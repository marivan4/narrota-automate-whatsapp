
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, FileText, Filter, CalendarRange } from 'lucide-react';
import { toast } from 'sonner';

// Mock data for the charts
const monthlyRevenueData = [
  { name: 'Jan', value: 4000 },
  { name: 'Fev', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Abr', value: 2780 },
  { name: 'Mai', value: 1890 },
  { name: 'Jun', value: 2390 },
  { name: 'Jul', value: 3490 },
  { name: 'Ago', value: 4000 },
  { name: 'Set', value: 2500 },
  { name: 'Out', value: 1500 },
  { name: 'Nov', value: 5000 },
  { name: 'Dez', value: 3800 },
];

const contractsStatusData = [
  { name: 'Ativos', value: 65 },
  { name: 'Vencidos', value: 15 },
  { name: 'Cancelados', value: 10 },
  { name: 'Em Aprovação', value: 10 },
];

const clientsByRegionData = [
  { name: 'São Paulo', value: 45 },
  { name: 'Rio de Janeiro', value: 25 },
  { name: 'Minas Gerais', value: 15 },
  { name: 'Outros', value: 15 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('revenue');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  const handleGenerateReport = () => {
    toast.success('Relatório gerado com sucesso!');
  };

  const handleDownloadReport = () => {
    toast.success('Relatório baixado com sucesso!');
  };

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <Button onClick={handleDownloadReport}>
            <Download className="h-4 w-4 mr-2" />
            Baixar Relatório
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Clientes Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">132</div>
              <p className="text-muted-foreground text-sm">Aumento de 8% este mês</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Contratos Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">98</div>
              <p className="text-muted-foreground text-sm">Aumento de 5% este mês</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Faturamento Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">R$ 75.230</div>
              <p className="text-muted-foreground text-sm">Aumento de 12% este mês</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Faturas Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">14</div>
              <p className="text-muted-foreground text-sm">Redução de 3% este mês</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Gerar Relatório</CardTitle>
            <CardDescription>Selecione as opções para gerar um relatório personalizado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="report-type">Tipo de Relatório</Label>
                <Select value={selectedReport} onValueChange={setSelectedReport}>
                  <SelectTrigger id="report-type">
                    <SelectValue placeholder="Tipo de Relatório" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Faturamento</SelectItem>
                    <SelectItem value="clients">Clientes</SelectItem>
                    <SelectItem value="contracts">Contratos</SelectItem>
                    <SelectItem value="vehicles">Veículos</SelectItem>
                    <SelectItem value="invoices">Faturas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="start-date">Data Inicial</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end-date">Data Final</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                />
              </div>
              
              <div className="flex items-end">
                <Button onClick={handleGenerateReport} className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="charts" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="charts">Gráficos</TabsTrigger>
            <TabsTrigger value="data">Dados</TabsTrigger>
          </TabsList>
          
          <TabsContent value="charts">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Faturamento Mensal</CardTitle>
                  <CardDescription>Faturamento dos últimos 12 meses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyRevenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => ['R$ ' + value, 'Faturamento']} />
                        <Legend />
                        <Bar dataKey="value" name="Faturamento (R$)" fill="#4f46e5" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Status dos Contratos</CardTitle>
                  <CardDescription>Distribuição dos contratos por status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={contractsStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {contractsStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} contratos`, 'Quantidade']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Clientes por Região</CardTitle>
                  <CardDescription>Distribuição geográfica dos clientes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={clientsByRegionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {clientsByRegionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} clientes`, 'Quantidade']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Contratos por Mês</CardTitle>
                  <CardDescription>Novos contratos mensais no último ano</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyRevenueData.map(item => ({ name: item.name, value: Math.round(item.value / 500) }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} contratos`, 'Quantidade']} />
                        <Legend />
                        <Bar dataKey="value" name="Contratos" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>Dados do Relatório</CardTitle>
                <CardDescription>Visualização detalhada dos dados</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-12">
                  Selecione um tipo de relatório e o período para visualizar os dados detalhados.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
