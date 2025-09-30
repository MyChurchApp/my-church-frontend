#!/usr/bin/env bash
set -euo pipefail

# 0) Build do Next (SEM export)
pnpm build

# 1) Garantir projeto Android
if [ ! -d "android" ]; then
  npx cap add android
fi

# 2) Criar pasta de assets (Bash puro)
mkdir -p android/app/src/main/assets

# 3) Sincronizar Capacitor
npx cap sync android

# 4) Gerar APK (debug)
pushd android >/dev/null
./gradlew assembleDebug
popd >/dev/null

APK_SRC="android/app/build/outputs/apk/debug/app-debug.apk"
APK_DST="$HOME/Desktop/MyChurch-debug.apk"   # usa $HOME (caminho POSIX no Git Bash)

cp -f "$APK_SRC" "$APK_DST"
echo "✅ APK copiado para: $APK_DST"
