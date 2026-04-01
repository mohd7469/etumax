import React from 'react';
import BookCard from '@/components/products/BookCard';

// Library Management System - Book List Component
const BookList = ({ books }) => {
  const sampleBooks = books || [
    { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', year: '1925', available: true },
    { id: 2, title: '1984', author: 'George Orwell', year: '1949', available: true },
    { id: 3, title: 'To Kill a Mockingbird', author: 'Harper Lee', year: '1960', available: false },
    { id: 4, title: 'Pride and Prejudice', author: 'Jane Austen', year: '1813', available: true },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {sampleBooks.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
};

export default BookList;