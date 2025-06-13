
"use client";

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
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
import { getUserByFirebaseUID, createUserProfile, updateUserProfile } from '@/lib/mockApi'; // We'll still use mockApi for profile data for now

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
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Fetch our app-specific user profile from mockApi (or Firestore in a full setup)
        const userProfile = await getUserByFirebaseUID(fbUser.uid);
        setCurrentUser(userProfile || null); // Or create profile if it doesn't exist
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, pass: string): Promise<User | null> => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const userProfile = await getUserByFirebaseUID(userCredential.user.uid);
      setCurrentUser(userProfile);
      setIsLoading(false);
      return userProfile;
    } catch (error) {
      setIsLoading(false);
      console.error("Firebase login error:", error);
      throw error; // Re-throw for the form to handle
    }
  }, []);

  const signup = useCallback(async (userData: SignupData): Promise<User | null> => {
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
      setIsLoading(false);
      return newUserProfile;
    } catch (error) {
      setIsLoading(false);
      console.error("Firebase signup error:", error);
      throw error; // Re-throw for the form to handle
    }
  }, []);

  const logout = useCallback(async () => {
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
    if (!auth.currentUser) throw new Error("User not authenticated.");
    // Re-authentication might be needed for sensitive operations like password change.
    // This example assumes user is recently logged in or re-authentication is handled elsewhere.
    try {
      await firebaseUpdatePassword(auth.currentUser, data.newPassword);
      // Optionally, update password in your backend if you store it (hashed)
      // For this app, Firebase Auth is the source of truth for passwords.
    } catch (error) {
      console.error("Password update error:", error);
      throw error;
    }
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
