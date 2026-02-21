#!/bin/bash
# heartsync-selfie.sh
# Usage: ./heartsync-selfie.sh "<prompt>" "<channel>" ["<caption>"] [aspect_ratio] [output_format] [profile]

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info(){ echo -e "${GREEN}[INFO]${NC} $1"; }
log_error(){ echo -e "${RED}[ERROR]${NC} $1"; }
log_warn(){ echo -e "${YELLOW}[WARN]${NC} $1"; }

# Optional: load local .env for convenience
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

if [ -z "${FAL_KEY:-}" ]; then
  log_error "FAL_KEY environment variable not set"
  echo "Tip: set FAL_KEY in your shell or .env file"
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  log_error "jq is required (brew install jq)"
  exit 1
fi

PROMPT="${1:-}"
CHANNEL="${2:-}"
CAPTION="${3:-Generated with HeartSync}"
ASPECT_RATIO="${4:-1:1}"
OUTPUT_FORMAT="${5:-jpeg}"
PROFILE="${6:-main}"

if [ -z "$PROMPT" ] || [ -z "$CHANNEL" ]; then
  echo "Usage: $0 <prompt> <channel> [caption] [aspect_ratio] [output_format] [profile]"
  echo "Profiles: main | casual | formal | outdoor"
  echo "Example target: telegram:8415830962"
  exit 1
fi

if [[ "$CHANNEL" == telegram:@* ]]; then
  log_warn "Telegram @username targets are unreliable for bots."
  log_warn "Use numeric chat id instead, e.g. telegram:8415830962"
fi

REF_MAIN="${HEARTSYNC_REF_MAIN:-${HEARTSYNC_REF_IMAGE:-https://cdn.jsdelivr.net/gh/soulomonlab/heartsync@main/assets/main.png}}"
REF_CASUAL="${HEARTSYNC_REF_CASUAL:-$REF_MAIN}"
REF_FORMAL="${HEARTSYNC_REF_FORMAL:-$REF_MAIN}"
REF_OUTDOOR="${HEARTSYNC_REF_OUTDOOR:-$REF_MAIN}"

case "$PROFILE" in
  casual) REF_IMAGE="$REF_CASUAL" ;;
  formal) REF_IMAGE="$REF_FORMAL" ;;
  outdoor) REF_IMAGE="$REF_OUTDOOR" ;;
  *) REF_IMAGE="$REF_MAIN" ;;
esac

# trim accidental spaces/newlines in env-provided URLs
REF_IMAGE="$(echo -n "$REF_IMAGE" | tr -d '\r' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"

log_info "Generating image (profile=$PROFILE)..."

RESPONSE=$(curl -s -X POST "https://fal.run/xai/grok-imagine-image/edit" \
  -H "Authorization: Key $FAL_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"image_url\": $(printf '%s' "$REF_IMAGE" | jq -Rs .),
    \"prompt\": $(printf '%s' "$PROMPT" | jq -Rs .),
    \"num_images\": 1,
    \"aspect_ratio\": \"$ASPECT_RATIO\",
    \"output_format\": \"$OUTPUT_FORMAT\"
  }")

if echo "$RESPONSE" | jq -e '.error // .detail' >/dev/null 2>&1; then
  log_error "$(echo "$RESPONSE" | jq -r '.error // .detail // "Unknown error"')"
  exit 1
fi

# fal can return different response shapes depending on model/runtime
IMAGE_URL=$(echo "$RESPONSE" | jq -r '.images[0].url // .data.images[0].url // .output[0].url // empty')

# async fallback: poll request status when only request_id is returned
if [ -z "$IMAGE_URL" ]; then
  REQUEST_ID=$(echo "$RESPONSE" | jq -r '.request_id // empty')
  if [ -n "$REQUEST_ID" ]; then
    log_info "Request queued ($REQUEST_ID). Polling..."
    for i in {1..20}; do
      STATUS=$(curl -s "https://fal.run/xai/grok-imagine-image/edit/requests/$REQUEST_ID/status" \
        -H "Authorization: Key $FAL_KEY")
      IMAGE_URL=$(echo "$STATUS" | jq -r '.images[0].url // .response.images[0].url // .data.images[0].url // empty')
      [ -n "$IMAGE_URL" ] && break
      sleep 1
    done
  fi
fi

if [ -z "$IMAGE_URL" ]; then
  log_error "No image URL in response"
  echo "Raw response: $RESPONSE"
  exit 1
fi

openclaw message send \
  --target "$CHANNEL" \
  --message "$CAPTION" \
  --media "$IMAGE_URL"

log_info "Sent to $CHANNEL"
