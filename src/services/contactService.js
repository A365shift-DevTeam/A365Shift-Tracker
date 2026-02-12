import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const CONTACTS_COLLECTION = 'contacts';

export const contactService = {
    getContacts: async () => {
        const snapshot = await getDocs(collection(db, CONTACTS_COLLECTION));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    createContact: async (contactData) => {
        const docRef = await addDoc(collection(db, CONTACTS_COLLECTION), contactData);
        return { id: docRef.id, ...contactData };
    },

    updateContact: async (id, updates) => {
        const docRef = doc(db, CONTACTS_COLLECTION, id);
        await updateDoc(docRef, updates);
        return { id, ...updates };
    },

    deleteContact: async (id) => {
        const docRef = doc(db, CONTACTS_COLLECTION, id);
        await deleteDoc(docRef);
        return id;
    }
};
