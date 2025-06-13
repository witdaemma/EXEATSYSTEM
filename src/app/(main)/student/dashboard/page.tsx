
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { getExeatRequestsByStudent, formatDate } from '@/lib/mockApi';
import type { ExeatRequest } from '@/lib/types';
import { Loader2, Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from '@/components/StatusBadge';

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

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col items-center justify-center p-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-headline font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {currentUser?.fullName || 'Student'}!</p>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-xl">My Requests</CardTitle>
          <CardDescription>A summary of your recent exeat applications.</CardDescription>
        </CardHeader>
        <CardContent>
          {exeatRequests.length === 0 ? (
            <div className="text-center py-10">
              <img 
                src="https://placehold.co/300x200.png?text=No+Requests+Yet" 
                alt="No requests" 
                data-ai-hint="empty state document" 
                className="mx-auto mb-4 rounded-md"
              />
              <p className="text-xl text-muted-foreground">You haven't made any exeat requests yet.</p>
              <p className="text-muted-foreground">Use the sidebar to "Request Exeat".</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exeatRequests.map((exeat) => (
                  <TableRow key={exeat.id}>
                    <TableCell className="font-medium">{exeat.id}</TableCell>
                    <TableCell>{formatDate(exeat.departureDate, false)}</TableCell>
                    <TableCell className="max-w-[250px] truncate">{exeat.purpose}</TableCell>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    