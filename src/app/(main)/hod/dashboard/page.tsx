"use client";

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getExeatRequestsForRole } from '@/lib/mockApi';
import type { ExeatRequest } from '@/lib/types';
import { ExeatRequestTable } from '@/components/ExeatRequestTable';
import { Loader2 } from 'lucide-react';

export default function HODDashboardPage() {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<ExeatRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = useCallback(() => {
    if (currentUser && currentUser.role === 'hod') {
      setIsLoading(true);
      getExeatRequestsForRole('hod')
        .then(data => setRequests(data))
        .catch(error => console.error("Failed to fetch requests for HOD:", error))
        .finally(() => setIsLoading(false));
    }
  }, [currentUser]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  if (isLoading) {
     return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading requests for review...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-headline font-bold">HOD Dashboard</h1>
        <p className="text-muted-foreground">Review exeat requests forwarded by Porters.</p>
      </div>
      <ExeatRequestTable requests={requests} actorRole="hod" onActionComplete={fetchRequests} />
    </div>
  );
}
