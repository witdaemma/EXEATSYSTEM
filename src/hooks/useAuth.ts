
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
import type { User, UserRole, SignupData, UpdatePasswordData, UpdateProfileData } from '@/lib/types';
import { getUserByFirebaseUID, createUserProfile, linkProfileToFirebaseUser, updateUserProfile as mockUpdateUserProfile } from '@/lib/mockApi'; 

const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'YOUR_ACTUAL_API_KEY';

interface AuthContextType {
  currentUser: User | null; // Our app's User type
  firebaseUser: FirebaseUser | null; // Firebase's User type
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<FirebaseUser | null>;
  signup: (userData: SignupData) => Promise<User | null>;
  logout: () => Promise<void>;
  updateUserPassword: (data: UpdatePasswordData) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateUserProfile: (data: UpdateProfileData) => Promise<void>;
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
        setIsLoading(true);
        let userProfile = await getUserByFirebaseUID(fbUser.uid);

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

  const login = useCallback(async (email: string, pass: string): Promise<FirebaseUser | null> => {
    if (!isFirebaseConfigured) {
      throw new Error("Firebase is not configured. Please add your project credentials to src/lib/firebase.ts");
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      // The onAuthStateChanged listener will handle fetching the profile and setting state.
      return userCredential.user;
    } catch (error) {
      console.error("Firebase login error:", error);
      throw error;
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
      
      const newUserProfileData: Omit<User, 'id'> = {
        firebaseUID: fbUser.uid,
        email: userData.email,
        fullName: userData.fullName,
        matricNumber: userData.matricNumber,
        role: 'student',
      };
      const newUserProfile = await createUserProfile(newUserProfileData);
      setCurrentUser(newUserProfile);
      setFirebaseUser(fbUser); 
      setIsLoading(false);
      return newUserProfile;
    } catch (error) {
      setIsLoading(false);
      console.error("Firebase signup error:", error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    if (!isFirebaseConfigured) {
      setCurrentUser(null);
      setFirebaseUser(null);
      router.push('/login');
      return;
    }
    try {
      await signOut(auth);
      setCurrentUser(null);
      setFirebaseUser(null);
      router.push('/login');
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // No need to set loading state on logout
    }
  }, [router]);

  const updateUserPassword = useCallback(async (data: UpdatePasswordData) => {
    if (!isFirebaseConfigured) {
      throw new Error("Firebase is not configured.");
    }
    if (!auth.currentUser) throw new Error("User not authenticated.");
    try {
      await firebaseUpdatePassword(auth.currentUser, data.newPassword);
    } catch (error) {
      console.error("Password update error:", error);
      throw error;
    }
  }, []);

  const updateUserProfile = useCallback(async (data: UpdateProfileData) => {
    if (!currentUser || !currentUser.firebaseUID) {
      throw new Error("User not authenticated.");
    }
    setIsLoading(true);
    try {
      const updatedProfile = await mockUpdateUserProfile(currentUser.firebaseUID, data);
      if (updatedProfile) {
        setCurrentUser(updatedProfile);
      } else {
        throw new Error("Profile update failed in mock API.");
      }
    } catch (error) {
       console.error("Profile update error:", error);
       throw error;
    } finally {
        setIsLoading(false);
    }
  }, [currentUser]);

  const sendPasswordReset = useCallback(async (email: string) => {
    if (!isFirebaseConfigured) {
      throw new Error("Firebase is not configured.");
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
    sendPasswordReset,
    updateUserProfile
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
