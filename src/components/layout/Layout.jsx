
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Library Management System - Layout Component
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 overflow-x-hidden w-full">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
