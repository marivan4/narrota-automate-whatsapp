
import React, { useState, useEffect } from 'react';
import { Client } from '@/types';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, FileText, Car, QrCode, FileDown, Sim } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SimCardManagement from '@/components/clients/SimCardManagement';

const Clients: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState("clients");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  // Load mock data for demonstration
  useEffect(() => {
    const mockClients: Client[] = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao.silva@email.com',
        phone: '(11) 99999-1234',
        document: '123.456.789-00',
        address: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        role: 'client',
        createdAt: new Date('2023-01-15'),
        contracts: []
      },
      {
        id: '2',
        name: 'Maria Oliveira',
        email: 'maria.oliveira@email.com',
        phone: '(11) 98888-5678',
        document: '987.654.321-00',
        address: 'Av. Paulista, 1000',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
        role: 'client',
        createdAt: new Date('2023-02-20'),
        contracts: []
      },
      {
        id: '3',
        name: 'Pedro Santos',
        email: 'pedro.santos@email.com',
        phone: '(21) 97777-9012',
        document: '111.222.333-44',
        address: 'Rua da Praia, 50',
        city: 'Rio de Janeiro',
        state: 'RJ',
        zipCode: '20000-000',
        role: 'client',
        createdAt: new Date('2023-03-10'),
        contracts: []
      }
    ];
    setClients(mockClients);
  }, []);

  // Function to handle client creation
  const handleCreateClient = () => {
    // Ensure name is required and not optional
    if (!formData.name || formData.name.trim() === '') {
      toast.error('Nome do cliente é obrigatório');
      return;
    }

    // Create new client following the Client interface structure
    const newClient: Client = {
      id: String(Date.now()),
      name: formData.name,
      email: formData.email || '',
      phone: formData.phone || '',
      document: formData.document,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      role: 'client',
      createdAt: new Date(),
      contracts: []
    };

    // Add new client to state
    setClients([...clients, newClient]);
    toast.success('Cliente criado com sucesso!');
    setIsAddClientOpen(false);
    resetForm();
  };

  // Function to handle client update
  const handleUpdateClient = () => {
    if (!currentClient) return;
    if (!formData.name || formData.name.trim() === '') {
      toast.error('Nome do cliente é obrigatório');
      return;
    }

    const updatedClients = clients.map(client => 
      client.id === currentClient.id 
        ? { 
            ...client, 
            name: formData.name,
            email: formData.email || '',
            phone: formData.phone || '',
            document: formData.document,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode
          } 
        : client
    );

    setClients(updatedClients);
    toast.success('Cliente atualizado com sucesso!');
    setIsEditClientOpen(false);
    resetForm();
  };

  // Function to handle client deletion
  const handleDeleteClient = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      setClients(clients.filter(client => client.id !== id));
      toast.success('Cliente excluído com sucesso!');
    }
  };

  // Function to handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Function to reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      document: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
    });
    setCurrentClient(null);
  };

  // Function to open edit dialog with client data
  const openEditDialog = (client: Client) => {
    setCurrentClient(client);
    setFormData({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      document: client.document || '',
      address: client.address || '',
      city: client.city || '',
      state: client.state || '',
      zipCode: client.zipCode || '',
    });
    setIsEditClientOpen(true);
  };

  // Function to navigate to create contract page for a client
  const navigateToCreateContract = (client: Client) => {
    // In a real application, you would likely pass the client ID and navigate to the contract creation page
    toast.info(`Criando contrato para ${client.name}`);
    navigate(`/contracts?clientId=${client.id}`);
  };

  // Function to navigate to create invoice page for a client
  const navigateToCreateInvoice = (client: Client) => {
    // In a real application, you would likely pass the client ID and navigate to the invoice creation page
    toast.info(`Criando fatura para ${client.name}`);
    navigate(`/invoices?clientId=${client.id}`);
  };

  // Function to manage SIM cards for a client
  const manageSimCards = (client: Client) => {
    setSelectedClientId(client.id);
    setActiveTab("simcards");
  };

  // Filter clients based on search term
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.document?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Find selected client name
  const selectedClientName = clients.find(c => c.id === selectedClientId)?.name;

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestão de Clientes</h1>
          <Button onClick={() => setIsAddClientOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>
        
        <Tabs defaultValue="clients" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="clients">Clientes</TabsTrigger>
            <TabsTrigger value="simcards" disabled={!selectedClientId}>
              SIM Cards {selectedClientName ? `- ${selectedClientName}` : ''}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="clients">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Pesquisar Clientes</CardTitle>
                <CardDescription>Encontre clientes por nome, email, documento ou telefone</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Input 
                    placeholder="Buscar cliente..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lista de Clientes</CardTitle>
                <CardDescription>Gerencie seus clientes e acesse suas informações</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredClients.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Documento</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Endereço</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredClients.map((client) => (
                          <TableRow key={client.id}>
                            <TableCell className="font-medium">{client.name}</TableCell>
                            <TableCell>{client.document}</TableCell>
                            <TableCell>{client.phone}</TableCell>
                            <TableCell>{client.email}</TableCell>
                            <TableCell>
                              {client.address && `${client.address}, ${client.city}/${client.state}`}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="icon" onClick={() => openEditDialog(client)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => navigateToCreateContract(client)}>
                                  <FileText className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => navigateToCreateInvoice(client)}>
                                  <FileDown className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => manageSimCards(client)}>
                                  <Sim className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => handleDeleteClient(client.id)}>
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="simcards">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>SIM Cards</CardTitle>
                    <CardDescription>Gerenciamento de SIM Cards para {selectedClientName}</CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setActiveTab("clients")}>
                    Voltar para Clientes
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <SimCardManagement clientId={selectedClientId || undefined} clientName={selectedClientName} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Client Dialog */}
      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Cliente</DialogTitle>
            <DialogDescription>
              Preencha as informações do cliente abaixo. Os campos com * são obrigatórios.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="document">CPF/CNPJ</Label>
                <Input
                  id="document"
                  name="document"
                  value={formData.document}
                  onChange={handleFormChange}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="cliente@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleFormChange}
                placeholder="Rua, número, complemento"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleFormChange}
                  placeholder="Cidade"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleFormChange}
                  placeholder="UF"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">CEP</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleFormChange}
                  placeholder="00000-000"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddClientOpen(false);
              resetForm();
            }}>
              Cancelar
            </Button>
            <Button onClick={handleCreateClient}>Salvar Cliente</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditClientOpen} onOpenChange={setIsEditClientOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Atualize as informações do cliente abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome *</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-document">CPF/CNPJ</Label>
                <Input
                  id="edit-document"
                  name="document"
                  value={formData.document}
                  onChange={handleFormChange}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">E-mail</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="cliente@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefone</Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Endereço</Label>
              <Input
                id="edit-address"
                name="address"
                value={formData.address}
                onChange={handleFormChange}
                placeholder="Rua, número, complemento"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-city">Cidade</Label>
                <Input
                  id="edit-city"
                  name="city"
                  value={formData.city}
                  onChange={handleFormChange}
                  placeholder="Cidade"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-state">Estado</Label>
                <Input
                  id="edit-state"
                  name="state"
                  value={formData.state}
                  onChange={handleFormChange}
                  placeholder="UF"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-zipCode">CEP</Label>
                <Input
                  id="edit-zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleFormChange}
                  placeholder="00000-000"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditClientOpen(false);
              resetForm();
            }}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateClient}>Atualizar Cliente</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Clients;
