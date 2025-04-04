
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { useApplication } from '@/context/ApplicationContext';
import { Database, Home, Users, FileText, HelpCircle, LayoutDashboard, CheckSquare, MessageSquare, UserCircle, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

const Navbar: React.FC = () => {
  const { dbConnected, initApp } = useApplication();
  const { authState, isAuthorized } = useAuth();
  
  const isAdmin = authState?.user?.role === UserRole.ADMIN;

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-8">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">Faturamento</span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link to="/" className="flex items-center text-lg font-medium transition-colors hover:text-primary">
              <Home className="mr-1 h-4 w-4" />
              Início
            </Link>
            <Link to="/dashboard" className="flex items-center text-lg font-medium transition-colors hover:text-primary">
              <LayoutDashboard className="mr-1 h-4 w-4" />
              Dashboard
            </Link>
            <Link to="/clients" className="flex items-center text-lg font-medium transition-colors hover:text-primary">
              <Users className="mr-1 h-4 w-4" />
              Clientes
            </Link>
            <Link to="/contracts" className="flex items-center text-lg font-medium transition-colors hover:text-primary">
              <FileText className="mr-1 h-4 w-4" />
              Contratos
            </Link>
            <Link to="/invoices" className="flex items-center text-lg font-medium transition-colors hover:text-primary">
              <FileText className="mr-1 h-4 w-4" />
              Faturas
            </Link>
            <Link to="/checklists" className="flex items-center text-lg font-medium transition-colors hover:text-primary">
              <CheckSquare className="mr-1 h-4 w-4" />
              Checklists
            </Link>
            <Link to="/whatsapp-settings" className="flex items-center text-lg font-medium transition-colors hover:text-primary">
              <MessageSquare className="mr-1 h-4 w-4" />
              WhatsApp
            </Link>
            <Link to="/help" className="flex items-center text-lg font-medium transition-colors hover:text-primary">
              <HelpCircle className="mr-1 h-4 w-4" />
              Ajuda
            </Link>
            {isAdmin && (
              <Link to="/documentation" className="flex items-center text-lg font-medium transition-colors hover:text-primary">
                <BookOpen className="mr-1 h-4 w-4" />
                Documentação
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={dbConnected ? "outline" : "destructive"} 
            size="sm" 
            onClick={() => initApp()}
            className="flex items-center gap-1"
          >
            <Database className="h-4 w-4" />
            {dbConnected ? "BD Conectado" : "BD Desconectado"}
          </Button>
          <ModeToggle />
          <Button variant="outline" size="sm" asChild className="flex items-center gap-1">
            <Link to="/profile">
              <UserCircle className="h-4 w-4 mr-1" />
              Perfil
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/settings">Configurações</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
