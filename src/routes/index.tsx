
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
import WhatsAppSettings from '@/pages/WhatsAppSettings';
import Checklists from '@/pages/Checklists';
import Profile from '@/pages/Profile';
import WhatsAppConnect from '@/pages/WhatsAppConnect';
import InvoiceEdit from '@/pages/InvoiceEdit';
import UsersManagement from '@/pages/UsersManagement';
import Documentation from '@/pages/Documentation';
import Login from '@/pages/Login';
import AuthLayout from '@/components/layout/AuthLayout';
import { useAuth } from '@/contexts/AuthContext';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { authState } = useAuth();
  
  // If not authenticated, redirect to login
  if (!authState.isAuthenticated) {
    return <Login />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes with layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-background flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/clients" element={<ClientsPage />} />
                  <Route path="/contracts" element={<ContractsPage />} />
                  <Route path="/invoices" element={<InvoicesPage />} />
                  <Route path="/invoice-edit/:id" element={<InvoiceEdit />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/help" element={<HelpPage />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/whatsapp-settings" element={<WhatsAppSettings />} />
                  <Route path="/whatsapp-connect" element={<WhatsAppConnect />} />
                  <Route path="/checklists" element={<Checklists />} />
                  <Route path="/users" element={<UsersManagement />} />
                  <Route path="/documentation" element={<Documentation />} />
                </Routes>
              </main>
            </div>
          </ProtectedRoute>
        } />
        
        {/* Fallback for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
