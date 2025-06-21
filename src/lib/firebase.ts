
// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6qOlaMBwU2I1YnEJ6L0MZpidpNTT6FWk",
  authDomain: "mtuexceat-6660d.firebaseapp.com",
  projectId: "mtuexceat-6660d",
  storageBucket: "mtuexceat-6660d.firebasestorage.app",
  messagingSenderId: "11331869899",
  appId: "1:11331869899:web:bc6603fe898733b08a4f4e"
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
