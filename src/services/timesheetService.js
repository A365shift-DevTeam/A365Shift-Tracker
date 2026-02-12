import { db } from './firebase';
import { collection, addDoc, updateDoc, doc, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';

const TIMESHEETS_COLLECTION = 'timesheets';

export const timesheetService = {
    // Clock In: Create a new document with startTime
    clockIn: async (userId) => {
        const newEntry = {
            userId,
            startTime: Timestamp.now(),
            endTime: null,
            notes: '',
            date: new Date().toISOString().split('T')[0] // Store as YYYY-MM-DD for easy querying
        };
        const docRef = await addDoc(collection(db, TIMESHEETS_COLLECTION), newEntry);
        return { id: docRef.id, ...newEntry };
    },

    // Clock Out: Update the document with endTime
    clockOut: async (id, notes = '') => {
        const docRef = doc(db, TIMESHEETS_COLLECTION, id);
        const endTime = Timestamp.now();
        await updateDoc(docRef, { endTime, notes });
        return endTime;
    },

    // Get current active session (if any)
    getCurrentSession: async (userId) => {
        const q = query(
            collection(db, TIMESHEETS_COLLECTION),
            where('userId', '==', userId),
            where('endTime', '==', null),
            orderBy('startTime', 'desc'),
            limit(1)
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    },

    // Get entries for a specific user (e.g., last 7 days) - Simplified for now to get all
    getUserEntries: async (userId) => {
        const q = query(
            collection(db, TIMESHEETS_COLLECTION),
            where('userId', '==', userId),
            orderBy('startTime', 'desc'),
            limit(50)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
};
