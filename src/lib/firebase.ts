
// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, firebaseConfig };

/**
 * IMPORTANT:
 * 1. Replace the placeholder `firebaseConfig` values above with your actual Firebase project's configuration.
 * You can find these details in your Firebase project settings:
 * Project Overview -> Project settings (gear icon) -> General tab -> Your apps -> Firebase SDK snippet (click Config).
 * 
 * 2. Ensure you have enabled Email/Password sign-in in Firebase Authentication:
 * Firebase Console -> Authentication -> Sign-in method -> Email/Password (enable it).
 * 
 * 3. Set up Firestore security rules. For development, you can start with:
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     match /{document=**} {
 *       allow read, write: if request.auth != null; // Or more restrictive rules
 *     }
 *   }
 * }
 * Remember to configure more secure rules for production.
 */
