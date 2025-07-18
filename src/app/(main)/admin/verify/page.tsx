
"use client";

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { ExeatComment } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { Search, Loader2, FileText, ShieldCheck, ShieldAlert, ShieldQuestion, MessageSquare, Terminal } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { verifyExeat, type VerifyExeatOutput } from '@/ai/flows/verify-exeat-flow';
import { formatDate } from '@/lib/utils';

const verifySchema = z.object({
  exeatId: z.string().min(1, { message: "Exeat ID is required." }),
});

type VerifyFormValues = z.infer<typeof verifySchema>;
type ExeatDetails = NonNullable<VerifyExeatOutput['data']>;


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
}


export default function VerifyExeatPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [exeatDetails, setExeatDetails] = useState<ExeatDetails | null | undefined>(null); // null: idle, undefined: not found
  const [verificationError, setVerificationError] = useState<string | null>(null);

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

    setIsLoading(true);
    setExeatDetails(null);
    setVerificationError(null);
    try {
      const result = await verifyExeat({ exeatId: trimmedId });
      
      if (result.error) {
        setVerificationError(result.error);
        setExeatDetails(undefined);
      } else {
        setExeatDetails(result.data === null ? undefined : result.data);
      }
    } catch (error) {
      console.error("Verification submission error:", error);
      setVerificationError("A network error occurred or the server is unavailable. Please check the console and try again.");
      setExeatDetails(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Card className="max-w-2xl mx-auto shadow-xl">
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
                      <Input placeholder="e.g., EX-MTU-2024-00001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="h-10">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Verify
              </Button>
            </form>
          </Form>

          {verificationError && (
            <Alert variant="destructive" className="my-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Verification Failed</AlertTitle>
              <AlertDescription>{verificationError}</AlertDescription>
            </Alert>
          )}

          {exeatDetails === null && !isLoading && !verificationError && (
             <div className="text-center py-6 text-muted-foreground">
              <ShieldQuestion className="mx-auto h-12 w-12 mb-2"/>
              Enter an Exeat ID to begin verification.
            </div>
          )}
          
          {exeatDetails === undefined && !isLoading && !verificationError && (
            <div className="text-center py-6 text-destructive">
              <ShieldAlert className="mx-auto h-12 w-12 mb-2"/>
              Exeat ID not found. Please double-check the ID and try again.
            </div>
          )}

          {exeatDetails && (
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
              </div>

              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3 font-headline">Approval Trail</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {exeatDetails.approvalTrail.map((comment, index) => (
                    <CommentCard key={index} comment={comment} />
                  ))}
                </div>
              </div>
              
              <Separator />
              <div className="text-center">
                 <Button variant="outline" onClick={() => window.print()} className="mt-4">
                  Print Exeat Record
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
