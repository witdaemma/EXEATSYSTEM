
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircleIcon, LifeBuoy } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-headline font-bold">Help & Support</h1>
        <p className="text-muted-foreground">Find answers to common questions and get support.</p>
      </div>

      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center">
            <HelpCircleIcon className="mr-2 h-6 w-6 text-primary" />
            Frequently Asked Questions (FAQ)
          </CardTitle>
          <CardDescription>Common queries about the ExeatTrack system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I request an exeat?</AccordionTrigger>
              <AccordionContent>
                To request an exeat, navigate to the "Request Exeat" page using the sidebar. Fill in all required details, including purpose, dates, contact information, and upload your parent/guardian consent document. Then, click "Submit Exeat Request".
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How can I check the status of my request?</AccordionTrigger>
              <AccordionContent>
                You can view all your exeat requests and their current statuses on your "Dashboard" or "My Requests" page. The status (e.g., Pending, Hold, Approved, Rejected) will be displayed next to each request.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>What do the different statuses mean?</AccordionTrigger>
              <AccordionContent>
                - **Pending:** Your request has been submitted and is awaiting review by the Porter. <br />
                - **Hold:** Your request has been reviewed by the Porter and/or HOD and is awaiting further approval (e.g., from HOD or DSA). <br />
                - **Approved:** Your request has been fully approved by the DSA. You can print your exeat permit. <br />
                - **Rejected:** Your request has been declined at one of the approval stages. Check the comments for reasons.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Who do I contact if I have an issue?</AccordionTrigger>
              <AccordionContent>
                For technical issues with the ExeatTrack system, please contact the IT support desk. For questions regarding exeat policies or specific decisions on your request, please consult with the Student Affairs office or your Head of Department.
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-5">
              <AccordionTrigger>Can I edit my request after submitting it?</AccordionTrigger>
              <AccordionContent>
                Currently, submitted exeat requests cannot be edited. If you need to make changes, you may need to contact the Porter's office to see if they can decline the current request, allowing you to submit a new one with the corrected information. It's best to ensure all details are accurate before submission.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

       <Card className="max-w-3xl mx-auto shadow-xl mt-8">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center">
            <LifeBuoy className="mr-2 h-6 w-6 text-primary" />
            Contact Support
          </CardTitle>
          <CardDescription>If you need further assistance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
            <p>If your question isn't answered in the FAQ, you can reach out to:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Student Affairs Office:</strong> For policy-related queries. Email: <a href="mailto:studentaffairs@mtu.edu.ng" className="text-primary hover:underline">studentaffairs@mtu.edu.ng</a></li>
                <li><strong>IT Help Desk:</strong> For technical issues with the portal. Email: <a href="mailto:ithelpdesk@mtu.edu.ng" className="text-primary hover:underline">ithelpdesk@mtu.edu.ng</a></li>
            </ul>
             <p className="text-xs text-muted-foreground pt-2">Please provide your Matric Number and Exeat ID (if applicable) when contacting support.</p>
        </CardContent>
      </Card>
    </div>
  );
}

    