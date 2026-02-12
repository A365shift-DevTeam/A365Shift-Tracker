import { db } from './firebase'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, writeBatch, setDoc, getDoc
} from 'firebase/firestore'

const ENTRIES_COLLECTION = 'timesheet_entries'
const COLUMNS_COLLECTION = 'timesheet_columns'

// Default columns seeded on first load if none exist
const DEFAULT_COLUMNS = [
  { id: 'col-id', name: 'ID', type: 'text', required: false, visible: false, order: 0, config: { readOnly: true } },
  { id: 'col-task', name: 'Task', type: 'text', required: true, visible: true, order: 1 },
  { id: 'col-start-datetime', name: 'Start Date & Time', type: 'datetime', required: true, visible: true, order: 2 },
  { id: 'col-end-datetime', name: 'End Date & Time', type: 'datetime', required: false, visible: true, order: 3 },
  { id: 'col-notes', name: 'Notes', type: 'text', required: false, visible: true, order: 4, config: { multiline: true } },
  { id: 'col-name', name: 'Person', type: 'text', required: false, visible: true, order: 5 },
  { id: 'col-customer', name: 'Customer', type: 'text', required: false, visible: true, order: 6 },
  { id: 'col-site', name: 'Site', type: 'text', required: false, visible: true, order: 7 },
  { id: 'col-attachments', name: 'Attachments', type: 'file', required: false, visible: true, order: 8 }
]

// Helper: deduplicate columns by `id` field, delete extras from Firestore, return unique list
const deduplicateColumns = async (docs) => {
  const seen = new Map()
  const duplicateRefs = []

  for (const d of docs) {
    const data = d.data()
    const colId = data.id
    if (!colId) {
      // Document without an id field — delete it
      duplicateRefs.push(d.ref)
      continue
    }
    if (seen.has(colId)) {
      duplicateRefs.push(d.ref)
    } else {
      seen.set(colId, { ...data, _docId: d.id })
    }
  }

  // Delete duplicates from Firestore — AWAIT so they're gone before we return
  if (duplicateRefs.length > 0) {
    try {
      const batch = writeBatch(db)
      duplicateRefs.forEach(ref => batch.delete(ref))
      await batch.commit()
      console.log(`Cleaned ${duplicateRefs.length} duplicate column(s) from Firestore`)
    } catch (err) {
      console.error('Error cleaning duplicate columns:', err)
    }
  }

  return Array.from(seen.values())
}

// Sanitize entry values before saving to Firestore.
// Firestore has a 1MB doc limit — base64 data URLs from file inputs are too large.
// Strip them out and store only a placeholder/filename.
const sanitizeValuesForFirestore = (values) => {
  if (!values || typeof values !== 'object') return values
  const clean = {}
  for (const [key, val] of Object.entries(values)) {
    if (typeof val === 'string' && val.startsWith('data:')) {
      // It's a base64 data URL — too large for Firestore
      // Extract a readable label from the data URL type
      const mimeMatch = val.match(/^data:([^;]+)/)
      clean[key] = mimeMatch ? `[file: ${mimeMatch[1]}]` : '[file attached]'
    } else {
      clean[key] = val
    }
  }
  return clean
}

export const timesheetService = {
  // ─── Entries ───────────────────────────────────────────────

  getEntries: async () => {
    const snapshot = await getDocs(collection(db, ENTRIES_COLLECTION))
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  },

  createEntry: async (entryData) => {
    // Sanitize values to avoid Firestore size limits with base64 files
    const sanitized = {
      ...entryData,
      values: sanitizeValuesForFirestore(entryData.values),
      createdAt: new Date().toISOString()
    }
    const docRef = await addDoc(collection(db, ENTRIES_COLLECTION), sanitized)
    return { id: docRef.id, ...sanitized }
  },

  updateEntry: async (id, updates) => {
    const docRef = doc(db, ENTRIES_COLLECTION, id)
    // Sanitize values if present
    const sanitized = updates.values
      ? { ...updates, values: sanitizeValuesForFirestore(updates.values) }
      : updates
    await updateDoc(docRef, sanitized)
    return { id, ...sanitized }
  },

  deleteEntry: async (id) => {
    const docRef = doc(db, ENTRIES_COLLECTION, id)
    await deleteDoc(docRef)
    return id
  },

  // ─── Columns ───────────────────────────────────────────────

  getColumns: async () => {
    // Fetch ALL documents (no orderBy — ensures nothing is skipped)
    const snapshot = await getDocs(collection(db, COLUMNS_COLLECTION))

    // Deduplicate — keeps first occurrence of each column id, deletes extras from Firestore
    let cols = await deduplicateColumns(snapshot.docs)

    // Seed defaults if the collection is empty (use column id as Firestore doc id to prevent duplicates)
    if (cols.length === 0) {
      const batch = writeBatch(db)
      DEFAULT_COLUMNS.forEach(col => {
        const ref = doc(db, COLUMNS_COLLECTION, col.id)
        batch.set(ref, col)
      })
      await batch.commit()
      const snap2 = await getDocs(collection(db, COLUMNS_COLLECTION))
      cols = snap2.docs.map(d => ({ ...d.data(), _docId: d.id }))
    }

    // Sort by order field in JavaScript
    cols.sort((a, b) => (a.order ?? 999) - (b.order ?? 999))

    return cols
  },

  addColumn: async (columnData) => {
    const colId = 'col-' + Date.now()

    // Count existing columns for order
    const snapshot = await getDocs(collection(db, COLUMNS_COLLECTION))
    const existingIds = new Set()
    snapshot.docs.forEach(d => existingIds.add(d.data().id))
    const order = existingIds.size

    const payload = {
      id: colId,
      name: columnData.name,
      type: columnData.type || 'text',
      required: columnData.required || false,
      visible: columnData.visible !== false,
      order
    }
    // Include config (e.g., choice options) if provided
    if (columnData.config) {
      payload.config = columnData.config
    }
    // Use column id as Firestore doc id to prevent duplicates
    const ref = doc(db, COLUMNS_COLLECTION, colId)
    await setDoc(ref, payload)
    return { ...payload, _docId: colId }
  },

  updateColumn: async (columnId, updates) => {
    // Try direct lookup first (new docs use columnId as Firestore doc id)
    const directRef = doc(db, COLUMNS_COLLECTION, columnId)
    const directSnap = await getDoc(directRef)
    if (directSnap.exists()) {
      await updateDoc(directRef, updates)
      return { id: columnId, ...updates }
    }
    // Fallback: search by `id` field (old docs with auto-generated Firestore ids)
    const snapshot = await getDocs(collection(db, COLUMNS_COLLECTION))
    const target = snapshot.docs.find(d => d.data().id === columnId)
    if (!target) throw new Error('Column not found')
    await updateDoc(target.ref, updates)
    return { id: columnId, ...updates }
  },

  deleteColumn: async (columnId) => {
    const defaultIds = DEFAULT_COLUMNS.map(c => c.id)
    if (defaultIds.includes(columnId)) {
      throw new Error('Cannot delete default columns')
    }
    // Try direct lookup first
    const directRef = doc(db, COLUMNS_COLLECTION, columnId)
    const directSnap = await getDoc(directRef)
    if (directSnap.exists()) {
      await deleteDoc(directRef)
      return columnId
    }
    // Fallback: search by `id` field
    const snapshot = await getDocs(collection(db, COLUMNS_COLLECTION))
    const target = snapshot.docs.find(d => d.data().id === columnId)
    if (!target) throw new Error('Column not found')
    await deleteDoc(target.ref)
    return columnId
  },

  reorderColumns: async (orderedIds) => {
    const snapshot = await getDocs(collection(db, COLUMNS_COLLECTION))
    const batch = writeBatch(db)
    snapshot.docs.forEach(d => {
      const colId = d.data().id
      const newOrder = orderedIds.indexOf(colId)
      if (newOrder !== -1) {
        batch.update(d.ref, { order: newOrder })
      }
    })
    await batch.commit()
  }
}
