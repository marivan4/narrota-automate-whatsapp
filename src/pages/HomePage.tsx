
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Users, FileText, FileContract, Settings, Database, HelpCircle } from 'lucide-react';
import DatabaseStatus from '@/components/database/DatabaseStatus';
import { useApplication } from '@/context/ApplicationContext';

const HomePage: React.FC = () => {
  const { dbConnected } = useApplication();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sistema de Faturamento</h1>
        <Button variant="outline" asChild>
          <Link to="/settings">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Link>
        </Button>
      </div>
      
      {!dbConnected && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <div>
              <h3 className="text-amber-800 font-medium">Atenção: Banco de dados não conectado</h3>
              <p className="text-amber-700 text-sm mt-1">
                O sistema não conseguiu se conectar ao banco de dados. Verifique suas configurações no arquivo .env
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="grid gap-6 md:grid-cols-2">
          <Link to="/clients" className="group">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Clientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Gerenciar cadastro de clientes
                </p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/contracts" className="group">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileContract className="h-5 w-5 text-emerald-500" />
                  Contratos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Gerenciar contratos de serviços
                </p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/invoices" className="group">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-violet-500" />
                  Faturas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Gerenciar faturas e pagamentos
                </p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/help" className="group">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-amber-500" />
                  Ajuda
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Suporte e documentação
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
        
        <div>
          <DatabaseStatus showDetails={true} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
