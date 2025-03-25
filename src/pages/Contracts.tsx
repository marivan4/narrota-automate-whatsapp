
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ContractForm from '@/components/shared/ContractForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserRole, Contract } from '@/types';
import { FileText, Plus, Search, Edit, Send, Archive, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Helper to generate mock contracts
const generateMockContracts = (): Contract[] => {
  const statuses = ['draft', 'active', 'archived'] as const;
  return Array.from({ length: 8 }, (_, i) => ({
    id: `contract-${i + 1}`,
    title: [
      'Contrato de Prestação de Serviços',
      'Termo de Adesão',
      'Contrato de Permanência',
      'Acordo de Nível de Serviço (SLA)',
    ][i % 4] + ` ${i + 1}`,
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
    createdBy: ['admin', 'manager'][Math.floor(Math.random() * 2)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
  }));
};

const Contracts: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);

  useEffect(() => {
    // Simulate fetching contracts
    const fetchContracts = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setContracts(generateMockContracts());
      } catch (error) {
        toast.error("Erro ao carregar contratos. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchContracts();
  }, []);

  const handleCreateContract = (data: { title: string; content: string; status: string; }) => {
    const newContract: Contract = {
      id: `contract-${contracts.length + 1}`,
      title: data.title,
      content: data.content,
      createdAt: new Date(),
      createdBy: 'admin',
      status: data.status as 'draft' | 'active' | 'archived',
    };
    
    setContracts([newContract, ...contracts]);
    setShowCreateForm(false);
  };

  const handleUpdateContract = (data: { title: string; content: string; status: string; }) => {
    if (!editingContract) return;
    
    const updatedContracts = contracts.map(contract => 
      contract.id === editingContract.id 
        ? { 
            ...contract, 
            title: data.title,
            content: data.content,
            status: data.status as 'draft' | 'active' | 'archived',
          } 
        : contract
    );
    
    setContracts(updatedContracts);
    setEditingContract(null);
  };

  const handleSendWhatsApp = (phoneNumber: string) => {
    // In a real app, this would call the WhatsApp API
    console.log(`Sending contract to ${phoneNumber} via WhatsApp`);
    // Implementation would be in a real app
  };

  const handleArchiveContract = (contractId: string) => {
    const updatedContracts = contracts.map(contract => 
      contract.id === contractId 
        ? { ...contract, status: 'archived' } 
        : contract
    );
    
    setContracts(updatedContracts);
    toast.success("Contrato arquivado com sucesso!");
  };

  const handleDeleteContract = (contractId: string) => {
    const updatedContracts = contracts.filter(contract => contract.id !== contractId);
    setContracts(updatedContracts);
    toast.success("Contrato excluído com sucesso!");
  };

  const filteredContracts = contracts.filter(contract => 
    contract.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: Contract['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Rascunho</Badge>;
      case 'active':
        return <Badge className="bg-green-500">Ativo</Badge>;
      case 'archived':
        return <Badge variant="secondary">Arquivado</Badge>;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout requiredRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.USER]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contratos</h1>
            <p className="text-muted-foreground">
              Gerencie seus modelos de contratos e termos
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Contrato
          </Button>
        </div>

        <div className="flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contratos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="glassmorphism animate-pulse-slow">
                <CardHeader className="space-y-2">
                  <div className="h-5 w-3/4 bg-muted rounded"></div>
                  <div className="h-4 w-1/2 bg-muted rounded"></div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded"></div>
                  <div className="h-4 w-full bg-muted rounded"></div>
                  <div className="h-4 w-2/3 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {filteredContracts.length === 0 ? (
              <Card className="glassmorphism">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">Nenhum contrato encontrado</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery 
                      ? "Tente ajustar sua busca ou criar um novo contrato." 
                      : "Comece criando seu primeiro modelo de contrato."}
                  </p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Contrato
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredContracts.map((contract) => (
                  <Card key={contract.id} className="glassmorphism hover-scale">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-md">{contract.title}</CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                                <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingContract(contract)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <Dialog>
                              <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Send className="h-4 w-4 mr-2" />
                                  Enviar
                                </DropdownMenuItem>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Enviar Contrato por WhatsApp</DialogTitle>
                                </DialogHeader>
                                <ContractForm
                                  initialData={{
                                    title: contract.title,
                                    content: contract.content,
                                    status: contract.status,
                                  }}
                                  onSendWhatsApp={handleSendWhatsApp}
                                />
                              </DialogContent>
                            </Dialog>
                            <DropdownMenuItem 
                              onClick={() => handleArchiveContract(contract.id)}
                              disabled={contract.status === 'archived'}
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              Arquivar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteContract(contract.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardDescription className="flex items-center justify-between">
                        <span>Criado em {contract.createdAt.toLocaleDateString()}</span>
                        {getStatusBadge(contract.status)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm line-clamp-3">
                        {contract.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Novo Contrato</DialogTitle>
          </DialogHeader>
          <ContractForm onSubmit={handleCreateContract} onSendWhatsApp={handleSendWhatsApp} />
        </DialogContent>
      </Dialog>

      <Dialog open={editingContract !== null} onOpenChange={(open) => !open && setEditingContract(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Contrato</DialogTitle>
          </DialogHeader>
          {editingContract && (
            <ContractForm 
              initialData={{
                title: editingContract.title,
                content: editingContract.content,
                status: editingContract.status,
              }}
              onSubmit={handleUpdateContract}
              onSendWhatsApp={handleSendWhatsApp}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Contracts;
