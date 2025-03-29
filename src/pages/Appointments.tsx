
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { 
  Calendar, 
  Clock, 
  Plus, 
  User, 
  Car, 
  MapPin, 
  CheckCheck,
  X,
  AlertTriangle,
  Search
} from 'lucide-react';
import { cn } from "@/lib/utils";

// Types
type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
type AppointmentType = 'installation' | 'maintenance' | 'removal' | 'inspection';

interface Appointment {
  id: string;
  type: AppointmentType;
  status: AppointmentStatus;
  date: Date;
  timeSlot: string;
  client: {
    id: string;
    name: string;
    phone: string;
  };
  vehicle: {
    plate: string;
    model: string;
  };
  location: string;
  technician?: string;
  notes?: string;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

const Appointments: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  // New appointment form state
  const [newAppointmentDate, setNewAppointmentDate] = useState<Date | undefined>(undefined);
  const [newAppointmentType, setNewAppointmentType] = useState<AppointmentType>('installation');
  const [newAppointmentTimeSlot, setNewAppointmentTimeSlot] = useState('');

  // Mock data
  const timeSlots: TimeSlot[] = [
    { id: '1', time: '08:00', available: true },
    { id: '2', time: '09:00', available: true },
    { id: '3', time: '10:00', available: false },
    { id: '4', time: '11:00', available: true },
    { id: '5', time: '13:00', available: true },
    { id: '6', time: '14:00', available: false },
    { id: '7', time: '15:00', available: true },
    { id: '8', time: '16:00', available: true },
    { id: '9', time: '17:00', available: true },
  ];

  const mockAppointments: Appointment[] = [
    {
      id: '1',
      type: 'installation',
      status: 'confirmed',
      date: new Date('2023-05-15T10:00:00'),
      timeSlot: '10:00',
      client: {
        id: '1',
        name: 'João Silva',
        phone: '(11) 98765-4321',
      },
      vehicle: {
        plate: 'ABC1234',
        model: 'Honda Civic',
      },
      location: 'Av. Paulista, 1000, São Paulo - SP',
      technician: 'Carlos Oliveira',
      notes: 'Cliente solicitou instalação discreta do rastreador.',
    },
    {
      id: '2',
      type: 'maintenance',
      status: 'pending',
      date: new Date('2023-05-16T14:00:00'),
      timeSlot: '14:00',
      client: {
        id: '2',
        name: 'Maria Souza',
        phone: '(11) 91234-5678',
      },
      vehicle: {
        plate: 'DEF5678',
        model: 'Toyota Corolla',
      },
      location: 'Rua Augusta, 500, São Paulo - SP',
      notes: 'Rastreador apresentando falha na comunicação.',
    },
    {
      id: '3',
      type: 'removal',
      status: 'completed',
      date: new Date('2023-05-14T09:00:00'),
      timeSlot: '09:00',
      client: {
        id: '3',
        name: 'Pedro Santos',
        phone: '(21) 98765-4321',
      },
      vehicle: {
        plate: 'GHI9012',
        model: 'Volkswagen Gol',
      },
      location: 'Av. Rio Branco, 150, Rio de Janeiro - RJ',
      technician: 'Roberto Silva',
      notes: 'Cliente vendeu o veículo e solicitou a remoção do rastreador.',
    },
    {
      id: '4',
      type: 'inspection',
      status: 'cancelled',
      date: new Date('2023-05-13T15:00:00'),
      timeSlot: '15:00',
      client: {
        id: '4',
        name: 'Ana Oliveira',
        phone: '(11) 97654-3210',
      },
      vehicle: {
        plate: 'JKL3456',
        model: 'Fiat Uno',
      },
      location: 'Av. Beira Mar, 500, Florianópolis - SC',
      notes: 'Cliente cancelou pois precisou viajar.',
    },
    {
      id: '5',
      type: 'installation',
      status: 'pending',
      date: new Date('2023-05-17T11:00:00'),
      timeSlot: '11:00',
      client: {
        id: '5',
        name: 'Carlos Pereira',
        phone: '(21) 91234-5678',
      },
      vehicle: {
        plate: 'MNO7890',
        model: 'Chevrolet Onix',
      },
      location: 'Av. das Américas, 1000, Rio de Janeiro - RJ',
      technician: 'Fernando Gomes',
    },
  ];

  // Filter appointments
  const filteredAppointments = mockAppointments.filter(appointment => {
    // Filter by status
    if (statusFilter !== 'all' && appointment.status !== statusFilter) {
      return false;
    }
    
    // Filter by type
    if (typeFilter !== 'all' && appointment.type !== typeFilter) {
      return false;
    }
    
    // Filter by date
    if (selectedDate && 
      appointment.date.getDate() !== selectedDate.getDate() ||
      appointment.date.getMonth() !== selectedDate.getMonth() ||
      appointment.date.getFullYear() !== selectedDate.getFullYear()) {
      return false;
    }
    
    // Filter by search term
    const term = searchTerm.toLowerCase();
    return (
      appointment.client.name.toLowerCase().includes(term) ||
      appointment.vehicle.plate.toLowerCase().includes(term) ||
      appointment.vehicle.model.toLowerCase().includes(term) ||
      appointment.location.toLowerCase().includes(term)
    );
  });

  // Group appointments by date for calendar view
  const appointmentsByDate: Record<string, Appointment[]> = {};
  mockAppointments.forEach(appointment => {
    const dateKey = appointment.date.toISOString().split('T')[0];
    if (!appointmentsByDate[dateKey]) {
      appointmentsByDate[dateKey] = [];
    }
    appointmentsByDate[dateKey].push(appointment);
  });
  
  // Get appointment count for a given date
  const getAppointmentCountForDate = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    return appointmentsByDate[dateKey]?.length || 0;
  };

  // Handle creating a new appointment
  const handleCreateAppointment = () => {
    if (!newAppointmentDate || !newAppointmentTimeSlot) {
      toast.error("Por favor, selecione a data e horário");
      return;
    }
    
    toast.success("Agendamento criado com sucesso!");
    // Reset form
    setNewAppointmentDate(undefined);
    setNewAppointmentType('installation');
    setNewAppointmentTimeSlot('');
  };

  // Handle change appointment status
  const handleChangeStatus = (appointmentId: string, newStatus: AppointmentStatus) => {
    // In a real app, this would update the appointment in the database
    toast.success(`Status do agendamento alterado para ${
      newStatus === 'confirmed' ? 'Confirmado' :
      newStatus === 'completed' ? 'Concluído' :
      newStatus === 'cancelled' ? 'Cancelado' : 'Pendente'
    }`);
  };

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Agendamentos</h1>
          <div className="flex space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Agendamento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Agendar Novo Serviço</DialogTitle>
                  <DialogDescription>
                    Selecione a data, horário e tipo de serviço
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="service-type">Tipo de Serviço</Label>
                    <Select
                      value={newAppointmentType}
                      onValueChange={(value) => setNewAppointmentType(value as AppointmentType)}
                    >
                      <SelectTrigger id="service-type">
                        <SelectValue placeholder="Selecione o tipo de serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="installation">Instalação</SelectItem>
                        <SelectItem value="maintenance">Manutenção</SelectItem>
                        <SelectItem value="removal">Remoção</SelectItem>
                        <SelectItem value="inspection">Inspeção</SelectItem>
                      </SelectContent>
                    </Select>
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
                        <SelectItem value="4">Ana Oliveira</SelectItem>
                        <SelectItem value="5">Carlos Pereira</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="vehicle">Veículo</Label>
                    <Select>
                      <SelectTrigger id="vehicle">
                        <SelectValue placeholder="Selecione o veículo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Honda Civic - ABC1234</SelectItem>
                        <SelectItem value="2">Toyota Corolla - DEF5678</SelectItem>
                        <SelectItem value="3">Volkswagen Gol - GHI9012</SelectItem>
                        <SelectItem value="4">Fiat Uno - JKL3456</SelectItem>
                        <SelectItem value="5">Chevrolet Onix - MNO7890</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Data do Agendamento</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newAppointmentDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {newAppointmentDate ? (
                            format(newAppointmentDate, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={newAppointmentDate}
                          onSelect={setNewAppointmentDate}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <Label htmlFor="time-slot">Horário</Label>
                    <Select
                      value={newAppointmentTimeSlot}
                      onValueChange={setNewAppointmentTimeSlot}
                      disabled={!newAppointmentDate}
                    >
                      <SelectTrigger id="time-slot">
                        <SelectValue placeholder="Selecione um horário" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem
                            key={slot.id}
                            value={slot.time}
                            disabled={!slot.available}
                          >
                            {slot.time} {!slot.available && "(Indisponível)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Local</Label>
                    <Input id="location" placeholder="Endereço completo" />
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea 
                      id="notes" 
                      placeholder="Informações adicionais sobre o agendamento" 
                      className="resize-none"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateAppointment}>
                    Agendar Serviço
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
            <TabsTrigger value="list">Lista de Agendamentos</TabsTrigger>
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Agendamentos de Serviços</CardTitle>
                <CardDescription>
                  Visualize e gerencie os agendamentos de instalação e manutenção
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="md:w-1/2 flex">
                    <div className="relative w-full">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por cliente, veículo ou local..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:w-1/2">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="pending">Pendentes</SelectItem>
                        <SelectItem value="confirmed">Confirmados</SelectItem>
                        <SelectItem value="completed">Concluídos</SelectItem>
                        <SelectItem value="cancelled">Cancelados</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={typeFilter}
                      onValueChange={setTypeFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="installation">Instalação</SelectItem>
                        <SelectItem value="maintenance">Manutenção</SelectItem>
                        <SelectItem value="removal">Remoção</SelectItem>
                        <SelectItem value="inspection">Inspeção</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {selectedDate ? (
                            format(selectedDate, "dd/MM/yyyy")
                          ) : (
                            <span>Filtrar por data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <div className="p-2">
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => setSelectedDate(undefined)}
                          >
                            Limpar filtro de data
                          </Button>
                        </div>
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                {filteredAppointments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Cliente/Veículo</TableHead>
                        <TableHead>Local</TableHead>
                        <TableHead>Técnico</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                                {appointment.date.toLocaleDateString('pt-BR')}
                              </div>
                              <div className="flex items-center text-muted-foreground text-sm">
                                <Clock className="h-3 w-3 mr-1" />
                                {appointment.timeSlot}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              appointment.type === 'installation' ? 'bg-blue-100 text-blue-800' :
                              appointment.type === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                              appointment.type === 'removal' ? 'bg-red-100 text-red-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {appointment.type === 'installation' ? 'Instalação' :
                              appointment.type === 'maintenance' ? 'Manutenção' :
                              appointment.type === 'removal' ? 'Remoção' :
                              'Inspeção'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-1 text-muted-foreground" />
                                {appointment.client.name}
                              </div>
                              <div className="flex items-center text-muted-foreground text-sm">
                                <Car className="h-3 w-3 mr-1" />
                                {appointment.vehicle.model} ({appointment.vehicle.plate})
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                              {appointment.location.length > 25 
                                ? appointment.location.substring(0, 25) + '...' 
                                : appointment.location}
                            </div>
                          </TableCell>
                          <TableCell>
                            {appointment.technician || 'Não atribuído'}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {appointment.status === 'pending' ? 'Pendente' :
                              appointment.status === 'confirmed' ? 'Confirmado' :
                              appointment.status === 'completed' ? 'Concluído' :
                              'Cancelado'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              {appointment.status === 'pending' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleChangeStatus(appointment.id, 'confirmed')}
                                    className="text-green-600"
                                  >
                                    <CheckCheck className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleChangeStatus(appointment.id, 'cancelled')}
                                    className="text-red-600"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              {appointment.status === 'confirmed' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleChangeStatus(appointment.id, 'completed')}
                                  className="text-blue-600"
                                >
                                  <CheckCheck className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // View details
                                  toast.success(`Visualizando detalhes do agendamento ${appointment.id}`);
                                }}
                              >
                                Detalhes
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Nenhum agendamento encontrado</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || selectedDate
                        ? "Tente ajustar os filtros de busca"
                        : "Crie um novo agendamento para começar"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Calendário de Agendamentos</CardTitle>
                <CardDescription>
                  Visualize agendamentos em formato de calendário
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/2">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                      modifiers={{
                        hasAppointment: (date) => getAppointmentCountForDate(date) > 0
                      }}
                      modifiersStyles={{
                        hasAppointment: { backgroundColor: '#EFF6FF', fontWeight: 'bold' }
                      }}
                      components={{
                        DayContent: (props) => {
                          const count = getAppointmentCountForDate(props.date);
                          return (
                            <div className="relative w-full h-full flex items-center justify-center">
                              {props.children}
                              {count > 0 && (
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -mb-1">
                                  <div className="w-4 h-1 bg-blue-500 rounded-full"></div>
                                </div>
                              )}
                            </div>
                          );
                        }
                      }}
                    />
                  </div>
                  
                  <div className="md:w-1/2">
                    <h3 className="text-lg font-medium mb-4">
                      {selectedDate 
                        ? `Agendamentos em ${format(selectedDate, "PPPP", { locale: ptBR })}`
                        : "Selecione uma data para ver os agendamentos"
                      }
                    </h3>

                    {selectedDate && filteredAppointments.length > 0 ? (
                      <div className="space-y-3">
                        {filteredAppointments.map((appointment) => (
                          <Card key={appointment.id} className="overflow-hidden">
                            <div className={`h-1 w-full ${
                              appointment.type === 'installation' ? 'bg-blue-500' :
                              appointment.type === 'maintenance' ? 'bg-yellow-500' :
                              appointment.type === 'removal' ? 'bg-red-500' :
                              'bg-purple-500'
                            }`}></div>
                            <CardContent className="p-3">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                  <span className="font-medium">{appointment.timeSlot}</span>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                  appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {appointment.status === 'pending' ? 'Pendente' :
                                  appointment.status === 'confirmed' ? 'Confirmado' :
                                  appointment.status === 'completed' ? 'Concluído' :
                                  'Cancelado'}
                                </span>
                              </div>
                              <div className="mt-2">
                                <div className="flex items-center text-sm">
                                  <User className="h-3 w-3 mr-1 text-muted-foreground" />
                                  {appointment.client.name}
                                </div>
                                <div className="flex items-center text-sm mt-1">
                                  <Car className="h-3 w-3 mr-1 text-muted-foreground" />
                                  {appointment.vehicle.model} ({appointment.vehicle.plate})
                                </div>
                              </div>
                              <div className="mt-2">
                                <div className="flex items-start text-sm">
                                  <MapPin className="h-3 w-3 mr-1 text-muted-foreground mt-0.5" />
                                  <span className="text-muted-foreground">{appointment.location}</span>
                                </div>
                              </div>
                              {appointment.notes && (
                                <div className="mt-2 text-xs text-muted-foreground italic">
                                  "{appointment.notes}"
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : selectedDate ? (
                      <div className="flex flex-col items-center justify-center py-6">
                        <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">Nenhum agendamento para esta data</p>
                        <Button className="mt-4" onClick={() => {
                          setNewAppointmentDate(selectedDate);
                        }}>
                          <Plus className="h-4 w-4 mr-2" />
                          Agendar para este dia
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10">
                        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Selecione uma data no calendário</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Appointments;
