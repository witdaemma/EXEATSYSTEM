import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (dateString: string | Date, includeTime: boolean = true) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) { // Check if date is valid
      return "Invalid Date";
    }
    if (includeTime) {
      return format(date, "MMM d, yyyy 'at' h:mm a");
    }
    return format(date, "yyyy-MM-dd");
  } catch (e) {
    return "Invalid Date";
  }
};
