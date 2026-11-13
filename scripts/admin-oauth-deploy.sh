#!/usr/bin/env bash
#
# Deploy the admin's GitHub OAuth proxy (admin-api/oauth) as an AWS Lambda behind a
# Function URL, and print the URL to put in public/admin/config.yml.
#
#   scripts/admin-oauth-deploy.sh            create or update, and show what is missing
#
# Two phases, because GitHub needs the callback URL before it hands out client
# credentials, and the callback URL only exists once the function does:
#   1. run it with no credentials: it creates the function and prints the URL
#   2. create the GitHub OAuth App with callback  <URL>/callback , then run it again with
#        GITHUB_CLIENT_ID=... GITHUB_CLIENT_SECRET=... scripts/admin-oauth-deploy.sh
#
# Nothing here touches the website's S3 bucket or CloudFront distribution.
set -euo pipefail

FUNCTION="${FUNCTION_NAME:-spenza-admin-oauth}"
ROLE="${ROLE_NAME:-spenza-admin-oauth-role}"
REGION="${REGION:-us-east-1}"
REPO="${GITHUB_REPO:-rajatraikar-spenza/Spenza-astro.js-based}"
ADMIN_ORIGIN="${ADMIN_ORIGIN:-https://spenza.com}"
SRC="$(cd "$(dirname "$0")/.." && pwd)/admin-api/oauth"

say()  { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
die()  { printf '\n\033[31mERROR: %s\033[0m\n' "$*" >&2; exit 1; }
command -v aws >/dev/null || die "aws CLI is not installed"
command -v zip >/dev/null || die "zip is not installed"
aws sts get-caller-identity >/dev/null || die "AWS credentials are not working"

say "Packaging $SRC"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
(cd "$SRC" && zip -q -r "$TMP/oauth.zip" index.mjs)

say "Execution role"
ROLE_ARN="$(aws iam get-role --role-name "$ROLE" --query Role.Arn --output text 2>/dev/null || true)"
if [ -z "$ROLE_ARN" ] || [ "$ROLE_ARN" = "None" ]; then
  ROLE_ARN="$(aws iam create-role --role-name "$ROLE" \
    --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}' \
    --query Role.Arn --output text)"
  aws iam attach-role-policy --role-name "$ROLE" --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
  echo "    created $ROLE_ARN (waiting for IAM to propagate)"; sleep 12
else
  echo "    exists: $ROLE_ARN"
fi

# Keep an existing STATE_SECRET: rotating it would invalidate sign-ins in flight.
STATE_SECRET="${STATE_SECRET:-$(aws lambda get-function-configuration --function-name "$FUNCTION" --region "$REGION" \
  --query 'Environment.Variables.STATE_SECRET' --output text 2>/dev/null || true)}"
if [ -z "$STATE_SECRET" ] || [ "$STATE_SECRET" = "None" ]; then STATE_SECRET="$(openssl rand -hex 32)"; fi

CID="${GITHUB_CLIENT_ID:-}"; CSECRET="${GITHUB_CLIENT_SECRET:-}"
ENV_JSON="$(node -e '
  const e = { GITHUB_REPO: process.argv[1], ADMIN_ORIGIN: process.argv[2], STATE_SECRET: process.argv[3],
              GITHUB_CLIENT_ID: process.argv[4] || "not-set-yet", GITHUB_CLIENT_SECRET: process.argv[5] || "not-set-yet" };
  process.stdout.write(JSON.stringify({ Variables: e }));' "$REPO" "$ADMIN_ORIGIN" "$STATE_SECRET" "$CID" "$CSECRET")"

say "Function $FUNCTION"
if aws lambda get-function --function-name "$FUNCTION" --region "$REGION" >/dev/null 2>&1; then
  aws lambda update-function-code --function-name "$FUNCTION" --zip-file "fileb://$TMP/oauth.zip" --region "$REGION" >/dev/null
  aws lambda wait function-updated --function-name "$FUNCTION" --region "$REGION"
  # Only overwrite credentials when new ones were supplied.
  if [ -n "$CID" ] && [ -n "$CSECRET" ]; then
    aws lambda update-function-configuration --function-name "$FUNCTION" --region "$REGION" --environment "$ENV_JSON" >/dev/null
  fi
  echo "    updated"
else
  aws lambda create-function --function-name "$FUNCTION" --region "$REGION" --runtime nodejs22.x \
    --handler index.handler --role "$ROLE_ARN" --zip-file "fileb://$TMP/oauth.zip" \
    --timeout 15 --memory-size 128 --environment "$ENV_JSON" >/dev/null
  aws lambda wait function-active --function-name "$FUNCTION" --region "$REGION"
  echo "    created"
fi

say "Function URL"
URL="$(aws lambda get-function-url-config --function-name "$FUNCTION" --region "$REGION" --query FunctionUrl --output text 2>/dev/null || true)"
if [ -z "$URL" ] || [ "$URL" = "None" ]; then
  URL="$(aws lambda create-function-url-config --function-name "$FUNCTION" --region "$REGION" --auth-type NONE --query FunctionUrl --output text)"
  aws lambda add-permission --function-name "$FUNCTION" --region "$REGION" --statement-id public-url \
    --action lambda:InvokeFunctionUrl --principal '*' --function-url-auth-type NONE >/dev/null
fi
URL="${URL%/}"
echo "    $URL"

say "What to do next"
if [ -z "$CID" ] || [ -z "$CSECRET" ]; then
  cat <<MSG
  1. GitHub > Settings > Developer settings > OAuth Apps > New OAuth App
       Homepage URL:               $ADMIN_ORIGIN
       Authorization callback URL: $URL/callback
  2. Generate a client secret, then re-run:
       GITHUB_CLIENT_ID=... GITHUB_CLIENT_SECRET=... $0
MSG
else
  echo "  Credentials set."
fi
cat <<MSG
  3. In public/admin/config.yml set:   base_url: $URL
  4. Merge, let the site deploy, then open $ADMIN_ORIGIN/admin/ and sign in.
MSG
