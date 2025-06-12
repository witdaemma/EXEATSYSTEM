// src/hooks/useAuth.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User, UserRole } from '@/lib/types';
import { getUserByEmail, createUser as apiCreateUser } from '@/lib/mockApi';

interface AuthState {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<User | null>;
  signup: (userData: Omit<User, 'id' | 'role'> & {role: UserRole}) => Promise<User | null>;
  logout: () => void;
}

const AUTH_STORAGE_KEY = 'exeattrack_user';

export function useAuth(): AuthState {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to load user from localStorage", error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, pass: string): Promise<User | null> => {
    setIsLoading(true);
    // In a real app, you'd call an API. Here we use mockApi.
    const user = await getUserByEmail(email);
    if (user && user.password === pass) { // Mock password check
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      setCurrentUser(user);
      setIsLoading(false);
      return user;
    }
    setIsLoading(false);
    return null;
  }, []);

  const signup = useCallback(async (userData: Omit<User, 'id'>): Promise<User | null> => {
    setIsLoading(true);
    // Ensure student role for signup through this flow
    const userToCreate = {...userData, role: 'student' as UserRole };
    const existingUser = await getUserByEmail(userToCreate.email);
    if (existingUser) {
      setIsLoading(false);
      throw new Error("User with this email already exists.");
    }
    const newUser = await apiCreateUser(userToCreate);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    setCurrentUser(newUser);
    setIsLoading(false);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setCurrentUser(null);
    router.push('/login');
  }, [router]);

  return { currentUser, isLoading, login, signup, logout };
}
