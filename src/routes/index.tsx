
import React from 'react';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
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
import { useAuth } from '@/contexts/AuthContext';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { authState } = useAuth();
  
  // If not authenticated, redirect to login
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
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
        
        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-background flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Dashboard />
              </main>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/clients" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-background flex flex-col">
              <Navbar />
              <main className="flex-1">
                <ClientsPage />
              </main>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/contracts" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-background flex flex-col">
              <Navbar />
              <main className="flex-1">
                <ContractsPage />
              </main>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/invoices" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-background flex flex-col">
              <Navbar />
              <main className="flex-1">
                <InvoicesPage />
              </main>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/invoice-edit/:id" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-background flex flex-col">
              <Navbar />
              <main className="flex-1">
                <InvoiceEdit />
              </main>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-background flex flex-col">
              <Navbar />
              <main className="flex-1">
                <SettingsPage />
              </main>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/help" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-background flex flex-col">
              <Navbar />
              <main className="flex-1">
                <HelpPage />
              </main>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-background flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Profile />
              </main>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/whatsapp-settings" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-background flex flex-col">
              <Navbar />
              <main className="flex-1">
                <WhatsAppSettings />
              </main>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/whatsapp-connect" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-background flex flex-col">
              <Navbar />
              <main className="flex-1">
                <WhatsAppConnect />
              </main>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/checklists" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-background flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Checklists />
              </main>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/users" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-background flex flex-col">
              <Navbar />
              <main className="flex-1">
                <UsersManagement />
              </main>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/documentation" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-background flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Documentation />
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
