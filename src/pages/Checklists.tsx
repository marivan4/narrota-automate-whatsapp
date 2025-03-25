
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserRole, Checklist, ChecklistItem } from '@/types';
import { CheckSquare, Plus, Search, Edit, Send, Archive, Trash2, Plus as PlusIcon, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";
import { Checkbox } from '@/components/ui/checkbox';
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

// Helper to generate mock checklists
const generateMockChecklists = (): Checklist[] => {
  const statuses = ['draft', 'active', 'archived'] as const;
  
  const checklistTemplates = [
    {
      title: 'Checklist de Instalação de Internet',
      items: [
        { id: '1', title: 'Verificar sinal do roteador', required: true },
        { id: '2', title: 'Testar velocidade de download', required: true },
        { id: '3', title: 'Testar velocidade de upload', required: true },
        { id: '4', title: 'Verificar cabeamento', required: false },
        { id: '5', title: 'Configurar Wi-Fi', required: true },
      ]
    },
    {
      title: 'Checklist de Manutenção',
      items: [
        { id: '1', title: 'Verificar equipamentos', required: true },
        { id: '2', title: 'Testar conexão', required: true },
        { id: '3', title: 'Atualizar firmware', required: false },
      ]
    },
    {
      title: 'Checklist de Entrega de Equipamento',
      items: [
        { id: '1', title: 'Verificar integridade física', required: true },
        { id: '2', title: 'Testar funcionamento', required: true },
        { id: '3', title: 'Registrar número de série', required: true },
        { id: '4', title: 'Entregar manual', required: false },
      ]
    },
    {
      title: 'Checklist de Suporte Técnico',
      items: [
        { id: '1', title: 'Identificar problema', required: true },
        { id: '2', title: 'Verificar histórico do cliente', required: false },
        { id: '3', title: 'Testar remotamente', required: true },
        { id: '4', title: 'Registrar solução', required: true },
      ]
    },
  ];
  
  return Array.from({ length: 8 }, (_, i) => ({
    id: `checklist-${i + 1}`,
    title: checklistTemplates[i % checklistTemplates.length].title + (i >= checklistTemplates.length ? ` ${Math.floor(i / checklistTemplates.length) + 1}` : ''),
    items: checklistTemplates[i % checklistTemplates.length].items,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
    createdBy: ['admin', 'manager'][Math.floor(Math.random() * 2)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
  }));
};

interface ChecklistFormProps {
  initialData?: {
    title: string;
    items: ChecklistItem[];
    status: string;
  };
  onSubmit: (data: { title: string; items: ChecklistItem[]; status: string }) => void;
  onSendWhatsApp?: (phoneNumber: string) => void;
  isEditing?: boolean;
}

const ChecklistForm: React.FC<ChecklistFormProps> = ({
  initialData = { title: '', items: [], status: 'draft' },
  onSubmit,
  onSendWhatsApp,
  isEditing = false,
}) => {
  const [title, setTitle] = useState(initialData.title);
  const [items, setItems] = useState<ChecklistItem[]>(initialData.items);
  const [status, setStatus] = useState(initialData.status);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemRequired, setNewItemRequired] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showWhatsAppForm, setShowWhatsAppForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleAddItem = () => {
    if (!newItemTitle.trim()) {
      toast.error("Por favor, informe um título para o item.");
      return;
    }

    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      title: newItemTitle,
      required: newItemRequired,
    };

    setItems([...items, newItem]);
    setNewItemTitle('');
    setNewItemRequired(true);
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Por favor, informe um título para o checklist.");
      return;
    }

    if (items.length === 0) {
      toast.error("Por favor, adicione pelo menos um item ao checklist.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      onSubmit({
        title,
        items,
        status,
      });

      toast.success(isEditing ? "Checklist atualizado com sucesso!" : "Checklist criado com sucesso!");
    } catch (error) {
      toast.error("Ocorreu um erro ao salvar o checklist. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple Brazilian phone number validation
    const phoneRegex = /^(\+55|55)?(\d{2})(\d{8,9})$/;
    if (!phoneRegex.test(phoneNumber.replace(/\D/g, ''))) {
      toast.error("Por favor, informe um número de telefone válido (DDD + número).");
      return;
    }

    setIsSending(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));

      if (onSendWhatsApp) {
        onSendWhatsApp(phoneNumber);
      }

      toast.success("Checklist enviado por WhatsApp com sucesso!");
      setShowWhatsAppForm(false);
    } catch (error) {
      toast.error("Ocorreu um erro ao enviar o checklist. Por favor, tente novamente.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="w-full animate-scale-in">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckSquare className="h-5 w-5" />
          <span>{isEditing ? 'Editar Checklist' : 'Novo Checklist'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Título do checklist"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex space-x-2">
              {['draft', 'active', 'archived'].map((statusOption) => (
                <Button
                  key={statusOption}
                  type="button"
                  variant={status === statusOption ? "default" : "outline"}
                  onClick={() => setStatus(statusOption)}
                  className="capitalize"
                >
                  {statusOption === 'draft' ? 'Rascunho' : 
                    statusOption === 'active' ? 'Ativo' : 'Arquivado'}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Itens do Checklist</Label>
              <Badge variant="outline">{items.length} itens</Badge>
            </div>

            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-md animate-fade-in">
                  <div className="flex items-center space-x-3">
                    <Checkbox checked={item.required} disabled />
                    <span>{item.title}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}

              {items.length === 0 && (
                <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-md">
                  <CheckSquare className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum item adicionado. Adicione itens ao seu checklist abaixo.
                  </p>
                </div>
              )}

              <div className="flex flex-col space-y-2 p-4 border rounded-md">
                <Label htmlFor="newItemTitle">Novo Item</Label>
                <div className="flex space-x-2">
                  <Input
                    id="newItemTitle"
                    placeholder="Título do item"
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                  />
                  <Button
                    type="button"
                    onClick={handleAddItem}
                    disabled={!newItemTitle.trim()}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox
                    id="newItemRequired"
                    checked={newItemRequired}
                    onCheckedChange={(value) => setNewItemRequired(!!value)}
                  />
                  <label
                    htmlFor="newItemRequired"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Item obrigatório
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowWhatsAppForm(!showWhatsAppForm)}
              disabled={isSubmitting || items.length === 0}
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar por WhatsApp
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar Checklist'}
            </Button>
          </div>
        </form>

        {showWhatsAppForm && (
          <div className="mt-6 p-4 border rounded-md bg-secondary/50 animate-slide-up">
            <form onSubmit={handleSendWhatsApp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Número de WhatsApp</Label>
                <Input
                  id="phoneNumber"
                  placeholder="Ex: 5511999999999"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Formato: DDD + número (apenas números)
                </p>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSending}>
                  {isSending ? 'Enviando...' : 'Enviar'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <span>Os checklists são enviados como formulários via WhatsApp</span>
        {isEditing && (
          <span>Última modificação: {new Date().toLocaleDateString()}</span>
        )}
      </CardFooter>
    </Card>
  );
};

const Checklists: React.FC = () => {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<Checklist | null>(null);

  useEffect(() => {
    // Simulate fetching checklists
    const fetchChecklists = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setChecklists(generateMockChecklists());
      } catch (error) {
        toast.error("Erro ao carregar checklists. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchChecklists();
  }, []);

  const handleCreateChecklist = (data: { title: string; items: ChecklistItem[]; status: string }) => {
    const newChecklist: Checklist = {
      id: `checklist-${checklists.length + 1}`,
      title: data.title,
      items: data.items,
      createdAt: new Date(),
      createdBy: 'admin',
      status: data.status as 'draft' | 'active' | 'archived',
    };

    setChecklists([newChecklist, ...checklists]);
    setShowCreateForm(false);
  };

  const handleUpdateChecklist = (data: { title: string; items: ChecklistItem[]; status: string }) => {
    if (!editingChecklist) return;

    const updatedChecklists = checklists.map(checklist =>
      checklist.id === editingChecklist.id
        ? {
            ...checklist,
            title: data.title,
            items: data.items,
            status: data.status as 'draft' | 'active' | 'archived',
          }
        : checklist
    );

    setChecklists(updatedChecklists);
    setEditingChecklist(null);
  };

  const handleSendWhatsApp = (phoneNumber: string) => {
    // In a real app, this would call the WhatsApp API
    console.log(`Sending checklist to ${phoneNumber} via WhatsApp`);
    // Implementation would be in a real app
  };

  const handleArchiveChecklist = (checklistId: string) => {
    const updatedChecklists = checklists.map(checklist =>
      checklist.id === checklistId
        ? { ...checklist, status: 'archived' }
        : checklist
    );

    setChecklists(updatedChecklists);
    toast.success("Checklist arquivado com sucesso!");
  };

  const handleDeleteChecklist = (checklistId: string) => {
    const updatedChecklists = checklists.filter(checklist => checklist.id !== checklistId);
    setChecklists(updatedChecklists);
    toast.success("Checklist excluído com sucesso!");
  };

  const filteredChecklists = checklists.filter(checklist =>
    checklist.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: Checklist['status']) => {
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
            <h1 className="text-3xl font-bold tracking-tight">Checklists</h1>
            <p className="text-muted-foreground">
              Gerencie seus modelos de checklists para ordens de serviço
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Checklist
          </Button>
        </div>

        <div className="flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar checklists..."
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
            {filteredChecklists.length === 0 ? (
              <Card className="glassmorphism">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <CheckSquare className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">Nenhum checklist encontrado</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery
                      ? "Tente ajustar sua busca ou criar um novo checklist."
                      : "Comece criando seu primeiro modelo de checklist."}
                  </p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Checklist
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredChecklists.map((checklist) => (
                  <Card key={checklist.id} className="glassmorphism hover-scale">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-md">{checklist.title}</CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                                <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingChecklist(checklist)}>
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
                                  <DialogTitle>Enviar Checklist por WhatsApp</DialogTitle>
                                </DialogHeader>
                                <div className="p-4">
                                  <ChecklistForm
                                    initialData={{
                                      title: checklist.title,
                                      items: checklist.items,
                                      status: checklist.status,
                                    }}
                                    onSubmit={() => {}}
                                    onSendWhatsApp={handleSendWhatsApp}
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>
                            <DropdownMenuItem
                              onClick={() => handleArchiveChecklist(checklist.id)}
                              disabled={checklist.status === 'archived'}
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              Arquivar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteChecklist(checklist.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardDescription className="flex items-center justify-between">
                        <span>Criado em {checklist.createdAt.toLocaleDateString()}</span>
                        {getStatusBadge(checklist.status)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm space-y-1">
                        <p>{checklist.items.length} itens no checklist</p>
                        <ul className="space-y-1 mt-2">
                          {checklist.items.slice(0, 3).map((item) => (
                            <li key={item.id} className="flex items-center text-xs text-muted-foreground">
                              <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                              <span className="truncate">{item.title}</span>
                            </li>
                          ))}
                          {checklist.items.length > 3 && (
                            <li className="text-xs text-muted-foreground">
                              E mais {checklist.items.length - 3} itens...
                            </li>
                          )}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Novo Checklist</DialogTitle>
          </DialogHeader>
          <ChecklistForm onSubmit={handleCreateChecklist} onSendWhatsApp={handleSendWhatsApp} />
        </DialogContent>
      </Dialog>

      <Dialog open={editingChecklist !== null} onOpenChange={(open) => !open && setEditingChecklist(null)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Editar Checklist</DialogTitle>
          </DialogHeader>
          {editingChecklist && (
            <ChecklistForm
              initialData={{
                title: editingChecklist.title,
                items: editingChecklist.items,
                status: editingChecklist.status,
              }}
              onSubmit={handleUpdateChecklist}
              onSendWhatsApp={handleSendWhatsApp}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Checklists;
