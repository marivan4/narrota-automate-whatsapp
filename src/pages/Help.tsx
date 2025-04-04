
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HelpPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ajuda e Suporte</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-amber-500" />
              Perguntas Frequentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Como adicionar um novo cliente?</h3>
              <p className="text-muted-foreground">
                Acesse a página de Clientes e clique no botão "Adicionar Cliente". Preencha os dados necessários e salve.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Como gerar uma nova fatura?</h3>
              <p className="text-muted-foreground">
                Vá até a página de Faturas, clique em "Nova Fatura", selecione um cliente, preencha os itens e valores e clique em "Gerar".
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">O sistema não está conectando ao banco de dados, o que fazer?</h3>
              <p className="text-muted-foreground">
                Verifique se o arquivo .env está configurado corretamente com os dados de acesso ao banco. Depois clique em "Reconectar" no painel de status do banco de dados.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Documentação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Acesse nossa documentação completa para obter informações detalhadas sobre todas as funcionalidades do sistema.
            </p>
            
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Manual do Usuário
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Guia de Configuração
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                API de Integração
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="mailto:suporte@sistema.com">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Contatar Suporte
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HelpPage;
