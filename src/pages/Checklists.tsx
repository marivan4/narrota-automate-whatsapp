import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, Checklist } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { toast } from "sonner";
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

interface ChecklistsProps {
  // Define props if needed
}

const Checklists: React.FC<ChecklistsProps> = () => {
  const navigate = useNavigate();
  const { authState, isAuthorized, logout } = useAuth();

  // State variables
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [newChecklistName, setNewChecklistName] = useState('');
  const [newChecklistContent, setNewChecklistContent] = useState('');
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const checklistsPerPage = 5;

  // Mock data (replace with API calls later)
  useEffect(() => {
    // Simulate loading data from an API
    setIsLoading(true);
    setTimeout(() => {
      const mockChecklists: Checklist[] = [
        {
          id: '1',
          title: 'Checklist de Instalação',
          items: [
            { id: '1-1', title: 'Verificar equipamentos', required: true },
            { id: '1-2', title: 'Testar conexão', required: true },
            { id: '1-3', title: 'Configurar software', required: false },
          ],
          createdAt: new Date('2023-01-10'),
          createdBy: 'João Silva',
          status: 'active',
        },
        {
          id: '2',
          title: 'Checklist de Segurança',
          items: [
            { id: '2-1', title: 'Verificar extintores', required: true },
            { id: '2-2', title: 'Testar alarmes', required: true },
            { id: '2-3', title: 'Inspecionar saídas de emergência', required: true },
          ],
          createdAt: new Date('2023-02-15'),
          createdBy: 'Maria Oliveira',
          status: 'active',
        },
        {
          id: '3',
          title: 'Checklist de Integração',
          items: [
            { id: '3-1', title: 'Configurar API', required: true },
            { id: '3-2', title: 'Testar comunicação entre módulos', required: true },
            { id: '3-3', title: 'Validar dados', required: true },
          ],
          createdAt: new Date('2023-03-20'),
          createdBy: 'Carlos Pereira',
          status: 'active',
        },
        {
          id: '4',
          title: 'Checklist de Testes',
          items: [
            { id: '4-1', title: 'Executar testes unitários', required: true },
            { id: '4-2', title: 'Realizar testes de integração', required: true },
            { id: '4-3', title: 'Efetuar testes de usabilidade', required: false },
          ],
          createdAt: new Date('2023-04-25'),
          createdBy: 'Ana Souza',
          status: 'active',
        },
        {
          id: '5',
          title: 'Checklist de Implantação',
          items: [
            { id: '5-1', title: 'Preparar ambiente de produção', required: true },
            { id: '5-2', title: 'Realizar backup dos dados', required: true },
            { id: '5-3', title: 'Monitorar a implantação', required: true },
          ],
          createdAt: new Date('2023-05-30'),
          createdBy: 'Ricardo Alves',
          status: 'active',
        },
        {
          id: '6',
          title: 'Checklist de Manutenção',
          items: [
            { id: '6-1', title: 'Verificar logs do sistema', required: true },
            { id: '6-2', title: 'Aplicar patches de segurança', required: true },
            { id: '6-3', title: 'Otimizar o desempenho do sistema', required: false },
          ],
          createdAt: new Date('2023-06-05'),
          createdBy: 'Patrícia Santos',
          status: 'active',
        },
        {
          id: '7',
          title: 'Checklist de Backup',
          items: [
            { id: '7-1', title: 'Agendar backups automáticos', required: true },
            { id: '7-2', title: 'Testar a restauração dos backups', required: true },
            { id: '7-3', title: 'Armazenar backups em local seguro', required: true },
          ],
          createdAt: new Date('2023-07-10'),
          createdBy: 'Fernando Costa',
          status: 'active',
        },
        {
          id: '8',
          title: 'Checklist de Auditoria',
          items: [
            { id: '8-1', title: 'Verificar conformidade com as normas', required: true },
            { id: '8-2', title: 'Analisar os registros de acesso', required: true },
            { id: '8-3', title: 'Identificar vulnerabilidades', required: true },
          ],
          createdAt: new Date('2023-08-15'),
          createdBy: 'Amanda Oliveira',
          status: 'active',
        },
        {
          id: '9',
          title: 'Checklist de Desempenho',
          items: [
            { id: '9-1', title: 'Monitorar o uso de recursos', required: true },
            { id: '9-2', title: 'Identificar gargalos', required: true },
            { id: '9-3', title: 'Ajustar configurações', required: false },
          ],
          createdAt: new Date('2023-09-20'),
          createdBy: 'Rafael Pereira',
          status: 'active',
        },
        {
          id: '10',
          title: 'Checklist de Acessibilidade',
          items: [
            { id: '10-1', title: 'Verificar contraste de cores', required: true },
            { id: '10-2', title: 'Testar a navegação por teclado', required: true },
            { id: '10-3', title: 'Utilizar alternativas de texto para imagens', required: true },
          ],
          createdAt: new Date('2023-10-25'),
          createdBy: 'Juliana Souza',
          status: 'active',
        },
      ];
      setChecklists(mockChecklists);
      setIsLoading(false);
    }, 500);
  }, []);

  // Pagination
  const indexOfLastChecklist = currentPage * checklistsPerPage;
  const indexOfFirstChecklist = indexOfLastChecklist - checklistsPerPage;
  const currentChecklists = checklists.slice(indexOfFirstChecklist, indexOfLastChecklist);

  const totalPages = Math.ceil(checklists.length / checklistsPerPage);

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage(currentPage - 1);
  };

  // Handlers
  const handleCreateChecklist = () => {
    if (!newChecklistName || !newChecklistContent) {
      toast.error('Por favor, preencha todos os campos.');
      return;
    }

    const newChecklist: Checklist = {
      id: String(Date.now()), // Generate a unique ID
      title: newChecklistName,
      items: [], // You might want to handle checklist items creation separately
      createdAt: new Date(),
      createdBy: authState.user?.name || 'Unknown',
      status: 'draft',
    };

    setChecklists([...checklists, newChecklist]);
    setNewChecklistName('');
    setNewChecklistContent('');
    toast.success('Checklist criado com sucesso!');
  };

  const handleEditChecklist = (checklist: Checklist) => {
    setSelectedChecklist(checklist);
    setNewChecklistName(checklist.title);
    setNewChecklistContent(checklist.title); // You might want to have a separate field for content
    setIsEditing(true);
  };

  const handleUpdateChecklist = () => {
    if (!newChecklistName || !newChecklistContent) {
      toast.error('Por favor, preencha todos os campos.');
      return;
    }

    if (!selectedChecklist) return;

    const updatedChecklists = checklists.map(checklist =>
      checklist.id === selectedChecklist.id
        ? { ...checklist, title: newChecklistName }
        : checklist
    );

    setChecklists(updatedChecklists);
    setSelectedChecklist(null);
    setNewChecklistName('');
    setNewChecklistContent('');
    setIsEditing(false);
    toast.success('Checklist atualizado com sucesso!');
  };

  const handleDeleteChecklist = (checklistId: string) => {
    setChecklists(checklists.filter(checklist => checklist.id !== checklistId));
    toast.success('Checklist excluído com sucesso!');
  };

  const handleCancelEdit = () => {
    setSelectedChecklist(null);
    setNewChecklistName('');
    setNewChecklistContent('');
    setIsEditing(false);
  };

  const handleCopyChecklist = (checklist: Checklist) => {
    navigator.clipboard.writeText(checklist.title); // You might want to copy the whole checklist content
    toast.success('Checklist copiado para a área de transferência!');
  };

  const handleSendTestMessage = (checklist: Checklist) => {
    // Implement your logic to send a test message via WhatsApp
    toast.info(`Enviando mensagem de teste para o checklist "${checklist.title}"... (funcionalidade não implementada)`);
  };

  // Permissions
  if (!authState.isAuthenticated) {
    return navigate('/login');
  }

  if (!isAuthorized([UserRole.ADMIN, UserRole.MANAGER])) {
    return navigate('/dashboard');
  }

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Gerenciamento de Checklists</h1>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Criar Novo Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="checklistName">Nome do Checklist</Label>
                <Input
                  id="checklistName"
                  placeholder="Ex: Checklist de Instalação"
                  value={newChecklistName}
                  onChange={(e) => setNewChecklistName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="checklistContent">Conteúdo do Checklist</Label>
                <Textarea
                  id="checklistContent"
                  placeholder="Ex: Verificar equipamentos..."
                  value={newChecklistContent}
                  onChange={(e) => setNewChecklistContent(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex justify-end">
                {isEditing ? (
                  <>
                    <Button variant="ghost" onClick={handleCancelEdit}>
                      Cancelar
                    </Button>
                    <Button onClick={handleUpdateChecklist}>
                      Atualizar Checklist
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleCreateChecklist}>
                    Criar Checklist
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Checklists Existentes</CardTitle>
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
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Conteúdo
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentChecklists.map((checklist) => (
                      <tr key={checklist.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{checklist.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">
                            {checklist.title.length > 50
                              ? `${checklist.title.substring(0, 50)}...`
                              : checklist.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEditChecklist(checklist)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleCopyChecklist(checklist)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleSendTestMessage(checklist)}>
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteChecklist(checklist.id)}>
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

export default Checklists;
