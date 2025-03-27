
import React from 'react';
import { Container } from '../ui/container';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { authState } = useAuth();

  // Redirect if already authenticated
  if (authState.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-evolution-darker dot-pattern p-4">
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <div className="h-8 w-8 bg-evolution-blue rounded flex items-center justify-center logo-glow">
          <span className="text-white font-bold">N</span>
        </div>
        <h1 className="text-xl font-bold text-white">Narrota</h1>
      </div>
      
      <div className="w-full animate-fade-in">
        <Container maxWidth="sm">
          <div className="w-full glassmorphism rounded-xl p-8 shadow-lg">
            {children}
          </div>
        </Container>
      </div>
    </div>
  );
};

export default AuthLayout;
