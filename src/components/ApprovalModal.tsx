
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from '@/hooks/useAuth';
import type { ExeatRequest, UserRole } from '@/lib/types';
import { updateExeatRequestStatus } from '@/lib/mockApi';
import { formatDate } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const approvalSchema = z.object({
  comment: z.string().min(1, { message: "Comment is required, especially for declines/rejections." }).max(300, { message: "Comment is too long (max 300 characters)."}),
});

type ApprovalFormValues = z.infer<typeof approvalSchema>;

interface ApprovalModalProps {
  exeat: ExeatRequest;
  actorRole: UserRole; // To determine action text
  onActionComplete: () => void; // Callback to refresh data
  triggerButton: React.ReactNode;
}

export function ApprovalModal({ exeat, actorRole, onActionComplete, triggerButton }: ApprovalModalProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<ApprovalFormValues>({
    resolver: zodResolver(approvalSchema),
    defaultValues: { comment: '' },
  });
  
  const handleAction = async (actionType: 'Approved' | 'Declined' | 'Rejected') => {
    setErrorMessage(null); // Reset error on new action attempt
    if (!currentUser) {
      toast({ variant: "destructive", title: "Error", description: "User not authenticated." });
      return;
    }
    
    const isValid = await form.trigger();
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);
    const values = form.getValues();

    try {
      await updateExeatRequestStatus(exeat.id, currentUser, actionType, values.comment);
      toast({ title: "Action Successful", description: `Exeat request ${exeat.id} has been ${actionType.toLowerCase()}.` });
      onActionComplete();
      setIsOpen(false); 
      form.reset();
    } catch (error: any) {
        let detailedError = "An unexpected error occurred. Please try again.";
        if (error.code === 'permission-denied' || (error.message && error.message.toLowerCase().includes('permission'))) {
            detailedError = `Permission Denied: This usually means the staff user '${currentUser.email}' does not have the correct role ('${actorRole}') assigned in the Firestore '/users' collection. Please verify the user's data in your live database.`;
            toast({ variant: "destructive", title: "Permission Error", description: "See details in the modal." });
        } else {
            detailedError = (error as Error).message;
            toast({ variant: "destructive", title: "Action Failed", description: detailedError });
        }
        setErrorMessage(detailedError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset state when dialog is closed
      form.reset();
      setErrorMessage(null);
    }
  };

  const getActionText = (type: 'approve' | 'decline') => {
    if (actorRole === 'dsa') {
      return type === 'approve' ? 'Approve Exeat' : 'Reject Exeat';
    }
    return type === 'approve' ? 'Forward for Approval' : 'Decline Request';
  }
  
  const approveActionType = 'Approved';
  const declineActionType = actorRole === 'dsa' ? 'Rejected' : 'Declined';


  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Review Exeat Request: {exeat.id}</DialogTitle>
          <DialogDescription>
            Student: {exeat.studentName} ({exeat.matricNumber})<br/>
            Purpose: {exeat.purpose} <br/>
            Departure: {formatDate(exeat.departureDate, false)}, Return: {formatDate(exeat.returnDate, false)}
             {exeat.consentFormUrl && (
              <span className="block mt-2">
                <Button asChild variant="link" className="p-0 h-auto text-sm">
                  <Link href={exeat.consentFormUrl} target="_blank" rel="noopener noreferrer">
                    View Uploaded Consent Form
                  </Link>
                </Button>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <Alert variant="destructive" className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Action Failed</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Comment / Reason ({field.value.length}/300)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Provide remarks or reasons for your decision..." {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className="gap-2 sm:justify-between pt-4">
          <Button 
            variant="destructive" 
            onClick={() => handleAction(declineActionType)} 
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {getActionText('decline')}
          </Button>
          <Button 
            onClick={() => handleAction(approveActionType)} 
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {getActionText('approve')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
