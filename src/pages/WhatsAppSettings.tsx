
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { whatsappService } from '@/utils/whatsappService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertCircle, Save, QrCode, Link, MessageSquare, Settings } from "lucide-react";
import WhatsAppQRCode from '@/components/shared/WhatsAppQRCode';
import WhatsAppMessenger from '@/components/shared/WhatsAppMessenger';

// Define interface for WhatsApp config type
interface WhatsAppConfig {
  instance: string;
  apiKey: string;
  connected: boolean;
  status?: string;
  lastConnected?: Date;
}

const WhatsAppSettings: React.FC = () => {
  const navigate = useNavigate();
  const { authState, isAuthorized } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [connectionState, setConnectionState] = useState<'connected' | 'disconnected' | 'loading'>('disconnected');
  const [whatsappConfig, setWhatsappConfig] = useState<WhatsAppConfig>({
    instance: 'sistema-' + Math.random().toString(36).substring(2, 7),
    apiKey: '',
    connected: false,
    status: 'disconnected'
  });
  const [showQrCode, setShowQrCode] = useState(false);
  const [baseUrl, setBaseUrl] = useState('https://evolutionapi.gpstracker-16.com.br');

  useEffect(() => {
    if (!authState.isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!isAuthorized([UserRole.ADMIN])) {
      navigate('/dashboard');
      return;
    }

    // Carregar configurações do WhatsApp (simulado)
    setLoading(true);
    setTimeout(() => {
      // Simulando a carga de dados da API
      const storedConfig = localStorage.getItem('whatsappConfig');
      if (storedConfig) {
        setWhatsappConfig(JSON.parse(storedConfig));
        if (JSON.parse(storedConfig).connected) {
          setConnectionState('connected');
        }
      }
      setLoading(false);
    }, 1000);
  }, [authState.isAuthenticated, isAuthorized, navigate]);

  const handleSaveConfig = () => {
    setSaving(true);
    
    // Simulando uma chamada à API
    setTimeout(() => {
      localStorage.setItem('whatsappConfig', JSON.stringify(whatsappConfig));
      toast.success('Configurações do WhatsApp salvas com sucesso!');
      setSaving(false);
    }, 1500);
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      // Chamar o serviço real aqui se estiver disponível
      setShowQrCode(true);
      
      // Atualizar o estado com status conectado (simulado)
      setTimeout(() => {
        setWhatsappConfig(prev => ({
          ...prev,
          connected: true,
          status: 'connected',
          lastConnected: new Date()
        }));
        setConnectionState('connected');
        setLoading(false);
        toast.success('WhatsApp conectado com sucesso!');
      }, 3000);
    } catch (error) {
      console.error('Erro ao conectar WhatsApp:', error);
      toast.error('Falha ao conectar WhatsApp. Tente novamente.');
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      // Chamar o serviço de logout aqui
      await whatsappService.logout(whatsappConfig.instance);
      
      setWhatsappConfig(prev => ({
        ...prev,
        connected: false,
        status: 'disconnected',
      }));
      setConnectionState('disconnected');
      setShowQrCode(false);
      toast.success('WhatsApp desconectado com sucesso!');
    } catch (error) {
      console.error('Erro ao desconectar WhatsApp:', error);
      toast.error('Falha ao desconectar WhatsApp. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const checkConnection = () => {
    setConnectionState('loading');
    setTimeout(() => {
      if (whatsappConfig.connected) {
        setConnectionState('connected');
      } else {
        setConnectionState('disconnected');
      }
    }, 1500);
  };

  return (
    <DashboardLayout requiredRoles={[UserRole.ADMIN]}>
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Configurações do WhatsApp</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Configure a integração do sistema com o WhatsApp
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="mr-2"
            >
              Voltar
            </Button>
            <Button 
              onClick={handleSaveConfig} 
              disabled={saving}
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar Configurações
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Carregando configurações...</span>
          </div>
        ) : (
          <Tabs defaultValue="connection" className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="connection">
                <Link className="mr-2 h-4 w-4" />
                Conexão
              </TabsTrigger>
              <TabsTrigger value="messages">
                <MessageSquare className="mr-2 h-4 w-4" />
                Mensagens
              </TabsTrigger>
              <TabsTrigger value="advanced">
                <Settings className="mr-2 h-4 w-4" />
                Avançado
              </TabsTrigger>
            </TabsList>

            <TabsContent value="connection" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Conexão com WhatsApp</CardTitle>
                  <CardDescription>
                    Configure os dados de conexão com a API do WhatsApp
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="instance">Nome da Instância</Label>
                      <Input
                        id="instance"
                        value={whatsappConfig.instance}
                        onChange={(e) => setWhatsappConfig(prev => ({ ...prev, instance: e.target.value }))}
                        placeholder="ex: empresa-whatsapp"
                      />
                      <p className="text-sm text-muted-foreground">
                        Um identificador único para sua instância do WhatsApp
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="apiKey">Chave de API</Label>
                      <Input
                        id="apiKey"
                        value={whatsappConfig.apiKey}
                        onChange={(e) => setWhatsappConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                        type="password"
                        placeholder="Sua chave de API"
                      />
                      <p className="text-sm text-muted-foreground">
                        A chave de API fornecida pelo provedor do serviço
                      </p>
                    </div>
                  </div>

                  <Separator className="my-4" />
                  
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <Label>Status da Conexão</Label>
                      <div className="flex items-center space-x-2">
                        <div className={`h-3 w-3 rounded-full ${whatsappConfig.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span>{whatsappConfig.connected ? 'Conectado' : 'Desconectado'}</span>
                      </div>
                      {whatsappConfig.lastConnected && (
                        <p className="text-sm text-muted-foreground">
                          Última conexão: {new Date(whatsappConfig.lastConnected).toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between">
                        {!whatsappConfig.connected ? (
                          <Button onClick={handleConnect} disabled={loading || !whatsappConfig.apiKey}>
                            {loading ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <QrCode className="mr-2 h-4 w-4" />
                            )}
                            Conectar WhatsApp
                          </Button>
                        ) : (
                          <Button variant="destructive" onClick={handleDisconnect} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Desconectar WhatsApp
                          </Button>
                        )}
                      </div>
                    </div>

                    {showQrCode && !whatsappConfig.connected && (
                      <WhatsAppQRCode
                        baseUrl={baseUrl}
                        defaultApiKey={whatsappConfig.apiKey}
                        defaultInstance={whatsappConfig.instance}
                        onConnect={() => {
                          setWhatsappConfig(prev => ({
                            ...prev,
                            connected: true,
                            status: 'connected',
                            lastConnected: new Date()
                          }));
                          setConnectionState('connected');
                          setShowQrCode(false);
                        }}
                        onConfigChange={(config) => {
                          setWhatsappConfig(prev => ({
                            ...prev,
                            apiKey: config.apiKey,
                            instance: config.instance
                          }));
                          setBaseUrl(config.baseUrl);
                        }}
                      />
                    )}
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/50 p-4 rounded-b-lg">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Importante</AlertTitle>
                    <AlertDescription>
                      Para usar esta funcionalidade, você precisa configurar sua instância com
                      uma chave de API válida e garantir que seu número do WhatsApp esteja disponível.
                    </AlertDescription>
                  </Alert>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="messages" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Envio de Mensagens</CardTitle>
                  <CardDescription>
                    Configure modelos e envie mensagens de teste
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WhatsAppMessenger
                    baseUrl={baseUrl}
                    apiKey={whatsappConfig.apiKey}
                    instance={whatsappConfig.instance}
                    connectionState={connectionState}
                    onCheckConnection={checkConnection}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Avançadas</CardTitle>
                  <CardDescription>
                    Opções avançadas para a integração com WhatsApp
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="baseUrl">URL Base da API</Label>
                      <Input
                        id="baseUrl"
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                        placeholder="URL do servidor da API"
                      />
                      <p className="text-sm text-muted-foreground">
                        URL do serviço de API do WhatsApp
                      </p>
                    </div>
                  </div>

                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Atenção</AlertTitle>
                    <AlertDescription>
                      Alterar configurações avançadas pode afetar o funcionamento da integração.
                      Consulte a documentação técnica antes de fazer alterações.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WhatsAppSettings;
