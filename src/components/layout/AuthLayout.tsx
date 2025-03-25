
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
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
