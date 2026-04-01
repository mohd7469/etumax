
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, CheckCircle, AlertCircle, Cloud } from 'lucide-react';
import { cn } from '@/lib/utils';

const MediaUploadDropZone = ({ onUpload, isUploading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([]);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
    e.target.value = null;
  };

  const handleFiles = (files) => {
    const fileObjects = files.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      name: file.name,
      size: file.size,
      status: 'pending',
      progress: 0,
      error: null,
    }));

    setUploadQueue(fileObjects);
    onUpload(files, {
      onProgress: (id, progress) => {
        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, progress: Math.round(progress), status: 'uploading' } : item
          )
        );
      },
      onSuccess: (id) => {
        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: 'success', progress: 100 } : item
          )
        );
        setTimeout(() => {
          setUploadQueue((prev) => prev.filter((item) => item.id !== id));
        }, 3000);
      },
      onError: (id, error) => {
        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: 'error', error } : item
          )
        );
      },
    });
  };

  const removeFromQueue = (id) => {
    setUploadQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <Card
        className={cn(
          'border-2 border-dashed transition-all cursor-pointer bg-white hover:bg-gray-50',
          isDragging && 'border-purple-500 bg-purple-50',
          isUploading && 'opacity-50 pointer-events-none'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="p-12 text-center">
          <motion.div
            animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Cloud className="mx-auto h-12 w-12 text-purple-400 mb-4" />
          </motion.div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isDragging ? 'Drop files here' : 'Upload to Firebase Storage'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Drag and drop files or click to browse
          </p>
          <p className="text-xs text-gray-400">
            Supported: Images (JPG, PNG, GIF, WebP, SVG) and PDFs • Max 10MB per file
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </Card>

      <AnimatePresence>
        {uploadQueue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-2"
          >
            {uploadQueue.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {item.status === 'success' && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {item.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    {(item.status === 'pending' || item.status === 'uploading') && (
                      <div className="relative h-6 w-6">
                        <div className="absolute inset-0 border-2 border-purple-200 rounded-full"></div>
                        <div 
                          className="absolute inset-0 border-2 border-purple-600 rounded-full border-t-transparent animate-spin"
                        ></div>
                      </div>
                    )}
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between mb-1">
                      <p className="text-sm font-medium truncate pr-4">{item.name}</p>
                      <span className="text-xs font-semibold text-purple-700">
                        {item.status === 'uploading' ? `${item.progress}%` : item.status === 'success' ? '100%' : ''}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{formatBytes(item.size)}</p>

                    {item.status === 'uploading' && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          className="h-full bg-purple-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${item.progress}%` }}
                          transition={{ duration: 0.1 }}
                        />
                      </div>
                    )}

                    {item.status === 'error' && (
                      <p className="text-xs text-red-600 mt-1">{item.error}</p>
                    )}

                    {item.status === 'success' && (
                      <p className="text-xs text-green-600 mt-1">Uploaded securely to Firebase</p>
                    )}
                  </div>

                  {item.status === 'error' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromQueue(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaUploadDropZone;
