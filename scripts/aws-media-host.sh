#!/usr/bin/env bash
#
# Stand up media.spenza.com on S3 + CloudFront, entirely through the AWS CLI.
#
# Run one step at a time — two of them hand off to DNS, which is not necessarily
# in this account, and the certificate cannot issue until that record exists.
#
#   ./scripts/aws-media-host.sh bucket     create the private bucket
#   ./scripts/aws-media-host.sh upload     sync both media trees (~2.2GB)
#   ./scripts/aws-media-host.sh cert       request the certificate, print the CNAME
#   ./scripts/aws-media-host.sh cert-wait  block until the certificate is ISSUED
#   ./scripts/aws-media-host.sh cdn        OAC + distribution + bucket policy
#   ./scripts/aws-media-host.sh verify     smoke-test the live host
#   ./scripts/aws-media-host.sh status     show what exists so far
#   ./scripts/aws-media-host.sh policy     print the IAM policy these steps need
#
# Every step is idempotent: re-running one that already succeeded reports what
# is there and changes nothing. That matters because `cert` and `cdn` are slow
# and easy to interrupt.
set -euo pipefail

# ---- configuration ---------------------------------------------------------
BUCKET="${BUCKET:-spenza-media}"
REGION="${REGION:-us-east-1}"
DOMAIN="${DOMAIN:-media.spenza.com}"

# CloudFront reads certificates from us-east-1 only, whatever region everything
# else lives in. A certificate issued elsewhere is simply invisible to it.
CERT_REGION="us-east-1"

# Thirty days rather than a year: WordPress appends -1/-2 on re-upload so names
# are effectively stable, but a "replace media" plugin can overwrite in place.
CACHE_CONTROL="public, max-age=2592000"

UPLOADS_SRC="./public/wp-content"
UPLOADS_DST="s3://${BUCKET}/wp-content"
WEBP_SRC="./public/wp-assets/wp-content/webp-express"
WEBP_DST="s3://${BUCKET}/wp-assets/wp-content/webp-express"

# ---- helpers ---------------------------------------------------------------
say()  { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
info() { printf '    %s\n' "$*"; }
die()  { printf '\n\033[31mERROR: %s\033[0m\n' "$*" >&2; exit 1; }

need() { command -v "$1" >/dev/null 2>&1 || die "$1 is not installed"; }
need aws

ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"

denied() { printf '%s' "$1" | grep -qiE 'AccessDenied|not authorized|UnauthorizedOperation'; }

# Preflight, because the discovery helpers below run inside `$( )` — a subshell,
# where `exit` cannot stop the script. Without this, a denied List call is
# indistinguishable from an empty result and `status` cheerfully reports a clean
# slate for an account it has no permission to see. Failing here instead means
# the only way to reach a step is to actually be allowed to run it.
require_perms() {
  local failed=()
  local probe
  for probe in "$@"; do
    local out
    case "$probe" in
      s3)         out="$(aws s3api list-buckets --query 'Buckets[0].Name' 2>&1)" || true ;;
      acm)        out="$(aws acm list-certificates --region "$CERT_REGION" 2>&1)" || true ;;
      cloudfront) out="$(aws cloudfront list-distributions 2>&1)" || true ;;
    esac
    denied "$out" && failed+=("$probe")
  done
  [ ${#failed[@]} -eq 0 ] && return 0
  printf '\n\033[31mThese credentials cannot manage: %s\033[0m\n' "${failed[*]}" >&2
  printf '  identity: %s\n' "$(aws sts get-caller-identity --query Arn --output text)" >&2
  printf '  Grant the policy printed by:  %s policy\n\n' "$0" >&2
  exit 1
}

# 404 means the bucket is free to create; 403 means someone else owns the name
# or we cannot see it — very different, and worth separating.
bucket_exists() {
  local out
  out="$(aws s3api head-bucket --bucket "$BUCKET" 2>&1)" && return 0
  denied "$out" && die "cannot read bucket ${BUCKET}: ${out}"
  return 1
}

# Find a certificate that already covers $DOMAIN.
#
# An exact match is ideal, but a `*.spenza.com` wildcard covers media.spenza.com
# just as well — and this account has two, both ISSUED and both already backing
# CloudFront distributions. Reusing one skips requesting a certificate *and* the
# DNS validation round-trip it would need, which is the slowest part of a
# first-time setup and the only step that cannot be automated end to end.
#
# Only ISSUED certificates are considered: the account also holds an EXPIRED and
# a FAILED one, and an unfiltered query happily returns those.
#
# Set CERT_ARN to pin a specific certificate and skip discovery.
cert_arn() {
  if [ -n "${CERT_ARN:-}" ]; then printf '%s' "$CERT_ARN"; return 0; fi

  # media.spenza.com -> *.spenza.com. A wildcard matches one label only, so this
  # is exactly the wildcard that could cover us.
  local wildcard="*.${DOMAIN#*.}"

  local candidates
  candidates="$(aws acm list-certificates --region "$CERT_REGION" \
    --certificate-statuses ISSUED \
    --query "CertificateSummaryList[?DomainName=='${DOMAIN}' || DomainName=='${wildcard}'].CertificateArn" \
    --output text 2>/dev/null || true)"
  [ -n "$candidates" ] || return 0

  # Several may match. Choose the latest expiry rather than whichever ACM
  # happened to list first, so repeat runs resolve to the same certificate.
  local best="" best_when="" arn when
  for arn in $candidates; do
    when="$(aws acm describe-certificate --region "$CERT_REGION" --certificate-arn "$arn" \
      --query Certificate.NotAfter --output text 2>/dev/null || true)"
    if [ -z "$best" ] || [[ "$when" > "$best_when" ]]; then best="$arn"; best_when="$when"; fi
  done
  printf '%s' "$best"
}

dist_id() {
  aws cloudfront list-distributions \
    --query "DistributionList.Items[?contains(Aliases.Items || \`[]\`, '${DOMAIN}')].Id | [0]" \
    --output text 2>/dev/null | grep -v '^None$' || true
}

oac_id() {
  aws cloudfront list-origin-access-controls \
    --query "OriginAccessControlList.Items[?Name=='${BUCKET}'].Id | [0]" \
    --output text 2>/dev/null | grep -v '^None$' || true
}

# The least privilege that gets through every step below.
step_policy() {
  cat <<JSON
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BucketLifecycle",
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:PutBucketPolicy",
        "s3:GetBucketPolicy",
        "s3:PutBucketPublicAccessBlock",
        "s3:GetBucketPublicAccessBlock",
        "s3:GetBucketLocation",
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::${BUCKET}"
    },
    {
      "Sid": "Objects",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::${BUCKET}/*"
    },
    {
      "Sid": "FindTheBucket",
      "Effect": "Allow",
      "Action": "s3:ListAllMyBuckets",
      "Resource": "*"
    },
    {
      "Sid": "Certificate",
      "Effect": "Allow",
      "Action": [
        "acm:RequestCertificate",
        "acm:DescribeCertificate",
        "acm:ListCertificates"
      ],
      "Resource": "*"
    },
    {
      "Sid": "Cdn",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateDistribution",
        "cloudfront:GetDistribution",
        "cloudfront:ListDistributions",
        "cloudfront:CreateOriginAccessControl",
        "cloudfront:ListOriginAccessControls",
        "cloudfront:ListCachePolicies"
      ],
      "Resource": "*"
    }
  ]
}
JSON
}

# ---- steps -----------------------------------------------------------------

step_bucket() {
  require_perms s3
  say "Bucket ${BUCKET} in ${REGION}"
  if bucket_exists; then
    info "already exists — leaving it alone"
  else
    # us-east-1 is the one region that rejects LocationConstraint.
    if [ "$REGION" = "us-east-1" ]; then
      aws s3api create-bucket --bucket "$BUCKET" --region "$REGION" >/dev/null
    else
      aws s3api create-bucket --bucket "$BUCKET" --region "$REGION" \
        --create-bucket-configuration "LocationConstraint=${REGION}" >/dev/null
    fi
    info "created"
  fi

  # Stays private: CloudFront reaches it through OAC, not public read.
  aws s3api put-public-access-block --bucket "$BUCKET" \
    --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
  info "public access blocked"

  say "robots.txt"
  # Google Image Search reads the robots.txt of the host serving the image, not
  # the page. Without this the blog's images are at the mercy of whatever a bare
  # CloudFront 403 is interpreted as.
  printf 'User-agent: *\nAllow: /\n' | \
    aws s3 cp - "s3://${BUCKET}/robots.txt" \
      --content-type "text/plain" --cache-control "public, max-age=3600" >/dev/null
  info "uploaded"
}

step_upload() {
  require_perms s3
  bucket_exists || die "bucket ${BUCKET} does not exist — run 'bucket' first"
  [ -d "$UPLOADS_SRC" ] || die "$UPLOADS_SRC not found — run from the project root"
  [ -d "$WEBP_SRC" ] || die "$WEBP_SRC not found — run from the project root"

  # 11k small objects at the default concurrency of 10 is needlessly slow.
  aws configure set default.s3.max_concurrent_requests 32

  # --size-only, not the default size+mtime: a fresh clone gives every file a
  # new mtime, which would re-upload all 2.2GB from a CI runner every time.
  say "Uploading uploads tree -> ${UPLOADS_DST}"
  aws s3 sync "$UPLOADS_SRC" "$UPLOADS_DST" \
    --size-only --cache-control "$CACHE_CONTROL" --only-show-errors

  say "Uploading WebP variants -> ${WEBP_DST}"
  aws s3 sync "$WEBP_SRC" "$WEBP_DST" \
    --size-only --cache-control "$CACHE_CONTROL" --only-show-errors

  say "Checking Content-Type on a .webp"
  # These are named foo.png.webp. Older CLI builds do not know the extension and
  # fall back to binary/octet-stream, which browsers will not decode as an image.
  local probe ctype
  probe="wp-assets/wp-content/webp-express/webp-images/uploads/2026/04/butrle.png.webp"
  ctype="$(aws s3api head-object --bucket "$BUCKET" --key "$probe" \
    --query ContentType --output text 2>/dev/null || echo MISSING)"
  info "${probe##*/} -> ${ctype}"
  if [ "$ctype" != "image/webp" ] && [ "$ctype" != "MISSING" ]; then
    say "Repairing Content-Type across all .webp"
    aws s3 cp "$WEBP_DST" "$WEBP_DST" --recursive \
      --exclude "*" --include "*.webp" \
      --content-type "image/webp" --metadata-directive REPLACE \
      --cache-control "$CACHE_CONTROL" --only-show-errors
  fi

  say "Done"
  aws s3 ls "s3://${BUCKET}" --recursive --summarize \
    | tail -2 | sed 's/^/    /'
}

step_cert() {
  require_perms acm
  local arn; arn="$(cert_arn)"
  if [ -n "$arn" ]; then
    local dom status
    dom="$(aws acm describe-certificate --region "$CERT_REGION" --certificate-arn "$arn" \
      --query Certificate.DomainName --output text)"
    status="$(aws acm describe-certificate --region "$CERT_REGION" --certificate-arn "$arn" \
      --query Certificate.Status --output text)"
    say "Using the existing ${dom} certificate (${status})"
    info "$arn"
    [ "$status" = "ISSUED" ] && info "covers ${DOMAIN} — nothing to request, no DNS validation needed"
    return 0
  fi
  # Nothing covers the domain yet, so request one.
  say "Requesting certificate for ${DOMAIN} in ${CERT_REGION}"
  # The preflight can only check read access — ACM has no dry run for this, so a
  # principal that can list certificates but not request one gets this far before
  # failing. Catch it and name the way out: requesting by hand is a perfectly
  # good substitute, since discovery above finds it by domain, not by author.
  local out
  if ! out="$(aws acm request-certificate \
    --domain-name "$DOMAIN" \
    --validation-method DNS \
    --region "$CERT_REGION" \
    --query CertificateArn --output text 2>&1)"; then
    if denied "$out"; then
      die "acm:RequestCertificate is not permitted for this principal.
    Either grant it, or request the certificate once by hand — both work:
      aws acm request-certificate --domain-name ${DOMAIN} \\
        --validation-method DNS --region ${CERT_REGION}
    or ACM console (N. Virginia) -> Request -> public -> ${DOMAIN} -> DNS validation.
    Then re-run '$0 cert' and it will pick the certificate up."
    fi
    die "$out"
  fi
  arn="$out"
  info "$arn"
  sleep 5   # ACM populates the validation record asynchronously.

  say "Add this CNAME to DNS, then run: $0 cert-wait"
  aws acm describe-certificate --region "$CERT_REGION" --certificate-arn "$arn" \
    --query 'Certificate.DomainValidationOptions[0].ResourceRecord' \
    --output table
}

step_cert_wait() {
  require_perms acm
  local arn; arn="$(cert_arn)"
  [ -n "$arn" ] || die "no certificate for ${DOMAIN} — run 'cert' first"
  say "Waiting for ${DOMAIN} certificate to validate (up to ~40 min)"
  aws acm wait certificate-validated --region "$CERT_REGION" --certificate-arn "$arn"
  info "ISSUED"
}

step_cdn() {
  require_perms s3 acm cloudfront
  bucket_exists || die "bucket ${BUCKET} does not exist — run 'bucket' first"

  local arn status
  arn="$(cert_arn)"
  [ -n "$arn" ] || die "no certificate for ${DOMAIN} — run 'cert' first"
  status="$(aws acm describe-certificate --region "$CERT_REGION" --certificate-arn "$arn" \
    --query Certificate.Status --output text)"
  [ "$status" = "ISSUED" ] || die "certificate is ${status}, not ISSUED — run 'cert-wait'"

  local oac; oac="$(oac_id)"
  if [ -n "$oac" ]; then
    say "Origin access control exists: ${oac}"
  else
    say "Creating origin access control"
    oac="$(aws cloudfront create-origin-access-control \
      --origin-access-control-config "{
        \"Name\": \"${BUCKET}\",
        \"Description\": \"Spenza media bucket\",
        \"SigningProtocol\": \"sigv4\",
        \"SigningBehavior\": \"always\",
        \"OriginAccessControlOriginType\": \"s3\"
      }" --query OriginAccessControl.Id --output text)"
    info "$oac"
  fi

  local dist; dist="$(dist_id)"
  if [ -n "$dist" ]; then
    say "Distribution already exists: ${dist}"
  else
    # Look the managed policy up rather than hardcoding its id. The name carries
    # a "Managed-" prefix that the console hides — filtering on the bare name
    # matches nothing, and a JMESPath miss returns the *string* "None", which is
    # non-empty and sails straight through a naive check into the config.
    local cache_policy
    cache_policy="$(aws cloudfront list-cache-policies --type managed \
      --query "CachePolicyList.Items[?CachePolicy.CachePolicyConfig.Name=='Managed-CachingOptimized'].CachePolicy.Id | [0]" \
      --output text)"
    case "$cache_policy" in
      ''|None) die "could not resolve the Managed-CachingOptimized cache policy" ;;
    esac
    info "cache policy Managed-CachingOptimized = ${cache_policy}"

    # Inline rather than `--distribution-config file://$(mktemp)`. Under Git Bash
    # mktemp hands back an MSYS path like /tmp/tmp.XXXX, which the native Windows
    # aws.exe cannot resolve — it reports the file as missing after writing it
    # successfully. Passing the JSON directly works the same everywhere.
    local cfg
    cfg="$(cat <<JSON
{
  "CallerReference": "${BUCKET}-$(date +%s)",
  "Comment": "Spenza media host",
  "Enabled": true,
  "Aliases": { "Quantity": 1, "Items": ["${DOMAIN}"] },
  "Origins": {
    "Quantity": 1,
    "Items": [{
      "Id": "s3-${BUCKET}",
      "DomainName": "${BUCKET}.s3.${REGION}.amazonaws.com",
      "OriginPath": "",
      "CustomHeaders": { "Quantity": 0 },
      "S3OriginConfig": { "OriginAccessIdentity": "" },
      "OriginAccessControlId": "${oac}",
      "ConnectionAttempts": 3,
      "ConnectionTimeout": 10
    }]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "s3-${BUCKET}",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"],
      "CachedMethods": { "Quantity": 2, "Items": ["GET", "HEAD"] }
    },
    "Compress": true,
    "CachePolicyId": "${cache_policy}"
  },
  "ViewerCertificate": {
    "ACMCertificateArn": "${arn}",
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021",
    "CloudFrontDefaultCertificate": false
  },
  "PriceClass": "PriceClass_All",
  "HttpVersion": "http2and3",
  "IsIPV6Enabled": true
}
JSON
)"
    say "Creating distribution"
    dist="$(aws cloudfront create-distribution --distribution-config "$cfg" \
      --query Distribution.Id --output text)"
    info "$dist"
  fi

  # Without this every request is a 403, whatever else is correct.
  say "Granting the distribution read access to the bucket"
  aws s3api put-bucket-policy --bucket "$BUCKET" --policy "{
    \"Version\": \"2012-10-17\",
    \"Statement\": [{
      \"Sid\": \"AllowCloudFrontServicePrincipal\",
      \"Effect\": \"Allow\",
      \"Principal\": { \"Service\": \"cloudfront.amazonaws.com\" },
      \"Action\": \"s3:GetObject\",
      \"Resource\": \"arn:aws:s3:::${BUCKET}/*\",
      \"Condition\": { \"StringEquals\": {
        \"AWS:SourceArn\": \"arn:aws:cloudfront::${ACCOUNT}:distribution/${dist}\"
      }}
    }]
  }"
  info "bucket policy applied"

  local host
  host="$(aws cloudfront get-distribution --id "$dist" \
    --query Distribution.DomainName --output text)"

  say "Point DNS at the distribution"
  info "${DOMAIN}.  CNAME  ${host}."
  info "(Route 53: an A record with Alias to the same target)"

  say "Waiting for the distribution to deploy (~15 min)"
  aws cloudfront wait distribution-deployed --id "$dist"
  info "deployed"
}

step_verify() {
  say "Smoke-testing https://${DOMAIN}"
  local fail=0

  check() {
    local label="$1" url="$2" expect="$3" extra="${4:-}"
    local code
    # shellcheck disable=SC2086
    code="$(curl -s -o /dev/null -w '%{http_code}' $extra "$url" || echo 000)"
    if [ "$code" = "$expect" ]; then
      printf '    \033[32mok\033[0m   %-22s %s\n' "$label" "$code"
    else
      printf '    \033[31mFAIL\033[0m %-22s %s (wanted %s)\n' "$label" "$code" "$expect"
      # Origin access control grants s3:GetObject but not s3:ListBucket, so S3
      # answers a missing key with AccessDenied rather than NoSuchKey — which
      # CloudFront surfaces as 403. It does not leak which objects exist, but it
      # does make "not uploaded yet" look exactly like "permissions are wrong".
      [ "$code" = "403" ] && printf '         %s\n' \
        "403 here usually means the object is not in the bucket yet — check 'aws s3 ls' before suspecting the policy"
      fail=1
    fi
  }

  check "png"       "https://${DOMAIN}/wp-content/uploads/2026/04/butrle.png" 200
  check "webp"      "https://${DOMAIN}/wp-assets/wp-content/webp-express/webp-images/uploads/2026/04/butrle.png.webp" 200
  check "robots"    "https://${DOMAIN}/robots.txt" 200
  # Video seeking depends on range support — the site ships a 30MB MP4.
  check "mp4 range" "https://${DOMAIN}/wp-content/uploads/2025/09/Reselling-Devices-to-End-Users.mp4" 206 "-H Range:bytes=0-1023"

  say "Headers on the WebP"
  curl -sI "https://${DOMAIN}/wp-assets/wp-content/webp-express/webp-images/uploads/2026/04/butrle.png.webp" \
    | grep -iE '^(HTTP|content-type|cache-control|x-cache)' | sed 's/^/    /'

  [ "$fail" = 0 ] || die "smoke test failed — do not build against this host yet"

  say "Host is good. Next:"
  info "MEDIA_ORIGIN=https://${DOMAIN} npm run build"
  info "npm run wp:verify-dist -- https://${DOMAIN}"
}

step_status() {
  require_perms s3 acm cloudfront
  say "Account ${ACCOUNT}"
  info "bucket       ${BUCKET} $(bucket_exists && echo '(exists)' || echo '(missing)')"
  local a d o
  a="$(cert_arn)"; d="$(dist_id)"; o="$(oac_id)"
  if [ -n "$a" ]; then
    info "certificate  $(aws acm describe-certificate --region "$CERT_REGION" \
      --certificate-arn "$a" --query Certificate.Status --output text)"
  else
    info "certificate  (none)"
  fi
  info "oac          ${o:-(none)}"
  if [ -n "$d" ]; then
    info "distribution ${d} $(aws cloudfront get-distribution --id "$d" \
      --query Distribution.Status --output text) -> $(aws cloudfront get-distribution \
      --id "$d" --query Distribution.DomainName --output text)"
  else
    info "distribution (none)"
  fi
}

case "${1:-}" in
  bucket)    step_bucket ;;
  upload)    step_upload ;;
  cert)      step_cert ;;
  cert-wait) step_cert_wait ;;
  cdn)       step_cdn ;;
  verify)    step_verify ;;
  policy)    step_policy ;;
  status)    step_status ;;
  *)
    sed -n '3,20p' "$0" | sed 's/^# \{0,1\}//'
    exit 1
    ;;
esac
