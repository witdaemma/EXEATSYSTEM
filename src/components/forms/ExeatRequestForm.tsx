
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from '@/hooks/useAuth';
import { createExeatRequest } from '@/lib/mockApi';
import type { User, ExeatRequest as ExeatRequestType } from '@/lib/types';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, UploadCloud, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const exeatRequestSchema = z.object({
  purpose: z.string().min(5, { message: "Purpose must be at least 5 characters." }).max(200, {message: "Purpose is too long (max 200 chars)."}),
  departureDate: z.date({ required_error: "Departure date is required." }),
  returnDate: z.date({ required_error: "Return date is required." }),
  contactInfo: z.string().min(10, { message: "Contact information must be at least 10 characters." }).max(150, {message: "Contact info is too long (max 150 chars)."}),
  consentDocument: z.custom<FileList>().refine(files => files && files.length > 0, "Parent/Guardian consent is required.")
                                     .refine(files => files && files[0]?.size <= 5 * 1024 * 1024, "File size should be less than 5MB.")
                                     .refine(files => files && /\.(jpg|jpeg|png|pdf)$/i.test(files[0]?.name), "Only JPG, PNG, or PDF files are allowed."),
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
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const form = useForm<ExeatRequestFormValues>({
    resolver: zodResolver(exeatRequestSchema),
    defaultValues: {
      purpose: '',
      contactInfo: '',
      // consentDocument will be undefined initially
    },
  });
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Trigger validation for the file input
      form.setValue('consentDocument', files, { shouldValidate: true });
      setSelectedFileName(files[0].name);
    } else {
      form.setValue('consentDocument', new DataTransfer().files, { shouldValidate: true }); 
      setSelectedFileName(null);
    }
  };

  const onSubmit = async (values: ExeatRequestFormValues) => {
    if (!currentUser || !currentUser.matricNumber || !currentUser.firebaseUID) {
      toast({ variant: "destructive", title: "Error", description: "User not logged in, matric number or UID missing." });
      return;
    }
    setIsSubmitting(true);

    const requestData: Omit<ExeatRequestType, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'approvalTrail' | 'currentStage'> = {
      studentId: currentUser.firebaseUID, // Use Firebase UID
      studentName: currentUser.fullName,
      matricNumber: currentUser.matricNumber,
      purpose: values.purpose,
      departureDate: values.departureDate.toISOString(),
      returnDate: values.returnDate.toISOString(),
      contactInfo: values.contactInfo,
      // In a real app, upload the file and get URL. Here, just store name.
      consentDocumentName: values.consentDocument[0].name,
      consentDocumentUrl: `https://placehold.co/200x300.png?text=${encodeURIComponent(values.consentDocument[0].name)}` // Mock URL
    };

    try {
      // Pass the full currentUser object which includes firebaseUID
      const newExeat = await createExeatRequest(requestData, currentUser); 
      toast({ title: "Exeat Request Submitted!", description: `Your Exeat ID is ${newExeat.id}. Status: Pending.` });
      router.push('/student/dashboard');
    } catch (error) {
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
            <Input value={currentUser.fullName} disabled className="bg-muted/50" />
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

        <FormField
          control={form.control}
          name="consentDocument"
          render={({ fieldState }) => ( 
            <FormItem>
              <FormLabel>Parent/Guardian Consent Document (PDF/JPG/PNG, Max 5MB)</FormLabel>
              <FormControl>
                 <div className="relative">
                    <Input 
                      type="file" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange} // Use custom handler
                      className="hidden" 
                      id="consentDocumentFile" // Changed ID to avoid conflict with field name if any
                    />
                    <Label 
                      htmlFor="consentDocumentFile"
                      className={cn(
                        "flex items-center justify-center w-full h-32 px-4 transition bg-background border-2 border-dashed rounded-md appearance-none cursor-pointer hover:border-primary focus:outline-none",
                        fieldState.error && "border-destructive"
                      )}
                    >
                      <span className="flex items-center space-x-2">
                        <UploadCloud className="w-6 h-6 text-muted-foreground" />
                        <span className="font-medium text-muted-foreground">
                          {selectedFileName || "Click to upload document"}
                        </span>
                      </span>
                    </Label>
                  </div>
              </FormControl>
              <FormMessage /> {/* This will show Zod validation errors */}
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : 'Submit Exeat Request'}
        </Button>
      </form>
    </Form>
  );
}
