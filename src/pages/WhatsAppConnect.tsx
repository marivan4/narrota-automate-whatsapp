import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WhatsAppQRCode from '@/components/shared/WhatsAppQRCode';
import WhatsAppMessenger from '@/components/shared/WhatsAppMessenger';
import { useAuth } from '@/contexts/AuthContext';
import { WHATSAPP_DEFAULTS, UserRole } from '@/types';

interface ConnectionConfig {
  baseUrl: string;
  apiKey: string;
  instance: string;
}

const WhatsAppConnect: React.FC = () => {
  const { authState } = useAuth();
  const [config, setConfig] = useState<ConnectionConfig>({
    baseUrl: WHATSAPP_DEFAULTS.DEFAULT_SERVER_URL,
    apiKey: '',
    instance: ''
  });
  
  const [connectionState, setConnectionState] = useState<'connected' | 'disconnected' | 'loading'>('loading');
  const isAdmin = authState?.user?.role === UserRole.ADMIN;
  
  useEffect(() => {
    // Load stored config on component mount
    const storedConfig = localStorage.getItem('whatsapp_config');
    if (storedConfig) {
      try {
        const parsedConfig = JSON.parse(storedConfig);
        
        // For admin users, always use the global API key for QR code generation
        const apiKeyToUse = isAdmin 
          ? WHATSAPP_DEFAULTS.GLOBAL_API_KEY 
          : (parsedConfig.apiKey || '');
          
        setConfig(prevConfig => ({
          ...prevConfig,
          ...parsedConfig,
          apiKey: apiKeyToUse
        }));
        
        // If we have a stored instance, check connection state
        if (parsedConfig.instance) {
          checkConnectionState({
            ...parsedConfig,
            apiKey: apiKeyToUse
          });
        } else {
          setConnectionState('disconnected');
        }
      } catch (error) {
        console.error('Error parsing stored WhatsApp config:', error);
      }
    } else {
      // For new configs, initialize admin with global API key
      if (isAdmin) {
        setConfig(prev => ({
          ...prev,
          apiKey: WHATSAPP_DEFAULTS.GLOBAL_API_KEY
        }));
      }
      setConnectionState('disconnected');
    }
  }, [isAdmin]);
  
  const checkConnectionState = async (cfg: ConnectionConfig) => {
    if (!cfg.instance) {
      setConnectionState('disconnected');
      return;
    }
    
    setConnectionState('loading');
    try {
      // Always use global API key for admin operations
      const apiKeyToUse = isAdmin ? WHATSAPP_DEFAULTS.GLOBAL_API_KEY : cfg.apiKey;
      
      const response = await fetch(`${cfg.baseUrl}/instance/connectionState/${cfg.instance}`, {
        method: 'GET',
        headers: {
          'apikey': apiKeyToUse,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data?.state === 'open' || data?.state === 'connected' || 
          (data?.instance && data?.instance.state === 'open')) {
        setConnectionState('connected');
      } else {
        setConnectionState('disconnected');
      }
    } catch (error) {
      console.error('Error checking connection state:', error);
      setConnectionState('disconnected');
    }
  };

  const handleConnected = () => {
    // This function will be called when the WhatsApp is successfully connected
    setConnectionState('connected');
    toast.success('WhatsApp conectado com sucesso!');
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Conexão WhatsApp</h1>
        
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <InfoIcon className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Informação</AlertTitle>
          <AlertDescription className="text-blue-700">
            {isAdmin 
              ? "Como administrador, você usa a API key global para leitura do QR code. Clientes precisam especificar suas próprias chaves para envio de notificações."
              : "Conecte o WhatsApp ao sistema para enviar contratos e faturas automaticamente para seus clientes. É necessário usar uma API key específica para envio de mensagens."}
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue="connect" className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-6">
            <TabsTrigger value="connect">Conectar WhatsApp</TabsTrigger>
            <TabsTrigger value="messenger">Enviar Mensagens</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connect">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <WhatsAppQRCode 
                  baseUrl={config.baseUrl}
                  defaultApiKey={config.apiKey}
                  defaultInstance={config.instance}
                  onConnect={handleConnected}
                  onConfigChange={(newConfig) => {
                    // Store the client-specific API key if provided, otherwise keep the global one for admins
                    const apiKeyToStore = isAdmin ? WHATSAPP_DEFAULTS.GLOBAL_API_KEY : newConfig.apiKey;
                    
                    const configToStore = {
                      ...newConfig,
                      apiKey: apiKeyToStore
                    };
                    
                    setConfig(configToStore);
                    localStorage.setItem('whatsapp_config', JSON.stringify(configToStore));
                  }}
                />
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Instruções</CardTitle>
                    <CardDescription>Como conectar ao WhatsApp</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium">1. Configure sua API</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {isAdmin 
                          ? "Como administrador, a Chave API global já está configurada para leitura do QR code."
                          : "Insira sua Chave API, Nome da Instância e URL do Servidor nos campos à esquerda."}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium">2. Gere o QR Code</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Clique no botão "Gerar QR Code do WhatsApp" para obter um código QR.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium">3. Escaneie com seu celular</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Abra o WhatsApp no seu celular, vá em Menu &gt; WhatsApp Web e escaneie o código QR.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium">4. Gerenciamento</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Após conectar, você pode desconectar ou reiniciar a instância usando os botões fornecidos.
                      </p>
                    </div>
                    
                    <div className="bg-orange-50 p-3 rounded-md border border-orange-200">
                      <p className="text-sm text-orange-700">
                        <strong>Importante:</strong> Não compartilhe sua chave API ou QR Code com outras pessoas. Isso pode comprometer a segurança da sua conta.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="messenger">
            <WhatsAppMessenger 
              baseUrl={config.baseUrl}
              apiKey={config.apiKey}
              instance={config.instance}
              connectionState={connectionState}
              onCheckConnection={() => checkConnectionState(config)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default WhatsAppConnect;
