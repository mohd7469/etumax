
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMedia } from '@/context/MediaContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, ChevronsUpDown, List, Grid, Loader2, Upload, Cloud, Settings, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import MediaUploadDropZone from '@/components/admin/MediaUploadDropZone';
import FilePreview from '@/components/admin/FilePreview';
import { ScrollArea } from '@/components/ui/scroll-area';
import { app } from '@/lib/firebase';
import { toast } from 'sonner';

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const AdminMedia = () => {
  const { mediaItems, uploadMedia, deleteMedia, isLoading, isInitializing } = useMedia();
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showUploadArea, setShowUploadArea] = useState(false);
  
  // Pagination state
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredItems = useMemo(() => {
    if (!searchQuery || typeof searchQuery !== 'string') return mediaItems;
    
    const query = searchQuery.toLowerCase();
    
    return mediaItems.filter((item) => {
      if (!item) return false;
      
      const nameMatch = item.name && typeof item.name === 'string' 
        ? item.name.toLowerCase().includes(query) 
        : false;
        
      const pathMatch = item.path && typeof item.path === 'string'
        ? item.path.toLowerCase().includes(query)
        : false;
        
      return nameMatch || pathMatch;
    });
  }, [mediaItems, searchQuery]);

  // Reset to first page when search or items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = (checked) => {
    setSelectedItems(checked ? paginatedItems.map((item) => item.id) : []);
  };

  const handleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    await deleteMedia(selectedItems);
    setSelectedItems([]);
  };

  const handleUpload = (files, callbacks) => {
    uploadMedia(files, callbacks, 'media');
  };

  const handleUnimplementedAction = () => {
    toast("🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀");
  };

  const isAllSelected = selectedItems.length > 0 && paginatedItems.every(item => selectedItems.includes(item.id));

  const totalSize = mediaItems.reduce((sum, item) => sum + (item.size || 0), 0);
  
  const isFirebaseActive = !!app.options.apiKey;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Media Library
            {isFirebaseActive && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Cloud className="w-3 h-3 mr-1" />
                Firebase Storage Active
              </span>
            )}
          </h1>
          <p className="text-gray-500 mt-1">
            {mediaItems.length} files • {formatBytes(totalSize)} total
          </p>
        </div>
        <Button onClick={() => setShowUploadArea(!showUploadArea)}>
          <Upload className="mr-2 h-4 w-4" />
          {showUploadArea ? 'Hide Upload' : 'Upload Files'}
        </Button>
      </div>

      {showUploadArea && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6"
        >
          <MediaUploadDropZone onUpload={handleUpload} isUploading={isLoading} />
        </motion.div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search media files by name or path..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {selectedItems.length > 0 && (
                <div className="text-sm text-gray-600 mr-2">
                  {selectedItems.length} selected
                </div>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={selectedItems.length === 0}>
                    Bulk Actions <ChevronsUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                        Delete Selected
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedItems.length} files?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the selected files from Firebase Storage. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleBulkDelete}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="outline" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Screen Options
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Pagination</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="p-2 flex items-center justify-between">
                      <span className="text-sm font-medium">Items per page:</span>
                      <Select 
                        value={itemsPerPage.toString()} 
                        onValueChange={(val) => setItemsPerPage(Number(val))}
                      >
                        <SelectTrigger className="w-[80px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleUnimplementedAction}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>

                <div className="flex items-center rounded-md bg-gray-100 p-1">
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isInitializing ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
                <p className="text-gray-500">Loading media library from Firebase Storage...</p>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 mb-2">
                {searchQuery ? 'No files match your search' : 'No media files found in Firebase Storage'}
              </p>
              {!searchQuery && (
                <p className="text-sm text-gray-400">
                  Click "Upload Files" to get started
                </p>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-gray-600">Select All</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                <AnimatePresence>
                  {paginatedItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <FilePreview
                        file={item}
                        onDelete={deleteMedia}
                        isSelected={selectedItems.includes(item.id)}
                        onSelect={handleSelectItem}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
              <ScrollArea className="h-[600px]">
                <table className="w-full text-left">
                  <thead className="border-b bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="p-4 w-12">
                        <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} />
                      </th>
                      <th className="p-4 font-semibold">File</th>
                      <th className="p-4 font-semibold">Path</th>
                      <th className="p-4 font-semibold">Type</th>
                      <th className="p-4 font-semibold">Size</th>
                      <th className="p-4 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b last:border-none hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleSelectItem(item.id)}
                      >
                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={() => handleSelectItem(item.id)}
                          />
                        </td>
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-md bg-gray-100"
                          />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{item.name}</p>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-600">{item.path}</td>
                        <td className="p-4 text-sm text-gray-600">{item.type}</td>
                        <td className="p-4 text-sm text-gray-600">{formatBytes(item.size)}</td>
                        <td className="p-4 text-sm text-gray-600">
                          {new Date(item.uploadedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </div>
          )}

          {/* Pagination Controls */}
          {filteredItems.length > 0 && (
            <div className="flex items-center justify-between mt-6 border-t pt-4">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="text-sm font-medium px-4">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminMedia;
