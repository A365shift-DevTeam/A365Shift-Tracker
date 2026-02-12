import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_UPLOAD_URL } from './cloudinaryConfig'

/**
 * Upload a file to Cloudinary (free tier) and return metadata
 * Supports images, PDFs, documents, spreadsheets, and more
 *
 * @param {File} file - The File object from an <input type="file">
 * @param {string} folder - Cloudinary folder path (e.g. 'timesheet-attachments')
 * @returns {Promise<{url: string, fileName: string, fileType: string, fileSize: number, publicId: string}>}
 */
export async function uploadFile(file, folder = 'timesheet-attachments') {
  if (!file) throw new Error('No file provided')

  // Validate file size (max 10MB for free tier)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File too large. Maximum size is 10 MB on the free plan.')
  }

  // Check that Cloudinary is configured
  if (!CLOUDINARY_CLOUD_NAME || CLOUDINARY_CLOUD_NAME === 'YOUR_CLOUD_NAME_HERE') {
    throw new Error(
      'Cloudinary is not configured. Please open src/services/cloudinaryConfig.js and follow the setup instructions.'
    )
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  formData.append('folder', folder)

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const message = errorData?.error?.message || `Upload failed (${response.status})`
    throw new Error(message)
  }

  const data = await response.json()

  return {
    url: data.secure_url,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    publicId: data.public_id
  }
}

/**
 * Delete a file from Cloudinary
 * Note: Unsigned deletes are not supported by Cloudinary's free tier.
 * Files can be manually deleted from the Cloudinary dashboard.
 * The entry's attachment reference will be removed from Firestore.
 *
 * @param {string} publicId - The public_id returned during upload
 */
export async function deleteFile(publicId) {
  // Cloudinary does not allow unsigned deletes from the client.
  // The file remains in Cloudinary storage but gets unlinked from the entry.
  // To fully delete, go to your Cloudinary Media Library dashboard.
  console.info('File unlinked from entry. To delete from Cloudinary, use the dashboard:', publicId)
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
