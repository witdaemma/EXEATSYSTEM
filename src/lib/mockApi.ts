
import type { User, ExeatRequest, ExeatStatus, UserRole, ExeatComment, SignupData } from './types';
import { format } from 'date-fns';

// In a real Firebase app, this user data would live in Firestore, not in-memory.
// We're keeping it here for now to simulate profile data alongside Firebase Auth.
let users: User[] = [
  { id: 'student1-uid', firebaseUID: 'student1-uid', email: 'student1@mtu.edu.ng', fullName: 'Adekunle Gold', matricNumber: 'MTU/21/0001', role: 'student' },
  { id: 'porter1-uid', firebaseUID: 'porter1-uid', email: 'porter1@mtu.edu.ng', fullName: 'Babatunde Porter', role: 'porter' },
  { id: 'hod1-uid', firebaseUID: 'hod1-uid', email: 'hod1@mtu.edu.ng', fullName: 'Dr. Chinyere HOD', role: 'hod' },
  { id: 'dsa1-uid', firebaseUID: 'dsa1-uid', email: 'dsa1@mtu.edu.ng', fullName: 'Prof. Dayo DSA', role: 'dsa' },
  // Admin role is removed.
  // Add more mock users that Firebase Auth would create. Password is not stored here.
  // The 'id' here can be the same as firebaseUID for simplicity in this mock setup.
];

let exeatRequests: ExeatRequest[] = [
  {
    id: 'EX-MTU-2025-00001',
    studentId: 'student1-uid', // Matches firebaseUID
    studentName: 'Adekunle Gold',
    matricNumber: 'MTU/21/0001',
    purpose: 'Attend National Programming Contest',
    departureDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), 
    returnDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), 
    contactInfo: '08012345678, Tech Hub Lagos',
    consentDocumentName: 'invitation_letter.pdf',
    consentDocumentUrl: 'https://placehold.co/200x300.png?text=Invite',
    status: 'Pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    approvalTrail: [{ userId: 'student1-uid', userName: 'Adekunle Gold', role: 'student', comment: 'Initial request submitted.', timestamp: new Date().toISOString(), action: 'Submitted' }],
    currentStage: 'porter',
  },
  {
    id: 'EX-MTU-2025-00002',
    studentId: 'student1-uid',
    studentName: 'Adekunle Gold',
    matricNumber: 'MTU/21/0001',
    purpose: 'Urgent Family Visit',
    departureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    returnDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    contactInfo: '08098765432, No. 5, Family Estate, Ibadan',
    consentDocumentName: 'family_consent.jpg',
    consentDocumentUrl: 'https://placehold.co/200x300.png?text=Consent',
    status: 'Hold',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), 
    updatedAt: new Date().toISOString(),
    approvalTrail: [
      { userId: 'student1-uid', userName: 'Adekunle Gold', role: 'student', comment: 'Initial request submitted.', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), action: 'Submitted' },
      { userId: 'porter1-uid', userName: 'Babatunde Porter', role: 'porter', comment: 'Verified student identity. Forwarded.', timestamp: new Date().toISOString(), action: 'Approved' }
    ],
    currentStage: 'hod',
  },
   {
    id: 'EX-MTU-2025-00003',
    studentId: 'student1-uid',
    studentName: 'Adekunle Gold',
    matricNumber: 'MTU/21/0001',
    purpose: 'Weekend trip home',
    departureDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), 
    returnDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), 
    contactInfo: 'Home address, contact number',
    consentDocumentName: 'parental_note.pdf',
    consentDocumentUrl: 'https://placehold.co/200x300.png?text=Note',
    status: 'Approved',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    approvalTrail: [
      { userId: 'student1-uid', userName: 'Adekunle Gold', role: 'student', comment: 'Request for weekend.', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), action: 'Submitted' },
      { userId: 'porter1-uid', userName: 'Babatunde Porter', role: 'porter', comment: 'Checked and forwarded.', timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), action: 'Approved' },
      { userId: 'hod1-uid', userName: 'Dr. Chinyere HOD', role: 'hod', comment: 'Seems reasonable. Forwarded.', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), action: 'Approved' },
      { userId: 'dsa1-uid', userName: 'Prof. Dayo DSA', role: 'dsa', comment: 'Exeat approved. Maintain good conduct.', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), action: 'Approved' }
    ],
    currentStage: 'Completed',
  },
];

export const generateExeatId = (): string => {
  const year = new Date().getFullYear(); // Will be 2025 if current year is 2025
  const randomNum = String(Math.floor(Math.random() * 90000) + 10000).padStart(5, '0');
  return `EX-MTU-${year}-${randomNum}`; // Using current year for new IDs
};


// User Profile Functions (Simulating Firestore)
export const getUserByFirebaseUID = async (firebaseUID: string): Promise<User | undefined> => {
  return users.find(user => user.firebaseUID === firebaseUID);
};

export const createUserProfile = async (userData: Omit<User, 'id'> & { firebaseUID: string }): Promise<User> => {
  const existingUser = users.find(u => u.firebaseUID === userData.firebaseUID || u.email === userData.email);
  if (existingUser) {
    // This case should ideally be handled by Firebase Auth for email uniqueness.
    // If UID exists, it means profile creation might be re-attempted, update instead or handle.
    // For now, let's assume this means an error or return existing.
    console.warn("User profile or email already exists in mockApi:", userData.email);
    return existingUser; 
  }
  const newUser: User = { 
    id: userData.firebaseUID, // Use Firebase UID as the primary ID for our app's User object
    ...userData,
    matricNumber: userData.role === 'student' ? (userData.matricNumber || `MTU/XX/${String(Math.floor(Math.random()*1000)).padStart(4,'0')}`) : undefined
  };
  users.push(newUser);
  return newUser;
};

export const updateUserProfile = async (firebaseUID: string, profileData: Partial<User>): Promise<User | undefined> => {
  const userIndex = users.findIndex(u => u.firebaseUID === firebaseUID);
  if (userIndex === -1) return undefined;
  users[userIndex] = { ...users[userIndex], ...profileData };
  return users[userIndex];
};


// Exeat Functions
export const getExeatRequestsByStudent = async (studentId: string): Promise<ExeatRequest[]> => {
  return exeatRequests.filter(req => req.studentId === studentId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getExeatRequestsForRole = async (role: UserRole, userId: string): Promise<ExeatRequest[]> => {
  let relevantRequests: ExeatRequest[] = [];
  switch (role) {
    case 'porter':
      relevantRequests = exeatRequests.filter(req => 
        (req.status === 'Pending' && req.currentStage === 'porter') || 
        req.approvalTrail.some(comment => comment.userId === userId && comment.role === 'porter')
      );
      break;
    case 'hod':
      relevantRequests = exeatRequests.filter(req => 
        (req.status === 'Hold' && req.currentStage === 'hod') ||
        req.approvalTrail.some(comment => comment.userId === userId && comment.role === 'hod')
      );
      break;
    case 'dsa':
      relevantRequests = exeatRequests.filter(req => 
        (req.status === 'Hold' && req.currentStage === 'dsa') ||
        req.approvalTrail.some(comment => comment.userId === userId && comment.role === 'dsa')
      );
      break;
    default:
      return [];
  }
  // Sort to show pending ones first, then by update date
  return relevantRequests.sort((a,b) => {
    const isAPending = (a.status === 'Pending' && a.currentStage === role) || (a.status === 'Hold' && a.currentStage === role);
    const isBPending = (b.status === 'Pending' && b.currentStage === role) || (b.status === 'Hold' && b.currentStage === role);
    if (isAPending && !isBPending) return -1;
    if (!isAPending && isBPending) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
};

export const getExeatRequestById = async (id: string): Promise<ExeatRequest | undefined> => {
  return exeatRequests.find(req => req.id === id);
};

export const createExeatRequest = async (data: Omit<ExeatRequest, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'approvalTrail' | 'currentStage'>, student: User): Promise<ExeatRequest> => {
  const newExeat: ExeatRequest = {
    ...data,
    id: generateExeatId(),
    status: 'Pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    approvalTrail: [{ userId: student.firebaseUID, userName: student.fullName, role: 'student', comment: 'Initial request submitted.', timestamp: new Date().toISOString(), action: 'Submitted' }],
    currentStage: 'porter',
  };
  exeatRequests.push(newExeat);
  return newExeat;
};

export const updateExeatRequestStatus = async (
  exeatId: string,
  actor: User, // actor is our app's User type, which has firebaseUID
  action: 'Approved' | 'Declined' | 'Rejected', 
  commentText: string
): Promise<ExeatRequest | undefined> => {
  const exeat = exeatRequests.find(req => req.id === exeatId);
  if (!exeat) return undefined;

  const newComment: ExeatComment = {
    userId: actor.firebaseUID, // Use firebaseUID
    userName: actor.fullName,
    role: actor.role,
    comment: commentText,
    timestamp: new Date().toISOString(),
    action: action,
  };
  exeat.approvalTrail.push(newComment);
  exeat.updatedAt = new Date().toISOString();

  if (actor.role === 'porter') {
    if (action === 'Approved') {
      exeat.status = 'Hold';
      exeat.currentStage = 'hod';
    } else { 
      exeat.status = 'Rejected'; 
      exeat.currentStage = 'Completed'; 
    }
  } else if (actor.role === 'hod') {
    if (action === 'Approved') {
      exeat.status = 'Hold';
      exeat.currentStage = 'dsa';
    } else { 
      exeat.status = 'Rejected';
      exeat.currentStage = 'Completed'; 
    }
  } else if (actor.role === 'dsa') {
    if (action === 'Approved') {
      exeat.status = 'Approved';
    } else { 
      exeat.status = 'Rejected';
    }
    exeat.currentStage = 'Completed';
  }
  
  exeatRequests = exeatRequests.map(req => req.id === exeatId ? exeat : req);
  return exeat;
};

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
