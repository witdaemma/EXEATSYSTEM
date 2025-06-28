"use client";

import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import type { ExeatRequest, UserRole } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { ApprovalModal } from './ApprovalModal';
import { Eye, Edit3 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";


interface ExeatRequestTableProps {
  requests: ExeatRequest[];
  actorRole: UserRole;
  onActionComplete: () => void; // To refresh data after modal action
}

export function ExeatRequestTable({ requests, actorRole, onActionComplete }: ExeatRequestTableProps) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-10 bg-card rounded-lg shadow p-8">
        <img src="https://placehold.co/300x200.png?text=No+Pending+Items" alt="No pending items" data-ai-hint="empty state illustration" className="mx-auto mb-4 rounded"/>
        <p className="text-xl text-muted-foreground">No requests requiring your attention at this time.</p>
      </div>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead className="hidden md:table-cell">Purpose</TableHead>
                <TableHead className="hidden sm:table-cell">Departure</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((exeat) => (
                <TableRow key={exeat.id}>
                  <TableCell>
                    <div className="font-medium">{exeat.studentName}</div>
                    <div className="text-xs text-muted-foreground md:hidden">{exeat.purpose}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-[250px] truncate">{exeat.purpose}</TableCell>
                  <TableCell className="hidden sm:table-cell">{formatDate(exeat.departureDate, false)}</TableCell>
                  <TableCell><StatusBadge status={exeat.status} /></TableCell>
                  <TableCell className="text-right space-x-1 sm:space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/exeat/${exeat.id}`} title="View Details">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View Details</span>
                      </Link>
                    </Button>
                    <ApprovalModal
                      exeat={exeat}
                      actorRole={actorRole}
                      onActionComplete={onActionComplete}
                      triggerButton={
                        <Button variant="default" size="sm" title="Review Request">
                          <Edit3 className="h-4 w-4" />
                           <span className="sr-only sm:not-sr-only sm:ml-2">Review</span>
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
