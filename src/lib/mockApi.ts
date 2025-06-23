
import { format } from 'date-fns';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
  runTransaction,
  increment,
  arrayUnion
} from 'firebase/firestore';
import type { User, ExeatRequest, ExeatStatus, UserRole, ExeatComment } from './types';
import { db } from './firebase'; // Import the initialized db

// --- Helper Function ---
/**
 * Safely converts a Firestore Timestamp, a JavaScript Date, or an ISO string into an ISO string.
 * @param date The date value to convert.
 * @returns An ISO date string.
 */
const toISOString = (date: Timestamp | string | Date | undefined): string => {
  if (!date) {
    // Fallback for undefined dates, though data validation should prevent this.
    return new Date().toISOString();
  }
  if (date instanceof Timestamp) {
    return date.toDate().toISOString();
  }
  if (date instanceof Date) {
    return date.toISOString();
  }
  // If it's already a string, return it as is.
  return date;
};


// --- ID Generation ---
export const generateExeatId = async (): Promise<string> => {
  const counterRef = doc(db, 'counters', 'exeatRequests');
  let newIdNumber;

  try {
    await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      if (!counterDoc.exists()) {
        // Initialize the counter if it doesn't exist.
        transaction.set(counterRef, { count: 1 });
        newIdNumber = 1;
      } else {
        newIdNumber = counterDoc.data().count + 1;
        transaction.update(counterRef, { count: increment(1) });
      }
    });
  } catch (e) {
    console.error("Transaction failed: ", e);
    throw new Error("Could not generate a new Exeat ID.");
  }
  
  if (newIdNumber === undefined) {
    throw new Error("Failed to get new ID number from transaction.");
  }

  const year = new Date().getFullYear();
  const idString = String(newIdNumber).padStart(5, '0');
  return `EX-MTU-${year}-${idString}`;
};


// --- User Profile Functions (Firestore) ---
export const getUserByFirebaseUID = async (firebaseUID: string): Promise<User | undefined> => {
  // Use the UID directly as the document ID
  const userDocRef = doc(db, 'users', firebaseUID);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    const userData = userDocSnap.data();
    return {
      id: userDocSnap.id,
      firebaseUID: userDocSnap.id,
      ...userData
    } as User;
  }
  return undefined;
};

export const createUserProfile = async (userData: Omit<User, 'id'> & { firebaseUID: string }): Promise<User> => {
  const userDocRef = doc(db, 'users', userData.firebaseUID);
  
  // Data to be stored in Firestore, excluding redundant fields
  const profileData = {
    email: userData.email,
    fullName: userData.fullName,
    role: userData.role,
    ...(userData.role === 'student' && { matricNumber: userData.matricNumber })
  };

  await setDoc(userDocRef, profileData);

  return {
    id: userData.firebaseUID,
    ...userData
  };
};

export const linkProfileToFirebaseUser = async (email: string, firebaseUID: string): Promise<User | undefined> => {
    // A user's document ID in the 'users' collection should ALWAYS be their Firebase UID.
    // This function will attempt to find a user by email if a direct UID lookup fails,
    // which might happen during the first login of a pre-seeded staff account.
    
    const userByUID = await getUserByFirebaseUID(firebaseUID);
    if (userByUID) return userByUID;

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        console.log(`No profile found for email ${email} to link.`);
        return undefined;
    }

    const userDoc = querySnapshot.docs[0];
    const userProfileData = userDoc.data();
    
    // Create a new doc with the correct Firebase UID as the ID.
    const newUserDocRef = doc(db, 'users', firebaseUID);
    await setDoc(newUserDocRef, userProfileData);

    // Optional: You could delete the old document with the incorrect auto-ID here.
    // await deleteDoc(userDoc.ref);

    console.warn(`User profile for ${email} has been re-mapped to the correct Firebase UID: ${firebaseUID}.`);

    return {
      id: firebaseUID,
      firebaseUID: firebaseUID,
      ...userProfileData
    } as User;
};


export const updateUserProfile = async (firebaseUID: string, profileData: Partial<User>): Promise<User | undefined> => {
  const userDocRef = doc(db, 'users', firebaseUID);
  await updateDoc(userDocRef, profileData);
  return await getUserByFirebaseUID(firebaseUID);
};


// --- Exeat Functions (Firestore) ---

// Helper function to fetch an exeat doc and its approval trail
const getExeatWithTrail = async (exeatDocSnap: any): Promise<ExeatRequest> => {
    const exeatData = exeatDocSnap.data();

    const trailCollectionRef = collection(db, 'exeatRequests', exeatDocSnap.id, 'approvalTrail');
    const trailQuery = query(trailCollectionRef, orderBy('timestamp', 'asc'));
    const trailSnap = await getDocs(trailQuery);
    const approvalTrail = trailSnap.docs.map(doc => {
        const commentData = doc.data();
        return {
            ...commentData,
            timestamp: toISOString(commentData.timestamp)
        } as ExeatComment
    });

    return {
        ...exeatData,
        id: exeatDocSnap.id,
        // Convert dates safely to ISO strings
        departureDate: toISOString(exeatData.departureDate),
        returnDate: toISOString(exeatData.returnDate),
        createdAt: toISOString(exeatData.createdAt),
        updatedAt: toISOString(exeatData.updatedAt),
        approvalTrail,
    } as ExeatRequest;
};


export const getExeatRequestsByStudent = async (studentId: string): Promise<ExeatRequest[]> => {
  const exeatCollection = collection(db, 'exeatRequests');
  const q = query(exeatCollection, where('studentId', '==', studentId));
  const querySnapshot = await getDocs(q);
  
  const requests = await Promise.all(querySnapshot.docs.map(getExeatWithTrail));
  
  // Sort in the application layer to avoid needing a composite index.
  return requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getExeatRequestsForRole = async (role: UserRole, userId: string): Promise<ExeatRequest[]> => {
    const exeatCollection = collection(db, 'exeatRequests');

    // Query 1: Requests pending this role's action
    const pendingQuery = query(exeatCollection, where('currentStage', '==', role));
    // Query 2: Requests this user has already acted upon
    const actedOnQuery = query(exeatCollection, where('approvalTrailUserIds', 'array-contains', userId));

    const [pendingSnap, actedOnSnap] = await Promise.all([getDocs(pendingQuery), getDocs(actedOnQuery)]);
    
    const requestsMap = new Map<string, any>();
    pendingSnap.docs.forEach(doc => requestsMap.set(doc.id, doc));
    actedOnSnap.docs.forEach(doc => requestsMap.set(doc.id, doc));

    const uniqueDocs = Array.from(requestsMap.values());
    const requests = await Promise.all(uniqueDocs.map(getExeatWithTrail));
    
    // Sort to show pending ones first, then by update date
    return requests.sort((a,b) => {
        const isAPending = (a.status === 'Pending' || a.status === 'Hold') && a.currentStage === role;
        const isBPending = (b.status === 'Pending' || b.status === 'Hold') && b.currentStage === role;
        if (isAPending && !isBPending) return -1;
        if (!isAPending && isBPending) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
};


export const getExeatRequestById = async (id: string): Promise<ExeatRequest | undefined> => {
  const exeatDocRef = doc(db, 'exeatRequests', id);
  const exeatDocSnap = await getDoc(exeatDocRef);

  if (!exeatDocSnap.exists()) {
    return undefined;
  }
  return await getExeatWithTrail(exeatDocSnap);
};

export const createExeatRequest = async (data: Omit<ExeatRequest, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'approvalTrail' | 'approvalTrailUserIds' |'currentStage'>, student: User): Promise<ExeatRequest> => {
  const newExeatId = await generateExeatId();
  const exeatDocRef = doc(db, 'exeatRequests', newExeatId);
  const now = new Date();

  const newExeatData = {
    ...data,
    // Convert dates from ISO strings to Timestamps for Firestore storage
    departureDate: Timestamp.fromDate(new Date(data.departureDate)),
    returnDate: Timestamp.fromDate(new Date(data.returnDate)),
    status: 'Pending',
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
    currentStage: 'porter',
    approvalTrailUserIds: [student.firebaseUID],
  };

  await setDoc(exeatDocRef, newExeatData);

  const firstComment = {
    userId: student.firebaseUID,
    userName: student.fullName,
    role: 'student',
    comment: 'Initial request submitted.',
    action: 'Submitted',
    timestamp: Timestamp.fromDate(now)
  };

  const trailCollectionRef = collection(db, 'exeatRequests', newExeatId, 'approvalTrail');
  await addDoc(trailCollectionRef, firstComment);
  
  // Return the full object for confirmation
  const newExeat = await getExeatRequestById(newExeatId);
  if (!newExeat) throw new Error("Failed to create and retrieve new exeat request.");
  return newExeat;
};


export const updateExeatRequestStatus = async (
  exeatId: string,
  actor: User,
  action: 'Approved' | 'Declined' | 'Rejected', 
  commentText: string
): Promise<ExeatRequest | undefined> => {
  const exeatDocRef = doc(db, 'exeatRequests', exeatId);
  const now = new Date();

  const exeat = await getExeatRequestById(exeatId);
  if (!exeat) return undefined;

  let newStatus: ExeatStatus = exeat.status;
  let newStage: UserRole | 'Completed' = exeat.currentStage;

  if (actor.role === 'porter') {
    newStage = action === 'Approved' ? 'hod' : 'Completed';
    newStatus = action === 'Approved' ? 'Hold' : 'Rejected';
  } else if (actor.role === 'hod') {
    newStage = action === 'Approved' ? 'dsa' : 'Completed';
    newStatus = action === 'Approved' ? 'Hold' : 'Rejected';
  } else if (actor.role === 'dsa') {
    newStage = 'Completed';
    newStatus = action === 'Approved' ? 'Approved' : 'Rejected';
  }

  // Update main exeat document
  await updateDoc(exeatDocRef, {
      status: newStatus,
      currentStage: newStage,
      updatedAt: Timestamp.fromDate(now),
      approvalTrailUserIds: arrayUnion(actor.firebaseUID)
  });

  // Add new comment to approval trail subcollection
  const newComment = {
    userId: actor.firebaseUID,
    userName: actor.fullName,
    role: actor.role,
    comment: commentText,
    action: action,
    timestamp: Timestamp.fromDate(now)
  };
  const trailCollectionRef = collection(db, 'exeatRequests', exeatId, 'approvalTrail');
  await addDoc(trailCollectionRef, newComment);
  
  return await getExeatRequestById(exeatId);
};


// --- Utility ---
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
