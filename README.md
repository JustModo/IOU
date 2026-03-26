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

## Container Android Build (No Local Eject)

Use Docker Compose to build Android artifacts without generating `android/` or `ios/` in your local project.

Before building, set signing values in `.env` (copy from `.env.example`).

```bash
docker compose up --build
```

- Source code is mounted read-only into the container.
- Expo prebuild/eject and Gradle run inside a container volume (`/workspace`).
- Final `*.apk` is exported to local `builds/`.
- Caches are persisted via Docker volumes (`workspace`, `gradle-cache`, `npm-cache`) for faster repeat builds.
