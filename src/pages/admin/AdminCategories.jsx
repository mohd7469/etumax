import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tag, Plus, Edit, Trash, Globe, X, Search, FileUp, FileDown, ChevronsUpDown, Image as ImageIcon, ImageOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useProducts } from '@/context/ProductContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { downloadCsv } from '@/lib/utils';
import MediaLibraryModal from '@/components/admin/MediaLibraryModal';

const slugify = (text) => text.toString().toLowerCase()
  .replace(/\s+/g, '-')
  .replace(/[^\w-]+/g, '')
  .replace(/--+/g, '-')
  .replace(/^-+/, '')
  .replace(/-+$/, '');

const CategoryModal = ({ isOpen, onClose, category, onSave, updateCategoryInList }) => {
  const { products, addCategory, updateCategory } = useProducts();
  const { toast } = useToast();
  const isNewCategory = !category.id;

  const [formData, setFormData] = useState({
    id: category.id || null,
    name: category.name || '',
    slug: category.slug || '',
    status: category.status || 'published',
    productIds: category.productIds || [],
    image: category.image || null,
  });
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: isNewCategory ? slugify(name) : prev.slug
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast({ variant: 'destructive', title: 'Category name is required.' });
      return;
    }

    const categoryToSave = { ...formData, slug: formData.slug || slugify(formData.name) };
    if (isNewCategory) {
      categoryToSave.id = `cat_${Date.now()}`;
      categoryToSave.synced = false;
      addCategory(categoryToSave);
    } else {
      updateCategory(category.id, categoryToSave);
    }

    onSave(categoryToSave); // To update list in parent
    onClose();
  };

  if (!isOpen) return null;

  const productOptions = products.map(p => ({ value: p.id, label: p.name }));

  const handleImageSelect = (imageUrl) => {
    setFormData(prev => ({ ...prev, image: imageUrl }));
    if (formData.id) {
      updateCategoryInList(formData.id, { image: imageUrl });
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: -20 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-lg"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold">{isNewCategory ? 'Add New Category' : 'Edit Category'}</h2>
                <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                  <div>
                    <Label htmlFor="category-name">Category Name</Label>
                    <Input id="category-name" value={formData.name} onChange={handleNameChange} required />
                  </div>
                  <div>
                    <Label htmlFor="category-slug">URL Slug</Label>
                    <Input id="category-slug" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
                  </div>
                  <div>
                    <Label>Image (Firebase Storage)</Label>
                    <div className="flex items-center gap-4">
                      {formData.image ? <img src={formData.image} alt={formData.name} className="w-16 h-16 rounded-md object-cover border" /> : <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center"><ImageIcon className="w-8 h-8 text-gray-400" /></div>}
                      <Button type="button" variant="outline" onClick={() => setIsMediaModalOpen(true)}>Upload / Change</Button>
                      {formData.image && <Button type="button" variant="destructive" size="icon" onClick={() => handleImageSelect(null)}><ImageOff className="w-4 h-4" /></Button>}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={value => setFormData({ ...formData, status: value })}>
                      <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Products</Label>
                    <MultiSelect
                      options={productOptions}
                      selected={formData.productIds}
                      onChange={(selected) => setFormData(prev => ({ ...prev, productIds: selected }))}
                      placeholder="Select products..."
                    />
                  </div>
                </div>
                <div className="flex justify-end p-6 border-t bg-gray-50 rounded-b-lg">
                  <Button type="button" variant="ghost" className="mr-2" onClick={onClose}>Cancel</Button>
                  <Button type="submit">{isNewCategory ? 'Add Category' : 'Save Changes'}</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <MediaLibraryModal 
        isOpen={isMediaModalOpen} 
        onClose={() => setIsMediaModalOpen(false)} 
        onSelectImage={handleImageSelect} 
        uploadPath="categories"
      />
    </>
  );
};

const AdminCategories = () => {
  const { toast } = useToast();
  const { categories, products, deleteCategory, deleteMultipleCategories, updateMultipleCategoriesStatus } = useProducts();
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const fileInputRef = useRef(null);

  const [localCategories, setLocalCategories] = useState(categories);

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  const updateCategoryInList = (categoryId, updatedData) => {
    setLocalCategories(prev => prev.map(c => c.id === categoryId ? { ...c, ...updatedData } : c));
  };

  const filteredCategories = useMemo(() => {
    return localCategories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (category.slug && category.slug.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [localCategories, searchQuery]);

  const getProductCountForCategory = (category) => {
    if (category.synced) {
      // For synced categories, count products associated by name
      return products.filter(p => Array.isArray(p.categories) && p.categories.some(catName => catName === category.name)).length;
    }
    // For local categories, count by associated productIds
    if (category.productIds && category.productIds.length > 0) return category.productIds.length;
    return 0;
  };

  const handleAddNew = () => setEditingCategory({ name: '', slug: '', status: 'published', productIds: [] });
  const handleEdit = (category) => setEditingCategory(category);

  const handleDelete = (categoryId) => {
    deleteCategory(categoryId);
    toast({ title: 'Category deleted successfully' });
  };

  const handleBulkStatusChange = (status) => {
    const editable = selectedCategories.filter(id => !localCategories.find(c => c.id === id)?.synced);
    if (editable.length < selectedCategories.length) {
      toast({ variant: 'destructive', title: 'Action blocked', description: 'Cannot change status of synced categories.' });
    }
    if (editable.length > 0) {
      updateMultipleCategoriesStatus(editable, status);
      toast({ title: `${editable.length} categories set to ${status}.` });
    }
    setSelectedCategories([]);
  };

  const handleBulkDelete = () => {
    const deletable = selectedCategories.filter(id => !localCategories.find(c => c.id === id)?.synced);
    if (deletable.length < selectedCategories.length) {
      toast({ variant: 'destructive', title: 'Action blocked', description: 'Cannot delete synced categories.' });
    }
    if (deletable.length > 0) {
      deleteMultipleCategories(deletable);
      toast({ title: `${deletable.length} categories deleted.` });
    }
    setSelectedCategories([]);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedCategories(filteredCategories.map(c => c.id));
    } else {
      setSelectedCategories([]);
    }
  };

  const handleSelectCategory = (id, checked) => {
    setSelectedCategories(prev => checked ? [...prev, id] : prev.filter(catId => catId !== id));
  };

  const handleSave = (savedCategory) => {
    toast({
      title: `Category ${savedCategory.id ? 'Updated' : 'Added'}! 🎉`,
      description: `${savedCategory.name} has been successfully saved.`,
    });
    setEditingCategory(null);
  };

  const handleNotImplemented = () => {
    toast({ title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀" });
  };

  const handleExport = () => {
    downloadCsv(localCategories, 'categories.csv');
    toast({ title: "Categories exported successfully!" });
  };

  const handleImportClick = () => {
    handleNotImplemented();
  };

  const isAllSelected = selectedCategories.length > 0 && selectedCategories.length === filteredCategories.length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Product Categories</h1>
        <Button onClick={handleAddNew}><Plus className="mr-2 h-4 w-4" /> Add New Category</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Categories</CardTitle>
          <CardDescription>Organize your products with local and synced categories.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search categories..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={selectedCategories.length === 0}>Bulk Actions <ChevronsUpDown className="ml-2 h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => handleBulkStatusChange('published')}>Set as Published</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleBulkStatusChange('draft')}>Set as Draft</DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={e => e.preventDefault()} className="text-red-600">Delete Selected</DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete {selectedCategories.length} categories. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
            <input type="file" ref={fileInputRef} onChange={handleNotImplemented} accept=".csv" className="hidden" />
            <Button variant="outline" onClick={handleImportClick}><FileUp className="mr-2 h-4 w-4" /> Import</Button>
            <Button variant="outline" onClick={handleExport}><FileDown className="mr-2 h-4 w-4" /> Export</Button>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-x-auto border">
            <table className="w-full text-left">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="p-4 w-12"><Checkbox onCheckedChange={handleSelectAll} checked={isAllSelected} /></th>
                  <th className="p-4 font-semibold">Category Name</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Image</th>
                  <th className="p-4 font-semibold">Source</th>
                  <th className="p-4 font-semibold">Product Count</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="border-b last:border-none hover:bg-gray-50">
                    <td className="p-4"><Checkbox onCheckedChange={(checked) => handleSelectCategory(category.id, checked)} checked={selectedCategories.includes(category.id)} /></td>
                    <td className="p-4 font-medium flex items-center gap-2"><Tag className="h-4 w-4 text-gray-400" /> {category.name}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${category.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {category.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-4">
                      {category.image ? <img src={category.image} alt={category.name} className="w-10 h-10 rounded-md object-cover" /> : <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center"><ImageIcon className="w-5 h-5 text-gray-400" /></div>}
                    </td>
                    <td className="p-4">
                      {category.synced ? (
                        <span className="flex items-center gap-1 text-sm text-gray-500"><Globe className="h-4 w-4" /> Synced</span>
                      ) : 'Local'}
                    </td>
                    <td className="p-4 text-gray-600">{getProductCountForCategory(category)}</td>
                    <td className="p-4 flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(category)}><Edit className="h-3 w-3 mr-1" /> Edit</Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" disabled={category.synced}><Trash className="h-3 w-3 mr-1" /> Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(category.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {editingCategory && (
        <CategoryModal
          isOpen={!!editingCategory}
          onClose={() => setEditingCategory(null)}
          category={editingCategory}
          onSave={handleSave}
          updateCategoryInList={updateCategoryInList}
        />
      )}
    </motion.div>
  );
};

export default AdminCategories;