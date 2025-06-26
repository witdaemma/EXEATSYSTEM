
// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6qOlaMBwU2I1YnEJ6L0MZpidpNTT6FWk",
  authDomain: "mtuexceat-6660d.firebaseapp.com",
  projectId: "mtuexceat-6660d",
  storageBucket: "mtuexceat-6660d.appspot.com", // Corrected storage bucket format
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
const storage = getStorage(app);

export { app, auth, db, storage, firebaseConfig };

/**
 * IMPORTANT: SETUP INSTRUCTIONS
 * 
 * 1.  **Replace Credentials**: Replace the placeholder `firebaseConfig` values above with your actual 
 *     Firebase project's configuration. You can find this in your Firebase project settings.
 * 
 * 2.  **Enable Services**: In the Firebase Console, ensure you have enabled:
 *     -   **Authentication**: With the "Email/Password" provider.
 *     -   **Firestore Database**: In Production mode.
 *     -   **Storage**: Complete the setup wizard.
 * 
 * 3.  **Firestore Security Rules**: Go to Firestore -> Rules and paste the following:
 *     ```
 *     rules_version = '2';
 *     service cloud.firestore {
 *       match /databases/{database}/documents {
 *         // Counters collection can be incremented by authenticated users
 *         match /counters/exeatRequests {
 *           allow write: if request.auth != null;
 *           allow read; 
 *         }
 *         // Users can only read their own profile, but can create one
 *         match /users/{userId} {
 *           allow read, update: if request.auth != null && request.auth.uid == userId;
 *           allow create: if request.auth != null;
 *         }
 *         // Exeat requests can be publicly read for verification,
 *         // but can only be written to by authenticated users.
 *         match /exeatRequests/{exeatId} {
 *           allow read;
 *           allow write: if request.auth != null;
 *         }
 *         // The approval trail (a subcollection) follows the same pattern.
 *         match /exeatRequests/{exeatId}/{document=**} {
 *           allow read;
 *           allow write: if request.auth != null;
 *         }
 *       }
 *     }
 *     ```
 * 
 * 4.  **Firebase Storage Security Rules**: Go to Storage -> Rules and paste the following.
 *     This is CRUCIAL for allowing uploads and making consent forms viewable by staff.
 *     ```
 *     rules_version = '2';
 *     service firebase.storage {
 *       match /b/{bucket}/o {
 *         // Allow public read access to all consent documents
 *         match /consentDocuments/{allPaths=**} {
 *           allow read;
 *           // Only allow authenticated users to upload (write)
 *           allow write: if request.auth != null;
 *         }
 *       }
 *     }
 *     ```
 */
