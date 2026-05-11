# Firebase Setup Guide - Capture Crew

Follow these detailed steps to activate your Certificate Verification and Admin Dashboard.

## 1. Create your Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **"Add project"**.
3. Name it `Capture-Crew-Web` (or anything you like).
4. You can disable Google Analytics for this project to keep it simple.
5. Click **"Create project"** and wait for it to finish.

## 2. Register your Web App
1. On your Project Overview page, click the **Web icon** (`</>`) to add an app.
2. App nickname: `Capture Crew Frontend`.
3. **Do not** check "Firebase Hosting" for now (we can do that later).
4. Click **"Register app"**.
5. You will see a `firebaseConfig` object that looks like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "...",
     projectId: "...",
     // ...
   };
   ```
6. Copy this entire object.
7. Open `src/firebase.js` in your code editor and replace the placeholder values with your copied ones.

## 3. Enable Authentication (For Admin Login)
1. In the left sidebar, click **"Build"** -> **"Authentication"**.
2. Click **"Get Started"**.
3. Under **"Sign-in method"**, select **"Email/Password"**.
4. Enable the first toggle (Email/Password) and click **"Save"**.
5. **Create your first Admin**:
   - Go to the **"Users"** tab.
   - Click **"Add user"**.
   - Enter an email (e.g., `admin@capturecrew.com`) and a strong password.
   - You will use these credentials to log in to your dashboard.

## 4. Setup Firestore Database (For Certificates)
1. In the left sidebar, click **"Build"** -> **"Firestore Database"**.
2. Click **"Create database"**.
3. **Location**: Keep it as the default (e.g., `nam5-us-central`).
4. **Security Rules**: Select **"Start in test mode"** (this allows us to start quickly). Click **"Create"**.
5. **Add your first certificate manually (Optional)**:
   - Click **"Start collection"**.
   - Collection ID: `certificates`.
   - Document ID: Click "Auto-ID".
   - Add fields:
     - `name`: (string) "John Doe"
     - `serialNo`: (string) "CC-2024-001"
     - `date`: (string) "2024-05-11"
     - `event`: (string) "Varnakriti 2024"

## 5. Deployment Note
Once you have pasted the config into `src/firebase.js`, your local development server (`npm run dev`) will automatically connect to your live database. When you push to GitHub, Vercel will also use these settings to make the live site functional.
