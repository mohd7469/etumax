
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useReviews } from '@/context/ReviewContext';
import { useProducts } from '@/context/ProductContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Star, Trash2, CheckCircle, XCircle, FileUp, FileDown, Search, Trash, RotateCw, Settings2, FilterX, ChevronLeft, ChevronRight } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { downloadCsv } from '@/lib/utils';
import Papa from 'papaparse';
import { Link } from 'react-router-dom';

const defaultVisibleColumns = {
  author: true,
  rating: true,
  review: true,
  product: true,
  date: true,
  actions: true,
};

const AdminReviews = () => {
  const { reviews, addMultipleReviews, updateMultipleReviews, deleteMultipleReviewsPermanently } = useReviews();
  const { products } = useProducts();
  const { toast } = useToast();
  
  // Existing States
  const [filter, setFilter] = useState('all');
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);

  // New States for Screen Options & Pagination
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination when filters or items per page change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery, itemsPerPage]);

  const reviewCounts = useMemo(() => ({
    all: reviews.filter(r => r.status !== 'trash').length,
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    spam: reviews.filter(r => r.status === 'spam').length,
    trash: reviews.filter(r => r.status === 'trash').length,
  }), [reviews]);

  const getProductForReview = (productId) => products.find(p => p.id.toString() === productId.toString());

  const filteredReviews = useMemo(() => {
    let tempReviews = reviews;

    if (filter !== 'all') {
      tempReviews = tempReviews.filter(r => r.status === filter);
    } else {
      tempReviews = tempReviews.filter(r => r.status !== 'trash');
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      tempReviews = tempReviews.filter(r => {
        const product = getProductForReview(r.productId);
        return r.author.toLowerCase().includes(lowerQuery) ||
          r.email.toLowerCase().includes(lowerQuery) ||
          (product && product.name.toLowerCase().includes(lowerQuery));
      });
    }

    // Sort by date descending (newest first) as a reasonable default
    return tempReviews.sort((a, b) => new Date(b.submittedOn) - new Date(a.submittedOn));
  }, [reviews, filter, searchQuery, products]);

  // Pagination logic
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  
  const paginatedReviews = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredReviews.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredReviews, currentPage, itemsPerPage]);

  const handleSelectAll = (checked) => {
    setSelectedReviews(checked ? paginatedReviews.map(r => r.id) : []);
  };

  const handleSelectReview = (id, checked) => {
    setSelectedReviews(prev => checked ? [...prev, id] : prev.filter(reviewId => reviewId !== id));
  };

  const handleApplyBulkAction = () => {
    if (!bulkAction) {
      toast({ variant: 'destructive', title: 'No action selected' });
      return;
    }
    if (selectedReviews.length === 0) {
      toast({ variant: 'destructive', title: 'No reviews selected' });
      return;
    }

    if (bulkAction === 'delete_permanently') {
      deleteMultipleReviewsPermanently(selectedReviews);
      toast({ title: `Permanently deleted ${selectedReviews.length} reviews.` });
    } else {
      updateMultipleReviews(selectedReviews, bulkAction);
      toast({ title: `Marked ${selectedReviews.length} reviews as ${bulkAction}.` });
    }
    setSelectedReviews([]);
    setBulkAction(''); // Reset bulk action dropdown
  };

  const handleExport = () => {
    downloadCsv(reviews, 'reviews.csv');
    toast({ title: "Reviews exported successfully!" });
  }

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) {
      toast({ variant: "destructive", title: "No file selected", description: "Please choose a CSV file to import." });
      return;
    }
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        addMultipleReviews(results.data);
        toast({ title: "Reviews imported successfully! ✨", description: `${results.data.length} reviews added.` });
      },
      error: (error) => {
        toast({ variant: "destructive", title: "Import Failed", description: `Error parsing CSV: ${error.message}` });
      }
    });
    event.target.value = null;
  };

  const handleColumnToggle = (colKey) => {
    setVisibleColumns(prev => ({ ...prev, [colKey]: !prev[colKey] }));
  };

  const resetFilters = () => {
    setFilter('all');
    setSearchQuery('');
    setVisibleColumns(defaultVisibleColumns);
    setItemsPerPage(50);
    setCurrentPage(1);
    setSelectedReviews([]);
    setBulkAction('');
  };

  const isAllSelected = selectedReviews.length === paginatedReviews.length && paginatedReviews.length > 0;
  const isInTrash = filter === 'trash';

  // Calculate visible column count for colspan in empty state
  const visibleColCount = Object.values(visibleColumns).filter(Boolean).length + 1; // +1 for checkbox column

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reviews</h1>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-4 border-b pb-2">
          {['all', 'pending', 'approved', 'spam', 'trash'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 capitalize transition-colors ${filter === status ? 'text-purple-600 font-semibold border-b-2 border-purple-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              {status} ({reviewCounts[status]})
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap items-center gap-4 mb-4 justify-between bg-gray-50/40 p-2 rounded-lg">
          <div className="flex flex-wrap items-center gap-3 flex-grow">
            <Select onValueChange={setBulkAction} value={bulkAction}>
              <SelectTrigger className="w-[180px] h-10 bg-white border-gray-200">
                <SelectValue placeholder="Bulk actions" />
              </SelectTrigger>
              <SelectContent>
                {isInTrash ? (
                  <>
                    <SelectItem value="pending">Restore</SelectItem>
                    <SelectItem value="delete_permanently">Delete Permanently</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="approved">Approve</SelectItem>
                    <SelectItem value="pending">Mark as Pending</SelectItem>
                    <SelectItem value="spam">Mark as Spam</SelectItem>
                    <SelectItem value="trash">Move to Trash</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            <Button variant="secondary" onClick={handleApplyBulkAction} className="h-10">Apply</Button>
            
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search reviews by author, email, or product..." className="pl-10 h-10 bg-white border-gray-200" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10 bg-white border-gray-200">
                  <Settings2 className="mr-2 h-4 w-4" /> Screen Options
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="start">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Columns Visibility</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.keys(defaultVisibleColumns).map((col) => (
                        <div key={col} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`col-${col}`} 
                            checked={visibleColumns[col]} 
                            onCheckedChange={() => handleColumnToggle(col)} 
                          />
                          <label htmlFor={`col-${col}`} className="text-sm capitalize leading-none cursor-pointer">
                            {col === 'date' ? 'Submitted On' : col}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 pt-4 border-t">
                    <h4 className="font-medium text-sm">Pagination</h4>
                    <div className="flex items-center gap-3">
                      <label className="text-sm">Items per page:</label>
                      <Input 
                        type="number" 
                        min="1" max="500" 
                        className="w-20 h-8" 
                        value={itemsPerPage} 
                        onChange={(e) => setItemsPerPage(Number(e.target.value) || 50)} 
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button variant="ghost" onClick={resetFilters} className="h-10 text-muted-foreground hover:text-foreground hover:bg-gray-200">
              <FilterX className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <input type="file" ref={fileInputRef} onChange={handleImport} accept=".csv" className="hidden" />
            <Button variant="outline" onClick={handleImportClick} className="h-10 border-gray-200"><FileUp className="mr-2 h-4 w-4" /> Import</Button>
            <Button variant="outline" onClick={handleExport} className="h-10 border-gray-200"><FileDown className="mr-2 h-4 w-4" /> Export</Button>
          </div>
        </div>

        <div className="overflow-x-auto border rounded-md">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-gray-500 uppercase text-xs">
              <tr className="border-b">
                <th className="p-3 w-12 text-center">
                  <Checkbox onCheckedChange={handleSelectAll} checked={isAllSelected} className="border-gray-400" />
                </th>
                {visibleColumns.author && <th className="p-3 font-semibold">Author</th>}
                {visibleColumns.rating && <th className="p-3 font-semibold w-28">Rating</th>}
                {visibleColumns.review && <th className="p-3 font-semibold">Review</th>}
                {visibleColumns.product && <th className="p-3 font-semibold w-48">Product</th>}
                {visibleColumns.date && <th className="p-3 font-semibold w-40">Submitted on</th>}
                {visibleColumns.actions && <th className="p-3 font-semibold w-24">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedReviews.map(review => {
                const product = getProductForReview(review.productId);
                return (
                  <tr key={review.id} className={`hover:bg-gray-50 transition-colors ${review.status === 'pending' ? 'bg-yellow-50/50 hover:bg-yellow-50/80' : ''}`}>
                    <td className="p-3 text-center align-top">
                      <Checkbox onCheckedChange={(checked) => handleSelectReview(review.id, checked)} checked={selectedReviews.includes(review.id)} className="border-gray-300" />
                    </td>
                    {visibleColumns.author && (
                      <td className="p-3 align-top">
                        <div className="font-semibold text-gray-900">{review.author}</div>
                        <div className="text-sm text-gray-500">{review.email}</div>
                        <div className="text-xs text-gray-400">{review.ip}</div>
                      </td>
                    )}
                    {visibleColumns.rating && (
                      <td className="p-3 align-top">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />)}
                        </div>
                      </td>
                    )}
                    {visibleColumns.review && (
                      <td className="p-3 align-top max-w-sm">
                        <p className="line-clamp-3 text-gray-700">{review.content}</p>
                      </td>
                    )}
                    {visibleColumns.product && (
                      <td className="p-3 align-top">
                        {product ? (
                          <div>
                            <Link to={`/product/${product.slug || product.id}`} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800 hover:underline font-medium text-sm line-clamp-2">
                              {product.name}
                            </Link>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm italic">Product not found</span>
                        )}
                      </td>
                    )}
                    {visibleColumns.date && (
                      <td className="p-3 text-sm text-gray-600 align-top">
                        {new Date(review.submittedOn).toLocaleString()}
                      </td>
                    )}
                    {visibleColumns.actions && (
                      <td className="p-3 align-top">
                        <div className="flex gap-2">
                          {isInTrash ? (
                            <>
                              <Button variant="outline" size="sm" onClick={() => updateMultipleReviews([review.id], 'pending')} title="Restore">
                                <RotateCw className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm" title="Delete Permanently">
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the review. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteMultipleReviewsPermanently([review.id])} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          ) : (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" title="Move to Trash">
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will move the review to the trash.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => updateMultipleReviews([review.id], 'trash')} className="bg-red-600 hover:bg-red-700">Move to Trash</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {paginatedReviews.length === 0 && (
                <tr>
                  <td colSpan={visibleColCount} className="p-8 text-center text-gray-500 bg-gray-50/50">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-100 p-3 rounded-full mb-3">
                        <Search className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900">No reviews found</p>
                      <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search query.</p>
                      {(searchQuery || filter !== 'all') && (
                        <Button variant="outline" size="sm" className="mt-4 border-gray-200" onClick={resetFilters}>Clear All Filters</Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border border-t-0 border-gray-200 rounded-b-lg bg-gray-50/30 text-sm mt-0">
            <div className="text-gray-500">
              Showing <span className="font-semibold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredReviews.length)}</span> of <span className="font-semibold text-gray-900">{filteredReviews.length}</span> reviews
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1} 
                className="h-8 w-8 border-gray-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-3 h-8 flex items-center bg-white border border-gray-200 rounded-md text-sm font-medium text-gray-700">
                {currentPage} / {totalPages}
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages} 
                className="h-8 w-8 border-gray-200"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviews;
