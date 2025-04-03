
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { useApplication } from '@/context/ApplicationContext';
import { Database, Home } from 'lucide-react';

const Navbar: React.FC = () => {
  const { dbConnected, initApp } = useApplication();

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
            <Link to="/clients" className="text-lg font-medium transition-colors hover:text-primary">
              Clientes
            </Link>
            <Link to="/contracts" className="text-lg font-medium transition-colors hover:text-primary">
              Contratos
            </Link>
            <Link to="/invoices" className="text-lg font-medium transition-colors hover:text-primary">
              Faturas
            </Link>
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
        </div>
      </div>
    </header>
  );
};

export default Navbar;
