
export type UserRole = "student" | "porter" | "hod" | "dsa";

export interface User {
  id: string; // This will be the Firebase UID
  firebaseUID: string; // Explicitly store Firebase UID
  email: string;
  fullName?: string;
  matricNumber?: string;
  role: UserRole;
  // Password is not stored here; Firebase Auth handles it.
}

export interface SignupData {
  fullName: string;
  matricNumber: string;
  email: string;
  password: string;
}

export interface UpdatePasswordData {
  newPassword: string;
}

export interface UpdateProfileData {
  fullName: string;
}


export type ExeatStatus = "Pending" | "Hold" | "Approved" | "Rejected";

export interface ExeatComment {
  userId: string; // Firebase UID of the actor
  userName: string;
  role: UserRole;
  comment: string;
  timestamp: string; // ISO Date string
  action: "Approved" | "Declined" | "Rejected" | "Commented" | "Submitted";
}

export interface ExeatRequest {
  id: string; // Unique Exeat ID (e.g., EX-MTU-2025-00047)
  studentId: string; // Firebase UID of the student
  studentName: string;
  matricNumber: string;
  purpose: string;
  departureDate: string; // ISO Date string
  returnDate: string;   // ISO Date string
  contactInfo: string;
  consentFormUrl?: string; // Optional URL for the uploaded consent form
  status: ExeatStatus;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  approvalTrail: ExeatComment[];
  approvalTrailUserIds: string[]; // For querying
  currentStage: UserRole | "Completed"; // Tracks whose turn it is or if completed
}
