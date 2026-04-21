# LuxeStay — Premium Hotel Reservation App

LuxeStay is a high-end mobile hotel reservation system built with React Native (Expo) and Firebase. It features role-based access control, real-time booking management, and a polished user interface.

## 🚀 Features

- **Guest Experience:**
  - Real-time room listings with filtering and sorting.
  - Multi-step booking process with availability checks.
  - Wishlist (Saved Rooms) and booking history.
  - Profile management and notification settings.
  
- **Admin Panel:**
  - Real-time analytics dashboard.
  - Room listing management (CRUD + photo uploads).
  - Global booking moderation.
  - Review moderation and admin replies.
  - Global system configuration (Hotel name, tax rates, etc.).

- **Infrastructure:**
  - **Firebase Auth:** Secure email/password authentication with custom claims for admin roles.
  - **Firestore:** Real-time NoSQL database with offline persistence and strict security rules.
  - **Firebase Storage:** Optimized image storage for room photos and user avatars.
  - **Error Handling:** Centralized mapping and graceful Error Boundaries.
  - **Network Support:** Real-time offline detection and cached data display.

## 🛠️ Setup Instructions

### 1. Prerequisites
- Node.js (LTS)
- Expo CLI (`npm install -g expo-cli`)
- Firebase Account

### 2. Installation
```bash
git clone <repository-url>
cd luxestay-mobile
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory (refer to `.env.example`):
```env
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
```

### 4. Setting up Admin Access
Admin roles are determined by **Firebase Custom Claims**. We provide a dedicated script to create a seed admin account, assign the required claims, and set up their Firestore profile.

#### Production / Live Project
1. Download your service account key from **Firebase Console > Project Settings > Service Accounts**.
2. Save the file as `serviceAccountKey.json` in the project root (this file is ignored by git).
3. Run the creation script:
   ```powershell
   # Windows (PowerShell)
   $env:GOOGLE_APPLICATION_CREDENTIALS=".\serviceAccountKey.json"
   npx ts-node scripts/createAdmin.ts
   ```

#### Local Development (Emulator)
If you are using the Firebase Emulator, ensure it is running and then execute:
```powershell
# Windows (PowerShell)
$env:FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099"
$env:FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"
npx ts-node scripts/createAdmin.ts
```

### 5. Seeding Initial Data
Run the following command to seed the room catalog and global system configuration (hotel name, currency, tax rates) into your Firestore project:
```bash
npx ts-node scripts/seedFirestore.ts
```

### 6. Running the App
```bash
# Start Expo development server
npm start

# For local development with Firebase Emulators
firebase emulators:start
```

## 📂 Project Structure

- `src/components`: Reusable UI components (Loaders, Modals, etc.).
- `src/context`: React Context providers (Auth, Booking, Room, etc.).
- `src/hooks`: Custom hooks for data fetching and system status.
- `src/repositories`: Raw Firestore CRUD operations (Data Access Layer).
- `src/services`: Business logic and service orchestration.
- `src/utils`: Helper functions, validation, and error mapping.

## 🔒 Security Rules

Deployment of rules and indexes:
```bash
firebase deploy --only firestore:rules,firestore:indexes,storage:rules
```

---
*Developed for LuxeStay Premium Hospitality.*
