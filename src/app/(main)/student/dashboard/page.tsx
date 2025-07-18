"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { getExeatRequestsByStudent } from '@/lib/mockApi';
import { formatDate } from '@/lib/utils';
import type { ExeatRequest } from '@/lib/types';
import { Loader2, Eye, PlusCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { StatusBadge } from '@/components/StatusBadge';

export default function StudentDashboardPage() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const [exeatRequests, setExeatRequests] = useState<ExeatRequest[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (currentUser && currentUser.role === 'student' && currentUser.firebaseUID) {
      setIsFetching(true);
      try {
        const data = await getExeatRequestsByStudent(currentUser.firebaseUID);
        setExeatRequests(data);
      } catch (error) {
        console.error("Failed to fetch exeat requests:", error);
        setExeatRequests([]);
      } finally {
        setIsFetching(false);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (!authLoading && currentUser) {
      fetchRequests();
    }
    if (!authLoading && !currentUser) {
        setIsFetching(false);
    }
  }, [authLoading, currentUser, fetchRequests]);

  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col items-center justify-center p-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading your dashboard...</p>
      </div>
    );
  }
  
  if (!currentUser || currentUser.role !== 'student') {
     return (
      <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col items-center justify-center p-6">
        <p className="ml-4 text-lg text-destructive">Access Denied or user data not loaded. Please log in.</p>
         <Button asChild className="mt-4">
            <Link href="/login">Go to Login</Link>
          </Button>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {currentUser?.fullName || 'Student'}!</p>
        </div>
        <Button asChild size="lg">
          <Link href="/student/request-exeat">
            <PlusCircle className="mr-2 h-5 w-5" /> Request New Exeat
          </Link>
        </Button>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-xl">My Exeat Requests</CardTitle>
          <CardDescription>A summary of your exeat applications.</CardDescription>
        </CardHeader>
        <CardContent>
          {isFetching ? (
             <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-3 text-muted-foreground">Fetching requests...</p>
              </div>
          ) : exeatRequests.length === 0 ? (
            <div className="text-center py-10">
              <img 
                src="https://placehold.co/300x200.png?text=No+Requests+Yet" 
                alt="No requests" 
                data-ai-hint="empty state document" 
                className="mx-auto mb-4 rounded-md"
              />
              <p className="text-xl text-muted-foreground">You haven't made any exeat requests yet.</p>
              <p className="text-muted-foreground">Click "Request New Exeat" to start.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead className="hidden sm:table-cell">Departure</TableHead>
                    <TableHead className="hidden sm:table-cell">Return</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exeatRequests.map((exeat) => (
                    <TableRow key={exeat.id}>
                      <TableCell className="font-medium">{exeat.id}</TableCell>
                       <TableCell className="max-w-[150px] truncate sm:max-w-[200px]" title={exeat.purpose}>{exeat.purpose}</TableCell>
                      <TableCell className="hidden sm:table-cell">{formatDate(exeat.departureDate, false)}</TableCell>
                      <TableCell className="hidden sm:table-cell">{formatDate(exeat.returnDate, false)}</TableCell>
                      <TableCell><StatusBadge status={exeat.status} /></TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/exeat/${exeat.id}`} className="flex items-center gap-1">
                            <Eye className="h-4 w-4" /> View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {exeatRequests.length > 0 && !isFetching && (
           <CardFooter className="justify-end">
             <p className="text-xs text-muted-foreground">Total Requests: {exeatRequests.length}</p>
           </CardFooter>
        )}
      </Card>
    </div>
  );
}
