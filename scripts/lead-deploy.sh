#!/usr/bin/env bash
#
# Deploy the lead endpoint (admin-api/lead) as an AWS Lambda behind a Function URL, with the
# private archive bucket and the per-IP throttle table it needs. Idempotent: run it again to update.
#
#   ALERT_TO=a@x.com,b@x.com scripts/lead-deploy.sh
#
# Secrets (OAI_CAPI_KEY) are never read from the repo. Pass them in the environment of this one
# command; re-running without them keeps whatever the function already has.
set -euo pipefail

FUNCTION="${FUNCTION_NAME:-spenza-lead}"
ROLE="${ROLE_NAME:-spenza-lead-role}"
REGION="${REGION:-us-east-1}"
BUCKET="${ARCHIVE_BUCKET:-spenza-leads-archive}"
TABLE="${RATE_TABLE:-spenza-lead-rate}"
SRC="$(cd "$(dirname "$0")/.." && pwd)/admin-api/lead"
ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"

say() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
# Current value of an env var on the function, or empty.
cur() { aws lambda get-function-configuration --function-name "$FUNCTION" --region "$REGION" --query "Environment.Variables.$1" --output text 2>/dev/null | grep -vx None || true; }

say "Archive bucket $BUCKET (private, versioned, encrypted)"
if ! aws s3api head-bucket --bucket "$BUCKET" 2>/dev/null; then
  aws s3api create-bucket --bucket "$BUCKET" --region "$REGION" >/dev/null
fi
aws s3api put-public-access-block --bucket "$BUCKET" --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
aws s3api put-bucket-versioning --bucket "$BUCKET" --versioning-configuration Status=Enabled
aws s3api put-bucket-encryption --bucket "$BUCKET" --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

say "Throttle table $TABLE"
if ! aws dynamodb describe-table --table-name "$TABLE" --region "$REGION" >/dev/null 2>&1; then
  aws dynamodb create-table --table-name "$TABLE" --region "$REGION" --billing-mode PAY_PER_REQUEST \
    --attribute-definitions AttributeName=pk,AttributeType=S --key-schema AttributeName=pk,KeyType=HASH >/dev/null
  aws dynamodb wait table-exists --table-name "$TABLE" --region "$REGION"
  aws dynamodb update-time-to-live --table-name "$TABLE" --region "$REGION" --time-to-live-specification Enabled=true,AttributeName=expires >/dev/null
fi

say "Execution role $ROLE"
ROLE_ARN="$(aws iam get-role --role-name "$ROLE" --query Role.Arn --output text 2>/dev/null || true)"
if [ -z "$ROLE_ARN" ] || [ "$ROLE_ARN" = "None" ]; then
  ROLE_ARN="$(aws iam create-role --role-name "$ROLE" \
    --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}' \
    --query Role.Arn --output text)"
  aws iam attach-role-policy --role-name "$ROLE" --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
  sleep 12
fi
aws iam put-role-policy --role-name "$ROLE" --policy-name spenza-lead --policy-document "{
  \"Version\":\"2012-10-17\",\"Statement\":[
   {\"Effect\":\"Allow\",\"Action\":\"ses:SendEmail\",\"Resource\":\"*\"},
   {\"Effect\":\"Allow\",\"Action\":\"s3:PutObject\",\"Resource\":\"arn:aws:s3:::$BUCKET/leads/*\"},
   {\"Effect\":\"Allow\",\"Action\":\"dynamodb:UpdateItem\",\"Resource\":\"arn:aws:dynamodb:$REGION:$ACCOUNT:table/$TABLE\"}]}"

say "Packaging $SRC"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
(cd "$SRC" && zip -q -r "$TMP/lead.zip" index.mjs spam.mjs forms.mjs replies.json)

A_TO="${ALERT_TO:-$(cur ALERT_TO)}"
[ -n "$A_TO" ] || { echo "ALERT_TO is required on the first run" >&2; exit 1; }
ENV_JSON="$(node -e '
  const k = ["ALERT_TO","ALERT_FROM","REPLY_FROM","ARCHIVE_BUCKET","RATE_TABLE","SEND_CLIENT_REPLY","SEND_OAI","OAI_CAPI_KEY","OAI_PIXEL_ID","OAI_VALIDATE_ONLY","SPAM_ALERT_TO","SPAM_FILTER","SPAM_REQUIRE_TIMER"];
  const v = process.argv.slice(1);
  process.stdout.write(JSON.stringify({ Variables: Object.fromEntries(k.map((n, i) => [n, v[i]]).filter(([, x]) => x)) }));' \
  "$A_TO" "${ALERT_FROM:-Spenza Website <website@spenza.com>}" "${REPLY_FROM:-Spenza <sales@spenza.com>}" "$BUCKET" "$TABLE" \
  "${SEND_CLIENT_REPLY:-$(cur SEND_CLIENT_REPLY)}" "${SEND_OAI:-$(cur SEND_OAI)}" "${OAI_CAPI_KEY:-$(cur OAI_CAPI_KEY)}" \
  "${OAI_PIXEL_ID:-$(cur OAI_PIXEL_ID)}" "${OAI_VALIDATE_ONLY:-$(cur OAI_VALIDATE_ONLY)}" \
  "${SPAM_ALERT_TO-$(cur SPAM_ALERT_TO)}" "${SPAM_FILTER-$(cur SPAM_FILTER)}" "${SPAM_REQUIRE_TIMER-$(cur SPAM_REQUIRE_TIMER)}")"

say "Function $FUNCTION"
if aws lambda get-function --function-name "$FUNCTION" --region "$REGION" >/dev/null 2>&1; then
  aws lambda update-function-code --function-name "$FUNCTION" --zip-file "fileb://$TMP/lead.zip" --region "$REGION" >/dev/null
  aws lambda wait function-updated --function-name "$FUNCTION" --region "$REGION"
  aws lambda update-function-configuration --function-name "$FUNCTION" --region "$REGION" --environment "$ENV_JSON" >/dev/null
  aws lambda wait function-updated --function-name "$FUNCTION" --region "$REGION"
else
  aws lambda create-function --function-name "$FUNCTION" --region "$REGION" --runtime nodejs22.x --handler index.handler \
    --role "$ROLE_ARN" --zip-file "fileb://$TMP/lead.zip" --timeout 20 --memory-size 256 --environment "$ENV_JSON" >/dev/null
  aws lambda wait function-active --function-name "$FUNCTION" --region "$REGION"
  # A public form endpoint needs a ceiling: it bounds cost and SES volume if something floods it.
  aws lambda put-function-concurrency --function-name "$FUNCTION" --region "$REGION" --reserved-concurrent-executions 10 >/dev/null || \
    echo "    (could not reserve concurrency; the account limit may be too low. The rate table still applies.)"
fi

say "Function URL"
URL="$(aws lambda get-function-url-config --function-name "$FUNCTION" --region "$REGION" --query FunctionUrl --output text 2>/dev/null || true)"
if [ -z "$URL" ] || [ "$URL" = "None" ]; then
  URL="$(aws lambda create-function-url-config --function-name "$FUNCTION" --region "$REGION" --auth-type NONE --query FunctionUrl --output text)"
  aws lambda add-permission --function-name "$FUNCTION" --region "$REGION" --statement-id public-url \
    --action lambda:InvokeFunctionUrl --principal '*' --function-url-auth-type NONE >/dev/null
fi
# Since late 2025 a public Function URL also needs lambda:InvokeFunction (via the URL).
aws lambda add-permission --function-name "$FUNCTION" --region "$REGION" --statement-id public-invoke \
  --action lambda:InvokeFunction --principal '*' --invoked-via-function-url >/dev/null 2>&1 || true
echo "LEAD_ENDPOINT=${URL%/}"
