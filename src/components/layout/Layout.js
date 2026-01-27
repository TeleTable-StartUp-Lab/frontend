import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-tech-gradient text-white flex flex-col font-sans selection:bg-primary selection:text-dark-900">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {children}
      </main>
      <footer className="border-t border-white/5 bg-dark-900/50 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-center text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} TeleTable StartUp Lab.
            </p>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link to="/privacy" className="hover:text-primary cursor-pointer transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-primary cursor-pointer transition-colors">Terms</Link>
              <Link to="/contact" className="hover:text-primary cursor-pointer transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;