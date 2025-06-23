
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
    // If we're logging in and a profile exists with a matching email but a DIFFERENT ID,
    // it means there's a data consistency issue.
    // The most direct way is to fetch the user profile using the UID.
    // This function will attempt to find a user by email if a direct UID lookup fails,
    // which might happen during the first login of a pre-seeded staff account.
    
    // First, try the most efficient lookup: by UID
    const userByUID = await getUserByFirebaseUID(firebaseUID);
    if (userByUID) return userByUID;

    // If no user found by UID (e.g., first login for pre-seeded staff), try to find by email
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        console.log(`No profile found for email ${email} to link.`);
        return undefined;
    }

    const userDoc = querySnapshot.docs[0];
    const userProfileData = userDoc.data();

    // The user was found by email. Now, we create a new document with the correct Firebase UID as the ID
    // and delete the old one to fix the data inconsistency.
    const newUserDocRef = doc(db, 'users', firebaseUID);
    await setDoc(newUserDocRef, userProfileData);

    // Optional but recommended: delete the old document that had the incorrect auto-ID
    // await deleteDoc(userDoc.ref);

    console.warn(`User profile for ${email} was found with an incorrect document ID. It has been re-mapped to the correct Firebase UID: ${firebaseUID}.`);

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
    const approvalTrail = trailSnap.docs.map(doc => doc.data() as ExeatComment);

    return {
        ...exeatData,
        id: exeatDocSnap.id,
        // Convert Firestore Timestamps to ISO strings
        departureDate: (exeatData.departureDate as Timestamp).toDate().toISOString(),
        returnDate: (exeatData.returnDate as Timestamp).toDate().toISOString(),
        createdAt: (exeatData.createdAt as Timestamp).toDate().toISOString(),
        updatedAt: (exeatData.updatedAt as Timestamp).toDate().toISOString(),
        approvalTrail,
    } as ExeatRequest;
};


export const getExeatRequestsByStudent = async (studentId: string): Promise<ExeatRequest[]> => {
  const exeatCollection = collection(db, 'exeatRequests');
  // The composite query was removed to avoid needing a manual index creation.
  const q = query(exeatCollection, where('studentId', '==', studentId));
  const querySnapshot = await getDocs(q);
  
  const requests = await Promise.all(querySnapshot.docs.map(getExeatWithTrail));
  
  // Sorting is now done in the application layer.
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
        const isAPending = (a.status === 'Pending' && a.currentStage === role) || (a.status === 'Hold' && a.currentStage === role);
        const isBPending = (b.status === 'Pending' && b.currentStage === role) || (b.status === 'Hold' && b.currentStage === role);
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
    status: 'Pending',
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
    currentStage: 'porter',
    approvalTrailUserIds: [student.firebaseUID],
  };

  await setDoc(exeatDocRef, newExeatData);

  const firstComment: ExeatComment = {
      userId: student.firebaseUID, 
      userName: student.fullName, 
      role: 'student', 
      comment: 'Initial request submitted.', 
      timestamp: now.toISOString(), 
      action: 'Submitted'
  };

  const trailCollectionRef = collection(db, 'exeatRequests', newExeatId, 'approvalTrail');
  await addDoc(trailCollectionRef, { ...firstComment, timestamp: Timestamp.fromDate(now) });
  
  // Return the full object for confirmation
  return await getExeatRequestById(newExeatId) as ExeatRequest;
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
    if (action === 'Approved') {
      newStatus = 'Hold';
      newStage = 'hod';
    } else { 
      newStatus = 'Rejected'; 
      newStage = 'Completed'; 
    }
  } else if (actor.role === 'hod') {
    if (action === 'Approved') {
      newStatus = 'Hold';
      newStage = 'dsa';
    } else { 
      newStatus = 'Rejected';
      newStage = 'Completed'; 
    }
  } else if (actor.role === 'dsa') {
    if (action === 'Approved') {
      newStatus = 'Approved';
    } else { 
      newStatus = 'Rejected';
    }
    newStage = 'Completed';
  }

  // Update main exeat document
  await updateDoc(exeatDocRef, {
      status: newStatus,
      currentStage: newStage,
      updatedAt: Timestamp.fromDate(now),
      approvalTrailUserIds: arrayUnion(actor.firebaseUID)
  });

  // Add new comment to approval trail subcollection
  const newComment: Omit<ExeatComment, 'timestamp'> = {
    userId: actor.firebaseUID,
    userName: actor.fullName,
    role: actor.role,
    comment: commentText,
    action: action,
  };
  const trailCollectionRef = collection(db, 'exeatRequests', exeatId, 'approvalTrail');
  await addDoc(trailCollectionRef, { ...newComment, timestamp: Timestamp.fromDate(now) });
  
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
