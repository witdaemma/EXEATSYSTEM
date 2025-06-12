"use client";

import { ExeatRequestForm } from '@/components/forms/ExeatRequestForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RequestExeatPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl md:text-3xl">Request New Exeat</CardTitle>
          <CardDescription>
            Fill out the form below to submit your exeat request. Ensure all information is accurate and upload the required consent document.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExeatRequestForm />
        </CardContent>
      </Card>
    </div>
  );
}
