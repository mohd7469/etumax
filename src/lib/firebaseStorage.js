import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject, listAll, getMetadata } from 'firebase/storage';
import { isValidImageUrl } from '@/lib/utils';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];

export const validateFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'File type not allowed. Supported: images and PDFs' };
  }

  return { valid: true };
};

export const uploadFile = (file, onProgress) => {
  return new Promise((resolve, reject) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      reject(new Error(validation.error));
      return;
    }

    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `media/${timestamp}-${randomId}-${sanitizedName}`;
    const storageRef = ref(storage, storagePath);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(progress);
        }
      },
      (error) => {
        console.debug('Upload error:', error);
        let errorMessage = 'Upload failed';

        if (error.code === 'storage/unauthorized') {
          errorMessage = 'Unauthorized. Check Firebase Storage rules.';
        } else if (error.code === 'storage/quota-exceeded') {
          errorMessage = 'Storage quota exceeded. Please upgrade your plan.';
        } else if (error.code === 'storage/canceled') {
          errorMessage = 'Upload canceled';
        }

        reject(new Error(errorMessage));
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const metadata = await getMetadata(uploadTask.snapshot.ref);

          resolve({
            url: downloadURL,
            path: storagePath,
            name: file.name,
            size: metadata.size,
            type: metadata.contentType,
            uploadedAt: metadata.timeCreated,
          });
        } catch (error) {
          console.debug('Error getting download URL:', error);
          reject(new Error('Failed to get download URL'));
        }
      }
    );
  });
};

export const deleteFile = async (path) => {
  try {
    if (!path) {
      throw new Error('No file path provided');
    }

    const fileRef = ref(storage, path);
    await deleteObject(fileRef);
    return { success: true };
  } catch (error) {
    console.debug('Delete error:', error);

    if (error.code === 'storage/object-not-found') {
      return { success: true, warning: 'File already deleted' };
    }

    throw new Error('Failed to delete file from storage');
  }
};

export const listFiles = async (folderPath = 'media') => {
  try {
    const folderRef = ref(storage, folderPath);
    const result = await listAll(folderRef);

    const files = await Promise.all(
      result.items.map(async (itemRef) => {
        try {
          const url = await getDownloadURL(itemRef);
          const metadata = await getMetadata(itemRef);

          return {
            path: itemRef.fullPath,
            url,
            name: itemRef.name,
            size: metadata.size,
            type: metadata.contentType,
            uploadedAt: metadata.timeCreated,
          };
        } catch (error) {
          console.debug('Error fetching file metadata:', error);
          return null;
        }
      })
    );

    return files.filter(Boolean);
  } catch (error) {
    console.debug('List files error:', error);
    throw new Error('Failed to list files from storage');
  }
};

export const getFileMetadata = async (path) => {
  try {
    if (!path) {
      throw new Error('No file path provided');
    }

    const fileRef = ref(storage, path);
    const metadata = await getMetadata(fileRef);
    const url = await getDownloadURL(fileRef);

    return {
      path,
      url,
      name: metadata.name,
      size: metadata.size,
      type: metadata.contentType,
      uploadedAt: metadata.timeCreated,
      updatedAt: metadata.updated,
    };
  } catch (error) {
    console.debug('Get metadata error:', error);

    if (error.code === 'storage/object-not-found') {
      throw new Error('File not found');
    }

    throw new Error('Failed to get file metadata');
  }
};

export const getFileIcon = (type) => {
  if (type.startsWith('image/')) return '🖼️';
  if (type === 'application/pdf') return '📄';
  if (type.includes('word')) return '📝';
  return '📎';
};

export const isImageFile = (type) => {
  return ALLOWED_IMAGE_TYPES.includes(type);
};

/**
 * Generates an optimized URL with necessary transformations.
 * Validates the base URL and safely appends required Firebase tokens (like alt=media)
 *
 * @param {string} url - Original image URL
 * @param {number|string} width - Target width
 * @param {number|string} height - Target height 
 * @param {number} quality - Image quality (0.0 to 1.0)
 * @returns {string|null} Optimized URL or null if invalid
 */
export const getOptimizedImageUrl = (url, width, height, quality = 0.8) => {
  if (!isValidImageUrl(url)) {
    console.debug('getOptimizedImageUrl received invalid URL:', url);
    return null; // Return null safely so fallback kicks in
  }

  try {
    // Attempt URL parsing, gracefully return null on bad input
    const urlObj = new URL(url, window.location.origin);

    // Ensure Firebase Storage URLs have alt=media to display inline instead of downloading
    if (urlObj.hostname.includes('firebasestorage.googleapis.com')) {
      if (!urlObj.searchParams.has('alt')) {
        urlObj.searchParams.set('alt', 'media');
      }
    }

    urlObj.searchParams.set('w', width || 300);
    urlObj.searchParams.set('h', height || 300);
    urlObj.searchParams.set('q', Math.round(quality * 100));

    return urlObj.toString();
  } catch (e) {
    console.debug('Failed to parse URL for optimization:', url, e);
    return null;
  }
};