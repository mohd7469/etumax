
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMedia } from '@/context/MediaContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { CheckCircle, Search, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import MediaUploadDropZone from '@/components/admin/MediaUploadDropZone';
import FilePreview from '@/components/admin/FilePreview';

const MediaLibraryModal = ({ isOpen, onClose, onSelectImage, uploadPath = 'media' }) => {
  const { mediaItems, uploadMedia, deleteMedia, isLoading, isInitializing } = useMedia();
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const filteredItems = useMemo(() => {
    if (!searchQuery) return mediaItems;
    return mediaItems.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.path && item.path.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [mediaItems, searchQuery]);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleConfirmSelection = () => {
    if (selectedImage) {
      onSelectImage(selectedImage.url);
      setSelectedImage(null);
      onClose();
    } else {
      toast({
        variant: 'destructive',
        title: 'No Image Selected',
        description: 'Please select an image to confirm.',
      });
    }
  };

  const handleDelete = async (id) => {
    await deleteMedia(id);
    if (selectedImage?.id === id) {
      setSelectedImage(null);
    }
  };

  const handleUpload = (files, callbacks) => {
    uploadMedia(files, callbacks, uploadPath);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-2xl">Media Library</DialogTitle>
        </DialogHeader>

        <div className="flex-grow overflow-hidden">
          <Tabs defaultValue="library" className="flex flex-col h-full">
            <TabsList className="mx-6 mt-4">
              <TabsTrigger value="library">Firebase Storage Files</TabsTrigger>
              <TabsTrigger value="upload">Upload New ({uploadPath})</TabsTrigger>
            </TabsList>

            <TabsContent value="library" className="flex-grow overflow-hidden px-6 mt-4">
              <div className="space-y-4 h-full flex flex-col">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search files by name or path..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {isInitializing ? (
                  <div className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
                      <p className="text-gray-500">Connecting to Firebase Storage...</p>
                    </div>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-gray-500 mb-2">
                        {searchQuery ? 'No files match your search' : 'No media files yet'}
                      </p>
                      {!searchQuery && (
                        <p className="text-sm text-gray-400">
                          Upload files to Firebase Storage from the "Upload New" tab
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="flex-grow pr-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pb-4">
                      <AnimatePresence>
                        {filteredItems.map((item) => (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                          >
                            <FilePreview
                              file={item}
                              onDelete={handleDelete}
                              isSelected={selectedImage?.id === item.id}
                              onSelect={() => handleImageClick(item)}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </ScrollArea>
                )}
              </div>
            </TabsContent>

            <TabsContent value="upload" className="flex-grow overflow-hidden px-6 mt-4">
              <ScrollArea className="h-full pr-4">
                <MediaUploadDropZone
                  onUpload={handleUpload}
                  isUploading={isLoading}
                />
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="p-6 border-t bg-gray-50">
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button
            onClick={handleConfirmSelection}
            disabled={!selectedImage}
            className="gap-2"
          >
            {selectedImage && <CheckCircle className="h-4 w-4" />}
            Confirm Selection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MediaLibraryModal;
