
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, CheckSquare, Users, AlertCircle, MessageSquare, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { authState } = useAuth();
  const [stats, setStats] = useState({
    contracts: 0,
    checklists: 0,
    customers: 0,
    pendingInvoices: 0,
    whatsappStatus: 'disconnected' as 'disconnected' | 'connected' | 'error',
  });

  useEffect(() => {
    // Simulate fetching dashboard data
    const fetchDashboardData = async () => {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setStats({
        contracts: Math.floor(Math.random() * 50) + 10,
        checklists: Math.floor(Math.random() * 30) + 5,
        customers: Math.floor(Math.random() * 100) + 50,
        pendingInvoices: Math.floor(Math.random() * 20) + 3,
        whatsappStatus: Math.random() > 0.7 ? 'connected' : 'disconnected',
      });
    };
    
    fetchDashboardData();
  }, []);

  const getWhatsAppStatusBadge = () => {
    switch (stats.whatsappStatus) {
      case 'connected':
        return <Badge className="bg-green-500">Conectado</Badge>;
      case 'disconnected':
        return <Badge variant="outline">Desconectado</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo{authState.user?.name ? `, ${authState.user.name}` : ''}! Aqui está uma visão geral do seu sistema.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="glassmorphism">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Contratos
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.contracts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.contracts > 20 ? 'Contratos ativos em uso' : 'Contratos disponíveis'}
              </p>
              <div className="mt-4">
                <Button asChild size="sm" variant="outline">
                  <Link to="/contracts">Gerenciar</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glassmorphism">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Checklists
              </CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.checklists}</div>
              <p className="text-xs text-muted-foreground">
                Checklists ativos no sistema
              </p>
              <div className="mt-4">
                <Button asChild size="sm" variant="outline">
                  <Link to="/checklists">Gerenciar</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glassmorphism">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Clientes
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.customers}</div>
              <p className="text-xs text-muted-foreground">
                Clientes cadastrados
              </p>
              <div className="mt-4">
                <Button asChild size="sm" variant="outline">
                  <Link to="/customers">Visualizar</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle>Status do WhatsApp</CardTitle>
              <CardDescription>
                Acompanhe o status da integração com WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <span>WhatsApp</span>
                </div>
                {getWhatsAppStatusBadge()}
              </div>
              
              <Button asChild variant="outline" className="w-full">
                <Link to="/whatsapp-settings">
                  Configurar WhatsApp
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle>Faturas Pendentes</CardTitle>
              <CardDescription>
                Faturas aguardando pagamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <span>
                    {stats.pendingInvoices} {stats.pendingInvoices === 1 ? 'fatura pendente' : 'faturas pendentes'}
                  </span>
                </div>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-200">
                  Atenção
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {stats.pendingInvoices > 0 ? (
                  <p>Você tem faturas aguardando pagamento. Envie lembretes pelo WhatsApp para aumentar suas chances de recebimento.</p>
                ) : (
                  <p>Não há faturas pendentes no momento.</p>
                )}
              </div>
              
              <Button asChild variant="outline" className="w-full">
                <Link to="/invoices">
                  Gerenciar Faturas
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {authState.user?.role === UserRole.ADMIN && (
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Visão Geral do Sistema</span>
              </CardTitle>
              <CardDescription>
                Estatísticas e métricas do sistema (visível apenas para administradores)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                  <p className="text-2xl font-semibold">{Math.floor(Math.random() * 10) + 3}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Notificações Enviadas</p>
                  <p className="text-2xl font-semibold">{Math.floor(Math.random() * 200) + 50}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Taxa de Entrega</p>
                  <p className="text-2xl font-semibold">{Math.floor(Math.random() * 10) + 90}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Uso de Armazenamento</p>
                  <p className="text-2xl font-semibold">{Math.floor(Math.random() * 100) + 200} MB</p>
                </div>
              </div>
              
              <div className="mt-6">
                <Button asChild>
                  <Link to="/reports">Ver Relatórios Detalhados</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
