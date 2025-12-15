# IOU

A minimal, offline-first personal finance tracker designed to manage debts, loans, and shared bills with ease. Built with performance and privacy in mind.

## Features

- **Transaction Tracking**: Record "I Owe You", "You Owe Me", and "Repayments" effortlessly.
- **Bill Management**: Create and manage shared bills with multiple participants.
- **User Profiles**: Manage contacts and track balances per person.
- **Data Privacy**: All data is stored locally on your device using SQLite.
- **Backup & Restore**: Securely export your data to JSON and restore it whenever needed.
- **Safe & Secure**: Confirmation safeguards for all destructive actions to prevent accidental data loss.
- **Dark Mode**: Sleek, battery-saving dark interface.

## Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) (Expo)
- **Database**: [SQLite](https://www.sqlite.org/index.html) via `expo-sqlite`
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS)

## Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/IOU.git
    cd IOU
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the app**
    ```bash
    npx expo start
    ```

## Data Management

Go to the **More** tab to manage your data:
- **Backup**: Exports a timestamped JSON file (e.g., `iou_backup_v1.0.0_2024-12-15.json`).
- **Restore**: Overwrites current data with a selected backup file.
- **Wipe**: Permanently deletes all app data.

---

*v1.0.0*
