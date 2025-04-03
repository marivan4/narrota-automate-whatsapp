
import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import Navbar from '@/components/layout/Navbar';

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* Add more routes as needed */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default AppRoutes;
