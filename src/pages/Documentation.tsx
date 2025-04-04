
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, Code, Settings, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Documentation: React.FC = () => {
  const navigate = useNavigate();
  const { authState, isAuthorized } = useAuth();

  useEffect(() => {
    // Redirect não autorizados
    if (!authState.isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!isAuthorized([UserRole.ADMIN])) {
      navigate('/dashboard');
      return;
    }
  }, [authState.isAuthenticated, isAuthorized, navigate]);

  return (
    <DashboardLayout requiredRoles={[UserRole.ADMIN]}>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Documentação do Sistema</h1>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <Tabs defaultValue="manual">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Manual do Usuário
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Guia de Configuração
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              API de Integração
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <Card>
              <CardHeader>
                <CardTitle>Manual do Usuário</CardTitle>
                <CardDescription>
                  Instruções detalhadas sobre como utilizar cada funcionalidade do sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold">Primeiros Passos</h3>
                  <p>
                    Bem-vindo ao sistema de Faturamento. Este manual fornece instruções detalhadas
                    sobre como utilizar todas as funcionalidades disponíveis no sistema.
                  </p>
                  <div className="rounded-md bg-muted p-4">
                    <h4 className="font-medium mb-2">Navegação Básica</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Dashboard: Visualize métricas e indicadores importantes</li>
                      <li>Clientes: Gerencie cadastros de clientes</li>
                      <li>Contratos: Crie e gerencie contratos</li>
                      <li>Faturas: Emita e acompanhe faturas</li>
                      <li>Checklists: Gerencie processos padronizados</li>
                      <li>WhatsApp: Configure a integração com WhatsApp</li>
                    </ul>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xl font-semibold">Gerenciamento de Clientes</h3>
                  <p>
                    O módulo de clientes permite cadastrar, editar e excluir informações dos clientes.
                    Você pode organizar os clientes por categorias e acessar todo o histórico de 
                    contratos e faturas relacionados a cada cliente.
                  </p>
                  
                  <div className="rounded-md bg-muted p-4">
                    <h4 className="font-medium mb-2">Principais Funcionalidades</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Cadastro completo com dados pessoais e comerciais</li>
                      <li>Histórico de interações e documentos</li>
                      <li>Filtros avançados para pesquisa</li>
                      <li>Exportação de relatórios</li>
                    </ul>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xl font-semibold">Emissão de Faturas</h3>
                  <p>
                    O sistema oferece um fluxo completo para emissão e gerenciamento de faturas.
                    É possível criar modelos personalizados, configurar regras de numeração e
                    acompanhar o status de pagamento.
                  </p>
                  
                  <div className="rounded-md bg-muted p-4">
                    <h4 className="font-medium mb-2">Processo de Faturamento</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Selecione o cliente</li>
                      <li>Escolha o contrato (opcional)</li>
                      <li>Adicione os serviços/produtos</li>
                      <li>Configure condições de pagamento</li>
                      <li>Emita a fatura</li>
                      <li>Envie para o cliente via WhatsApp ou email</li>
                    </ol>
                  </div>
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config">
            <Card>
              <CardHeader>
                <CardTitle>Guia de Configuração</CardTitle>
                <CardDescription>
                  Instruções para configurar e personalizar o sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold">Configurações Gerais</h3>
                  <p>
                    Configure os principais parâmetros do sistema, como informações da empresa,
                    logotipos, configurações de email e preferências de numeração de documentos.
                  </p>
                  
                  <div className="rounded-md bg-muted p-4">
                    <h4 className="font-medium mb-2">Informações da Empresa</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Dados cadastrais (CNPJ, Razão Social, etc)</li>
                      <li>Endereço e contatos</li>
                      <li>Logotipo e identidade visual</li>
                      <li>Assinaturas digitais</li>
                    </ul>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xl font-semibold">Integração com WhatsApp</h3>
                  <p>
                    Configure a integração com a API do WhatsApp para envio automático de 
                    mensagens, faturas e lembretes para seus clientes.
                  </p>
                  
                  <div className="rounded-md bg-muted p-4">
                    <h4 className="font-medium mb-2">Passos para Configuração</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Acesse a página de configurações do WhatsApp</li>
                      <li>Insira sua chave de API</li>
                      <li>Configure o número de telefone</li>
                      <li>Escaneie o QR Code de autenticação</li>
                      <li>Configure modelos de mensagens automáticas</li>
                    </ol>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xl font-semibold">Integração com Asaas</h3>
                  <p>
                    Configure a integração com a plataforma Asaas para gerenciamento de
                    pagamentos, cobranças recorrentes e boletos bancários.
                  </p>
                  
                  <div className="rounded-md bg-muted p-4">
                    <h4 className="font-medium mb-2">Configuração de Pagamentos</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Insira sua chave de API do Asaas</li>
                      <li>Configure as formas de pagamento aceitas</li>
                      <li>Defina taxas e descontos</li>
                      <li>Configure notificações automáticas</li>
                    </ul>
                  </div>
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>API de Integração</CardTitle>
                <CardDescription>
                  Documentação técnica para desenvolvedores que desejam integrar outros sistemas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold">Visão Geral da API</h3>
                  <p>
                    Nossa API REST permite que você integre o sistema de faturamento com outras
                    aplicações. Todas as chamadas usam o formato JSON e requerem autenticação via
                    token JWT.
                  </p>
                  
                  <div className="bg-slate-950 text-slate-50 p-4 rounded-md font-mono text-sm">
                    <p className="text-slate-400">// Exemplo de requisição com autenticação</p>
                    <p>GET /api/v1/clients</p>
                    <p>Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</p>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xl font-semibold">Endpoints Disponíveis</h3>
                  
                  <div className="space-y-4">
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-2 text-green-600">GET /api/v1/clients</h4>
                      <p className="text-sm mb-2">Lista todos os clientes cadastrados</p>
                      <h5 className="text-sm font-medium mt-3">Parâmetros de Consulta:</h5>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>page: Número da página (padrão: 1)</li>
                        <li>limit: Registros por página (padrão: 20)</li>
                        <li>search: Termo de busca</li>
                      </ul>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-2 text-blue-600">POST /api/v1/invoices</h4>
                      <p className="text-sm mb-2">Cria uma nova fatura</p>
                      <h5 className="text-sm font-medium mt-3">Corpo da Requisição:</h5>
                      <div className="bg-slate-950 text-slate-50 p-3 rounded-md font-mono text-xs">
                        <p>{`{`}</p>
                        <p>{`  "clientId": "123",`}</p>
                        <p>{`  "items": [`}</p>
                        <p>{`    { "description": "Serviço X", "amount": 100.00 }`}</p>
                        <p>{`  ],`}</p>
                        <p>{`  "dueDate": "2023-12-31"`}</p>
                        <p>{`}`}</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xl font-semibold">Webhooks</h3>
                  <p>
                    Configure webhooks para receber notificações em tempo real sobre eventos
                    como pagamentos, criação de contratos, etc.
                  </p>
                  
                  <div className="rounded-md bg-muted p-4">
                    <h4 className="font-medium mb-2">Eventos Disponíveis</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>invoice.created: Quando uma nova fatura é criada</li>
                      <li>invoice.paid: Quando uma fatura é paga</li>
                      <li>contract.signed: Quando um contrato é assinado</li>
                      <li>client.created: Quando um novo cliente é cadastrado</li>
                    </ul>
                  </div>
                </section>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Documentation;
