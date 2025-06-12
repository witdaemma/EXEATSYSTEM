
export type UserRole = "student" | "porter" | "hod" | "dsa" | "admin";

export interface User {
  id: string;
  email: string;
  fullName: string;
  matricNumber?: string;
  role: UserRole;
  password?: string; // Only for mock purposes, don't store plain text passwords in real apps
}

export type ExeatStatus = "Pending" | "Hold" | "Approved" | "Rejected";

export interface ExeatComment {
  userId: string;
  userName: string;
  role: UserRole;
  comment: string;
  timestamp: string; // ISO Date string
  action: "Approved" | "Declined" | "Rejected" | "Commented" | "Submitted";
}

export interface ExeatRequest {
  id: string; // Unique Exeat ID (e.g., EX-MTU-2025-00047)
  studentId: string;
  studentName: string;
  matricNumber: string;
  purpose: string;
  departureDate: string; // ISO Date string
  returnDate: string;   // ISO Date string
  contactInfo: string;
  consentDocumentName?: string; 
  consentDocumentUrl?: string; // Path to uploaded file (mock)
  status: ExeatStatus;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  approvalTrail: ExeatComment[];
  currentStage: UserRole | "Completed"; // Tracks whose turn it is or if completed
}
