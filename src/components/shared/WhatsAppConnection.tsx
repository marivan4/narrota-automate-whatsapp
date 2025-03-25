
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
      
      // Simulate a random connection success or failure
      const randomSuccess = Math.random() > 0.3; // 70% success rate
      
      setTimeout(() => {
        if (randomSuccess) {
          setConnection({
            status: 'connected',
            instanceName: instanceName,
            apiKey: apiKey,
            lastUpdated: new Date(),
          });
          if (onStatusChange) onStatusChange('connected');
          toast.success("WhatsApp conectado com sucesso!");
          setCountdown(null);
        } else {
          setConnection({
            status: 'error',
            errorMessage: 'O tempo para conexão expirou. Por favor, tente novamente.',
            lastUpdated: new Date(),
          });
          if (onStatusChange) onStatusChange('error');
          toast.error("Falha ao conectar. Por favor, tente novamente.");
          setCountdown(null);
        }
      }, 20000); // Simulate connection after 20 seconds
      
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
              <div className="relative qr-scanning flex items-center justify-center p-2 bg-black rounded-lg shadow-sm mx-auto max-w-xs overflow-hidden">
                <img
                  src={connection.qrCode}
                  alt="WhatsApp QR Code"
                  className="w-full h-auto"
                />
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
