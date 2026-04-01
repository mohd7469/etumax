import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useUser } from '@/context/UserContext';
import { toast } from '@/components/ui/use-toast';
import { uploadFile, deleteFile, getFileUrl } from '@/lib/storageService';
import { listenToCollection, setDocument, deleteDocument } from '@/lib/firestoreService';

const MediaContext = createContext();

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (!context) throw new Error('useMedia must be used within a MediaProvider');
  return context;
};

export const MediaProvider = ({ children }) => {
  const { user } = useUser();
  const [mediaItems, setMediaItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const unsub = listenToCollection('media', (data) => {
        setMediaItems(data || []);
        setIsInitializing(false);
    });
    return () => unsub();
  }, []);

  const saveMediaToDatabase = async (mediaData) => {
    await setDocument('media', mediaData.id, mediaData);
  };

  const removeMediaFromDatabase = async (id) => {
    await deleteDocument('media', id);
  };

  const uploadMedia = async (files, callbacks = {}, uploadPath = 'media') => {
    setIsLoading(true);
    const { onProgress, onSuccess, onError } = callbacks;
    const uploadPromises = Array.from(files).map(async (file) => {
      const fileId = `media-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      try {
        const result = await uploadFile(file, uploadPath, (progress) => {
          if (onProgress) onProgress(fileId, progress);
        });
        
        const mediaData = { 
          id: fileId, 
          name: result.name, 
          url: result.url, 
          path: result.path, 
          type: result.type, 
          size: result.size, 
          author: user?.name || 'Admin', 
          uploadedAt: result.uploadedAt, 
          uploadedTo: uploadPath, 
          isLocal: false 
        };
        
        await saveMediaToDatabase(mediaData);
        if (onSuccess) onSuccess(fileId);
        return { success: true, file: file.name, data: mediaData };
      } catch (error) {
        if (onError) onError(fileId, error.message);
        return { success: false, file: file.name, error: error.message };
      }
    });

    try {
      const results = await Promise.allSettled(uploadPromises);
      const successCount = results.filter(r => r.value?.success).length;
      if (successCount > 0) {
        toast({ title: 'Upload Complete!', description: `${successCount} file(s) uploaded successfully.` });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMediaItems = async (ids) => {
    const idsArray = Array.isArray(ids) ? ids : [ids];
    setIsLoading(true);
    const deletePromises = idsArray.map(async (id) => {
      const item = mediaItems.find(m => m.id === id);
      if (!item) return;
      try {
        if (item.path) {
          await deleteFile(item.path);
        }
        await removeMediaFromDatabase(id);
      } catch (error) { 
        console.error("Error deleting media item:", error);
        toast({ variant: 'destructive', title: 'Error deleting file', description: error.message });
      }
    });
    
    await Promise.allSettled(deletePromises);
    setIsLoading(false);
  };

  const updateMedia = async (id, updatedData) => {
    const item = mediaItems.find(m => m.id === id);
    if (!item) return;
    await saveMediaToDatabase({ ...item, ...updatedData });
  };

  const addSyncedMedia = useCallback(async (syncedItems, storeId) => {
    for (const item of syncedItems) {
        await saveMediaToDatabase({ ...item, sourceStoreId: storeId, uploadedTo: item.uploadedTo || 'Synced' });
    }
  }, []);

  const getMediaUrl = async (path) => {
    return await getFileUrl(path);
  };

  return (
    <MediaContext.Provider value={{ 
      mediaItems, 
      uploadMedia, 
      addSyncedMedia, 
      deleteMedia: deleteMediaItems, 
      updateMedia, 
      getMediaUrl,
      isLoading, 
      isInitializing 
    }}>
      {children}
    </MediaContext.Provider>
  );
};