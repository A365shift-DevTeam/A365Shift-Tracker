import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';

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
    },

    getById: async (id) => {
        const docRef = doc(db, PROJECTS_COLLECTION, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            return null;
        }
    }
};

const TASKS_COLLECTION = 'tasks';

export const taskService = {
    getAll: async () => {
        const snapshot = await getDocs(collection(db, TASKS_COLLECTION));
        return snapshot.docs.map(doc => ({ firebaseId: doc.id, ...doc.data() }));
    },

    create: async (taskData) => {
        const docRef = await addDoc(collection(db, TASKS_COLLECTION), taskData);
        return { firebaseId: docRef.id, ...taskData };
    },

    update: async (firebaseId, updates) => {
        const docRef = doc(db, TASKS_COLLECTION, firebaseId);
        await updateDoc(docRef, updates);
        return { firebaseId, ...updates };
    },

    delete: async (firebaseId) => {
        const docRef = doc(db, TASKS_COLLECTION, firebaseId);
        await deleteDoc(docRef);
        return firebaseId;
    }
};
