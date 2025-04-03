
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { testDatabaseConnection, initializeDatabase } from '@/utils/database';

interface ApplicationContextType {
  loading: boolean;
  dbConnected: boolean;
  initApp: () => Promise<void>;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);

  const initApp = async () => {
    setLoading(true);
    try {
      // Test database connection
      const isConnected = await testDatabaseConnection();
      setDbConnected(isConnected);
      
      if (isConnected) {
        // Initialize database tables if connected
        await initializeDatabase();
        toast.success("Sistema inicializado com sucesso");
      } else {
        toast.error("Não foi possível conectar ao banco de dados. Verifique as configurações no arquivo .env");
      }
    } catch (error) {
      console.error("Error initializing application:", error);
      toast.error("Erro ao inicializar o sistema");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initApp();
  }, []);

  return (
    <ApplicationContext.Provider value={{ loading, dbConnected, initApp }}>
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplication = (): ApplicationContextType => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplication must be used within an ApplicationProvider');
  }
  return context;
};
