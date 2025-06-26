
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
