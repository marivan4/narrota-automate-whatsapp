
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, RefreshCw, QrCode, Check, LogOut, RotateCw } from 'lucide-react';

interface WhatsAppQRCodeProps {
  onConnect?: () => void;
}

const WhatsAppQRCode: React.FC<WhatsAppQRCodeProps> = ({ onConnect }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    apiKey: '',
    instance: '',
    serverUrl: '',
  });

  useEffect(() => {
    // Check if there's stored connection data
    const storedConfig = localStorage.getItem('whatsapp_config');
    if (storedConfig) {
      try {
        const config = JSON.parse(storedConfig);
        setFormData(config);
        // If we have a stored config, check if it's still connected
        checkConnection(config);
      } catch (error) {
        console.error('Error parsing stored WhatsApp config:', error);
      }
    }
  }, []);

  const checkConnection = async (config: typeof formData) => {
    setIsLoading(true);
    try {
      // In a real implementation, this would call the API to check connection status
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response - in a real app this would be the API response
      const mockConnected = Math.random() > 0.5;
      setIsConnected(mockConnected);
      
      if (mockConnected) {
        toast.success('WhatsApp conectado!');
        if (onConnect) onConnect();
      } else {
        // If not connected, try to generate a new QR code
        generateQRCode();
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
      if (!formData.apiKey || !formData.instance || !formData.serverUrl) {
        toast.error('Preencha todos os campos para gerar o QR Code.');
        setIsLoading(false);
        return;
      }

      // Store the config
      localStorage.setItem('whatsapp_config', JSON.stringify(formData));

      // In a real implementation, this would call the actual API
      // const response = await fetch(`${formData.serverUrl}/instance/connect/${formData.instance}`, {
      //   method: 'GET',
      //   headers: {
      //     'apikey': formData.apiKey,
      //     'Content-Type': 'application/json'
      //   }
      // });
      // const data = await response.json();
      // const qrCodeBase64 = data.qrcode.base64;
      
      // For demo, simulate API response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // This is a mock QR code
      setQrCode('data:image/png;base64,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');

      toast.success('QR Code gerado com sucesso!');
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
      // In a real implementation, this would call the API to disconnect
      // const response = await fetch(`${formData.serverUrl}/instance/logout/${formData.instance}`, {
      //   method: 'POST',
      //   headers: {
      //     'apikey': formData.apiKey,
      //     'Content-Type': 'application/json'
      //   }
      // });
      // await response.json();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
      // In a real implementation, this would call the API to restart the instance
      // const response = await fetch(`${formData.serverUrl}/instance/instance/restart/${formData.instance}`, {
      //   method: 'POST',
      //   headers: {
      //     'apikey': formData.apiKey,
      //     'Content-Type': 'application/json'
      //   }
      // });
      // await response.json();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Instância reiniciada com sucesso!');
      // After restart, check connection again
      setTimeout(() => checkConnection(formData), 1000);
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
              Servidor: {formData.serverUrl}
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
                <Label htmlFor="apiKey">Chave API</Label>
                <Input
                  id="apiKey"
                  name="apiKey"
                  value={formData.apiKey}
                  onChange={handleFormChange}
                  placeholder="A80892194E8E-401D-BDC2-763C9430A09E"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instance">Nome da Instância</Label>
                <Input
                  id="instance"
                  name="instance"
                  value={formData.instance}
                  onChange={handleFormChange}
                  placeholder="rastreamento1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serverUrl">URL do Servidor</Label>
                <Input
                  id="serverUrl"
                  name="serverUrl"
                  value={formData.serverUrl}
                  onChange={handleFormChange}
                  placeholder="https://evolutionapi.gpstracker-16.com.br"
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
