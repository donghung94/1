#!/bin/sh
# Xcode Cloud post-clone script for Tokutei Kensetsu (Capacitor wrap).
#
# In-repo layout: this repo IS the web app (donghung94/1). The web app lives
# at the repo root; the Capacitor project lives in the ios-app/ subfolder:
#   <repo>/                       web app source (index.html, premium.html, ...)
#   <repo>/ios-app/               Capacitor project root (package.json here)
#   <repo>/ios-app/ios/App/       App.xcodeproj / App.xcworkspace
#   <repo>/ios-app/ios/App/ci_scripts/ci_post_clone.sh   <- this file
# Xcode Cloud looks for ci_scripts in the folder containing the workspace —
# ios/App/ — so this file lives at ios/App/ci_scripts/ inside ios-app/.
set -e
echo "=== ci_post_clone: Tokutei Kensetsu ==="

# 1) Node.js — Xcode Cloud images usually ship Node via Homebrew; install if absent.
if ! command -v node >/dev/null 2>&1; then
  echo "Node not found — installing via Homebrew"
  if command -v brew >/dev/null 2>&1; then
    brew install node
  else
    echo "ERROR: node missing and brew not available" >&2
    exit 1
  fi
fi
node --version
npm --version

# 2) Resolve the Capacitor project root (ios-app/): three levels up from
#    ios/App/ci_scripts. The web source is its parent — the repo root
#    (Xcode Cloud also exposes it as CI_PRIMARY_REPOSITORY_PATH).
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
CAP_ROOT=$(cd "$SCRIPT_DIR/../../.." && pwd)
echo "Capacitor project root (ios-app/): $CAP_ROOT"
echo "Web source (repo root): $(dirname "$CAP_ROOT")"
cd "$CAP_ROOT"

# 3) Install JS dependencies (typescript is pinned to ^5.x — TS 7 breaks @capacitor/cli 6).
npm install

# 4) Copy the web app (repo root = parent of ios-app/) into www/.
#    sync-web.js defaults its source to the parent dir, which is exactly
#    the repo root in this layout; it skips ios-app/, demo-sora/,
#    service-worker.js, .git/ and node_modules/.
node sync-web.js

# 5) Sync web assets + native config into the iOS project.
npx cap sync ios

echo "=== ci_post_clone done ==="
