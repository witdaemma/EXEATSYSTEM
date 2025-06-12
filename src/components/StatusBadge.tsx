import { Badge } from "@/components/ui/badge";
import type { ExeatStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ExeatStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  let className = "";

  switch (status) {
    case "Pending":
      variant = "outline";
      className = "border-yellow-500 text-yellow-600 bg-yellow-100";
      break;
    case "Hold":
      variant = "outline";
      className = "border-blue-500 text-blue-600 bg-blue-100";
      break;
    case "Approved":
      variant = "outline";
      className = "border-green-500 text-green-600 bg-green-100";
      break;
    case "Rejected":
      variant = "destructive";
      className = "border-red-500 text-red-600 bg-red-100"; // Destructive has its own styling mostly
      break;
  }

  return (
    <Badge variant={variant} className={cn("font-semibold", className)}>
      {status}
    </Badge>
  );
}
