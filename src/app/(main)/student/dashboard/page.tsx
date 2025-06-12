"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExeatCard } from '@/components/ExeatCard';
import { useAuth } from '@/hooks/useAuth';
import { getExeatRequestsByStudent } from '@/lib/mockApi';
import type { ExeatRequest } from '@/lib/types';
import { PlusCircle, Loader2 } from 'lucide-react';

export default function StudentDashboardPage() {
  const { currentUser } = useAuth();
  const [exeatRequests, setExeatRequests] = useState<ExeatRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser && currentUser.role === 'student') {
      setIsLoading(true);
      getExeatRequestsByStudent(currentUser.id)
        .then(data => {
          setExeatRequests(data);
        })
        .catch(error => console.error("Failed to fetch exeat requests:", error))
        .finally(() => setIsLoading(false));
    }
  }, [currentUser]);

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-headline font-bold">Your Exeat Requests</h1>
        <Button asChild size="lg" className="shadow-md hover:shadow-lg transition-shadow">
          <Link href="/student/request-exeat" className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Request New Exeat
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg">Loading your requests...</p>
        </div>
      ) : exeatRequests.length === 0 ? (
        <div className="text-center py-10 bg-card rounded-lg shadow p-8">
          <img src="https://placehold.co/300x200.png?text=No+Requests" alt="No requests" data-ai-hint="empty state illustration" className="mx-auto mb-4 rounded"/>
          <p className="text-xl text-muted-foreground">You haven't made any exeat requests yet.</p>
          <p className="text-muted-foreground">Click "Request New Exeat" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exeatRequests.map((exeat) => (
            <ExeatCard key={exeat.id} exeat={exeat} />
          ))}
        </div>
      )}
    </div>
  );
}
