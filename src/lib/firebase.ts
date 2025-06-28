
// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_FIREBASE_STORAGE_BUCKET, // Corrected storage bucket format
  messagingSenderId: process.env.NEXT_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_FIREBASE_APP_ID
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

/*
================================================================================
IMPORTANT: FIREBASE SETUP INSTRUCTIONS
================================================================================

1.  **Replace Credentials**: Ensure the firebaseConfig object is correct.

2.  **Enable Services**: In the Firebase Console, enable Authentication, 
    Firestore, and Storage.

3.  **COPY THE RULES BELOW**: Go to Firestore -> Rules in your Firebase Console.
    Delete everything there and paste ONLY the block of code between the
    "START COPYING HERE" and "STOP COPYING HERE" lines.

// --- START COPYING HERE ---

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow get, list: if request.auth != null;
      allow create, update: if request.auth.uid == userId;
    }
    match /exeatRequests/{exeatId} {
      function isStaff() {
        return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['porter', 'hod', 'dsa'];
      }
      allow read: if true;
      allow create: if request.auth.uid == request.resource.data.studentId;
      allow update: if isStaff();
      match /approvalTrail/{commentId} {
        allow read: if true;
        allow create: if request.auth.uid == request.resource.data.userId;
      }
    }
    match /counters/exeatRequests {
      allow read, write: if request.auth != null;
    }
  }
}

// --- STOP COPYING HERE ---


4.  **Firebase Storage Security Rules**: Go to Storage -> Rules and paste the following.
    This allows uploads and makes consent forms viewable.

rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /mtuexceat_consents/{allPaths=**} {
      allow read;
      allow write: if request.auth != null;
    }
  }
}

*/
