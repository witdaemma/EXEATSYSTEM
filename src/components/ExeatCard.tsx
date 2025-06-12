import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import type { ExeatRequest } from "@/lib/types";
import { formatDate } from "@/lib/mockApi";
import { CalendarDays, ArrowRight, FileText } from "lucide-react";

interface ExeatCardProps {
  exeat: ExeatRequest;
}

export function ExeatCard({ exeat }: ExeatCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="font-headline text-lg mb-1">Exeat ID: {exeat.id}</CardTitle>
          <StatusBadge status={exeat.status} />
        </div>
        <CardDescription className="text-sm">Purpose: {exeat.purpose}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarDays className="mr-2 h-4 w-4" />
          <span>Departure: {formatDate(exeat.departureDate)}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarDays className="mr-2 h-4 w-4" />
          <span>Return: {formatDate(exeat.returnDate)}</span>
        </div>
        <div className="text-sm">
          <p className="font-medium">Last Update:</p>
          <p className="text-xs text-muted-foreground">{formatDate(exeat.updatedAt)}</p>
        </div>
        {exeat.approvalTrail.length > 0 && (
          <div className="text-sm">
            <p className="font-medium">Latest Comment:</p>
            <p className="text-xs text-muted-foreground truncate">
              "{exeat.approvalTrail[exeat.approvalTrail.length -1].comment}" by {exeat.approvalTrail[exeat.approvalTrail.length -1].userName} ({exeat.approvalTrail[exeat.approvalTrail.length-1].role})
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`/exeat/${exeat.id}`} className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> View Details <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
