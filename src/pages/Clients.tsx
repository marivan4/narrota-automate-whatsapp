
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  UserPlus,
  User,
  Search,
  FileText,
  Printer,
  Download,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

// Mock type for clients
interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'client' | 'viewer';
  createdAt: Date;
  contracts: {
    id: string;
    title: string;
    status: 'active' | 'draft' | 'expired';
    createdAt: Date;
  }[];
}

interface ClientsProps {
  // Define props if needed
}

const Clients: React.FC<ClientsProps> = () => {
  const navigate = useNavigate();
  const { authState, isAuthorized } = useAuth();

  // State variables
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 10;

  // Mock data (replace with API calls later)
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const mockClients: Client[] = Array.from({ length: 25 }).map((_, index) => ({
        id: `client-${index + 1}`,
        name: `Cliente ${index + 1}`,
        email: `cliente${index + 1}@exemplo.com`,
        phone: `(11) 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        role: index % 5 === 0 ? 'admin' : index % 3 === 0 ? 'viewer' : 'client',
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)),
        contracts: Array.from({ length: Math.floor(Math.random() * 5) }).map((_, cIndex) => ({
          id: `contract-${index}-${cIndex}`,
          title: `Contrato de Rastreamento Veicular ${cIndex + 1}`,
          status: cIndex % 3 === 0 ? 'active' : cIndex % 2 === 0 ? 'draft' : 'expired',
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 180 * 24 * 60 * 60 * 1000)),
        })),
      }));
      setClients(mockClients);
      setIsLoading(false);
    }, 800);
  }, []);

  // Filter clients based on search term
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  // Pagination
  const indexOfLastClient = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;
  const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);
  const totalPages = Math.ceil(filteredClients.length / clientsPerPage);

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  // Handlers
  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
  };

  const handlePrintContract = (contractId: string) => {
    toast.info(`Preparando impressão do contrato ${contractId}...`);
    // Implementation would go here
    setTimeout(() => {
      toast.success("Contrato enviado para impressão");
    }, 1500);
  };

  const handleExportPDF = (contractId: string) => {
    toast.info(`Gerando PDF do contrato ${contractId}...`);
    // Implementation would go here
    setTimeout(() => {
      toast.success("PDF gerado com sucesso");
    }, 1500);
  };

  // Permissions check
  if (!authState.isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (!isAuthorized([UserRole.ADMIN, UserRole.MANAGER])) {
    navigate('/dashboard');
    return null;
  }

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Gestão de Clientes</h1>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Lista de Clientes</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar clientes..."
                  className="w-[250px] pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Cliente
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableCaption>Lista de clientes cadastrados no sistema</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>E-mail</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Contratos</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentClients.length > 0 ? (
                        currentClients.map((client) => (
                          <TableRow key={client.id}>
                            <TableCell className="font-medium">{client.name}</TableCell>
                            <TableCell>{client.email}</TableCell>
                            <TableCell>{client.phone}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                client.role === 'admin' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : client.role === 'client' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                              }`}>
                                {client.role === 'admin' ? 'Administrador' : client.role === 'client' ? 'Cliente' : 'Visualizador'}
                              </span>
                            </TableCell>
                            <TableCell>{client.contracts.length}</TableCell>
                            <TableCell className="text-right">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => handleViewClient(client)}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                  <DialogHeader>
                                    <DialogTitle>Detalhes do Cliente</DialogTitle>
                                    <DialogDescription>
                                      Informações completas e contratos do cliente.
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  <Tabs defaultValue="info" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                      <TabsTrigger value="info">Informações</TabsTrigger>
                                      <TabsTrigger value="contracts">Contratos</TabsTrigger>
                                    </TabsList>
                                    
                                    <TabsContent value="info" className="space-y-4 pt-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-sm font-medium text-muted-foreground">Nome</p>
                                          <p>{client.name}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-muted-foreground">E-mail</p>
                                          <p>{client.email}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                                          <p>{client.phone}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-muted-foreground">Tipo de Usuário</p>
                                          <p className="capitalize">{client.role}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-muted-foreground">Data de Cadastro</p>
                                          <p>{client.createdAt.toLocaleDateString('pt-BR')}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-muted-foreground">Total de Contratos</p>
                                          <p>{client.contracts.length}</p>
                                        </div>
                                      </div>
                                      
                                      <div className="flex justify-end space-x-2 pt-4">
                                        <Button variant="outline">
                                          <Edit className="h-4 w-4 mr-2" />
                                          Editar
                                        </Button>
                                        <Button variant="destructive">
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Excluir
                                        </Button>
                                      </div>
                                    </TabsContent>
                                    
                                    <TabsContent value="contracts" className="space-y-4 pt-4">
                                      {client.contracts.length > 0 ? (
                                        <div className="space-y-4">
                                          {client.contracts.map((contract) => (
                                            <div key={contract.id} className="flex items-center justify-between p-4 border rounded-md">
                                              <div>
                                                <p className="font-medium">{contract.title}</p>
                                                <div className="flex items-center space-x-4 mt-1">
                                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    contract.status === 'active' 
                                                      ? 'bg-green-100 text-green-800' 
                                                      : contract.status === 'draft' 
                                                        ? 'bg-yellow-100 text-yellow-800' 
                                                        : 'bg-red-100 text-red-800'
                                                  }`}>
                                                    {contract.status === 'active' ? 'Ativo' : contract.status === 'draft' ? 'Rascunho' : 'Expirado'}
                                                  </span>
                                                  <span className="text-xs text-muted-foreground">
                                                    Criado em {contract.createdAt.toLocaleDateString('pt-BR')}
                                                  </span>
                                                </div>
                                              </div>
                                              <div className="flex space-x-2">
                                                <Button variant="outline" size="sm" onClick={() => handleViewClient(client)}>
                                                  <Eye className="h-4 w-4 mr-1" />
                                                  Ver
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handlePrintContract(contract.id)}>
                                                  <Printer className="h-4 w-4 mr-1" />
                                                  Imprimir
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handleExportPDF(contract.id)}>
                                                  <Download className="h-4 w-4 mr-1" />
                                                  PDF
                                                </Button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="text-center py-8">
                                          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                          <p className="text-muted-foreground">Este cliente não possui contratos</p>
                                        </div>
                                      )}
                                      
                                      <div className="flex justify-end pt-4">
                                        <Button>
                                          <FileText className="h-4 w-4 mr-2" />
                                          Novo Contrato
                                        </Button>
                                      </div>
                                    </TabsContent>
                                  </Tabs>
                                  
                                  <DialogFooter>
                                    <Button variant="secondary">Fechar</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10">
                            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-lg text-muted-foreground">Nenhum cliente encontrado</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {filteredClients.length > clientsPerPage && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {indexOfFirstClient + 1}-{Math.min(indexOfLastClient, filteredClients.length)} de {filteredClients.length} clientes
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Próximo
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Clients;
