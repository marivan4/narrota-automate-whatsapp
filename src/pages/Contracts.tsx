import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, Contract } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { toast } from "sonner";
import ContractForm from '@/components/shared/ContractForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Users,
  Plus,
  Edit,
  Trash2,
  Copy,
  Send,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface ContractsProps {
  // Define props if needed
}

const Contracts: React.FC<ContractsProps> = () => {
  const navigate = useNavigate();
  const { authState, isAuthorized } = useAuth();

  // State variables
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const contractsPerPage = 5;

  // Mock data (replace with API calls later)
  useEffect(() => {
    // Simulate loading data from an API
    setIsLoading(true);
    setTimeout(() => {
      const mockContracts: Contract[] = [
        {
          id: '1',
          title: 'Contrato de Rastreamento Veicular - Plano Básico',
          content: 'Este contrato estabelece os termos e condições para o serviço de rastreamento veicular...',
          createdAt: new Date('2023-01-15'),
          createdBy: 'João Silva',
          status: 'active',
        },
        {
          id: '2',
          title: 'Contrato de Rastreamento Veicular - Plano Premium',
          content: 'Este contrato estabelece os termos e condições para o serviço premium de rastreamento...',
          createdAt: new Date('2023-02-20'),
          createdBy: 'Maria Souza',
          status: 'draft',
        },
        {
          id: '3',
          title: 'Contrato de Manutenção de Rastreador',
          content: 'Este contrato estabelece os termos e condições para a manutenção do equipamento...',
          createdAt: new Date('2023-03-10'),
          createdBy: 'Carlos Pereira',
          status: 'archived',
        },
        {
          id: '4',
          title: 'Contrato de Monitoramento 24h',
          content: 'Este contrato estabelece os termos e condições para o serviço de monitoramento 24 horas...',
          createdAt: new Date('2023-04-01'),
          createdBy: 'Ana Oliveira',
          status: 'active',
        },
        {
          id: '5',
          title: 'Contrato de Instalação de Rastreador',
          content: 'Este contrato estabelece os termos e condições para a instalação do rastreador...',
          createdAt: new Date('2023-05-05'),
          createdBy: 'Pedro Santos',
          status: 'active',
        },
        {
          id: '6',
          title: 'Contrato de Parceria - Revendedor',
          content: 'Este contrato estabelece os termos e condições para a parceria de revenda...',
          createdAt: new Date('2023-06-12'),
          createdBy: 'Mariana Costa',
          status: 'draft',
        },
        {
          id: '7',
          title: 'Contrato de Prestação de Serviços - Frota',
          content: 'Este contrato estabelece os termos e condições para o rastreamento de frota...',
          createdAt: new Date('2023-07-18'),
          createdBy: 'Lucas Rodrigues',
          status: 'archived',
        },
        {
          id: '8',
          title: 'Contrato de Consultoria - Segurança Veicular',
          content: 'Este contrato estabelece os termos e condições para a consultoria em segurança veicular...',
          createdAt: new Date('2023-08-25'),
          createdBy: 'Fernanda Almeida',
          status: 'active',
        },
        {
          id: '9',
          title: 'Contrato de Licença de Software - Rastreamento',
          content: 'Este contrato estabelece os termos e condições para a licença do software de rastreamento...',
          createdAt: new Date('2023-09-30'),
          createdBy: 'Ricardo Carvalho',
          status: 'active',
        },
        {
          id: '10',
          title: 'Contrato de Manutenção Preventiva',
          content: 'Este contrato estabelece os termos e condições para a manutenção preventiva dos rastreadores...',
          createdAt: new Date('2023-10-01'),
          createdBy: 'Juliana Gomes',
          status: 'draft',
        },
      ];
      setContracts(mockContracts);
      setIsLoading(false);
    }, 500);
  }, []);

  // Filter contracts based on search term
  const filteredContracts = contracts.filter(contract =>
    contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastContract = currentPage * contractsPerPage;
  const indexOfFirstContract = indexOfLastContract - contractsPerPage;
  const currentContracts = filteredContracts.slice(indexOfFirstContract, indexOfLastContract);
  const totalPages = Math.ceil(filteredContracts.length / contractsPerPage);

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage(currentPage - 1);
  };

  // Handlers
  const handleCreateContract = (data: any) => {
    const newContract: Contract = {
      id: String(Date.now()), // Generate a unique ID
      title: data.title,
      content: data.content,
      createdAt: new Date(),
      createdBy: authState.user?.name || 'Admin',
      status: data.status,
    };

    setContracts([...contracts, newContract]);
    setIsCreating(false);
    toast.success('Contrato criado com sucesso!');
  };

  const handleEditContract = (contract: Contract) => {
    setSelectedContract(contract);
    setIsEditing(true);
  };

  const handleUpdateContract = (data: any) => {
    if (!selectedContract) return;

    const updatedContracts = contracts.map(contract =>
      contract.id === selectedContract.id
        ? { ...contract, title: data.title, content: data.content, status: data.status }
        : contract
    );

    setContracts(updatedContracts);
    setSelectedContract(null);
    setIsEditing(false);
    toast.success('Contrato atualizado com sucesso!');
  };

  const handleDeleteContract = (contractId: string) => {
    setContracts(contracts.filter(contract => contract.id !== contractId));
    toast.success('Contrato excluído com sucesso!');
  };

  const handleCopyContract = (contract: Contract) => {
    navigator.clipboard.writeText(contract.content);
    toast.success('Contrato copiado para a área de transferência!');
  };

  const handleSendTestMessage = (contract: Contract) => {
    toast.info(`Preparando envio do contrato "${contract.title}" via WhatsApp...`);
    // Implementation would go here
    setTimeout(() => {
      toast.success("Contrato enviado para o WhatsApp com sucesso!");
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gerenciamento de Contratos</h1>
          <div className="flex space-x-2">
            <Button onClick={() => navigate('/clients')}>
              <Users className="h-4 w-4 mr-2" />
              Clientes
            </Button>
            <Button onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>

        <div className="flex justify-between mb-6">
          <div className="relative">
            <Input
              placeholder="Buscar contratos..."
              className="w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Contrato
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-800 dark:text-white">Contratos Existentes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                {currentContracts.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                          Título
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                          Conteúdo
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                          Data de Criação
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {currentContracts.map((contract) => (
                        <tr key={contract.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{contract.title}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500 dark:text-gray-300">
                              {contract.content.length > 50
                                ? `${contract.content.substring(0, 50)}...`
                                : contract.content}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={cn(
                              "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                              contract.status === 'active' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                              contract.status === 'draft' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                              contract.status === 'archived' && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            )}>
                              {contract.status === 'active' ? 'Ativo' : contract.status === 'draft' ? 'Rascunho' : 'Arquivado'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-300">
                            {contract.createdAt.toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleEditContract(contract)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleCopyContract(contract)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleSendTestMessage(contract)}>
                              <Send className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteContract(contract.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-10">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">Nenhum contrato encontrado</p>
                    <p className="text-sm text-muted-foreground mt-1">Crie um novo contrato ou ajuste os filtros de busca</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex items-center justify-between px-6 py-4">
            <span className="text-sm text-gray-500">
              Página {currentPage} de {totalPages || 1}
            </span>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Create Contract Dialog */}
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Contrato</DialogTitle>
            </DialogHeader>
            <ContractForm onSubmit={handleCreateContract} />
          </DialogContent>
        </Dialog>

        {/* Edit Contract Dialog */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>Editar Contrato</DialogTitle>
            </DialogHeader>
            {selectedContract && (
              <ContractForm 
                onSubmit={handleUpdateContract} 
                initialData={{
                  title: selectedContract.title,
                  content: selectedContract.content,
                  status: selectedContract.status,
                }} 
                isEditing 
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Contracts;
