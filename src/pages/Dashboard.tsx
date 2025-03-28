
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, FileText, Car, Bell, Activity, CreditCard, BarChart3, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Define dashboard card data
const cards = [
  {
    title: "Clientes Ativos",
    value: "164",
    description: "+12% este mês",
    icon: <Users className="h-5 w-5 text-primary" />,
    link: "/clients"
  },
  {
    title: "Contratos Ativos",
    value: "98",
    description: "+5% este mês",
    icon: <FileText className="h-5 w-5 text-primary" />,
    link: "/contracts"
  },
  {
    title: "Veículos Monitorados",
    value: "142",
    description: "+8% este mês",
    icon: <Car className="h-5 w-5 text-primary" />,
    link: "/vehicles"
  },
  {
    title: "Alertas Recentes",
    value: "7",
    description: "-2% este mês",
    icon: <Bell className="h-5 w-5 text-primary" />,
    link: "/alerts"
  }
];

// Recent activity data
const recentActivity = [
  { id: 1, description: "Novo cliente adicionado: João Silva", time: "Há 30 minutos", type: "client" },
  { id: 2, description: "Contrato #12345 assinado", time: "Há 1 hora", type: "contract" },
  { id: 3, description: "Alerta: Veículo ABC-1234 fora da cerca virtual", time: "Há 2 horas", type: "alert" },
  { id: 4, description: "Fatura #543 paga", time: "Há 3 horas", type: "invoice" },
  { id: 5, description: "Rastreador instalado: Veículo XYZ-7890", time: "Há 5 horas", type: "vehicle" }
];

// Revenue data for chart
const revenueData = [
  { name: 'Jan', Faturamento: 4000 },
  { name: 'Fev', Faturamento: 3000 },
  { name: 'Mar', Faturamento: 2000 },
  { name: 'Abr', Faturamento: 2780 },
  { name: 'Mai', Faturamento: 1890 },
  { name: 'Jun', Faturamento: 2390 },
];

// Client distribution data for pie chart
const clientDistribution = [
  { name: 'Particulares', value: 65 },
  { name: 'Empresas', value: 25 },
  { name: 'Frotas', value: 10 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

// Schedule data
const scheduleItems = [
  { id: 1, title: "Instalação Rastreador", client: "Maria Oliveira", time: "09:00", status: "pending" },
  { id: 2, title: "Manutenção Preventiva", client: "Pedro Santos", time: "11:30", status: "confirmed" },
  { id: 3, title: "Reunião Comercial", client: "Empresa XYZ", time: "14:00", status: "confirmed" },
  { id: 4, title: "Instalação Rastreador", client: "Carlos Lima", time: "16:30", status: "pending" }
];

const Dashboard = () => {
  const { authState } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (!authState.isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Painel de Controle</h1>
            <p className="text-muted-foreground">
              Bem-vindo, {authState.user?.name || 'Administrador'}! Aqui está um resumo do seu sistema.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button asChild variant="outline">
              <Link to="/reports">
                <BarChart3 className="h-4 w-4 mr-2" />
                Relatórios
              </Link>
            </Button>
            <Button asChild>
              <Link to="/contracts">
                <FileText className="h-4 w-4 mr-2" />
                Contratos
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, i) => (
            <Card key={i} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                {card.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                <Link 
                  to={card.link} 
                  className="text-xs text-primary hover:underline mt-4 inline-block"
                >
                  Ver detalhes →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Faturamento Mensal</CardTitle>
              <CardDescription>Visão geral do faturamento nos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${value}`, 'Valor']} />
                  <Legend />
                  <Bar dataKey="Faturamento" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Distribuição de Clientes</CardTitle>
              <CardDescription>Por tipo de cliente</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={clientDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {clientDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Porcentagem']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Atividades Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start">
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full",
                      activity.type === 'client' && "bg-blue-100 text-blue-600",
                      activity.type === 'contract' && "bg-green-100 text-green-600",
                      activity.type === 'alert' && "bg-red-100 text-red-600", 
                      activity.type === 'invoice' && "bg-purple-100 text-purple-600",
                      activity.type === 'vehicle' && "bg-orange-100 text-orange-600",
                    )}>
                      {activity.type === 'client' && <Users className="h-4 w-4" />}
                      {activity.type === 'contract' && <FileText className="h-4 w-4" />}
                      {activity.type === 'alert' && <Bell className="h-4 w-4" />}
                      {activity.type === 'invoice' && <CreditCard className="h-4 w-4" />}
                      {activity.type === 'vehicle' && <Car className="h-4 w-4" />}
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Agendamentos para Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduleItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className={cn(
                        "w-2 h-2 rounded-full mr-3",
                        item.status === 'confirmed' ? "bg-green-500" : "bg-yellow-500"
                      )} />
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.client}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Ver Agenda Completa
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
