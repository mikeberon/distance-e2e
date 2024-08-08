#!/bin/bash

echo ">> printing work directory"
pwd

echo ">> listing project files"
ls

echo ">> listing avds"
/Users/${USER}/Library/Android/sdk/emulator/emulator -list-avds

echo ">> installing app"
/Users/${USER}/Library/Android/sdk/platform-tools/adb install WikipediaSample.apk

echo ">> getting package names"
/Users/${USER}/Library/Android/sdk/platform-tools/adb shell pm list packages -3 -f

echo ">> installing maestro"
curl -Ls "https://get.maestro.mobile.dev" | bash
export PATH="$PATH":"$HOME/.maestro/bin"
maestro --version

echo ">> running tests"
maestro test ./sampleTests/ --format junit
