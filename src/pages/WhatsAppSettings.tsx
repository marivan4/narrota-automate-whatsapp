import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, WhatsAppConnection } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  QrCode,
  Settings,
  Check,
  Copy,
  Key,
  Smartphone,
  RefreshCw,
  ExternalLink,
  Loader2,
  LogOut,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const WhatsAppSettings: React.FC = () => {
  const navigate = useNavigate();
  const { authState, isAuthorized } = useAuth();
  
  // State for API configuration
  const [apiKey, setApiKey] = useState('');
  const [instance, setInstance] = useState('');
  const [serverUrl, setServerUrl] = useState('https://evolutionapi.gpstracker-16.com.br');
  const [connectionStatus, setConnectionStatus] = useState<WhatsAppConnection['status']>('disconnected');
  const [isLoading, setIsLoading] = useState(false);
  const [savedConfig, setSavedConfig] = useState({
    apiKey: '',
    instance: '',
    serverUrl: '',
  });

  // Load saved settings
  useEffect(() => {
    // In a real app, this would be loaded from a secure storage or API
    // For demo, we'll use localStorage
    const savedSettings = localStorage.getItem('whatsappSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setApiKey(settings.apiKey || '');
      setInstance(settings.instance || '');
      setServerUrl(settings.serverUrl || 'https://evolutionapi.gpstracker-16.com.br');
      setSavedConfig({
        apiKey: settings.apiKey || '',
        instance: settings.instance || '',
        serverUrl: settings.serverUrl || 'https://evolutionapi.gpstracker-16.com.br',
      });
    }
  }, []);

  // Track connection status from child component
  const handleStatusChange = (status: WhatsAppConnection['status']) => {
    setConnectionStatus(status);
    
    if (status === 'connected' && connectionStatus !== 'connected') {
      toast.success(`WhatsApp conectado com sucesso!`);
    }
  };

  // Save API configuration
  const saveApiConfig = () => {
    // Validate inputs
    if (!apiKey.trim()) {
      toast.error('Por favor, insira uma API Key válida');
      return;
    }

    if (!serverUrl.trim()) {
      toast.error('Por favor, insira uma URL de servidor válida');
      return;
    }

    // Save configuration
    const newConfig = {
      apiKey,
      instance,
      serverUrl,
    };
    
    setSavedConfig(newConfig);
    localStorage.setItem('whatsappSettings', JSON.stringify(newConfig));
    localStorage.setItem('whatsapp_config', JSON.stringify(newConfig)); // Also save for the QR code component
    toast.success('Configurações da API salvas com sucesso');
  };

  // Copy value to clipboard
  const copyToClipboard = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copiado para a área de transferência`);
  };

  // Generate test message URL
  const getTestMessageUrl = () => {
    if (!savedConfig.apiKey || !savedConfig.instance || !savedConfig.serverUrl) {
      return null;
    }

    return `${savedConfig.serverUrl}/message/sendText/${savedConfig.instance}`;
  };

  const disconnectWhatsApp = async () => {
    if (!savedConfig.instance || !savedConfig.apiKey || !savedConfig.serverUrl) {
      toast.error('Configuração incompleta. Salve a configuração primeiro.');
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, this would call the actual API
      // const response = await fetch(`${savedConfig.serverUrl}/instance/logout/${savedConfig.instance}`, {
      //   method: 'POST',
      //   headers: {
      //     'apikey': savedConfig.apiKey,
      //     'Content-Type': 'application/json'
      //   }
      // });
      // const data = await response.json();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('WhatsApp desconectado com sucesso!');
      setConnectionStatus('disconnected');
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error);
      toast.error('Erro ao desconectar WhatsApp');
    } finally {
      setIsLoading(false);
    }
  };

  const restartInstance = async () => {
    if (!savedConfig.instance || !savedConfig.apiKey || !savedConfig.serverUrl) {
      toast.error('Configuração incompleta. Salve a configuração primeiro.');
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, this would call the actual API
      // const response = await fetch(`${savedConfig.serverUrl}/instance/instance/restart/${savedConfig.instance}`, {
      //   method: 'POST',
      //   headers: {
      //     'apikey': savedConfig.apiKey,
      //     'Content-Type': 'application/json'
      //   }
      // });
      // const data = await response.json();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Instância reiniciada com sucesso!');
      setConnectionStatus('connecting');
      
      // After a short delay, simulate the connection being re-established
      setTimeout(() => {
        setConnectionStatus('connected');
        toast.success('Conexão reestabelecida');
      }, 3000);
    } catch (error) {
      console.error('Error restarting WhatsApp instance:', error);
      toast.error('Erro ao reiniciar instância do WhatsApp');
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-2xl font-bold">Configurações do WhatsApp</h1>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <Tabs defaultValue="connection" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="connection" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              <span>Conexão WhatsApp</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Configuração da API</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connection" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Conectar WhatsApp</CardTitle>
                  <CardDescription>
                    Gerencie a conexão do WhatsApp com o sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          connectionStatus === 'connected' ? 'bg-green-500' :
                          connectionStatus === 'connecting' ? 'bg-yellow-500' :
                          connectionStatus === 'error' ? 'bg-red-500' :
                          'bg-gray-400'
                        }`} />
                        <span className="text-sm font-medium">
                          {connectionStatus === 'connected' ? 'Conectado' :
                          connectionStatus === 'connecting' ? 'Conectando...' :
                          connectionStatus === 'error' ? 'Erro de conexão' :
                          'Desconectado'}
                        </span>
                      </div>
                      
                      {connectionStatus === 'connected' && (
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={disconnectWhatsApp}
                            disabled={isLoading}
                          >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Desconectar'}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={restartInstance}
                            disabled={isLoading}
                          >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reiniciar'}
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {instance && (
                      <div className="mt-4 p-4 bg-muted rounded-md">
                        <p className="text-sm text-muted-foreground mb-2">Detalhes da conexão:</p>
                        <div className="grid grid-cols-1 gap-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Instância:</span>
                            <span className="text-sm">{instance}</span>
                          </div>
                          {serverUrl && (
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Servidor:</span>
                              <span className="text-sm">{serverUrl}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-4">
                      <Button 
                        className="w-full" 
                        onClick={() => navigate('/whatsapp-connect')}
                      >
                        <QrCode className="mr-2 h-4 w-4" />
                        Ir para página de QR Code
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciamento de Instância</CardTitle>
                  <CardDescription>
                    Gerencie sua instância do WhatsApp
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Ações disponíveis:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Desconectar seu WhatsApp da instância</li>
                      <li>• Reiniciar a instância em caso de problemas</li>
                      <li>• Gerar um novo QR Code para conectar</li>
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={disconnectWhatsApp}
                      disabled={isLoading || connectionStatus !== 'connected'}
                    >
                      Desconectar WhatsApp
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={restartInstance}
                      disabled={isLoading || connectionStatus !== 'connected'}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reiniciar Instância
                    </Button>
                  </div>
                  
                  {savedConfig.instance && (
                    <div className="mt-4 p-4 bg-muted rounded-md">
                      <p className="text-sm font-medium mb-2">URLs da API:</p>
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <div>
                          <p>URL para conectar (QR Code):</p>
                          <code className="bg-slate-100 p-1 rounded text-slate-800 text-xs block overflow-x-auto mt-1">
                            {savedConfig.serverUrl}/instance/connect/{savedConfig.instance}
                          </code>
                        </div>
                        <div>
                          <p>URL para desconectar:</p>
                          <code className="bg-slate-100 p-1 rounded text-slate-800 text-xs block overflow-x-auto mt-1">
                            {savedConfig.serverUrl}/instance/logout/{savedConfig.instance}
                          </code>
                        </div>
                        <div>
                          <p>URL para reiniciar:</p>
                          <code className="bg-slate-100 p-1 rounded text-slate-800 text-xs block overflow-x-auto mt-1">
                            {savedConfig.serverUrl}/instance/instance/restart/{savedConfig.instance}
                          </code>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuração da API</CardTitle>
                <CardDescription>
                  Configure os parâmetros da API do WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="server-url">URL do Servidor</Label>
                  <Input
                    id="server-url"
                    placeholder="https://evolutionapi.gpstracker-16.com.br"
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-key" className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    <span>API Key</span>
                  </Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="••••••••••••••••"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instance-id" className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <span>ID da Instância</span>
                  </Label>
                  <Input
                    id="instance-id"
                    placeholder="Digite o ID da instância"
                    value={instance}
                    onChange={(e) => setInstance(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Digite a sua instância. Você também pode escanear o código QR na aba "Conexão WhatsApp" para gerar uma instância nova.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => {
                  setApiKey(savedConfig.apiKey);
                  setServerUrl(savedConfig.serverUrl);
                  setInstance(savedConfig.instance);
                }}>
                  Cancelar
                </Button>
                <Button onClick={saveApiConfig}>
                  Salvar Configurações
                </Button>
              </CardFooter>
            </Card>

            {savedConfig.apiKey && savedConfig.instance && (
              <Card>
                <CardHeader>
                  <CardTitle>Teste de Integração</CardTitle>
                  <CardDescription>
                    Use estas informações para testar a integração com WhatsApp
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-md">
                    <h4 className="text-sm font-medium mb-2">Exemplo de requisição:</h4>
                    <div className="bg-card p-3 rounded-md text-xs overflow-x-auto">
                      <pre>
{`fetch("${getTestMessageUrl()}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "apikey": "${savedConfig.apiKey}"
  },
  body: JSON.stringify({
    number: "5511999999999",
    text: "Mensagem de teste do Sistema",
    delay: 0,
    linkPreview: false
  })
})`}
                      </pre>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block">URL da API</Label>
                      <div className="flex">
                        <Input
                          value={getTestMessageUrl() || ''}
                          readOnly
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="ml-2"
                          onClick={() => copyToClipboard(getTestMessageUrl() || '', 'URL da API')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="mb-2 block">API Key</Label>
                      <div className="flex">
                        <Input
                          value={savedConfig.apiKey}
                          type="password"
                          readOnly
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="ml-2"
                          onClick={() => copyToClipboard(savedConfig.apiKey, 'API Key')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Button variant="outline" className="w-full" asChild>
                      <a href="https://evolutionapi.gpstracker-16.com.br/docs" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver Documentação da API
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default WhatsAppSettings;
