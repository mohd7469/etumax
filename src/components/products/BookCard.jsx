import React from 'react';
import { Book, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

// Library Management System - Book Card Component
const BookCard = ({ book }) => {
  const handleBorrow = () => {
    toast({
      title: "Borrow Book",
      description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
      <div className="h-64 bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
        <Book className="h-24 w-24 text-white opacity-80 group-hover:scale-110 transition-transform" />
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
          {book.title || 'Library Book Title'}
        </h3>
        
        <div className="space-y-2 mb-4">
          <p className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>{book.author || 'Unknown Author'}</span>
          </p>
          <p className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{book.year || '2025'}</span>
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            book.available 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {book.available ? 'Available' : 'Borrowed'}
          </span>
          
          <Button 
            onClick={handleBorrow}
            disabled={!book.available}
            size="sm"
          >
            Borrow
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;