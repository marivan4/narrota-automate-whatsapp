
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, WhatsAppConnection } from '@/types';
import WhatsAppConnectionComponent from '@/components/shared/WhatsAppConnection';
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
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface WhatsAppSettingsProps {
  // Define props if needed
}

const WhatsAppSettings: React.FC<WhatsAppSettingsProps> = () => {
  const navigate = useNavigate();
  const { authState, isAuthorized } = useAuth();
  
  // State for API configuration
  const [apiKey, setApiKey] = useState('');
  const [instance, setInstance] = useState('');
  const [serverUrl, setServerUrl] = useState('api.example.com');
  const [connectionStatus, setConnectionStatus] = useState<WhatsAppConnection['status']>('disconnected');
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
      setServerUrl(settings.serverUrl || 'api.example.com');
      setSavedConfig({
        apiKey: settings.apiKey || '',
        instance: settings.instance || '',
        serverUrl: settings.serverUrl || 'api.example.com',
      });
    }
  }, []);

  // Track connection status from child component
  const handleStatusChange = (status: WhatsAppConnection['status']) => {
    setConnectionStatus(status);
    
    // If connected, save the instance
    if (status === 'connected' && connectionStatus !== 'connected') {
      // In a real implementation, this would come from the API response
      const newInstance = `instance_${Math.floor(Math.random() * 1000)}`;
      setInstance(newInstance);
      
      // Update saved config
      const updatedConfig = {
        ...savedConfig,
        instance: newInstance,
      };
      setSavedConfig(updatedConfig);
      localStorage.setItem('whatsappSettings', JSON.stringify(updatedConfig));
      
      toast.success(`Instância WhatsApp conectada: ${newInstance}`);
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
      instance: savedConfig.instance, // Keep existing instance if available
      serverUrl,
    };
    
    setSavedConfig(newConfig);
    localStorage.setItem('whatsappSettings', JSON.stringify(newConfig));
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

    return `https://${savedConfig.serverUrl}/message/sendText/${savedConfig.instance}`;
  };

  // Permissions check
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
            <Card>
              <CardHeader>
                <CardTitle>Conectar WhatsApp</CardTitle>
                <CardDescription>
                  Escaneie o código QR com seu WhatsApp para conectar ao sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WhatsAppConnectionComponent onStatusChange={handleStatusChange} />
              </CardContent>
              {connectionStatus === 'connected' && (
                <CardFooter className="flex flex-col items-start space-y-4">
                  <div className="w-full">
                    <Label htmlFor="instance">ID da Instância</Label>
                    <div className="flex mt-1">
                      <Input
                        id="instance"
                        value={savedConfig.instance}
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="ml-2"
                        onClick={() => copyToClipboard(savedConfig.instance, 'ID da Instância')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status da Conexão</CardTitle>
                <CardDescription>
                  Informações sobre a conexão atual do WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-500' :
                    connectionStatus === 'connecting' ? 'bg-yellow-500' :
                    connectionStatus === 'error' ? 'bg-red-500' :
                    'bg-gray-400'
                  }`} />
                  <p className="text-sm font-medium">
                    {connectionStatus === 'connected' ? 'Conectado' :
                     connectionStatus === 'connecting' ? 'Conectando...' :
                     connectionStatus === 'error' ? 'Erro de conexão' :
                     'Desconectado'}
                  </p>
                </div>

                {savedConfig.instance && (
                  <div className="mt-4 p-4 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground mb-2">Detalhes da conexão:</p>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Instância:</span>
                        <span className="text-sm">{savedConfig.instance}</span>
                      </div>
                      {savedConfig.serverUrl && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Servidor:</span>
                          <span className="text-sm">{savedConfig.serverUrl}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
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
                    placeholder="api.example.com"
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
                  <div className="flex">
                    <Input
                      id="instance-id"
                      placeholder="Conecte o WhatsApp para obter uma instância"
                      value={instance}
                      onChange={(e) => setInstance(e.target.value)}
                      className="flex-1"
                    />
                    {savedConfig.instance && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="ml-2"
                        onClick={() => {
                          setInstance(savedConfig.instance);
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {!savedConfig.instance && (
                    <p className="text-sm text-muted-foreground">
                      Conecte o WhatsApp na aba "Conexão WhatsApp" para gerar uma instância automaticamente
                    </p>
                  )}
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
    text: "Mensagem de teste do Narrota System",
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
