
import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import Navbar from '@/components/layout/Navbar';
import ClientsPage from '@/pages/Clients';
import ContractsPage from '@/pages/Contracts';
import InvoicesPage from '@/pages/Invoices';
import SettingsPage from '@/pages/Settings';
import HelpPage from '@/pages/Help';
import NotFound from '@/pages/NotFound';
import Dashboard from '@/pages/Dashboard';

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/contracts" element={<ContractsPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default AppRoutes;
