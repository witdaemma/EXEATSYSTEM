import type { User, ExeatRequest, ExeatStatus, UserRole, ExeatComment } from './types';
import { format } from 'date-fns';

let users: User[] = [
  { id: 'student1', email: 'student1@mtu.edu', fullName: 'John Student', matricNumber: 'MTU/20/0001', role: 'student', password: 'password' },
  { id: 'porter1', email: 'porter1@mtu.edu', fullName: 'Mr. Adam Porter', role: 'porter', password: 'password' },
  { id: 'hod1', email: 'hod1@mtu.edu', fullName: 'Dr. Eve HOD', role: 'hod', password: 'password' },
  { id: 'dsa1', email: 'dsa1@mtu.edu', fullName: 'Prof. Grace DSA', role: 'dsa', password: 'password' },
  { id: 'admin1', email: 'admin1@mtu.edu', fullName: 'Admin User', role: 'admin', password: 'password' },
];

let exeatRequests: ExeatRequest[] = [
  {
    id: 'EX-MTU-2024-00001',
    studentId: 'student1',
    studentName: 'John Student',
    matricNumber: 'MTU/20/0001',
    purpose: 'Family event',
    departureDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    returnDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    contactInfo: '08012345678, No 1. Family Lane',
    consentDocumentName: 'consent_form.pdf',
    consentDocumentUrl: 'https://placehold.co/200x300.png?text=Consent',
    status: 'Pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    approvalTrail: [{ userId: 'student1', userName: 'John Student', role: 'student', comment: 'Initial request submitted.', timestamp: new Date().toISOString(), action: 'Submitted' }],
    currentStage: 'porter',
  },
  {
    id: 'EX-MTU-2024-00002',
    studentId: 'student1',
    studentName: 'John Student',
    matricNumber: 'MTU/20/0001',
    purpose: 'Medical Appointment',
    departureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    returnDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    contactInfo: '08098765432, General Hospital',
    consentDocumentName: 'medical_note.jpg',
    consentDocumentUrl: 'https://placehold.co/200x300.png?text=Consent',
    status: 'Hold',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updatedAt: new Date().toISOString(),
    approvalTrail: [
      { userId: 'student1', userName: 'John Student', role: 'student', comment: 'Initial request submitted.', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), action: 'Submitted' },
      { userId: 'porter1', userName: 'Mr. Adam Porter', role: 'porter', comment: 'Document looks okay. Forwarded.', timestamp: new Date().toISOString(), action: 'Approved' }
    ],
    currentStage: 'hod',
  },
];

export const generateExeatId = (): string => {
  const year = new Date().getFullYear();
  const randomNum = String(Math.floor(Math.random() * 90000) + 10000).padStart(5, '0');
  return `EX-MTU-${year}-${randomNum}`;
};

// User Functions
export const getUserByEmail = async (email: string): Promise<User | undefined> => {
  return users.find(user => user.email === email);
};

export const getUserById = async (id: string): Promise<User | undefined> => {
  return users.find(user => user.id === id);
};

export const createUser = async (userData: Omit<User, 'id' | 'role'> & { role: UserRole }): Promise<User> => {
  const newUser: User = { 
    id: `user-${Date.now()}`, 
    ...userData,
    // Ensure matricNumber is set for students, or handle it as optional
    matricNumber: userData.role === 'student' ? (userData.matricNumber || `MTU/XX/${String(Math.floor(Math.random()*1000)).padStart(4,'0')}`) : undefined
  };
  users.push(newUser);
  return newUser;
};

// Exeat Functions
export const getExeatRequestsByStudent = async (studentId: string): Promise<ExeatRequest[]> => {
  return exeatRequests.filter(req => req.studentId === studentId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getExeatRequestsForRole = async (role: UserRole): Promise<ExeatRequest[]> => {
  switch (role) {
    case 'porter':
      return exeatRequests.filter(req => req.status === 'Pending' && req.currentStage === 'porter').sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    case 'hod':
      return exeatRequests.filter(req => req.status === 'Hold' && req.currentStage === 'hod').sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    case 'dsa':
      return exeatRequests.filter(req => req.status === 'Hold' && req.currentStage === 'dsa').sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    default:
      return [];
  }
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
    approvalTrail: [{ userId: student.id, userName: student.fullName, role: 'student', comment: 'Initial request submitted.', timestamp: new Date().toISOString(), action: 'Submitted' }],
    currentStage: 'porter',
  };
  exeatRequests.push(newExeat);
  return newExeat;
};

export const updateExeatRequestStatus = async (
  exeatId: string,
  actor: User,
  action: 'Approved' | 'Declined' | 'Rejected', // 'Declined' by Porter/HOD, 'Rejected' by DSA
  commentText: string
): Promise<ExeatRequest | undefined> => {
  const exeat = exeatRequests.find(req => req.id === exeatId);
  if (!exeat) return undefined;

  const newComment: ExeatComment = {
    userId: actor.id,
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
    } else { // Declined
      exeat.status = 'Rejected'; 
      exeat.currentStage = 'Completed'; // Or 'RejectedByPorter'
    }
  } else if (actor.role === 'hod') {
    if (action === 'Approved') {
      exeat.status = 'Hold';
      exeat.currentStage = 'dsa';
    } else { // Declined
      exeat.status = 'Rejected';
      exeat.currentStage = 'Completed'; // Or 'RejectedByHOD'
    }
  } else if (actor.role === 'dsa') {
    if (action === 'Approved') {
      exeat.status = 'Approved';
    } else { // Rejected
      exeat.status = 'Rejected';
    }
    exeat.currentStage = 'Completed';
  }
  
  // Simulate saving
  exeatRequests = exeatRequests.map(req => req.id === exeatId ? exeat : req);
  return exeat;
};

// Helper to format date for display
export const formatDate = (dateString: string | Date) => {
  return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
};
