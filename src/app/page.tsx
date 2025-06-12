"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/lib/types';

export default function HomePage() {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (currentUser) {
        // Redirect based on role
        switch (currentUser.role as UserRole) {
          case 'student':
            router.replace('/student/dashboard');
            break;
          case 'porter':
            router.replace('/porter/dashboard');
            break;
          case 'hod':
            router.replace('/hod/dashboard');
            break;
          case 'dsa':
            router.replace('/dsa/dashboard');
            break;
          case 'admin':
            router.replace('/admin/verify');
            break;
          default:
            router.replace('/login'); // Fallback, should not happen
        }
      } else {
        router.replace('/login');
      }
    }
  }, [currentUser, isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-lg font-semibold animate-pulse">Loading ExeatTrack...</p>
    </div>
  );
}
