"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getExeatRequestById, formatDate } from '@/lib/mockApi';
import type { ExeatRequest as ExeatRequestType, ExeatComment } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { ArrowLeft, Printer, User, FileText, CalendarDays, Contact, ShieldCheck, ShieldAlert, MessageSquare, QrCode } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/core/Logo';
import { useAuth } from '@/hooks/useAuth';

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
  const { currentUser } = useAuth();
  const [exeat, setExeat] = useState<ExeatRequestType | null | undefined>(null); // undefined for not found

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (id) {
      getExeatRequestById(id as string)
        .then(data => setExeat(data))
        .catch(error => {
          console.error("Failed to fetch exeat:", error);
          setExeat(undefined);
        });
    }
  }, [id]);

  if (exeat === null) {
    return <div className="flex min-h-screen items-center justify-center"><p className="text-lg">Loading exeat details...</p></div>;
  }

  if (exeat === undefined) {
    return <div className="flex min-h-screen items-center justify-center"><p className="text-lg text-destructive">Exeat not found.</p></div>;
  }
  
  // Security check: Only student who owns it or relevant staff can view
  const canView = currentUser?.id === exeat.studentId || 
                  ['porter', 'hod', 'dsa', 'admin'].includes(currentUser?.role || '');
  
  if (!canView) {
     return <div className="flex min-h-screen items-center justify-center"><p className="text-lg text-destructive">Access Denied.</p></div>;
  }


  return (
    <div className="container mx-auto py-8 px-4 md:px-6 print-friendly-page">
      <Button variant="outline" onClick={() => router.back()} className="mb-6 print:hidden">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

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
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-headline font-semibold mb-3 border-b pb-2">Approval Trail</h2>
            <div className="space-y-4">
              {exeat.approvalTrail.map((comment, index) => (
                <CommentDisplay key={index} comment={comment} />
              ))}
            </div>
          </section>
          
          {exeat.status === 'Approved' && (
            <>
            <Separator />
            <section className="text-center">
              <h2 className="text-xl font-headline font-semibold mb-3 border-b pb-2">Verification</h2>
              <div className="flex flex-col items-center">
                 <Image 
                    src={`https://placehold.co/150x150.png?text=${encodeURIComponent(exeat.id)}`} 
                    alt="QR Code for Exeat Verification" 
                    width={150} 
                    height={150}
                    data-ai-hint="qr code" 
                    className="rounded-md shadow-md"
                  />
                  <p className="text-sm text-muted-foreground mt-2">Scan to verify or use Exeat ID: {exeat.id}</p>
              </div>
            </section>
            </>
          )}

          <Separator className="print:hidden" />
          
          <div className="text-center pt-4 print:hidden">
            <Button onClick={() => window.print()} size="lg" className="shadow-md">
              <Printer className="mr-2 h-5 w-5" /> Print Exeat Permit
            </Button>
          </div>

          <div className="hidden print:block mt-8 text-xs text-center text-muted-foreground">
            This document is an official Exeat Permit from MTU. Validate at security checkpoints.
            <br />Printed on: {formatDate(new Date())}
          </div>
        </CardContent>
      </Card>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-friendly-page, .print-friendly-page * {
            visibility: visible;
          }
          .print-friendly-page {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-none { border: none !important; }
          .print\\:bg-transparent { background-color: transparent !important; }
        }
      `}</style>
    </div>
  );
}
