
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject, listAll } from 'firebase/storage';

export const uploadFile = (file, path = 'media', onProgress) => {
  return new Promise((resolve, reject) => {
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const fullPath = `${path}/${fileName}`;
    const storageRef = ref(storage, fullPath);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      (error) => {
        console.error("Firebase Storage Upload failed:", error);
        reject(error);
      },
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            url,
            path: fullPath,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString()
          });
        } catch (err) {
          console.error("Error getting download URL:", err);
          reject(err);
        }
      }
    );
  });
};

export const deleteFile = async (path) => {
  if (!path) return true;
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    // If the object doesn't exist, we might not care if we're just cleaning up
    if (error.code === 'storage/object-not-found') {
      return true;
    }
    console.error("Firebase Storage Delete error:", error);
    throw error;
  }
};

export const getFileUrl = async (path) => {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Error retrieving file URL:", error);
    throw error;
  }
};

export const listFiles = async (path) => {
  try {
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);
    return result.items;
  } catch (error) {
    console.error("Error listing files:", error);
    throw error;
  }
};

export const isImageFile = (type) => type?.startsWith('image/');

export const getFileIcon = (type) => {
  if (type?.includes('pdf')) return '📄';
  if (type?.includes('video')) return '🎥';
  if (type?.includes('audio')) return '🎵';
  if (type?.includes('zip') || type?.includes('tar')) return '🗜️';
  return '📁';
};
