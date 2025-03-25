
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import WhatsAppConnectionComponent from '@/components/shared/WhatsAppConnection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { WhatsAppConnection, UserRole } from '@/types';
import { MessageSquare, RefreshCw, Save, AlertCircle, Info } from 'lucide-react';
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const WhatsAppSettings: React.FC = () => {
  const { authState } = useAuth();
  const [apiKey, setApiKey] = useState('api-example-key-123456789');
  const [serverUrl, setServerUrl] = useState('api.whatsapp-service.com');
  const [instance, setInstance] = useState('instance1');
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppConnection['status']>('disconnected');
  const [templates, setTemplates] = useState([
    {
      id: 'new-client',
      name: 'Novo Cliente',
      content: 'Olá {{client_name}}, bem-vindo(a) à nossa empresa! Agradecemos por escolher nossos serviços.',
    },
    {
      id: 'invoice-created',
      name: 'Fatura Gerada',
      content: 'Olá {{client_name}}, sua fatura no valor de R$ {{amount}} foi gerada e vence em {{due_date}}. Acesse o link para pagamento: {{payment_link}}',
    },
    {
      id: 'invoice-overdue',
      name: 'Fatura em Atraso',
      content: 'Olá {{client_name}}, sua fatura no valor de R$ {{amount}} com vencimento em {{due_date}} está em atraso. Regularize seu pagamento: {{payment_link}}',
    },
    {
      id: 'invoice-paid',
      name: 'Fatura Paga',
      content: 'Olá {{client_name}}, recebemos seu pagamento de R$ {{amount}}. Obrigado!',
    },
  ]);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [templateContent, setTemplateContent] = useState('');

  const handleStatusChange = (status: WhatsAppConnection['status']) => {
    setWhatsappStatus(status);
    
    // Update instance if connected
    if (status === 'connected') {
      setInstance('instance_' + Math.floor(Math.random() * 1000));
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configurações. Por favor, tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setEditingTemplate(templateId);
      setTemplateContent(template.content);
    }
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedTemplates = templates.map(template => 
        template.id === editingTemplate 
          ? { ...template, content: templateContent } 
          : template
      );
      
      setTemplates(updatedTemplates);
      toast.success("Template atualizado com sucesso!");
      setEditingTemplate(null);
    } catch (error) {
      toast.error("Erro ao salvar template. Por favor, tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEditTemplate = () => {
    setEditingTemplate(null);
  };

  const isAuthorized = authState.user?.role === UserRole.ADMIN || authState.user?.role === UserRole.MANAGER;

  return (
    <DashboardLayout requiredRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações do WhatsApp</h1>
          <p className="text-muted-foreground">
            Gerencie a integração com o WhatsApp para envio de notificações
          </p>
        </div>

        <Tabs defaultValue="connection" className="space-y-6">
          <TabsList>
            <TabsTrigger value="connection">Conexão</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="help">Ajuda</TabsTrigger>
          </TabsList>

          <TabsContent value="connection" className="animate-fade-in">
            <div className="grid gap-6 md:grid-cols-2">
              <WhatsAppConnectionComponent onStatusChange={handleStatusChange} />
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status da Conexão</CardTitle>
                  <CardDescription>
                    Detalhes sobre o status atual da conexão com o WhatsApp
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <span className="font-medium">
                        {whatsappStatus === 'connected' 
                          ? 'Conectado' 
                          : whatsappStatus === 'connecting' 
                            ? 'Conectando...' 
                            : whatsappStatus === 'error' 
                              ? 'Erro' 
                              : 'Desconectado'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Instância:</span>
                      <span className="font-medium">{instance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Último status:</span>
                      <span className="font-medium">{new Date().toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-md bg-amber-50 text-amber-800 flex items-start space-x-2">
                    <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Mantenha seu dispositivo conectado</p>
                      <p>Para garantir o funcionamento correto, mantenha seu dispositivo carregado e conectado à internet.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="api" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Configurações da API</CardTitle>
                <CardDescription>
                  Configure os parâmetros da API para integração com o WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="serverUrl">URL do Servidor</Label>
                      <Input
                        id="serverUrl"
                        value={serverUrl}
                        onChange={(e) => setServerUrl(e.target.value)}
                        disabled={!isAuthorized}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">Chave da API</Label>
                      <div className="relative">
                        <Input
                          id="apiKey"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          type="password"
                          disabled={!isAuthorized}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                          onClick={() => {
                            const input = document.getElementById('apiKey') as HTMLInputElement;
                            input.type = input.type === 'password' ? 'text' : 'password';
                          }}
                          type="button"
                        >
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.5 11.25C9.5625 11.25 11.25 9.5625 11.25 7.5C11.25 5.4375 9.5625 3.75 7.5 3.75C5.4375 3.75 3.75 5.4375 3.75 7.5C3.75 9.5625 5.4375 11.25 7.5 11.25Z" fill="currentColor"/>
                            <path d="M7.5 9.375C8.53553 9.375 9.375 8.53553 9.375 7.5C9.375 6.46447 8.53553 5.625 7.5 5.625C6.46447 5.625 5.625 6.46447 5.625 7.5C5.625 8.53553 6.46447 9.375 7.5 9.375Z" fill="white"/>
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="instance">Instância</Label>
                    <Input
                      id="instance"
                      value={instance}
                      onChange={(e) => setInstance(e.target.value)}
                      disabled={!isAuthorized}
                    />
                    <p className="text-xs text-muted-foreground">
                      A instância é gerada automaticamente ao conectar via QR code.
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded-md bg-blue-50 text-blue-800 flex items-start space-x-2">
                    <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Importante!</p>
                      <p>Não compartilhe sua chave da API com terceiros. Ela é usada para autenticar todas as requisições à API do WhatsApp.</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setApiKey('api-example-key-123456789');
                        setServerUrl('api.whatsapp-service.com');
                        setInstance('instance1');
                      }}
                      disabled={!isAuthorized}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Restaurar Padrão
                    </Button>
                    <Button 
                      type="button" 
                      onClick={handleSaveSettings}
                      disabled={!isAuthorized || isSaving}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? 'Salvando...' : 'Salvar Configurações'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Templates de Mensagens</CardTitle>
                <CardDescription>
                  Configure os modelos de mensagens para diferentes tipos de notificações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-3 border rounded-md bg-blue-50 text-blue-800 flex items-start space-x-2">
                    <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Variáveis nos templates</p>
                      <p>Use as variáveis entre chaves duplas (ex: {"{{client_name}}"}) para inserir dados dinâmicos nas mensagens.</p>
                    </div>
                  </div>
                  
                  {editingTemplate ? (
                    <div className="space-y-4 animate-fade-in">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">
                          Editando: {templates.find(t => t.id === editingTemplate)?.name}
                        </h3>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="templateContent">Conteúdo da mensagem</Label>
                        <Textarea
                          id="templateContent"
                          value={templateContent}
                          onChange={(e) => setTemplateContent(e.target.value)}
                          className="min-h-[150px]"
                        />
                      </div>
                      
                      <div className="p-3 border rounded-md bg-blue-50 text-blue-800">
                        <p className="text-sm font-medium">Variáveis disponíveis:</p>
                        <ul className="text-sm mt-1 space-y-1">
                          <li><code>{"{{client_name}}"}</code> - Nome do cliente</li>
                          <li><code>{"{{amount}}"}</code> - Valor da fatura/transação</li>
                          <li><code>{"{{due_date}}"}</code> - Data de vencimento</li>
                          <li><code>{"{{payment_link}}"}</code> - Link para pagamento</li>
                        </ul>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancelEditTemplate}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          type="button" 
                          onClick={handleSaveTemplate}
                          disabled={isSaving}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {isSaving ? 'Salvando...' : 'Salvar Template'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {templates.map((template) => (
                        <div key={template.id} className="border rounded-md p-4 animate-fade-in">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium">{template.name}</h3>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditTemplate(template.id)}
                            >
                              Editar
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {template.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="help" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Ajuda e Suporte</CardTitle>
                <CardDescription>
                  Instruções e dicas para utilizar a integração com o WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Como conectar ao WhatsApp</h3>
                    <ol className="list-decimal pl-5 space-y-2 text-sm">
                      <li>Na aba "Conexão", clique no botão "Conectar WhatsApp"</li>
                      <li>Abra o WhatsApp no seu telefone</li>
                      <li>Toque em Configurações > Dispositivos conectados > Conectar um dispositivo</li>
                      <li>Aponte a câmera para o código QR exibido na tela</li>
                      <li>Aguarde a confirmação da conexão</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Dicas importantes</h3>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      <li>Mantenha seu telefone conectado à internet</li>
                      <li>O WhatsApp deve estar aberto no telefone ou rodando em segundo plano</li>
                      <li>Verifique se o telefone está carregado ou conectado à energia</li>
                      <li>Evite desconectar o dispositivo durante o envio de mensagens</li>
                      <li>Em caso de problemas, reconecte o dispositivo utilizando o QR code</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border rounded-md flex items-start space-x-4">
                    <AlertCircle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-medium mb-1">Limitações do WhatsApp</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Respeite as políticas de uso do WhatsApp</li>
                        <li>Envie mensagens apenas para clientes que concordaram em recebê-las</li>
                        <li>Evite enviar muitas mensagens em um curto período para evitar bloqueios</li>
                        <li>As mensagens enviadas pelo sistema são empresariais e devem seguir as diretrizes do WhatsApp Business</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-4">Perguntas Frequentes</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-1">Preciso manter meu telefone ligado?</h4>
                      <p className="text-sm text-muted-foreground">
                        Sim, o telefone que você usou para escanear o QR code precisa estar ligado e com acesso à internet para que o sistema possa enviar mensagens através dele.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-1">Posso conectar mais de um dispositivo?</h4>
                      <p className="text-sm text-muted-foreground">
                        Não, atualmente o sistema suporta apenas uma conexão por vez. Se você conectar um novo dispositivo, a conexão anterior será finalizada.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-1">O que acontece se meu telefone ficar offline?</h4>
                      <p className="text-sm text-muted-foreground">
                        Se seu telefone ficar offline, as mensagens não serão enviadas até que a conexão seja restabelecida. O sistema tentará reenviar as mensagens automaticamente quando a conexão for restaurada.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-1">Posso personalizar as mensagens?</h4>
                      <p className="text-sm text-muted-foreground">
                        Sim, você pode personalizar os templates de mensagens na aba "Templates". Use as variáveis disponíveis para incluir informações específicas de cada cliente e serviço.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Button variant="outline" className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Contatar Suporte</span>
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

export default WhatsAppSettings;
