import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, Contract } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  MessageSquare,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
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
  const { authState, isAuthorized, logout } = useAuth();

  // State variables
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [newContractTitle, setNewContractTitle] = useState('');
  const [newContractContent, setNewContractContent] = useState('');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
          title: 'Contrato de Prestação de Serviços',
          content: 'Este contrato estabelece os termos e condições...',
          createdAt: new Date('2023-01-15'),
          createdBy: 'João Silva',
          status: 'active',
        },
        {
          id: '2',
          title: 'Contrato de Aluguel',
          content: 'Este contrato estabelece os termos e condições para o aluguel...',
          createdAt: new Date('2023-02-20'),
          createdBy: 'Maria Souza',
          status: 'draft',
        },
        {
          id: '3',
          title: 'Contrato de Compra e Venda',
          content: 'Este contrato estabelece os termos e condições para a compra e venda...',
          createdAt: new Date('2023-03-10'),
          createdBy: 'Carlos Pereira',
          status: 'archived',
        },
        {
          id: '4',
          title: 'Contrato de Confidencialidade',
          content: 'Este contrato estabelece os termos e condições para a confidencialidade...',
          createdAt: new Date('2023-04-01'),
          createdBy: 'Ana Oliveira',
          status: 'active',
        },
        {
          id: '5',
          title: 'Contrato de Trabalho',
          content: 'Este contrato estabelece os termos e condições para o trabalho...',
          createdAt: new Date('2023-05-05'),
          createdBy: 'Pedro Santos',
          status: 'active',
        },
        {
          id: '6',
          title: 'Contrato de Parceria',
          content: 'Este contrato estabelece os termos e condições para a parceria...',
          createdAt: new Date('2023-06-12'),
          createdBy: 'Mariana Costa',
          status: 'draft',
        },
        {
          id: '7',
          title: 'Contrato de Prestação de Serviços (TI)',
          content: 'Este contrato estabelece os termos e condições para a prestação de serviços de TI...',
          createdAt: new Date('2023-07-18'),
          createdBy: 'Lucas Rodrigues',
          status: 'archived',
        },
        {
          id: '8',
          title: 'Contrato de Consultoria',
          content: 'Este contrato estabelece os termos e condições para a consultoria...',
          createdAt: new Date('2023-08-25'),
          createdBy: 'Fernanda Almeida',
          status: 'active',
        },
        {
          id: '9',
          title: 'Contrato de Licença de Software',
          content: 'Este contrato estabelece os termos e condições para a licença de software...',
          createdAt: new Date('2023-09-30'),
          createdBy: 'Ricardo Carvalho',
          status: 'active',
        },
        {
          id: '10',
          title: 'Contrato de Manutenção',
          content: 'Este contrato estabelece os termos e condições para a manutenção...',
          createdAt: new Date('2023-10-01'),
          createdBy: 'Juliana Gomes',
          status: 'draft',
        },
      ];
      setContracts(mockContracts);
      setIsLoading(false);
    }, 500);
  }, []);

  // Pagination
  const indexOfLastContract = currentPage * contractsPerPage;
  const indexOfFirstContract = indexOfLastContract - contractsPerPage;
  const currentContracts = contracts.slice(indexOfFirstContract, indexOfLastContract);

  const totalPages = Math.ceil(contracts.length / contractsPerPage);

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage(currentPage - 1);
  };

  // Handlers
  const handleCreateContract = () => {
    if (!newContractTitle || !newContractContent) {
      toast.error('Por favor, preencha todos os campos.');
      return;
    }

    const newContract: Contract = {
      id: String(Date.now()), // Generate a unique ID
      title: newContractTitle,
      content: newContractContent,
      createdAt: new Date(),
      createdBy: authState.user?.name || 'Admin',
      status: 'draft',
    };

    setContracts([...contracts, newContract]);
    setNewContractTitle('');
    setNewContractContent('');
    toast.success('Contrato criado com sucesso!');
  };

  const handleEditContract = (contract: Contract) => {
    setSelectedContract(contract);
    setNewContractTitle(contract.title);
    setNewContractContent(contract.content);
    setIsEditing(true);
  };

  const handleUpdateContract = () => {
    if (!newContractTitle || !newContractContent) {
      toast.error('Por favor, preencha todos os campos.');
      return;
    }

    if (!selectedContract) return;

    const updatedContracts = contracts.map(contract =>
      contract.id === selectedContract.id
        ? { ...contract, title: newContractTitle, content: newContractContent }
        : contract
    );

    setContracts(updatedContracts);
    setSelectedContract(null);
    setNewContractTitle('');
    setNewContractContent('');
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
    // Implement your logic to send a test message via WhatsApp
    toast.info(`Enviando mensagem de teste para o contrato "${contract.title}"... (funcionalidade não implementada)`);
  };

  const handleCancelEdit = () => {
    setSelectedContract(null);
    setNewContractTitle('');
    setNewContractContent('');
    setIsEditing(false);
  };

  // Permissions check - fixed to always return JSX
  if (!authState.isAuthenticated) {
    navigate('/login');
    return null; // Return null instead of void
  }

  if (!isAuthorized([UserRole.ADMIN, UserRole.MANAGER])) {
    navigate('/dashboard');
    return null; // Return null instead of void
  }

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Gerenciamento de Contratos</h1>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Criar Novo Contrato</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="contractTitle">Título do Contrato</Label>
                <Input
                  id="contractTitle"
                  placeholder="Ex: Contrato de Prestação de Serviços"
                  value={newContractTitle}
                  onChange={(e) => setNewContractTitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="contractContent">Conteúdo do Contrato</Label>
                <Textarea
                  id="contractContent"
                  placeholder="Ex: Este contrato estabelece os termos e condições..."
                  value={newContractContent}
                  onChange={(e) => setNewContractContent(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex justify-end">
                {isEditing ? (
                  <>
                    <Button variant="ghost" onClick={handleCancelEdit}>
                      Cancelar
                    </Button>
                    <Button onClick={handleUpdateContract}>
                      Atualizar Contrato
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleCreateContract}>
                    Criar Contrato
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contratos Existentes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Título
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Conteúdo
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentContracts.map((contract) => (
                      <tr key={contract.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{contract.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">
                            {contract.content.length > 50
                              ? `${contract.content.substring(0, 50)}...`
                              : contract.content}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={cn(
                            "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                            contract.status === 'active' && "bg-green-100 text-green-800",
                            contract.status === 'draft' && "bg-yellow-100 text-yellow-800",
                            contract.status === 'archived' && "bg-red-100 text-red-800"
                          )}>
                            {contract.status}
                          </span>
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
              </div>
            )}
          </CardContent>
          <CardFooter className="flex items-center justify-between px-6 py-4">
            <span className="text-sm text-gray-500">
              Página {currentPage} de {totalPages}
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
                disabled={currentPage === totalPages}
              >
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Contracts;
