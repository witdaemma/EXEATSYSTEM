"use client";

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getExeatRequestsForRole } from '@/lib/mockApi';
import type { ExeatRequest } from '@/lib/types';
import { ExeatRequestTable } from '@/components/ExeatRequestTable';
import { Loader2 } from 'lucide-react';

export default function PorterDashboardPage() {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<ExeatRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = useCallback(() => {
    if (currentUser && currentUser.role === 'porter') {
      setIsLoading(true);
      getExeatRequestsForRole('porter')
        .then(data => setRequests(data))
        .catch(error => console.error("Failed to fetch requests for porter:", error))
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
        <p className="ml-4 text-lg">Loading pending requests...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-headline font-bold">Porter Dashboard</h1>
        <p className="text-muted-foreground">Review and process new exeat requests.</p>
      </div>
      <ExeatRequestTable requests={requests} actorRole="porter" onActionComplete={fetchRequests} />
    </div>
  );
}
