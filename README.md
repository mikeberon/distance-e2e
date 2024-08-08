# tribune-e2e-tests

Automated scripts for tribune app (web and mobile)
- Playwright (web)
- Maestro (mobile)
  

# Playwright

Installing playwright

    npm init playwright@latest

Choose Typescript (or Javascript)

# Launch playwright ui

    npx playwright test --ui


# Maestro
This repository contains the different "flows" for the mobile tribune app automation testing.

# Installing Maestro
https://maestro.mobile.dev/getting-started/installing-maestro/macos

Dependencies:

Xcode (recommended version is 14 or higher)

Please make sure that Command Line Tools are installed (Xcode -> Preferences -> Locations -> Command Line Tools)

After setting up the macOS dependencies above, follow the default installation instructions:

# Installation
Run the following command to install Maestro on Mac OS, Linux or Windows (WSL):
    
    curl -Ls "https://get.maestro.mobile.dev" | bash

# Download samples
Use the download-samples command to download the samples:
    
    maestro download-samples

This will download the build-in sample Flows and app into a samples/ folder in your current directory.
# Run the Sample Flow
Install the sample app and then run the associated Flow using the maestro test command.

    cd ./samples
    adb install sample.apk
    maestro test android-flow.yaml

# Write a test in a YAML file

    appId: your.app.id
    ---
    - launchApp
    - tapOn: "Text on the screen"


Make sure an Android device/emulator or iOS simulator is running (instructions) and app is correctly installed on a selected device (instructions).

Run it!

Command in terminal (make sure you are in the root folder)

    maestro test flow.yaml

# Launch Maestro Studio
Maestro Studio is built right into the Maestro CLI. Upgrade your CLI to the latest version, and run the command below to launch Maestro Studio in your default browser:

    maestro studio


