import { db } from './firebase'
import {
    collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy
} from 'firebase/firestore'

const INCOMES_COLLECTION = 'incomes'

export const incomeService = {
    getIncomes: async () => {
        try {
            const q = query(collection(db, INCOMES_COLLECTION), orderBy('date', 'desc'))
            const snapshot = await getDocs(q)
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        } catch (error) {
            console.error('Error fetching incomes:', error)
            return []
        }
    },

    createIncome: async (incomeData) => {
        try {
            const docRef = await addDoc(collection(db, INCOMES_COLLECTION), {
                ...incomeData,
                createdAt: new Date().toISOString()
            })
            return { id: docRef.id, ...incomeData }
        } catch (error) {
            console.error('Error creating income:', error)
            throw error
        }
    },

    updateIncome: async (id, updates) => {
        try {
            const docRef = doc(db, INCOMES_COLLECTION, id)
            await updateDoc(docRef, updates)
            return { id, ...updates }
        } catch (error) {
            console.error('Error updating income:', error)
            throw error
        }
    },

    deleteIncome: async (id) => {
        try {
            const docRef = doc(db, INCOMES_COLLECTION, id)
            await deleteDoc(docRef)
            return id
        } catch (error) {
            console.error('Error deleting income:', error)
            throw error
        }
    }
}
