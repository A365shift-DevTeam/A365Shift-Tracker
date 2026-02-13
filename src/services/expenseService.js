import { db } from './firebase'
import {
    collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy
} from 'firebase/firestore'

const EXPENSES_COLLECTION = 'expenses'

export const expenseService = {
    getExpenses: async () => {
        try {
            const q = query(collection(db, EXPENSES_COLLECTION), orderBy('date', 'desc'))
            const snapshot = await getDocs(q)
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        } catch (error) {
            console.error('Error fetching expenses:', error)
            return []
        }
    },

    createExpense: async (expenseData) => {
        try {
            const docRef = await addDoc(collection(db, EXPENSES_COLLECTION), {
                ...expenseData,
                createdAt: new Date().toISOString()
            })
            return { id: docRef.id, ...expenseData }
        } catch (error) {
            console.error('Error creating expense:', error)
            throw error
        }
    },

    updateExpense: async (id, updates) => {
        try {
            const docRef = doc(db, EXPENSES_COLLECTION, id)
            await updateDoc(docRef, updates)
            return { id, ...updates }
        } catch (error) {
            console.error('Error updating expense:', error)
            throw error
        }
    },

    deleteExpense: async (id) => {
        try {
            const docRef = doc(db, EXPENSES_COLLECTION, id)
            await deleteDoc(docRef)
            return id
        } catch (error) {
            console.error('Error deleting expense:', error)
            throw error
        }
    }
}
