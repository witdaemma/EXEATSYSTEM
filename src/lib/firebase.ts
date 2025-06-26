
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
 * 3.  **Firestore Security Rules**: Go to Firestore -> Rules and paste the following block. 
 *     This version is cleaned up to prevent copy-paste errors.
 * 
 *     ```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Counter for generating unique exeat IDs
    match /counters/exeatRequests {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // User profiles can only be created, read, or updated by the user themselves.
    match /users/{userId} {
      allow create: if request.auth != null && request.auth.uid == userId;
      allow read, update: if request.auth != null && request.auth.uid == userId;
    }

    // Exeat requests can be read by anyone (for verification), but only written by authenticated users.
    match /exeatRequests/{exeatId} {
      allow read: if true;
      allow write: if request.auth != null;

      // The approval trail for an exeat can also be read by anyone, but only written by authenticated users.
      match /approvalTrail/{commentId} {
        allow read: if true;
        allow write: if request.auth != null;
      }
    }
  }
}
 *     ```
 * 
 * 4.  **Firebase Storage Security Rules**: Go to Storage -> Rules and paste the following.
 *     This is CRUCIAL for allowing uploads and making consent forms viewable by staff.
 * 
 *     ```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow public read access to all consent documents
    match /consentDocuments/{allPaths=**} {
      allow read;
      // Only allow authenticated users to upload (write)
      allow write: if request.auth != null;
    }
  }
}
 *     ```
 */
