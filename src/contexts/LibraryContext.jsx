import React, { createContext, useContext, useState, useEffect } from 'react';

// Library Management System - Library Context
const LibraryContext = createContext();

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};

export const LibraryProvider = ({ children }) => {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);

  // Initialize with sample data from localStorage
  useEffect(() => {
    const storedBooks = localStorage.getItem('libraryBooks');
    const storedMembers = localStorage.getItem('libraryMembers');
    const storedBorrowed = localStorage.getItem('libraryBorrowedBooks');

    if (storedBooks) {
      setBooks(JSON.parse(storedBooks));
    } else {
      const sampleBooks = [
        { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', year: '1925', category: 'Fiction', available: true },
        { id: '2', title: '1984', author: 'George Orwell', isbn: '9780451524935', year: '1949', category: 'Fiction', available: true },
        { id: '3', title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780061120084', year: '1960', category: 'Fiction', available: false },
        { id: '4', title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '9780141439518', year: '1813', category: 'Romance', available: true },
        { id: '5', title: 'The Hobbit', author: 'J.R.R. Tolkien', isbn: '9780547928227', year: '1937', category: 'Fantasy', available: true },
      ];
      setBooks(sampleBooks);
      localStorage.setItem('libraryBooks', JSON.stringify(sampleBooks));
    }

    if (storedMembers) {
      setMembers(JSON.parse(storedMembers));
    } else {
      const sampleMembers = [
        { id: '1', name: 'John Doe', email: 'john@example.com', phone: '+1234567890', membershipDate: '2024-01-15', status: 'Active' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+1234567891', membershipDate: '2024-02-20', status: 'Active' },
        { id: '3', name: 'Bob Johnson', email: 'bob@example.com', phone: '+1234567892', membershipDate: '2024-03-10', status: 'Inactive' },
      ];
      setMembers(sampleMembers);
      localStorage.setItem('libraryMembers', JSON.stringify(sampleMembers));
    }

    if (storedBorrowed) {
      setBorrowedBooks(JSON.parse(storedBorrowed));
    }
  }, []);

  // Add a new book
  const addBook = (book) => {
    const newBook = {
      ...book,
      id: Date.now().toString(),
      available: true,
    };
    const updatedBooks = [...books, newBook];
    setBooks(updatedBooks);
    localStorage.setItem('libraryBooks', JSON.stringify(updatedBooks));
    return newBook;
  };

  // Update a book
  const updateBook = (id, updatedData) => {
    const updatedBooks = books.map(book => 
      book.id === id ? { ...book, ...updatedData } : book
    );
    setBooks(updatedBooks);
    localStorage.setItem('libraryBooks', JSON.stringify(updatedBooks));
  };

  // Delete a book
  const deleteBook = (id) => {
    const updatedBooks = books.filter(book => book.id !== id);
    setBooks(updatedBooks);
    localStorage.setItem('libraryBooks', JSON.stringify(updatedBooks));
  };

  // Add a new member
  const addMember = (member) => {
    const newMember = {
      ...member,
      id: Date.now().toString(),
      membershipDate: new Date().toISOString().split('T')[0],
      status: 'Active',
    };
    const updatedMembers = [...members, newMember];
    setMembers(updatedMembers);
    localStorage.setItem('libraryMembers', JSON.stringify(updatedMembers));
    return newMember;
  };

  // Update a member
  const updateMember = (id, updatedData) => {
    const updatedMembers = members.map(member => 
      member.id === id ? { ...member, ...updatedData } : member
    );
    setMembers(updatedMembers);
    localStorage.setItem('libraryMembers', JSON.stringify(updatedMembers));
  };

  // Delete a member
  const deleteMember = (id) => {
    const updatedMembers = members.filter(member => member.id !== id);
    setMembers(updatedMembers);
    localStorage.setItem('libraryMembers', JSON.stringify(updatedMembers));
  };

  // Borrow a book
  const borrowBook = (bookId, memberId) => {
    const book = books.find(b => b.id === bookId);
    const member = members.find(m => m.id === memberId);
    
    if (!book || !book.available || !member) {
      return false;
    }

    const borrowRecord = {
      id: Date.now().toString(),
      bookId,
      memberId,
      bookTitle: book.title,
      memberName: member.name,
      borrowDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      returned: false,
    };

    const updatedBorrowed = [...borrowedBooks, borrowRecord];
    setBorrowedBooks(updatedBorrowed);
    localStorage.setItem('libraryBorrowedBooks', JSON.stringify(updatedBorrowed));

    updateBook(bookId, { available: false });
    return true;
  };

  // Return a book
  const returnBook = (borrowId) => {
    const borrowRecord = borrowedBooks.find(b => b.id === borrowId);
    if (!borrowRecord) return false;

    const updatedBorrowed = borrowedBooks.map(b => 
      b.id === borrowId ? { ...b, returned: true, returnDate: new Date().toISOString().split('T')[0] } : b
    );
    setBorrowedBooks(updatedBorrowed);
    localStorage.setItem('libraryBorrowedBooks', JSON.stringify(updatedBorrowed));

    updateBook(borrowRecord.bookId, { available: true });
    return true;
  };

  const value = {
    books,
    members,
    borrowedBooks,
    addBook,
    updateBook,
    deleteBook,
    addMember,
    updateMember,
    deleteMember,
    borrowBook,
    returnBook,
  };

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
};