import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, setDoc, query, where, or, orderBy } from 'firebase/firestore';

const CONTACTS_COLLECTION = 'contacts';
const SETTINGS_COLLECTION = 'settings';
const COLUMNS_DOC = 'contact_columns';

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
    },

    getColumns: async () => {
        const docRef = doc(db, SETTINGS_COLLECTION, COLUMNS_DOC);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data().columns;
        }
        return null;
    },

    saveColumns: async (columns) => {
        const docRef = doc(db, SETTINGS_COLLECTION, COLUMNS_DOC);
        await setDoc(docRef, { columns }, { merge: true });
        return columns;
    },

    getVendors: async () => {
        try {
            // Try to query vendors directly from Firestore
            // Check multiple possible field names: type, entityType, status
            const q1 = query(collection(db, CONTACTS_COLLECTION), where('type', '==', 'Vendor'));
            const q2 = query(collection(db, CONTACTS_COLLECTION), where('entityType', '==', 'Vendor'));
            const q3 = query(collection(db, CONTACTS_COLLECTION), where('status', '==', 'Vendor'));
            
            const [snapshot1, snapshot2, snapshot3] = await Promise.all([
                getDocs(q1).catch(() => ({ docs: [] })),
                getDocs(q2).catch(() => ({ docs: [] })),
                getDocs(q3).catch(() => ({ docs: [] }))
            ]);
            
            // Combine results and remove duplicates
            const allDocs = [...snapshot1.docs, ...snapshot2.docs, ...snapshot3.docs];
            const uniqueDocs = Array.from(new Map(allDocs.map(doc => [doc.id, doc])).values());
            
            return uniqueDocs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error querying vendors:', error);
            // Fallback: get all contacts and filter client-side
            const allContacts = await contactService.getContacts();
            return allContacts.filter(contact => 
                contact.type === 'Vendor' || 
                contact.entityType === 'Vendor' ||
                contact.status === 'Vendor'
            );
        }
    },

    // Vendor Email Responses
    getVendorResponses: async (vendorId) => {
        try {
            const responsesRef = collection(db, 'vendor_responses');
            const q = query(responsesRef, where('vendorId', '==', vendorId), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error fetching vendor responses:', error);
            return [];
        }
    },

    createVendorResponse: async (responseData) => {
        try {
            const responsesRef = collection(db, 'vendor_responses');
            const docRef = await addDoc(responsesRef, {
                ...responseData,
                createdAt: new Date().toISOString()
            });
            return { id: docRef.id, ...responseData };
        } catch (error) {
            console.error('Error creating vendor response:', error);
            throw error;
        }
    },

    saveEmailSent: async (emailData) => {
        try {
            const emailsRef = collection(db, 'vendor_emails');
            const docRef = await addDoc(emailsRef, {
                ...emailData,
                sentAt: new Date().toISOString(),
                status: 'sent'
            });
            return { id: docRef.id, ...emailData };
        } catch (error) {
            console.error('Error saving sent email:', error);
            throw error;
        }
    }
};
