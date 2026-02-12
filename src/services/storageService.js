import { auth } from './firebase'

// Backend API URL (Removed)
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/**
 * Get Firebase Auth token for authenticated requests
 */
/**
 * Upload a file (Disabled - Backend removed)
 */
export async function uploadFile(file, folder = 'timesheet-attachments') {
  throw new Error('File upload is disabled because the backend server has been removed.')
}

/**
 * Delete a file (Disabled - Backend removed)
 */
export async function deleteFile(publicId) {
  console.warn('File deletion skipped: Backend server removed')
  return { success: true }
}

/**
 * Format file size to human readable string
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

/**
 * Get a friendly file type label from MIME type
 * @param {string} mimeType
 * @returns {string}
 */
export function getFileTypeLabel(mimeType) {
  if (!mimeType) return 'File'
  if (mimeType.startsWith('image/')) return 'Image'
  if (mimeType === 'application/pdf') return 'PDF'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType === 'text/csv') return 'Spreadsheet'
  if (mimeType.includes('document') || mimeType.includes('word')) return 'Document'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'Presentation'
  if (mimeType.startsWith('video/')) return 'Video'
  if (mimeType.startsWith('audio/')) return 'Audio'
  if (mimeType.startsWith('text/')) return 'Text'
  if (mimeType.includes('zip') || mimeType.includes('compressed') || mimeType.includes('archive')) return 'Archive'
  return 'File'
}
