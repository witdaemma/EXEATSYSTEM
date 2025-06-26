
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getExeatRequestById, formatDate } from '@/lib/mockApi';
import type { ExeatRequest as ExeatRequestType, ExeatComment } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { ArrowLeft, Printer, User, FileText, CalendarDays, Contact, ShieldCheck, ShieldAlert, MessageSquare, FileCheck2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/core/Logo';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const CommentDisplay = ({ comment }: { comment: ExeatComment }) => {
  let icon = <MessageSquare className="h-5 w-5 text-muted-foreground" />;
  let borderColor = "border-muted";

  if (comment.action === 'Approved') {
    icon = <ShieldCheck className="h-5 w-5 text-green-600" />;
    borderColor = "border-green-500";
  } else if (comment.action === 'Declined' || comment.action === 'Rejected') {
    icon = <ShieldAlert className="h-5 w-5 text-red-600" />;
    borderColor = "border-red-500";
  } else if (comment.action === 'Submitted') {
    icon = <FileText className="h-5 w-5 text-blue-600" />;
    borderColor = "border-blue-500";
  }

  return (
    <div className={`p-4 border-l-4 ${borderColor} bg-card rounded-r-md shadow-sm`}>
      <div className="flex items-center mb-1">
        {icon}
        <span className="ml-2 font-semibold text-sm">{comment.userName} ({comment.role.toUpperCase()}) - {comment.action}</span>
      </div>
      <p className="text-sm text-foreground ml-7">{comment.comment}</p>
      <p className="text-xs text-muted-foreground ml-7 mt-1">{formatDate(comment.timestamp)}</p>
    </div>
  );
};


export default function ExeatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser, isLoading: authLoading } = useAuth();
  const [exeat, setExeat] = useState<ExeatRequestType | null | undefined>(null); // undefined for not found
  const [isFetchingExeat, setIsFetchingExeat] = useState(true);

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (id) {
      setIsFetchingExeat(true);
      getExeatRequestById(id as string)
        .then(data => setExeat(data))
        .catch(error => {
          console.error("Failed to fetch exeat:", error);
          setExeat(undefined);
        })
        .finally(() => setIsFetchingExeat(false));
    }
  }, [id]);

  const handlePrint = () => {
    const printContents = document.getElementById("printable-exeat-card")?.innerHTML;
    const originalContents = document.body.innerHTML;

    if (printContents) {
      // Temporarily set body to only the printable content
      document.body.innerHTML = `
        <html>
          <head>
            <title>Exeat Permit - ${exeat?.id || ''}</title>
            <link rel="stylesheet" href="/globals.css"> <!-- Ensure Tailwind/global styles are linked -->
            <style>
              body { margin: 20px; font-family: 'Inter', sans-serif; }
              .print-friendly-page { width: 100%; }
              .print\\:hidden { display: none !important; }
              .print\\:block { display: block !important; }
              .print\\:shadow-none { box-shadow: none !important; }
              .print\\:border-none { border: none !important; }
              .print\\:bg-transparent { background-color: transparent !important; }
              /* Add any additional specific print styles here */
            </style>
          </head>
          <body>${printContents}</body>
        </html>`;
      window.print();
      // Restore original content
      document.body.innerHTML = originalContents;
      // It's often necessary to re-initialize or reload parts of the page if complex JS interactions are broken
      // For simplicity here, we might just rely on the user navigating or a simple reload if issues occur.
      // router.refresh(); // Or window.location.reload(); if state is lost.
    }
  };


  if (authLoading || isFetchingExeat) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-lg">Loading exeat details...</p>
      </div>
    );
  }

  if (exeat === undefined) {
    return <div className="flex min-h-screen items-center justify-center"><p className="text-lg text-destructive">Exeat not found.</p></div>;
  }
  
  if (!exeat) { // Should be covered by undefined but good for safety
     return <div className="flex min-h-screen items-center justify-center"><p className="text-lg">No exeat data.</p></div>;
  }

  // Security check: Only student who owns it or relevant staff can view
  const canView = currentUser?.firebaseUID === exeat.studentId || 
                  ['porter', 'hod', 'dsa'].includes(currentUser?.role || '');
  
  if (!canView) {
     return <div className="flex min-h-screen items-center justify-center"><p className="text-lg text-destructive">Access Denied.</p></div>;
  }


  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-6 print:hidden">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div id="printable-exeat-card" className="print-friendly-page"> {/* ID for printing selection */}
        <Card className="max-w-4xl mx-auto shadow-xl print:shadow-none print:border-none">
          <CardHeader className="bg-muted/30 print:bg-transparent">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="mb-2"><Logo /></div>
                <CardTitle className="font-headline text-2xl md:text-3xl">Exeat Permit</CardTitle>
                <CardDescription>Exeat ID: {exeat.id}</CardDescription>
              </div>
              <div className="text-right">
                <StatusBadge status={exeat.status} />
                <p className="text-xs text-muted-foreground mt-1">Issued: {formatDate(exeat.createdAt)}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <section>
              <h2 className="text-xl font-headline font-semibold mb-3 border-b pb-2">Student Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <p><User className="inline mr-2 h-4 w-4 text-primary" /><strong>Name:</strong> {exeat.studentName}</p>
                <p><FileText className="inline mr-2 h-4 w-4 text-primary" /><strong>Matric No:</strong> {exeat.matricNumber}</p>
                <p><CalendarDays className="inline mr-2 h-4 w-4 text-primary" /><strong>Departure:</strong> {formatDate(exeat.departureDate)}</p>
                <p><CalendarDays className="inline mr-2 h-4 w-4 text-primary" /><strong>Return:</strong> {formatDate(exeat.returnDate)}</p>
                <p className="md:col-span-2"><FileText className="inline mr-2 h-4 w-4 text-primary" /><strong>Purpose:</strong> {exeat.purpose}</p>
                <p className="md:col-span-2"><Contact className="inline mr-2 h-4 w-4 text-primary" /><strong>Off-Campus Contact:</strong> {exeat.contactInfo}</p>
                 {exeat.consentFormUrl && (
                  <div className="md:col-span-2 mt-2">
                      <Button asChild variant="secondary" className="print:hidden">
                          <Link href={exeat.consentFormUrl} target="_blank" rel="noopener noreferrer">
                              <FileCheck2 className="mr-2 h-4 w-4" /> View Consent Form
                          </Link>
                      </Button>
                  </div>
                )}
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-headline font-semibold mb-3 border-b pb-2">Approval Trail</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {exeat.approvalTrail.map((comment, index) => (
                  <CommentDisplay key={index} comment={comment} />
                ))}
              </div>
            </section>
            
            <div className="hidden print:block mt-8 text-xs text-center text-muted-foreground">
              This document is an official Exeat Permit from Mountain Top University. 
              <br/>Validate at security checkpoints using the Exeat ID.
              <br />Printed on: {formatDate(new Date())}
            </div>
          </CardContent>
        </Card>
      </div> {/* End of printable-exeat-card */}

      <Separator className="my-6 print:hidden" />
      
      <div className="text-center pt-4 print:hidden">
        <Button onClick={handlePrint} size="lg" className="shadow-md">
          <Printer className="mr-2 h-5 w-5" /> Print Exeat Permit
        </Button>
      </div>

       {/* Global styles for print are handled by the handlePrint function injecting styles */}
    </div>
  );
}
