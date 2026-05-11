import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Replace these with your actual Firebase config from the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDjDDCDXplng41wWEz2ZU8zcJKhr8P0n0k",
  authDomain: "capture-crew-web.firebaseapp.com",
  projectId: "capture-crew-web",
  storageBucket: "capture-crew-web.firebasestorage.app",
  messagingSenderId: "232199793875",
  appId: "1:232199793875:web:855a239b75f0146c3c3826"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize App Check (Commented out for initial setup troubleshooting)
/*
if (typeof window !== "undefined") {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6LciXoMqAAAAAKGZ_z-q_Z-Z-Z-Z-Z-Z-Z-Z-Z'), 
    isTokenAutoRefreshEnabled: true
  });
}
*/
