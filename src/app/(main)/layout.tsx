
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/core/Header';
import { StudentSidebar } from '@/components/core/StudentSidebar';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-lg font-semibold animate-pulse">Loading...</p>
      </div>
    );
  }

  const isStudent = currentUser.role === 'student';

  return (
    <div className={cn("flex min-h-screen flex-col", isStudent ? "" : "bg-background")}>
      {isStudent ? (
        <div className="flex">
          <StudentSidebar />
          <main className="flex-1 pl-64 bg-background"> {/* Adjust pl value to match sidebar width */}
            {children}
             <footer className="py-6 text-center text-sm text-muted-foreground border-t bg-background print:hidden">
              © {new Date().getFullYear()} MTUEXCEAT - MTU. All rights reserved.
            </footer>
          </main>
        </div>
      ) : (
        <>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <footer className="py-6 text-center text-sm text-muted-foreground border-t print:hidden">
            © {new Date().getFullYear()} MTUEXCEAT - MTU. All rights reserved.
          </footer>
        </>
      )}
    </div>
  );
}
