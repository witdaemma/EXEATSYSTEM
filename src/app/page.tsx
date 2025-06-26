
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole, ExeatRequest, ExeatComment } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { StatusBadge } from '@/components/StatusBadge';
import { Search, Loader2, User, FileText, CalendarDays, MessageSquare, ShieldCheck, ShieldAlert, ShieldQuestion, FileCheck2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/core/Logo';
import { verifyExeat } from '@/ai/flows/verify-exeat-flow';
import { formatDate } from '@/lib/utils';

const verifySchema = z.object({
  exeatId: z.string().min(1, { message: "Exeat ID is required." }),
});
type VerifyFormValues = z.infer<typeof verifySchema>;

type ExeatDetails = NonNullable<Awaited<ReturnType<typeof verifyExeat>>>;

const CommentCard = ({ comment }: { comment: ExeatComment }) => {
  let icon = <MessageSquare className="h-5 w-5 text-muted-foreground" />;
  if (comment.action === 'Approved') icon = <ShieldCheck className="h-5 w-5 text-green-500" />;
  else if (comment.action === 'Declined' || comment.action === 'Rejected') icon = <ShieldAlert className="h-5 w-5 text-red-500" />;
  else if (comment.action === 'Submitted') icon = <FileText className="h-5 w-5 text-blue-500" />;

  return (
    <div className="flex items-start space-x-3 p-3 bg-muted/30 rounded-md">
      <div className="flex-shrink-0 pt-1">{icon}</div>
      <div>
        <p className="text-sm font-semibold">
          {comment.userName} <span className="text-xs text-muted-foreground">({comment.role.toUpperCase()}) - {comment.action}</span>
        </p>
        <p className="text-sm text-foreground">{comment.comment}</p>
        <p className="text-xs text-muted-foreground">{formatDate(comment.timestamp)}</p>
      </div>
    </div>
  )
};

function VerificationPortal() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [exeatDetails, setExeatDetails] = useState<ExeatDetails | null | undefined>(null); // null: idle, undefined: not found/error

  const form = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: { exeatId: '' },
  });

  const onSubmit = async (values: VerifyFormValues) => {
    const trimmedId = values.exeatId.trim();
    if (!trimmedId) {
      form.setError("exeatId", { type: "manual", message: "Exeat ID is required." });
      return;
    }

    setIsVerifying(true);
    setExeatDetails(null); // Reset to show loading state
    try {
      const details = await verifyExeat({ exeatId: trimmedId });
      // If details are null, it means 'not found'. Set state to 'undefined' to trigger the error message.
      setExeatDetails(details === null ? undefined : details);
    } catch (error) {
      console.error("Verification error:", error);
      setExeatDetails(undefined); // Indicate error
    } finally {
      setIsVerifying(false);
    }
  };
  
  const handlePrint = () => {
    const printContents = document.getElementById("printable-exeat-details")?.innerHTML;
    const originalContents = document.body.innerHTML;
    if (printContents) {
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // Reload to restore event listeners and original state
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <div className="absolute top-6 left-6">
          <Logo />
        </div>
      <Card className="w-full max-w-2xl shadow-xl mt-16">
        <CardHeader>
          <CardTitle className="font-headline text-2xl md:text-3xl">Verify Exeat ID</CardTitle>
          <CardDescription>Enter an Exeat ID to check its authenticity and approval status.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2 mb-6">
              <FormField
                control={form.control}
                name="exeatId"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel className="sr-only">Exeat ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., EX-MTU-2025-00001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isVerifying} className="h-10">
                {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Verify
              </Button>
            </form>
          </Form>

          {exeatDetails === null && !isVerifying && (
             <div className="text-center py-6 text-muted-foreground">
              <ShieldQuestion className="mx-auto h-12 w-12 mb-2"/>
              Enter an Exeat ID to begin verification.
            </div>
          )}
          
          {exeatDetails === undefined && !isVerifying && (
            <div className="text-center py-6 text-destructive">
              <ShieldAlert className="mx-auto h-12 w-12 mb-2"/>
              Exeat ID not found or an error occurred.
            </div>
          )}

          {exeatDetails && (
            <div id="printable-exeat-details"> {/* Wrapper for printing */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold font-headline">Exeat Details: {exeatDetails.id}</h2>
                  <StatusBadge status={exeatDetails.status} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><strong className="text-muted-foreground">Student:</strong> {exeatDetails.studentName} ({exeatDetails.matricNumber})</div>
                  <div><strong className="text-muted-foreground">Purpose:</strong> {exeatDetails.purpose}</div>
                  <div><strong className="text-muted-foreground">Departure:</strong> {formatDate(exeatDetails.departureDate)}</div>
                  <div><strong className="text-muted-foreground">Return:</strong> {formatDate(exeatDetails.returnDate)}</div>
                  <div className="md:col-span-2"><strong className="text-muted-foreground">Contact:</strong> {exeatDetails.contactInfo}</div>
                   {exeatDetails.consentFormUrl && (
                    <div className="md:col-span-2">
                      <strong className="text-muted-foreground">Consent:</strong>
                      <Button asChild variant="link" className="p-0 h-auto ml-2">
                          <Link href={exeatDetails.consentFormUrl} target="_blank" rel="noopener noreferrer">
                              View Uploaded Document
                          </Link>
                      </Button>
                    </div>
                  )}
                </div>

                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-3 font-headline">Approval Trail</h3>
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                    {exeatDetails.approvalTrail.map((comment, index) => (
                      <CommentCard key={index} comment={comment} />
                    ))}
                  </div>
                </div>
                
                <Separator className="print-hidden" />
                <div className="text-center print-hidden">
                   <Button variant="outline" onClick={handlePrint} className="mt-4">
                    Print Exeat Record
                  </Button>
                </div>
                 <div className="hidden print-block mt-8 text-xs text-center text-muted-foreground">
                    This document is an official Exeat Record from MTU. Validate at security checkpoints.
                    <br />Printed on: {formatDate(new Date())}
                  </div>
              </div>
            </div>
          )}
        </CardContent>
         <CardFooter className="print-hidden">
          <p className="text-xs text-muted-foreground w-full text-center">
            Staff or Student? <Link href="/login" className="font-medium text-primary hover:underline">Login here</Link>
          </p>
        </CardFooter>
      </Card>
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #printable-exeat-details, #printable-exeat-details * { visibility: visible; }
          #printable-exeat-details { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
          .print-hidden { display: none !important; }
          .print-block { display: block !important; }
        }
      `}</style>
    </div>
  );
}


export default function HomePage() {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && currentUser) {
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
          default:
            // Should not happen with defined roles, but good to have a fallback
            router.replace('/login'); 
        }
    }
  }, [currentUser, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg font-semibold">Loading MTUEXCEAT...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <VerificationPortal />;
  }

  // This part should ideally not be reached if redirection logic is correct
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-lg font-semibold animate-pulse">Redirecting...</p>
    </div>
  );
}
