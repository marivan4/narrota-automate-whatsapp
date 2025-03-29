
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from "sonner";
import { 
  Car,
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Battery,
  SignalHigh,
  AlertCircle,
  Loader2,
  ArrowUpDown,
  Calendar,
  User
} from 'lucide-react';

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  year: string;
  color: string;
  client: string;
  tracker: {
    model: string;
    imei: string;
    installDate: string;
    status: 'active' | 'inactive' | 'alert';
    batteryLevel: number;
    signalStrength: number;
  };
  lastLocation: {
    address: string;
    timestamp: Date;
    speed: number;
  };
}

const Vehicles: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentSort, setCurrentSort] = useState<{ field: string; direction: 'asc' | 'desc' }>({
    field: 'plate',
    direction: 'asc'
  });

  // Mock data
  const mockVehicles: Vehicle[] = [
    {
      id: '1',
      plate: 'ABC1234',
      model: 'Honda Civic',
      year: '2022',
      color: 'Preto',
      client: 'João Silva',
      tracker: {
        model: 'GT06N',
        imei: '123456789012345',
        installDate: '2023-01-15',
        status: 'active',
        batteryLevel: 95,
        signalStrength: 85,
      },
      lastLocation: {
        address: 'Av. Paulista, 1000, São Paulo - SP',
        timestamp: new Date('2023-05-15T14:30:00'),
        speed: 0,
      },
    },
    {
      id: '2',
      plate: 'DEF5678',
      model: 'Toyota Corolla',
      year: '2021',
      color: 'Prata',
      client: 'Maria Souza',
      tracker: {
        model: 'TK103',
        imei: '987654321098765',
        installDate: '2023-02-10',
        status: 'active',
        batteryLevel: 80,
        signalStrength: 90,
      },
      lastLocation: {
        address: 'Rua Augusta, 500, São Paulo - SP',
        timestamp: new Date('2023-05-15T15:45:00'),
        speed: 45,
      },
    },
    {
      id: '3',
      plate: 'GHI9012',
      model: 'Volkswagen Gol',
      year: '2020',
      color: 'Branco',
      client: 'Pedro Santos',
      tracker: {
        model: 'GT06N',
        imei: '456789012345678',
        installDate: '2023-03-05',
        status: 'alert',
        batteryLevel: 15,
        signalStrength: 60,
      },
      lastLocation: {
        address: 'Av. Rio Branco, 150, Rio de Janeiro - RJ',
        timestamp: new Date('2023-05-15T13:20:00'),
        speed: 0,
      },
    },
    {
      id: '4',
      plate: 'JKL3456',
      model: 'Fiat Uno',
      year: '2019',
      color: 'Vermelho',
      client: 'Ana Oliveira',
      tracker: {
        model: 'CT03',
        imei: '345678901234567',
        installDate: '2023-01-20',
        status: 'inactive',
        batteryLevel: 0,
        signalStrength: 0,
      },
      lastLocation: {
        address: 'Av. Beira Mar, 500, Florianópolis - SC',
        timestamp: new Date('2023-05-10T09:15:00'),
        speed: 0,
      },
    },
    {
      id: '5',
      plate: 'MNO7890',
      model: 'Chevrolet Onix',
      year: '2023',
      color: 'Azul',
      client: 'Carlos Pereira',
      tracker: {
        model: 'GT06N',
        imei: '567890123456789',
        installDate: '2023-04-10',
        status: 'active',
        batteryLevel: 75,
        signalStrength: 95,
      },
      lastLocation: {
        address: 'Av. das Américas, 1000, Rio de Janeiro - RJ',
        timestamp: new Date('2023-05-15T16:10:00'),
        speed: 65,
      },
    },
  ];

  // Filter and sort vehicles
  const filteredVehicles = mockVehicles.filter(vehicle => {
    // Apply status filter
    if (statusFilter !== 'all' && vehicle.tracker.status !== statusFilter) {
      return false;
    }
    
    // Apply search filter
    const term = searchTerm.toLowerCase();
    return (
      vehicle.plate.toLowerCase().includes(term) ||
      vehicle.model.toLowerCase().includes(term) ||
      vehicle.client.toLowerCase().includes(term) ||
      vehicle.lastLocation.address.toLowerCase().includes(term)
    );
  });

  // Sort vehicles
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    let valueA, valueB;

    // Get values based on sort field
    switch (currentSort.field) {
      case 'plate':
        valueA = a.plate;
        valueB = b.plate;
        break;
      case 'model':
        valueA = a.model;
        valueB = b.model;
        break;
      case 'client':
        valueA = a.client;
        valueB = b.client;
        break;
      case 'status':
        valueA = a.tracker.status;
        valueB = b.tracker.status;
        break;
      case 'lastUpdate':
        valueA = a.lastLocation.timestamp.getTime();
        valueB = b.lastLocation.timestamp.getTime();
        break;
      default:
        valueA = a.plate;
        valueB = b.plate;
    }

    // Compare values
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return currentSort.direction === 'asc' 
        ? valueA.localeCompare(valueB) 
        : valueB.localeCompare(valueA);
    } else {
      return currentSort.direction === 'asc' 
        ? (valueA as number) - (valueB as number) 
        : (valueB as number) - (valueA as number);
    }
  });

  // Handle sort
  const handleSort = (field: string) => {
    setCurrentSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gerenciamento de Veículos</h1>
          <div className="flex space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Veículo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Veículo</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do veículo e rastreador
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="plate">Placa</Label>
                      <Input id="plate" placeholder="ABC1234" />
                    </div>
                    <div>
                      <Label htmlFor="model">Modelo</Label>
                      <Input id="model" placeholder="Honda Civic" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="year">Ano</Label>
                      <Input id="year" placeholder="2022" />
                    </div>
                    <div>
                      <Label htmlFor="color">Cor</Label>
                      <Input id="color" placeholder="Preto" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="client">Cliente</Label>
                    <Select>
                      <SelectTrigger id="client">
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">João Silva</SelectItem>
                        <SelectItem value="2">Maria Souza</SelectItem>
                        <SelectItem value="3">Pedro Santos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tracker-model">Modelo do Rastreador</Label>
                      <Input id="tracker-model" placeholder="GT06N" />
                    </div>
                    <div>
                      <Label htmlFor="imei">IMEI</Label>
                      <Input id="imei" placeholder="123456789012345" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={() => {
                      toast.success("Veículo adicionado com sucesso!");
                    }}
                  >
                    Salvar Veículo
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Voltar
            </Button>
          </div>
        </div>

        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">Lista de Veículos</TabsTrigger>
            <TabsTrigger value="map">Mapa de Rastreamento</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Veículos Cadastrados</CardTitle>
                <CardDescription>
                  Gerencie os veículos e seus rastreadores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="md:w-1/2 flex">
                    <div className="relative w-full">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por placa, modelo ou cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  
                  <div className="md:w-1/4">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Filtrar por status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="active">Ativos</SelectItem>
                        <SelectItem value="inactive">Inativos</SelectItem>
                        <SelectItem value="alert">Com Alerta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {sortedVehicles.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer"
                          onClick={() => handleSort('plate')}
                        >
                          <div className="flex items-center">
                            Placa
                            {currentSort.field === 'plate' && (
                              <ArrowUpDown className={`ml-1 h-4 w-4 ${currentSort.direction === 'desc' ? 'rotate-180' : ''}`} />
                            )}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer"
                          onClick={() => handleSort('model')}
                        >
                          <div className="flex items-center">
                            Modelo/Ano
                            {currentSort.field === 'model' && (
                              <ArrowUpDown className={`ml-1 h-4 w-4 ${currentSort.direction === 'desc' ? 'rotate-180' : ''}`} />
                            )}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => handleSort('client')}
                        >
                          <div className="flex items-center">
                            Cliente
                            {currentSort.field === 'client' && (
                              <ArrowUpDown className={`ml-1 h-4 w-4 ${currentSort.direction === 'desc' ? 'rotate-180' : ''}`} />
                            )}
                          </div>
                        </TableHead>
                        <TableHead>Rastreador</TableHead>
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => handleSort('status')}
                        >
                          <div className="flex items-center">
                            Status
                            {currentSort.field === 'status' && (
                              <ArrowUpDown className={`ml-1 h-4 w-4 ${currentSort.direction === 'desc' ? 'rotate-180' : ''}`} />
                            )}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => handleSort('lastUpdate')}
                        >
                          <div className="flex items-center">
                            Última Atualização
                            {currentSort.field === 'lastUpdate' && (
                              <ArrowUpDown className={`ml-1 h-4 w-4 ${currentSort.direction === 'desc' ? 'rotate-180' : ''}`} />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedVehicles.map((vehicle) => (
                        <TableRow key={vehicle.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <Car className="h-4 w-4 mr-2" />
                              {vehicle.plate}
                            </div>
                          </TableCell>
                          <TableCell>
                            {vehicle.model} ({vehicle.year})<br/>
                            <span className="text-xs text-muted-foreground">Cor: {vehicle.color}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2" />
                              {vehicle.client}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{vehicle.tracker.model}</div>
                              <div className="text-xs text-muted-foreground">IMEI: {vehicle.tracker.imei}</div>
                              <div className="flex items-center mt-1 space-x-2">
                                <div className="flex items-center" title="Nível de bateria">
                                  <Battery className="h-3 w-3 mr-1 text-muted-foreground" />
                                  <span className={`text-xs ${
                                    vehicle.tracker.batteryLevel < 20 ? 'text-red-500' : 
                                    vehicle.tracker.batteryLevel < 50 ? 'text-yellow-500' : 
                                    'text-green-500'
                                  }`}>
                                    {vehicle.tracker.batteryLevel}%
                                  </span>
                                </div>
                                <div className="flex items-center" title="Força do sinal">
                                  <SignalHigh className="h-3 w-3 mr-1 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {vehicle.tracker.signalStrength}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${
                              vehicle.tracker.status === 'active' ? 'bg-green-100 text-green-800' : 
                              vehicle.tracker.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {vehicle.tracker.status === 'active' ? 'Ativo' : 
                              vehicle.tracker.status === 'inactive' ? 'Inativo' : 
                              'Alerta'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="flex items-center text-sm">
                                <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                                {vehicle.lastLocation.timestamp.toLocaleDateString('pt-BR')}
                              </div>
                              <div className="flex items-center text-sm">
                                <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                                {vehicle.lastLocation.address.length > 30 
                                  ? vehicle.lastLocation.address.substring(0, 30) + '...' 
                                  : vehicle.lastLocation.address}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  toast.success(`Editando veículo ${vehicle.plate}`);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  toast.success(`Link do mapa para ${vehicle.plate}`);
                                }}
                              >
                                <MapPin className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-red-500"
                                onClick={() => {
                                  toast.success(`Veículo ${vehicle.plate} removido`);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Car className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Nenhum veículo encontrado</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      {searchTerm || statusFilter !== 'all'
                        ? "Tente ajustar os filtros de busca"
                        : "Adicione um novo veículo para começar"}
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Exibindo {sortedVehicles.length} de {mockVehicles.length} veículos
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="map">
            <Card>
              <CardHeader>
                <CardTitle>Mapa de Rastreamento</CardTitle>
                <CardDescription>
                  Visualize a localização dos veículos em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[450px] flex items-center justify-center bg-gray-50 border rounded-md">
                <div className="text-center">
                  <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Mapa de Rastreamento</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Esta funcionalidade estará disponível em breve
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios de Veículos</CardTitle>
                <CardDescription>
                  Gere relatórios detalhados sobre os veículos e rastreadores
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">Relatórios em desenvolvimento</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Esta funcionalidade estará disponível em breve
                  </p>
                  <Button className="mt-4" onClick={() => navigate('/reports')}>
                    Ir para Relatórios
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Vehicles;
