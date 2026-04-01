
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash, Copy, Download, FileImage as FileIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { isImageFile, getFileIcon } from '@/lib/storageService';
import { cn } from '@/lib/utils';

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const FilePreview = ({ file, onDelete, isSelected, onSelect }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const isImage = isImageFile(file.type) || file.url?.match(/\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i);

  const handleCopyUrl = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(file.url);
    toast({
      title: 'URL Copied!',
      description: 'Firebase Storage URL has been copied to clipboard.',
    });
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = file.url;
    link.target = '_blank';
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          'group relative cursor-pointer overflow-hidden transition-all hover:shadow-lg',
          isSelected && 'ring-2 ring-purple-500'
        )}
        onClick={() => onSelect && onSelect(file.id)}
      >
        <div className="aspect-square bg-gray-100 flex items-center justify-center relative overflow-hidden">
          {isImage && !imageError ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <img
                src={file.url}
                alt={file.name}
                className={cn(
                  'w-full h-full object-cover transition-opacity',
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                loading="lazy"
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-4">
              <span className="text-6xl mb-2">{getFileIcon(file.type)}</span>
              <span className="text-xs text-gray-500 text-center truncate w-full px-2">
                {file.type || 'Unknown Type'}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="absolute bottom-2 left-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="secondary"
              className="flex-1 text-xs"
              onClick={handleCopyUrl}
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy URL
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleDownload}
              title="Download File"
            >
              <Download className="h-3 w-3" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button size="sm" variant="destructive" title="Delete File">
                  <Trash className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete File?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{file.name}" from Firebase Storage. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(file.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="p-3 space-y-1">
          <p className="text-sm font-medium truncate" title={file.name}>
            {file.name}
          </p>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatBytes(file.size)}</span>
            <span>{formatDate(file.uploadedAt)}</span>
          </div>
          <div className="text-[10px] text-gray-400 truncate">
            Path: {file.path}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default FilePreview;
