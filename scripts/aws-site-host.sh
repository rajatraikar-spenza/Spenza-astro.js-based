#!/usr/bin/env bash
#
# Serve the built site from S3 + CloudFront.
#
#   ./scripts/aws-site-host.sh bucket    private origin bucket
#   ./scripts/aws-site-host.sh function  build + publish the CloudFront Function
#   ./scripts/aws-site-host.sh cdn       OAC, headers policy, distribution, policy
#   ./scripts/aws-site-host.sh deploy    sync dist/ and invalidate
#   ./scripts/aws-site-host.sh verify    smoke-test the distribution
#   ./scripts/aws-site-host.sh alias     attach a domain once DNS is ready
#   ./scripts/aws-site-host.sh status    what exists so far
#   ./scripts/aws-site-host.sh policy    the IAM policy these steps need
#
# Why a CloudFront Function is not optional here: S3's REST endpoint has no
# directory index, so `/about-us/` arrives as the key `about-us/` and 404s.
# Every page this build emits is `<path>/index.html`. Without the function the
# site is unreachable apart from the root.
#
# `_redirects` and `_headers` are Cloudflare/Netlify conventions that CloudFront
# ignores entirely. Their two jobs are split here: redirects into the function,
# security headers into a response headers policy, and Cache-Control onto the
# objects themselves at upload — which is why `deploy` syncs in three passes.
set -euo pipefail

BUCKET="${SITE_BUCKET:-spenza-site}"
REGION="${REGION:-us-east-1}"
FUNCTION="${FUNCTION_NAME:-spenza-site-router}"
DIST_DIR="./dist"

say()  { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
info() { printf '    %s\n' "$*"; }
die()  { printf '\n\033[31mERROR: %s\033[0m\n' "$*" >&2; exit 1; }
denied() { printf '%s' "$1" | grep -qiE 'AccessDenied|not authorized|UnauthorizedOperation'; }

command -v aws >/dev/null 2>&1 || die "aws CLI is not installed"
ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"

# Same reasoning as the media script: the discovery helpers run in subshells
# where `exit` cannot stop anything, so a denied List call would read as "does
# not exist" and the script would cheerfully try to create a duplicate.
require_perms() {
  local failed=() probe out
  for probe in "$@"; do
    case "$probe" in
      s3)         out="$(aws s3api list-buckets 2>&1)" || true ;;
      cloudfront) out="$(aws cloudfront list-distributions 2>&1)" || true ;;
    esac
    denied "$out" && failed+=("$probe")
  done
  [ ${#failed[@]} -eq 0 ] && return 0
  printf '\n\033[31mThese credentials cannot manage: %s\033[0m\n' "${failed[*]}" >&2
  printf '  identity: %s\n\n' "$(aws sts get-caller-identity --query Arn --output text)" >&2
  exit 1
}

bucket_exists() {
  local out; out="$(aws s3api head-bucket --bucket "$BUCKET" 2>&1)" && return 0
  denied "$out" && die "cannot read bucket ${BUCKET}: ${out}"
  return 1
}
dist_id() {
  aws cloudfront list-distributions \
    --query "DistributionList.Items[?Comment=='spenza site'].Id | [0]" \
    --output text 2>/dev/null | grep -v '^None$' || true
}
oac_id() {
  aws cloudfront list-origin-access-controls \
    --query "OriginAccessControlList.Items[?Name=='${BUCKET}'].Id | [0]" \
    --output text 2>/dev/null | grep -v '^None$' || true
}
fn_etag() {
  aws cloudfront describe-function --name "$FUNCTION" \
    --query ETag --output text 2>/dev/null | grep -v '^None$' || true
}
headers_policy_id() {
  aws cloudfront list-response-headers-policies --type custom \
    --query "ResponseHeadersPolicyList.Items[?ResponseHeadersPolicy.ResponseHeadersPolicyConfig.Name=='spenza-site-security'].ResponseHeadersPolicy.Id | [0]" \
    --output text 2>/dev/null | grep -v '^None$' || true
}

step_bucket() {
  require_perms s3
  say "Bucket ${BUCKET} in ${REGION}"
  if bucket_exists; then
    info "already exists"
  else
    if [ "$REGION" = "us-east-1" ]; then
      aws s3api create-bucket --bucket "$BUCKET" --region "$REGION" >/dev/null
    else
      aws s3api create-bucket --bucket "$BUCKET" --region "$REGION" \
        --create-bucket-configuration "LocationConstraint=${REGION}" >/dev/null
    fi
    info "created"
  fi
  aws s3api put-public-access-block --bucket "$BUCKET" \
    --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
  info "public access blocked"
}

step_function() {
  require_perms cloudfront
  say "Building the router function"
  node scripts/aws-build-cf-function.mjs || die "function generation failed"
  local code="scripts/.cf-site-function.js"
  [ -f "$code" ] || die "expected $code"

  local etag; etag="$(fn_etag)"
  if [ -n "$etag" ]; then
    say "Updating function ${FUNCTION}"
    etag="$(aws cloudfront update-function --name "$FUNCTION" --if-match "$etag" \
      --function-config "Comment=Spenza site router,Runtime=cloudfront-js-2.0" \
      --function-code "fileb://${code}" --query ETag --output text)"
  else
    say "Creating function ${FUNCTION}"
    etag="$(aws cloudfront create-function --name "$FUNCTION" \
      --function-config "Comment=Spenza site router,Runtime=cloudfront-js-2.0" \
      --function-code "fileb://${code}" --query ETag --output text)"
  fi

  say "Publishing"
  aws cloudfront publish-function --name "$FUNCTION" --if-match "$etag" >/dev/null
  info "live"
}

step_cdn() {
  require_perms s3 cloudfront
  bucket_exists || die "bucket ${BUCKET} does not exist — run 'bucket' first"
  [ -n "$(fn_etag)" ] || die "function ${FUNCTION} does not exist — run 'function' first"

  local oac; oac="$(oac_id)"
  if [ -n "$oac" ]; then
    say "Origin access control exists: ${oac}"
  else
    say "Creating origin access control"
    oac="$(aws cloudfront create-origin-access-control \
      --origin-access-control-config "{
        \"Name\": \"${BUCKET}\",
        \"Description\": \"Spenza site bucket\",
        \"SigningProtocol\": \"sigv4\",
        \"SigningBehavior\": \"always\",
        \"OriginAccessControlOriginType\": \"s3\"
      }" --query OriginAccessControl.Id --output text)"
    info "$oac"
  fi

  # The security half of `_headers`. A managed policy rather than a function:
  # CloudFront applies these on the response without running any code.
  #
  # HSTS ships without includeSubDomains or preload on purpose — the zone has
  # siblings (api, telematics, docs, media) and forcing HTTPS on all of them
  # from here, irreversibly in preload's case, is not this script's call.
  local hp; hp="$(headers_policy_id)"
  if [ -n "$hp" ]; then
    say "Response headers policy exists: ${hp}"
  else
    say "Creating response headers policy"
    hp="$(aws cloudfront create-response-headers-policy \
      --response-headers-policy-config '{
        "Name": "spenza-site-security",
        "Comment": "Security headers for the Spenza site",
        "SecurityHeadersConfig": {
          "StrictTransportSecurity": {
            "Override": true, "IncludeSubdomains": false,
            "Preload": false, "AccessControlMaxAgeSec": 31536000
          },
          "ContentTypeOptions": { "Override": true },
          "FrameOptions": { "Override": true, "FrameOption": "SAMEORIGIN" },
          "ReferrerPolicy": {
            "Override": true, "ReferrerPolicy": "strict-origin-when-cross-origin"
          }
        }
      }' --query ResponseHeadersPolicy.Id --output text)"
    info "$hp"
  fi

  local dist; dist="$(dist_id)"
  if [ -n "$dist" ]; then
    say "Distribution already exists: ${dist}"
  else
    local cache_policy fn_arn
    cache_policy="$(aws cloudfront list-cache-policies --type managed \
      --query "CachePolicyList.Items[?CachePolicy.CachePolicyConfig.Name=='Managed-CachingOptimized'].CachePolicy.Id | [0]" \
      --output text)"
    case "$cache_policy" in ''|None) die "could not resolve Managed-CachingOptimized" ;; esac
    fn_arn="$(aws cloudfront describe-function --name "$FUNCTION" \
      --query FunctionSummary.FunctionMetadata.FunctionARN --output text)"

    say "Creating distribution"
    dist="$(aws cloudfront create-distribution --distribution-config "{
      \"CallerReference\": \"${BUCKET}-$(date +%s)\",
      \"Comment\": \"spenza site\",
      \"Enabled\": true,
      \"DefaultRootObject\": \"\",
      \"Aliases\": { \"Quantity\": 0 },
      \"Origins\": { \"Quantity\": 1, \"Items\": [{
        \"Id\": \"s3-${BUCKET}\",
        \"DomainName\": \"${BUCKET}.s3.${REGION}.amazonaws.com\",
        \"OriginPath\": \"\",
        \"CustomHeaders\": { \"Quantity\": 0 },
        \"S3OriginConfig\": { \"OriginAccessIdentity\": \"\" },
        \"OriginAccessControlId\": \"${oac}\",
        \"ConnectionAttempts\": 3,
        \"ConnectionTimeout\": 10
      }]},
      \"DefaultCacheBehavior\": {
        \"TargetOriginId\": \"s3-${BUCKET}\",
        \"ViewerProtocolPolicy\": \"redirect-to-https\",
        \"AllowedMethods\": { \"Quantity\": 2, \"Items\": [\"GET\", \"HEAD\"],
          \"CachedMethods\": { \"Quantity\": 2, \"Items\": [\"GET\", \"HEAD\"] } },
        \"Compress\": true,
        \"CachePolicyId\": \"${cache_policy}\",
        \"ResponseHeadersPolicyId\": \"${hp}\",
        \"FunctionAssociations\": { \"Quantity\": 1, \"Items\": [{
          \"EventType\": \"viewer-request\", \"FunctionARN\": \"${fn_arn}\"
        }]}
      },
      \"CustomErrorResponses\": { \"Quantity\": 1, \"Items\": [{
        \"ErrorCode\": 403,
        \"ResponsePagePath\": \"/404.html\",
        \"ResponseCode\": \"404\",
        \"ErrorCachingMinTTL\": 60
      }]},
      \"PriceClass\": \"PriceClass_All\",
      \"HttpVersion\": \"http2and3\",
      \"IsIPV6Enabled\": true
    }" --query Distribution.Id --output text)"
    info "$dist"
  fi

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

  say "Waiting for the distribution to deploy (~15 min)"
  aws cloudfront wait distribution-deployed --id "$dist"
  info "deployed -> $(aws cloudfront get-distribution --id "$dist" \
    --query Distribution.DomainName --output text)"
}

step_deploy() {
  require_perms s3
  bucket_exists || die "bucket ${BUCKET} does not exist — run 'bucket' first"
  [ -d "$DIST_DIR" ] || die "$DIST_DIR not found — run a build first"
  [ -f "$DIST_DIR/index.html" ] || die "$DIST_DIR has no index.html"

  aws configure set default.s3.max_concurrent_requests 32

  # Three passes, because Cache-Control lives on the object in S3 and the right
  # value differs. Content-addressed names can be cached forever; HTML cannot,
  # or a deploy would be invisible to anyone who has already visited.
  say "Immutable assets (content-addressed)"
  aws s3 sync "$DIST_DIR" "s3://${BUCKET}" --size-only --only-show-errors \
    --exclude "*" --include "wp-assets/_opt/*" --include "_astro/*" \
    --include "wp-assets/_fonts/*" \
    --cache-control "public, max-age=31536000, immutable"

  say "Other static assets"
  aws s3 sync "$DIST_DIR" "s3://${BUCKET}" --size-only --only-show-errors \
    --exclude "*.html" --exclude "wp-assets/_opt/*" --exclude "_astro/*" \
    --exclude "wp-assets/_fonts/*" --exclude "_redirects" --exclude "_headers" \
    --cache-control "public, max-age=2592000"

  # Last, and with --delete, so a page that no longer exists stops being served.
  # HTML only: the earlier passes must not delete assets an old page still uses
  # while a stale HTML copy is cached at an edge.
  say "HTML"
  aws s3 sync "$DIST_DIR" "s3://${BUCKET}" --only-show-errors --delete \
    --exclude "*" --include "*.html" --include "*.xml" --include "robots.txt" \
    --cache-control "public, max-age=0, must-revalidate"

  local dist; dist="$(dist_id)"
  if [ -n "$dist" ]; then
    say "Invalidating HTML at the edge"
    aws cloudfront create-invalidation --distribution-id "$dist" \
      --paths '/*' --query 'Invalidation.Id' --output text | sed 's/^/    /'
  fi
}

step_alias() {
  local domain="${1:-}"
  [ -n "$domain" ] || die "usage: $0 alias <domain>   e.g. $0 alias www.spenza.com"
  require_perms cloudfront
  local dist; dist="$(dist_id)"
  [ -n "$dist" ] || die "no distribution — run 'cdn' first"

  local cert
  cert="$(aws acm list-certificates --region us-east-1 --certificate-statuses ISSUED \
    --query "CertificateSummaryList[?DomainName=='${domain}' || DomainName=='*.${domain#*.}'].CertificateArn | [0]" \
    --output text 2>/dev/null | grep -v '^None$' || true)"
  [ -n "$cert" ] || die "no ISSUED certificate in us-east-1 covering ${domain}"

  say "Attaching ${domain} to ${dist}"
  info "certificate ${cert}"
  info "This edits the live distribution config; run it when DNS is ready."
  info "aws cloudfront get-distribution-config --id ${dist} > cfg.json, set"
  info "Aliases + ViewerCertificate, then update-distribution --if-match <ETag>."
}

step_verify() {
  local host="${1:-}"
  if [ -z "$host" ]; then
    local dist; dist="$(dist_id)"
    [ -n "$dist" ] || die "no distribution — run 'cdn' first"
    host="$(aws cloudfront get-distribution --id "$dist" --query Distribution.DomainName --output text)"
  fi
  say "Smoke-testing https://${host}"
  local fail=0
  check() {
    local label="$1" path="$2" expect="$3"
    local code; code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 25 "https://${host}${path}")"
    if [ "$code" = "$expect" ]; then
      printf '    \033[32mok\033[0m   %-26s %s\n' "$label" "$code"
    else
      printf '    \033[31mFAIL\033[0m %-26s %s (wanted %s)\n' "$label" "$code" "$expect"
      fail=1
    fi
  }
  check "home"              "/"                              200
  check "directory index"   "/about-us/"                     200
  check "slashless -> 301"  "/about-us"                      301
  check "blog post"         "/telecom/what-is-mvno/"         200
  check "wp 301"            "/blog/top-telecom-billing-mistakes/" 301
  check "robots.txt"        "/robots.txt"                    200
  check "sitemap"           "/sitemap-index.xml"             200
  check "404"               "/this-does-not-exist/"          404

  # A real bundle, taken from the build rather than hardcoded — the names are
  # content hashes and change whenever the CSS does.
  local bundle
  bundle="$(grep -ho '/wp-assets/_opt/bundle-[a-f0-9]*\.css' "$DIST_DIR/index.html" 2>/dev/null | head -1)"
  [ -n "$bundle" ] && check "css bundle" "$bundle" 200

  say "Cache-Control on an immutable asset"
  [ -n "$bundle" ] && curl -sI "https://${host}${bundle}" \
    | grep -iE '^(HTTP|cache-control|content-encoding)' | sed 's/^/    /'

  say "Headers on the home page"
  curl -sI "https://${host}/" | grep -iE '^(HTTP|cache-control|content-type|strict-transport|x-content-type|x-frame|referrer-policy|x-cache)' | sed 's/^/    /'
  [ "$fail" = 0 ] || die "smoke test failed"
  info ""
  info "Good. Attach a domain with: $0 alias <domain>"
}

step_status() {
  require_perms s3 cloudfront
  say "Account ${ACCOUNT}"
  info "bucket       ${BUCKET} $(bucket_exists && echo '(exists)' || echo '(missing)')"
  info "function     ${FUNCTION} $([ -n "$(fn_etag)" ] && echo '(exists)' || echo '(missing)')"
  info "oac          $(oac_id || true)"
  info "headers      $(headers_policy_id || true)"
  local d; d="$(dist_id)"
  if [ -n "$d" ]; then
    info "distribution ${d} $(aws cloudfront get-distribution --id "$d" --query Distribution.Status --output text) -> $(aws cloudfront get-distribution --id "$d" --query Distribution.DomainName --output text)"
  else
    info "distribution (none)"
  fi
}

step_policy() {
  cat <<JSON
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow",
      "Action": ["s3:CreateBucket","s3:PutBucketPolicy","s3:GetBucketPolicy",
                 "s3:PutBucketPublicAccessBlock","s3:GetBucketLocation","s3:ListBucket"],
      "Resource": "arn:aws:s3:::${BUCKET}" },
    { "Effect": "Allow",
      "Action": ["s3:PutObject","s3:GetObject","s3:DeleteObject"],
      "Resource": "arn:aws:s3:::${BUCKET}/*" },
    { "Effect": "Allow", "Action": "s3:ListAllMyBuckets", "Resource": "*" },
    { "Effect": "Allow", "Action": ["acm:ListCertificates","acm:DescribeCertificate"],
      "Resource": "*" },
    { "Effect": "Allow",
      "Action": ["cloudfront:CreateDistribution","cloudfront:GetDistribution",
                 "cloudfront:GetDistributionConfig","cloudfront:UpdateDistribution",
                 "cloudfront:ListDistributions","cloudfront:CreateInvalidation",
                 "cloudfront:CreateOriginAccessControl","cloudfront:ListOriginAccessControls",
                 "cloudfront:ListCachePolicies","cloudfront:CreateResponseHeadersPolicy",
                 "cloudfront:ListResponseHeadersPolicies","cloudfront:CreateFunction",
                 "cloudfront:UpdateFunction","cloudfront:PublishFunction",
                 "cloudfront:DescribeFunction"],
      "Resource": "*" }
  ]
}
JSON
}

case "${1:-}" in
  bucket)   step_bucket ;;
  function) step_function ;;
  cdn)      step_cdn ;;
  deploy)   step_deploy ;;
  verify)   step_verify "${2:-}" ;;
  alias)    step_alias "${2:-}" ;;
  status)   step_status ;;
  policy)   step_policy ;;
  *) sed -n '3,20p' "$0" | sed 's/^# \{0,1\}//'; exit 1 ;;
esac
