
"use client";

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { auth, firebaseConfig } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updatePassword as firebaseUpdatePassword,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import type { User, UserRole, SignupData, UpdatePasswordData } from '@/lib/types';
import { getUserByFirebaseUID, createUserProfile, linkProfileToFirebaseUser } from '@/lib/mockApi'; 

const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'YOUR_API_KEY';

interface AuthContextType {
  currentUser: User | null; // Our app's User type
  firebaseUser: FirebaseUser | null; // Firebase's User type
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<User | null>;
  signup: (userData: SignupData) => Promise<User | null>;
  logout: () => Promise<void>;
  updateUserPassword: (data: UpdatePasswordData) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isFirebaseConfigured) {
      console.error("FIREBASE NOT CONFIGURED: Please update src/lib/firebase.ts with your project credentials. Authentication will not work.");
      setIsLoading(false);
      return; // Do not set up auth listener if firebase is not configured
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Fetch our app-specific user profile from mockApi (or Firestore in a full setup)
        let userProfile = await getUserByFirebaseUID(fbUser.uid);

        // If no profile with this UID, it might be a pre-defined staff user's first login.
        // Try to link the profile based on email.
        if (!userProfile && fbUser.email) {
            console.log(`No profile for UID ${fbUser.uid}. Trying to link by email ${fbUser.email}...`);
            userProfile = await linkProfileToFirebaseUser(fbUser.email, fbUser.uid);
        }

        setCurrentUser(userProfile || null);
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, pass: string): Promise<User | null> => {
    if (!isFirebaseConfigured) {
      throw new Error("Firebase is not configured. Please add your project credentials to src/lib/firebase.ts");
    }
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      // The onAuthStateChanged listener will handle setting the user profile
      const userProfile = await getUserByFirebaseUID(userCredential.user.uid);
      setCurrentUser(userProfile); // Manually set here to ensure immediate update post-login
      setFirebaseUser(userCredential.user); 
      setIsLoading(false);
      return userProfile;
    } catch (error) {
      setIsLoading(false);
      console.error("Firebase login error:", error);
      throw error; // Re-throw for the form to handle
    }
  }, []);

  const signup = useCallback(async (userData: SignupData): Promise<User | null> => {
     if (!isFirebaseConfigured) {
      throw new Error("Firebase is not configured. Please add your project credentials to src/lib/firebase.ts");
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const fbUser = userCredential.user;
      
      // Create user profile in our system (mockApi for now)
      const newUserProfileData: Omit<User, 'id'> = {
        firebaseUID: fbUser.uid,
        email: userData.email,
        fullName: userData.fullName,
        matricNumber: userData.matricNumber,
        role: 'student', // Sign up is always for students
      };
      const newUserProfile = await createUserProfile(newUserProfileData);
      setCurrentUser(newUserProfile);
      setFirebaseUser(fbUser); 
      setIsLoading(false);
      return newUserProfile;
    } catch (error) {
      setIsLoading(false);
      console.error("Firebase signup error:", error);
      throw error; // Re-throw for the form to handle
    }
  }, []);

  const logout = useCallback(async () => {
    if (!isFirebaseConfigured) {
      setCurrentUser(null);
      setFirebaseUser(null);
      router.push('/login');
      return;
    }
    setIsLoading(true);
    try {
      await signOut(auth);
      setCurrentUser(null);
      setFirebaseUser(null);
      router.push('/login');
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const updateUserPassword = useCallback(async (data: UpdatePasswordData) => {
    if (!isFirebaseConfigured) {
      throw new Error("Firebase is not configured. Please add your project credentials to src/lib/firebase.ts");
    }
    if (!auth.currentUser) throw new Error("User not authenticated.");
    try {
      await firebaseUpdatePassword(auth.currentUser, data.newPassword);
    } catch (error) {
      console.error("Password update error:", error);
      throw error;
    }
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    if (!isFirebaseConfigured) {
      throw new Error("Firebase is not configured. Please add your project credentials to src/lib/firebase.ts");
    }
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    }
  }, []);


  const value = { 
    currentUser, 
    firebaseUser, 
    isLoading, 
    login, 
    signup, 
    logout,
    updateUserPassword,
    sendPasswordReset
  };

  return React.createElement(AuthContext.Provider, { value: value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
