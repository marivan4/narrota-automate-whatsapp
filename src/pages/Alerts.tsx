import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckCheck, AlertCircle, BellOff, BellRing, Clock, MapPin } from 'lucide-react';

// Define types
type AlertPriority = 'high' | 'medium' | 'low';
type AlertStatus = 'active' | 'resolved' | 'ignored';
type AlertType = 'geofence' | 'battery' | 'motion' | 'speed' | 'disconnect';

interface Alert {
  id: string;
  vehiclePlate: string;
  vehicleModel: string;
  client: string;
  type: AlertType;
  message: string;
  location: string;
  priority: AlertPriority;
  status: AlertStatus;
  timestamp: Date;
}

const Alerts: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Mock data
  const mockAlerts: Alert[] = [
    {
      id: '1',
      vehiclePlate: 'ABC1234',
      vehicleModel: 'Honda Civic',
      client: 'João Silva',
      type: 'geofence',
      message: 'Veículo saiu da cerca virtual',
      location: 'Av. Paulista, São Paulo - SP',
      priority: 'high',
      status: 'active',
      timestamp: new Date('2023-05-15T13:45:00')
    },
    {
      id: '2',
      vehiclePlate: 'DEF5678',
      vehicleModel: 'Toyota Corolla',
      client: 'Maria Souza',
      type: 'battery',
      message: 'Bateria do rastreador baixa',
      location: 'R. Augusta, São Paulo - SP',
      priority: 'medium',
      status: 'active',
      timestamp: new Date('2023-05-15T10:22:00')
    },
    {
      id: '3',
      vehiclePlate: 'GHI9012',
      vehicleModel: 'Volkswagen Gol',
      client: 'Pedro Santos',
      type: 'motion',
      message: 'Movimento detectado com ignição desligada',
      location: 'Av. Rio Branco, Rio de Janeiro - RJ',
      priority: 'high',
      status: 'resolved',
      timestamp: new Date('2023-05-14T22:15:00')
    },
    {
      id: '4',
      vehiclePlate: 'JKL3456',
      vehicleModel: 'Fiat Uno',
      client: 'Ana Oliveira',
      type: 'speed',
      message: 'Excesso de velocidade detectado',
      location: 'BR-101, Km 23, Florianópolis - SC',
      priority: 'medium',
      status: 'active',
      timestamp: new Date('2023-05-15T09:10:00')
    },
    {
      id: '5',
      vehiclePlate: 'MNO7890',
      vehicleModel: 'Chevrolet Onix',
      client: 'Carlos Pereira',
      type: 'disconnect',
      message: 'Rastreador desconectado',
      location: 'Av. das Américas, Rio de Janeiro - RJ',
      priority: 'low',
      status: 'ignored',
      timestamp: new Date('2023-05-14T18:30:00')
    },
  ];

  // Filter alerts
  const filteredAlerts = mockAlerts.filter(alert => {
    // Filter by status
    if (statusFilter && alert.status !== statusFilter) return false;
    
    // Filter by type
    if (typeFilter && alert.type !== typeFilter) return false;
    
    // Search term filter (case insensitive)
    const term = searchTerm.toLowerCase();
    return (
      alert.vehiclePlate.toLowerCase().includes(term) ||
      alert.vehicleModel.toLowerCase().includes(term) ||
      alert.client.toLowerCase().includes(term) ||
      alert.message.toLowerCase().includes(term) ||
      alert.location.toLowerCase().includes(term)
    );
  });

  // Sort alerts by timestamp (most recent first) and priority
  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    // First sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    
    // If priority is the same, sort by timestamp
    if (priorityDiff === 0) {
      return b.timestamp.getTime() - a.timestamp.getTime();
    }
    
    return priorityDiff;
  });

  const handleResolveAlert = (alertId: string) => {
    // In a real app, this would update the alert in the database
    toast.success('Alerta marcado como resolvido!');
  };

  const handleIgnoreAlert = (alertId: string) => {
    // In a real app, this would update the alert in the database
    toast.success('Alerta ignorado!');
  };

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Alertas e Notificações</h1>
          <Button onClick={() => navigate('/dashboard')}>Voltar ao Dashboard</Button>
        </div>

        <Tabs defaultValue="current" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="current">Alertas Atuais</TabsTrigger>
              <TabsTrigger value="history">Histórico de Alertas</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <Label htmlFor="auto-refresh" className="text-sm">
                Atualização automática
              </Label>
            </div>
          </div>

          <TabsContent value="current">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Alertas Ativos</CardTitle>
                <CardDescription>
                  Monitore e gerencie alertas em tempo real
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <Input
                    placeholder="Buscar por placa, cliente ou local..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="md:w-1/3"
                  />
                  
                  <Select
                    value={statusFilter || "all-status"}
                    onValueChange={(value) => setStatusFilter(value === "all-status" ? null : value)}
                  >
                    <SelectTrigger className="md:w-1/4">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-status">Todos os status</SelectItem>
                      <SelectItem value="active">Ativos</SelectItem>
                      <SelectItem value="resolved">Resolvidos</SelectItem>
                      <SelectItem value="ignored">Ignorados</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={typeFilter || "all-types"}
                    onValueChange={(value) => setTypeFilter(value === "all-types" ? null : value)}
                  >
                    <SelectTrigger className="md:w-1/4">
                      <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-types">Todos os tipos</SelectItem>
                      <SelectItem value="geofence">Cerca Virtual</SelectItem>
                      <SelectItem value="battery">Bateria</SelectItem>
                      <SelectItem value="motion">Movimento</SelectItem>
                      <SelectItem value="speed">Velocidade</SelectItem>
                      <SelectItem value="disconnect">Desconexão</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {sortedAlerts.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Prioridade</TableHead>
                        <TableHead>Veículo</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Alerta</TableHead>
                        <TableHead>Localização</TableHead>
                        <TableHead>Horário</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedAlerts.map((alert) => (
                        <TableRow key={alert.id}>
                          <TableCell>
                            <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              alert.priority === 'high' 
                                ? 'bg-red-100 text-red-800' 
                                : alert.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {alert.priority === 'high' ? 'Alta' : alert.priority === 'medium' ? 'Média' : 'Baixa'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {alert.vehicleModel} ({alert.vehiclePlate})
                          </TableCell>
                          <TableCell>{alert.client}</TableCell>
                          <TableCell>{alert.message}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                              {alert.location}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                              {alert.timestamp.toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center ${
                              alert.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : alert.status === 'resolved'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-50 text-red-800'
                            }`}>
                              {alert.status === 'active' && <BellRing className="h-3 w-3 mr-1" />}
                              {alert.status === 'resolved' && <CheckCheck className="h-3 w-3 mr-1" />}
                              {alert.status === 'ignored' && <BellOff className="h-3 w-3 mr-1" />}
                              {alert.status === 'active' ? 'Ativo' : 
                              alert.status === 'resolved' ? 'Resolvido' : 'Ignorado'}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleResolveAlert(alert.id)}
                              >
                                <CheckCheck className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleIgnoreAlert(alert.id)}
                              >
                                <BellOff className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="rounded-full bg-green-100 p-3">
                      <CheckCheck className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">Sem alertas ativos</h3>
                    <p className="mt-1 text-sm text-muted-foreground text-center">
                      {searchTerm || statusFilter || typeFilter 
                        ? "Nenhum alerta encontrado com os filtros atuais" 
                        : "Não há alertas ativos no momento"}
                    </p>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Última atualização: {new Date().toLocaleTimeString('pt-BR')}</span>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Alertas</CardTitle>
                <CardDescription>
                  Visualize e analise alertas passados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg text-muted-foreground">Histórico de alertas em desenvolvimento</p>
                  <p className="text-sm text-muted-foreground">Esta funcionalidade estará disponível em breve</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Alertas</CardTitle>
                <CardDescription>
                  Personalize os tipos de alertas e notificações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10">
                  <BellRing className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg text-muted-foreground">Configurações de alertas em desenvolvimento</p>
                  <p className="text-sm text-muted-foreground">Esta funcionalidade estará disponível em breve</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Alerts;
