"use client";

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from '@/hooks/useAuth';
import type { ExeatRequest, User, UserRole } from '@/lib/types';
import { updateExeatRequestStatus } from '@/lib/mockApi';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';

const approvalSchema = z.object({
  comment: z.string().min(1, { message: "Comment is required, especially for declines/rejections." }),
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

  const form = useForm<ApprovalFormValues>({
    resolver: zodResolver(approvalSchema),
    defaultValues: { comment: '' },
  });
  
  const handleAction = async (actionType: 'Approved' | 'Declined' | 'Rejected') => {
    if (!currentUser) {
      toast({ variant: "destructive", title: "Error", description: "User not authenticated." });
      return;
    }
    
    // Validate form before submitting action
    const isValid = await form.trigger();
    if (!isValid && (actionType === 'Declined' || actionType === 'Rejected')) {
      // If declining/rejecting, comment is strictly required by schema.
      // If approving, comment is optional - backend might handle this. For mock, we require it by schema.
      // If we want optional comment for approve:
      // if (!isValid && (actionType === 'Declined' || actionType === 'Rejected' || (actionType === 'Approved' && form.getValues('comment').trim() === '')))
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
    } catch (error) {
      toast({ variant: "destructive", title: "Action Failed", description: (error as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActionText = (type: 'approve' | 'decline') => {
    if (actorRole === 'dsa') {
      return type === 'approve' ? 'Approve Exeat' : 'Reject Exeat';
    }
    return type === 'approve' ? 'Approve & Forward' : 'Decline Request';
  }
  
  const approveActionType = 'Approved';
  const declineActionType = actorRole === 'dsa' ? 'Rejected' : 'Declined';


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Review Exeat Request: {exeat.id}</DialogTitle>
          <DialogDescription>
            Student: {exeat.studentName} ({exeat.matricNumber})<br/>
            Purpose: {exeat.purpose}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Comment / Reason</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Provide remarks or reasons for your decision..." {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button 
            variant="outline" 
            onClick={() => handleAction(declineActionType)} 
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {getActionText('decline')}
          </Button>
          <Button 
            onClick={() => handleAction(approveActionType)} 
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {getActionText('approve')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
