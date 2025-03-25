import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
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

interface WhatsAppSettingsProps {
  // Define props if needed
}

interface Template {
  id: string;
  name: string;
  content: string;
}

const WhatsAppSettings: React.FC<WhatsAppSettingsProps> = () => {
  const navigate = useNavigate();
  const { authState, isAuthorized, logout } = useAuth();

  // State variables
  const [templates, setTemplates] = useState<Template[]>([]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const templatesPerPage = 5;

  // Mock data (replace with API calls later)
  useEffect(() => {
    // Simulate loading data from an API
    setIsLoading(true);
    setTimeout(() => {
      const mockTemplates: Template[] = [
        { id: '1', name: 'Boas Vindas', content: 'Olá, seja bem-vindo(a) à Narrota System!' },
        { id: '2', name: 'Lembrete de Pagamento', content: 'Lembre-se de pagar sua fatura até o dia 10.' },
        { id: '3', name: 'Confirmação de Agendamento', content: 'Seu agendamento foi confirmado para o dia 15.' },
        { id: '4', name: 'Pesquisa de Satisfação', content: 'Responda nossa pesquisa e nos ajude a melhorar!' },
        { id: '5', name: 'Promoção Exclusiva', content: 'Aproveite nossa promoção exclusiva para você!' },
        { id: '6', name: 'Teste Template', content: 'Teste de template para verificar a formatação.' },
        { id: '7', name: 'Template Longo', content: 'Este é um template longo para testar a quebra de linha e a exibição correta do conteúdo em diferentes dispositivos. Ele deve ser exibido corretamente mesmo que tenha várias linhas de texto.' },
        { id: '8', name: 'Template com Variáveis', content: 'Olá, [nome]! Seu código de acesso é [codigo].' },
        { id: '9', name: 'Template de Cobrança', content: 'Olá, [nome]! Seu boleto no valor de [valor] vence em [data].' },
        { id: '10', name: 'Template de Suporte', content: 'Olá, [nome]! Precisa de ajuda? Entre em contato conosco!' },
      ];
      setTemplates(mockTemplates);
      setIsLoading(false);
    }, 500);
  }, []);

  // Pagination
  const indexOfLastTemplate = currentPage * templatesPerPage;
  const indexOfFirstTemplate = indexOfLastTemplate - templatesPerPage;
  const currentTemplates = templates.slice(indexOfFirstTemplate, indexOfLastTemplate);

  const totalPages = Math.ceil(templates.length / templatesPerPage);

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage(currentPage - 1);
  };

  // Handlers
  const handleCreateTemplate = () => {
    if (!newTemplateName || !newTemplateContent) {
      toast.error('Por favor, preencha todos os campos.');
      return;
    }

    const newTemplate: Template = {
      id: String(Date.now()), // Generate a unique ID
      name: newTemplateName,
      content: newTemplateContent,
    };

    setTemplates([...templates, newTemplate]);
    setNewTemplateName('');
    setNewTemplateContent('');
    toast.success('Template criado com sucesso!');
  };

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setNewTemplateName(template.name);
    setNewTemplateContent(template.content);
    setIsEditing(true);
  };

  const handleUpdateTemplate = () => {
    if (!newTemplateName || !newTemplateContent) {
      toast.error('Por favor, preencha todos os campos.');
      return;
    }

    if (!selectedTemplate) return;

    const updatedTemplates = templates.map(template =>
      template.id === selectedTemplate.id
        ? { ...template, name: newTemplateName, content: newTemplateContent }
        : template
    );

    setTemplates(updatedTemplates);
    setSelectedTemplate(null);
    setNewTemplateName('');
    setNewTemplateContent('');
    setIsEditing(false);
    toast.success('Template atualizado com sucesso!');
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(template => template.id !== templateId));
    toast.success('Template excluído com sucesso!');
  };

  const handleCancelEdit = () => {
    setSelectedTemplate(null);
    setNewTemplateName('');
    setNewTemplateContent('');
    setIsEditing(false);
  };

  const handleCopyTemplate = (template: Template) => {
    navigator.clipboard.writeText(template.content);
    toast.success('Template copiado para a área de transferência!');
  };

  const handleSendTestMessage = (template: Template) => {
    // Implement your logic to send a test message via WhatsApp
    toast.info(`Enviando mensagem de teste para o template "${template.name}"... (funcionalidade não implementada)`);
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
          <h1 className="text-2xl font-bold">Configurações WhatsApp</h1>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Criar Novo Template</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="templateName">Nome do Template</Label>
                <Input
                  id="templateName"
                  placeholder="Ex: Boas Vindas"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="templateContent">Conteúdo do Template</Label>
                <Textarea
                  id="templateContent"
                  placeholder="Ex: Olá, seja bem-vindo(a)!"
                  value={newTemplateContent}
                  onChange={(e) => setNewTemplateContent(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex justify-end">
                {isEditing ? (
                  <>
                    <Button variant="ghost" onClick={handleCancelEdit}>
                      Cancelar
                    </Button>
                    <Button onClick={handleUpdateTemplate}>
                      Atualizar Template
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleCreateTemplate}>
                    Criar Template
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Templates Existentes</CardTitle>
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
                    {currentTemplates.map((template) => (
                      <tr key={template.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{template.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">
                            {template.content.length > 50
                              ? `${template.content.substring(0, 50)}...`
                              : template.content}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEditTemplate(template)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleCopyTemplate(template)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleSendTestMessage(template)}>
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteTemplate(template.id)}>
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

export default WhatsAppSettings;
