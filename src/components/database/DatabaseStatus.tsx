
import React from 'react';
import { useApplication } from '@/context/ApplicationContext';
import { Button } from '@/components/ui/button';
import { Database, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface DatabaseStatusProps {
  showDetails?: boolean;
}

const DatabaseStatus: React.FC<DatabaseStatusProps> = ({ showDetails = false }) => {
  const { dbConnected, loading, initApp } = useApplication();

  return (
    <Card className={`shadow border ${dbConnected ? 'border-green-500' : 'border-red-500'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" /> 
          Status do Banco de Dados
        </CardTitle>
        <CardDescription>
          {dbConnected 
            ? "O sistema está conectado ao banco de dados"
            : "O sistema não está conectado ao banco de dados"}
        </CardDescription>
      </CardHeader>
      
      {showDetails && (
        <CardContent className="pt-0">
          <div className="flex items-center gap-2 text-sm">
            <div className={`h-2 w-2 rounded-full ${dbConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>Status:</span>
            <span className={`font-medium ${dbConnected ? 'text-green-600' : 'text-red-600'}`}>
              {dbConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
          
          <div className="mt-4">
            {!dbConnected && (
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Verifique o arquivo .env</li>
                <li>Confirme se o banco de dados está em execução</li>
                <li>Verifique se a URL da API está correta</li>
                <li>Cheque os logs para mais informações</li>
              </ul>
            )}
          </div>
        </CardContent>
      )}
      
      <CardFooter>
        <Button 
          onClick={initApp} 
          disabled={loading}
          variant={dbConnected ? "outline" : "default"}
          className="w-full"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              {dbConnected ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <AlertCircle className="h-4 w-4 mr-2" />
              )}
              {dbConnected ? 'Reconectar' : 'Tentar Conectar'}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DatabaseStatus;
