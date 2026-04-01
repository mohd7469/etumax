import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useLibrary } from '@/contexts/LibraryContext';
import { toast } from '@/components/ui/use-toast';

// Library Management System - Admin Books Management
const AdminBooks = () => {
  const { books, addBook, updateBook, deleteBook } = useLibrary();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    year: '',
    category: '',
  });

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.isbn.includes(searchQuery)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingBook) {
      updateBook(editingBook.id, formData);
      toast({
        title: "Success",
        description: "Book updated successfully",
      });
      setEditingBook(null);
    } else {
      addBook(formData);
      toast({
        title: "Success",
        description: "Book added successfully",
      });
      setIsAddDialogOpen(false);
    }
    setFormData({ title: '', author: '', isbn: '', year: '', category: '' });
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      year: book.year,
      category: book.category,
    });
  };

  const handleDelete = (id) => {
    deleteBook(id);
    toast({
      title: "Success",
      description: "Book deleted successfully",
    });
  };

  return (
    <>
      <Helmet>
        <title>Manage Books - Digital Library Management System</title>
        <meta name="description" content="Manage your library book collection. Add new books, edit details, and remove books from the system." />
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Manage Books</h1>
            <p className="text-gray-600">Add, edit, or remove books from your collection</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Book
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Book</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="isbn">ISBN</Label>
                  <Input
                    id="isbn"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Add Book</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2">
          <Input 
            placeholder="Search books by title, author, or ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ISBN</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">{book.title}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{book.author}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{book.isbn}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{book.year}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        book.available 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {book.available ? 'Available' : 'Borrowed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Dialog open={editingBook?.id === book.id} onOpenChange={(open) => !open && setEditingBook(null)}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => handleEdit(book)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Book</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                              <div>
                                <Label htmlFor="edit-title">Title</Label>
                                <Input
                                  id="edit-title"
                                  value={formData.title}
                                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-author">Author</Label>
                                <Input
                                  id="edit-author"
                                  value={formData.author}
                                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-isbn">ISBN</Label>
                                <Input
                                  id="edit-isbn"
                                  value={formData.isbn}
                                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-year">Year</Label>
                                <Input
                                  id="edit-year"
                                  value={formData.year}
                                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-category">Category</Label>
                                <Input
                                  id="edit-category"
                                  value={formData.category}
                                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                  required
                                />
                              </div>
                              <Button type="submit" className="w-full">Update Book</Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete(book.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminBooks;