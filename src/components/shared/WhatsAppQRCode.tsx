
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, RefreshCw, QrCode, Check, LogOut, RotateCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, WHATSAPP_DEFAULTS } from '@/types';

interface WhatsAppQRCodeProps {
  baseUrl: string;
  defaultApiKey?: string;
  defaultInstance?: string;
  onConnect?: () => void;
  onConfigChange?: (config: { baseUrl: string; apiKey: string; instance: string }) => void;
}

const WhatsAppQRCode: React.FC<WhatsAppQRCodeProps> = ({ 
  baseUrl, 
  defaultApiKey = '', 
  defaultInstance = '', 
  onConnect, 
  onConfigChange 
}) => {
  const { authState } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    apiKey: defaultApiKey || WHATSAPP_DEFAULTS.GLOBAL_API_KEY,
    instance: defaultInstance,
    baseUrl: baseUrl || WHATSAPP_DEFAULTS.DEFAULT_SERVER_URL,
  });

  const isAdmin = authState?.user?.role === UserRole.ADMIN;

  useEffect(() => {
    if (defaultInstance && (defaultApiKey || WHATSAPP_DEFAULTS.GLOBAL_API_KEY)) {
      checkConnection();
    }
    
    // If user is admin, use the global API key
    if (isAdmin) {
      setFormData(prev => ({
        ...prev,
        apiKey: WHATSAPP_DEFAULTS.GLOBAL_API_KEY
      }));
    }
  }, [defaultInstance, defaultApiKey, isAdmin]);

  const checkConnection = async () => {
    if (!formData.instance) {
      return;
    }

    // Always use the global API key for admin operations
    const apiKeyToUse = isAdmin ? WHATSAPP_DEFAULTS.GLOBAL_API_KEY : formData.apiKey;

    setIsLoading(true);
    try {
      const response = await fetch(`${formData.baseUrl}/instance/connectionState/${formData.instance}`, {
        method: 'GET',
        headers: {
          'apikey': apiKeyToUse,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data?.state === 'open' || data?.state === 'connected' || 
          (data?.instance && data?.instance.state === 'open')) {
        setIsConnected(true);
        if (onConnect) onConnect();
        toast.success('WhatsApp conectado!');
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error checking WhatsApp connection:', error);
      toast.error('Erro ao verificar conexão do WhatsApp.');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCode = async () => {
    setIsLoading(true);
    try {
      // Validate form data
      if (!formData.instance) {
        toast.error('Preencha a instância para gerar o QR Code.');
        setIsLoading(false);
        return;
      }

      // Always use the global API key for admin operations
      const apiKeyToUse = isAdmin ? WHATSAPP_DEFAULTS.GLOBAL_API_KEY : formData.apiKey;

      // Notify parent component about config change
      if (onConfigChange) {
        onConfigChange({
          ...formData,
          apiKey: apiKeyToUse
        });
      }

      // Call the actual API
      const response = await fetch(`${formData.baseUrl}/instance/connect/${formData.instance}`, {
        method: 'GET',
        headers: {
          'apikey': apiKeyToUse,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data && data.base64) {
        setQrCode(data.base64);
        toast.success('QR Code gerado com sucesso!');
      } else {
        throw new Error('QR Code não recebido da API');
      }
    } catch (error) {
      console.error('Error generating WhatsApp QR code:', error);
      toast.error('Erro ao gerar QR Code do WhatsApp.');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWhatsApp = async () => {
    setIsLoading(true);
    try {
      // Always use the global API key for admin operations
      const apiKeyToUse = isAdmin ? WHATSAPP_DEFAULTS.GLOBAL_API_KEY : formData.apiKey;
      
      const response = await fetch(`${formData.baseUrl}/instance/logout/${formData.instance}`, {
        method: 'POST',
        headers: {
          'apikey': apiKeyToUse,
          'Content-Type': 'application/json'
        }
      });
      
      await response.json();
      
      setIsConnected(false);
      setQrCode(null);
      toast.success('WhatsApp desconectado com sucesso!');
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error);
      toast.error('Erro ao desconectar WhatsApp.');
    } finally {
      setIsLoading(false);
    }
  };

  const restartInstance = async () => {
    setIsLoading(true);
    try {
      // Always use the global API key for admin operations
      const apiKeyToUse = isAdmin ? WHATSAPP_DEFAULTS.GLOBAL_API_KEY : formData.apiKey;
      
      const response = await fetch(`${formData.baseUrl}/instance/restart/${formData.instance}`, {
        method: 'POST',
        headers: {
          'apikey': apiKeyToUse,
          'Content-Type': 'application/json'
        }
      });
      
      await response.json();
      
      toast.success('Instância reiniciada com sucesso!');
      // After restart, check connection again
      setTimeout(() => checkConnection(), 1000);
    } catch (error) {
      console.error('Error restarting WhatsApp instance:', error);
      toast.error('Erro ao reiniciar instância do WhatsApp.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Conexão com WhatsApp</CardTitle>
        <CardDescription>
          Configure sua conexão com WhatsApp para enviar contratos e faturas para seus clientes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="flex flex-col items-center space-y-4 p-6 text-center">
            <div className="flex items-center justify-center rounded-full bg-green-100 p-2 w-12 h-12">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium">WhatsApp Conectado</h3>
            <p className="text-sm text-muted-foreground">
              Instância: {formData.instance}<br />
              Servidor: {formData.baseUrl}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={disconnectWhatsApp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="mr-2 h-4 w-4" />
                )}
                Desconectar
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={restartInstance}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RotateCw className="mr-2 h-4 w-4" />
                )}
                Reiniciar Instância
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="baseUrl">URL do Servidor</Label>
                <Input
                  id="baseUrl"
                  name="baseUrl"
                  value={formData.baseUrl}
                  onChange={handleFormChange}
                  placeholder={WHATSAPP_DEFAULTS.DEFAULT_SERVER_URL}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKey">Chave API {isAdmin && "(Global - Somente Leitura)"}</Label>
                <Input
                  id="apiKey"
                  name="apiKey"
                  value={isAdmin ? WHATSAPP_DEFAULTS.GLOBAL_API_KEY : formData.apiKey}
                  onChange={handleFormChange}
                  placeholder={WHATSAPP_DEFAULTS.GLOBAL_API_KEY}
                  readOnly={isAdmin} // Make it read-only for admin users
                  className={isAdmin ? "bg-gray-100" : ""}
                />
                {isAdmin && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Essa é a chave API global para administradores, usada apenas para leitura de QR code.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="instance">Nome da Instância</Label>
                <Input
                  id="instance"
                  name="instance"
                  value={formData.instance}
                  onChange={handleFormChange}
                  placeholder="minha-instancia"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={generateQRCode}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando QR Code...
                  </>
                ) : (
                  <>
                    <QrCode className="mr-2 h-4 w-4" />
                    Gerar QR Code do WhatsApp
                  </>
                )}
              </Button>
            </div>

            {qrCode && (
              <div className="mt-6 flex flex-col items-center">
                <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mb-4 w-full">
                  <h4 className="text-sm font-medium mb-2 text-blue-800">Como conectar o WhatsApp:</h4>
                  <ol className="text-sm text-blue-700 list-decimal ml-4 space-y-1">
                    <li>Abra o aplicativo WhatsApp no seu celular</li>
                    <li>Toque em Menu (três pontos) &gt; WhatsApp Web</li>
                    <li>Aponte a câmera para o código QR abaixo</li>
                    <li>Aguarde a conexão ser estabelecida</li>
                  </ol>
                </div>
                <div className="border p-4 rounded-md bg-white">
                  <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64" />
                </div>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={generateQRCode}
                  disabled={isLoading}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Atualizar QR Code
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground border-t pt-4">
        <p>Nota: O QR Code expira após 45 segundos. Se expirar, clique em "Atualizar QR Code".</p>
      </CardFooter>
    </Card>
  );
};

export default WhatsAppQRCode;
