
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from '@/hooks/useAuth';
import { createExeatRequest } from '@/lib/mockApi';
import type { ExeatRequest as ExeatRequestType } from '@/lib/types';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const exeatRequestSchema = z.object({
  purpose: z.string().min(5, { message: "Purpose must be at least 5 characters." }).max(200, {message: "Purpose is too long (max 200 chars)."}),
  departureDate: z.date({ required_error: "Departure date is required." }),
  returnDate: z.date({ required_error: "Return date is required." }),
  contactInfo: z.string().min(10, { message: "Contact information must be at least 10 characters." }).max(150, {message: "Contact info is too long (max 150 chars)."}),
}).refine(data => data.returnDate > data.departureDate, {
  message: "Return date must be after departure date.",
  path: ["returnDate"],
});

type ExeatRequestFormValues = z.infer<typeof exeatRequestSchema>;

export function ExeatRequestForm() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ExeatRequestFormValues>({
    resolver: zodResolver(exeatRequestSchema),
    defaultValues: {
      purpose: '',
      contactInfo: '',
    },
  });
  
  const onSubmit = async (values: ExeatRequestFormValues) => {
    if (!currentUser || !currentUser.matricNumber || !currentUser.fullName) {
      toast({ variant: "destructive", title: "Profile Incomplete", description: "Your profile is missing required information. Please log in again or contact support." });
      return;
    }
    setIsSubmitting(true);
    
    try {
      const requestData: Omit<ExeatRequestType, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'approvalTrail' | 'currentStage' | 'approvalTrailUserIds'> = {
        studentId: currentUser.firebaseUID,
        studentName: currentUser.fullName,
        matricNumber: currentUser.matricNumber,
        purpose: values.purpose,
        departureDate: values.departureDate.toISOString(),
        returnDate: values.returnDate.toISOString(),
        contactInfo: values.contactInfo,
      };
      
      const newExeat = await createExeatRequest(requestData, currentUser); 
      toast({ title: "Exeat Request Submitted!", description: `Your Exeat ID is ${newExeat.id}. Status: Pending.` });
      router.push('/student/dashboard');

    } catch (error) {
      console.error("Submission error:", error);
      toast({ variant: "destructive", title: "Submission Failed", description: (error as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!currentUser) return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading user data...
      </div>
    );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <Input value={currentUser.fullName || ''} disabled className="bg-muted/50" />
          </FormItem>
          <FormItem>
            <FormLabel>Matric Number</FormLabel>
            <Input value={currentUser.matricNumber || 'N/A'} disabled className="bg-muted/50" />
          </FormItem>
        </div>

        <FormField
          control={form.control}
          name="purpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purpose of Travel</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Attending a family event, medical appointment." {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="departureDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Departure Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) } // Disable past dates
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="returnDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Return Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < (form.getValues("departureDate") || new Date(new Date().setHours(0,0,0,0)))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="contactInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Off-campus Contact Information (Address & Phone)</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., 123 Main St, Anytown. Phone: 08012345678" {...field} rows={3}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground">
              By submitting this request, you confirm that all information is accurate. You will be required to present your parent/guardian's consent upon exit.
            </p>
        </div>


        <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Submit Exeat Request
        </Button>
      </form>
    </Form>
  );
}
