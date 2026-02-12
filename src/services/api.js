import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const PROJECTS_COLLECTION = 'projects';

export const projectService = {
    getAll: async () => {
        const snapshot = await getDocs(collection(db, PROJECTS_COLLECTION));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    create: async (projectData) => {
        const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), projectData);
        return { id: docRef.id, ...projectData };
    },

    update: async (id, updates) => {
        const docRef = doc(db, PROJECTS_COLLECTION, id);
        await updateDoc(docRef, updates);
        return { id, ...updates };
    },

    delete: async (id) => {
        const docRef = doc(db, PROJECTS_COLLECTION, id);
        await deleteDoc(docRef);
        return id;
    }
};
