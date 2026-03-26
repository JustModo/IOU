#!/usr/bin/env bash
set -euo pipefail

SRC_DIR="${SRC_DIR:-/src}"
WORK_ROOT="${WORK_ROOT:-/workspace}"
OUTPUT_DIR="${OUTPUT_DIR:-/out}"
PROJECT_DIR="$WORK_ROOT/project"

mkdir -p "$PROJECT_DIR" "$OUTPUT_DIR"

echo "== Preparing isolated workspace =="
find "$PROJECT_DIR" -mindepth 1 -maxdepth 1 ! -name node_modules ! -name .gradle -exec rm -rf {} +

tar -C "$SRC_DIR" \
  --exclude=node_modules \
  --exclude=android \
  --exclude=ios \
  --exclude=builds \
  --exclude=.git \
  --exclude=.expo \
  -cf - . | tar -C "$PROJECT_DIR" -xf -

cd "$PROJECT_DIR"

echo "== Installing dependencies (cached) =="
if [ ! -f "node_modules/expo/package.json" ]; then
  npm ci
fi

echo "== Resolving app config =="

APP_CONFIG=$(npx expo config --json)

APP_NAME=$(echo "$APP_CONFIG" | node -e "const fs = require('fs'); const config = JSON.parse(fs.readFileSync(0, 'utf8')); console.log((config.name || 'app').replace(/[^a-zA-Z0-9]/g, '_'));" )
APP_VERSION=$(echo "$APP_CONFIG" | node -e "const fs = require('fs'); const config = JSON.parse(fs.readFileSync(0, 'utf8')); console.log(config.version || '0.0.0');" )

OUTPUT_BASE="${APP_NAME}_v${APP_VERSION}"

echo "App: $APP_NAME"
echo "Version: $APP_VERSION"

echo "== Prebuild (only if needed) =="
CI=1 npx expo prebuild --platform android

cd android

echo "== Inject signing config =="

: "${KEYSTORE_BASE64:?KEYSTORE_BASE64 is required}"
: "${KEYSTORE_PASSWORD:?KEYSTORE_PASSWORD is required}"
: "${KEY_ALIAS:?KEY_ALIAS is required}"
: "${KEY_PASSWORD:?KEY_PASSWORD is required}"

echo "$KEYSTORE_BASE64" | base64 -d > app/release.keystore

cat >> app/build.gradle <<EOF

android {
  signingConfigs {
    release {
      storeFile file("release.keystore")
      storePassword "$KEYSTORE_PASSWORD"
      keyAlias "$KEY_ALIAS"
      keyPassword "$KEY_PASSWORD"
    }
  }
  buildTypes {
    release {
      signingConfig signingConfigs.release
    }
  }
}
EOF

echo "== Building APK =="
./gradlew assembleRelease

cd ..

echo "== Collecting outputs =="

APK=$(find android/app/build/outputs/apk/release -name "*.apk" | head -n 1)

FINAL_APK="${OUTPUT_BASE}.apk"

[ -f "$APK" ] && cp "$APK" "$OUTPUT_DIR/$FINAL_APK"

echo "== DONE =="
ls -lh "$OUTPUT_DIR"/*.apk 2>/dev/null || true