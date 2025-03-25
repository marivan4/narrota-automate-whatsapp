
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WhatsAppConnection } from '@/types';
import { RefreshCw, AlertCircle, CheckCircle, Smartphone } from 'lucide-react';
import { toast } from "sonner";
import { cn } from '@/lib/utils';

interface WhatsAppConnectionProps {
  onStatusChange?: (status: WhatsAppConnection['status']) => void;
}

const WhatsAppConnectionComponent: React.FC<WhatsAppConnectionProps> = ({ onStatusChange }) => {
  const [connection, setConnection] = useState<WhatsAppConnection>({
    status: 'disconnected',
    lastUpdated: new Date(),
  });

  const [countdown, setCountdown] = useState<number | null>(null);
  const [instanceName, setInstanceName] = useState('');
  const [apiKey, setApiKey] = useState('');

  // Function to generate QR code using instance credentials
  const generateQRCode = async () => {
    if (!instanceName.trim()) {
      toast.error("Por favor, informe o nome da instância");
      return;
    }

    if (!apiKey.trim()) {
      toast.error("Por favor, informe a API Key");
      return;
    }

    setConnection({
      ...connection,
      status: 'connecting',
      lastUpdated: new Date(),
    });

    // Simulate API call to generate QR code
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock QR code data
      const mockQRCode = 'data:image/png;base64,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';
      
      setConnection({
        status: 'connecting',
        qrCode: mockQRCode,
        lastUpdated: new Date(),
      });
      
      // Start a countdown for QR code expiration
      setCountdown(60);
      
      // Simulate connection with entered credentials instead of random success/failure
      setTimeout(() => {
        setConnection({
          status: 'connected',
          instanceName: instanceName,
          apiKey: apiKey,
          lastUpdated: new Date(),
        });
        if (onStatusChange) onStatusChange('connected');
        toast.success("WhatsApp conectado com sucesso!");
        setCountdown(null);
      }, 5000); // Simulate connection after 5 seconds
      
    } catch (error) {
      setConnection({
        status: 'error',
        errorMessage: 'Erro ao gerar código QR',
        lastUpdated: new Date(),
      });
      if (onStatusChange) onStatusChange('error');
      toast.error("Erro ao gerar código QR. Por favor, tente novamente.");
    }
  };

  // Update countdown timer
  useEffect(() => {
    if (countdown === null) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          // If countdown finishes and still in connecting state, set to error
          if (connection.status === 'connecting') {
            setConnection({
              status: 'error',
              errorMessage: 'O tempo para conexão expirou. Por favor, tente novamente.',
              lastUpdated: new Date(),
            });
            if (onStatusChange) onStatusChange('error');
            toast.error("O tempo para conexão expirou. Por favor, tente novamente.");
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [countdown, connection.status, onStatusChange]);

  const disconnectWhatsApp = () => {
    setConnection({
      status: 'disconnected',
      lastUpdated: new Date(),
    });
    setInstanceName('');
    setApiKey('');
    if (onStatusChange) onStatusChange('disconnected');
    toast.info("WhatsApp desconectado.");
  };

  const getStatusContent = () => {
    switch (connection.status) {
      case 'disconnected':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <Smartphone className="h-5 w-5" />
              <p>WhatsApp não conectado</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instanceName">Nome da Instância</Label>
                <Input
                  id="instanceName"
                  placeholder="Sua instância WhatsApp"
                  value={instanceName}
                  onChange={(e) => setInstanceName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Sua chave de API"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              
              <Button 
                className="w-full" 
                onClick={generateQRCode}
              >
                Conectar WhatsApp
              </Button>
            </div>
          </div>
        );
      case 'connecting':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Escaneie o código QR com seu WhatsApp
              </p>
              <p className="text-xs text-muted-foreground">
                Expira em {countdown} segundos
              </p>
            </div>
            
            {connection.qrCode && (
              <div className="flex items-center justify-center">
                <div className="p-3 bg-black rounded-lg shadow-md">
                  <img
                    src={connection.qrCode}
                    alt="WhatsApp QR Code"
                    className="w-64 h-64 qr-scanning" 
                  />
                </div>
              </div>
            )}
            
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                className="flex items-center space-x-1"
                onClick={generateQRCode}
              >
                <RefreshCw className="h-4 w-4" />
                <span>Gerar novo código</span>
              </Button>
            </div>
          </div>
        );
      case 'connected':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <p>WhatsApp conectado</p>
            </div>
            <div className="text-sm text-center space-y-2">
              <p>Instância: <span className="font-medium">{connection.instanceName}</span></p>
              <p className="text-xs text-muted-foreground">
                Conectado em {connection.lastUpdated.toLocaleString()}
              </p>
            </div>
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                className="flex items-center space-x-1 text-destructive"
                onClick={disconnectWhatsApp}
              >
                <span>Desconectar</span>
              </Button>
            </div>
          </div>
        );
      case 'error':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{connection.errorMessage || 'Erro de conexão'}</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instanceName">Nome da Instância</Label>
                <Input
                  id="instanceName"
                  placeholder="Sua instância WhatsApp"
                  value={instanceName}
                  onChange={(e) => setInstanceName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Sua chave de API"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              
              <Button 
                className="w-full"
                onClick={generateQRCode}
              >
                Tentar novamente
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={cn("w-full", connection.status === 'error' && "border-destructive")}>
      <CardHeader>
        <CardTitle className="text-lg text-center">Conexão WhatsApp</CardTitle>
        <CardDescription className="text-center">
          Conecte sua conta do WhatsApp para enviar notificações
        </CardDescription>
      </CardHeader>
      <CardContent>
        {getStatusContent()}
      </CardContent>
    </Card>
  );
};

export default WhatsAppConnectionComponent;
