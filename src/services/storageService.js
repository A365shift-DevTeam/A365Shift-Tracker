import { auth } from './firebase'

// Backend API URL (change this to your deployed backend URL in production)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/**
 * Get Firebase Auth token for authenticated requests
 */
async function getAuthToken() {
  const user = auth.currentUser
  if (!user) {
    throw new Error('You must be logged in to upload files')
  }
  return await user.getIdToken()
}

/**
 * Upload a file securely via backend API (signed Cloudinary upload)
 * Supports images, PDFs, documents, spreadsheets, and more
 * 
 * Security Features:
 * - Requires Firebase Authentication
 * - Server-side signed uploads (no exposed API secrets)
 * - User-specific folders (timesheet-attachments/{userId}/)
 * - File type and size validation
 *
 * @param {File} file - The File object from an <input type="file">
 * @param {string} folder - Cloudinary folder path (e.g. 'timesheet-attachments')
 * @returns {Promise<{url: string, fileName: string, fileType: string, fileSize: number, publicId: string}>}
 */
export async function uploadFile(file, folder = 'timesheet-attachments') {
  if (!file) throw new Error('No file provided')

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File too large. Maximum size is 10 MB.')
  }

  // Check backend connectivity first
  try {
    const healthCheck = await fetch(`${API_BASE_URL}/api/health`)
    if (!healthCheck.ok) {
      throw new Error(`Backend server is not responding (${healthCheck.status})`)
    }
  } catch (healthError) {
    console.error('Backend health check failed:', healthError)
    throw new Error(
      `Cannot connect to upload server at ${API_BASE_URL}. ` +
      `Please make sure the backend server is running. ` +
      `Error: ${healthError.message}`
    )
  }

  // Get Firebase Auth token
  let token
  try {
    token = await getAuthToken()
  } catch (error) {
    throw new Error('Authentication required. Please log in to upload files.')
  }

  // Prepare form data
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)

  // Upload via secure backend API
  let response
  try {
    response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
  } catch (networkError) {
    // Network error (backend not reachable, CORS, etc.)
    console.error('Network error:', networkError)
    throw new Error(
      `Cannot connect to upload server. Please make sure the backend is running at ${API_BASE_URL}. ` +
      `Error: ${networkError.message}`
    )
  }

  if (!response.ok) {
    let errorData = {}
    try {
      errorData = await response.json()
    } catch (parseError) {
      // Response is not JSON
      const text = await response.text().catch(() => 'Unknown error')
      throw new Error(`Upload failed (${response.status}): ${text || 'Server error'}`)
    }
    
    const message = errorData?.error || errorData?.message || `Upload failed (${response.status})`
    
    if (response.status === 401) {
      throw new Error('Authentication failed. Please log in again.')
    }
    
    if (response.status === 503) {
      throw new Error('Upload service not configured. Please check backend server configuration.')
    }
    
    throw new Error(message)
  }

  const data = await response.json()

  return {
    url: data.url,
    fileName: data.fileName,
    fileType: data.fileType,
    fileSize: data.fileSize,
    publicId: data.publicId
  }
}

/**
 * Delete a file securely via backend API
 * Only allows deletion of files owned by the authenticated user
 *
 * @param {string} publicId - The public_id returned during upload
 */
export async function deleteFile(publicId) {
  if (!publicId) {
    console.warn('No publicId provided for deletion')
    return
  }

  // Get Firebase Auth token
  let token
  try {
    token = await getAuthToken()
  } catch (error) {
    console.warn('Authentication required for file deletion:', error.message)
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/delete/${encodeURIComponent(publicId)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Delete failed:', errorData?.error || errorData?.message)
      throw new Error(errorData?.error || 'Failed to delete file')
    }

    const data = await response.json()
    console.info('File deleted successfully:', publicId)
    return data
  } catch (error) {
    console.error('Error deleting file:', error)
    throw error
  }
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
