# IOU

A minimal, offline-first personal tracker for debts, loans, and shared bills. Designed to be fast, private, and simple.

## Features

- **Track Anything**: Quickly log if you owe money or if someone owes you.
- **Offline First**: All data lives locally on your device in SQLite. No cloud, no tracking.
- **UPI QR Integration**: Scan your friend's UPI IDs or generate your own QR code instantly to settle up.
- **Backup & Restore**: Export your data to JSON securely and move it anywhere.
- **Auto-Updates**: Checks GitHub automatically for new releases so you're always up to date.

## Tech Stack

Built with React Native (Expo), NativeWind, SQLite, and Drizzle ORM.

## Local Development (Continuous Native Generation)

Because we use continuous native generation (Expo Prebuild), the `android/` directory is effectively an ephemeral generated output. If you make changes to plugins, app icons, or `app.json`, regenerate the native config using:

```bash
npm run android:prebuild
```

Then, run the app via:
```bash
npm run android
```

## Container Android Build

Use the npm scripts to build Android release artifacts (`.apk`) using Docker Compose. This completely skips needing an Android Studio or Java setup locally.

Before building, set signing values in `.env` (copy from `.env.example`).

```bash
# Build the APK in Docker
npm run android:build:docker

# If you need to wipe out the volumes/caches first
npm run android:build:docker:clean
```

- Source code is mounted read-only into the container.
- The `android/` folder is ignored from the host; Expo prebuild rebuilds it fresh inside the container.
- Final `*.apk` is exported to the local `builds/` directory.
- Global Gradle and npm caches persist via Docker volumes for faster subsequent builds.
