
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import WhatsAppQRCode from '@/components/shared/WhatsAppQRCode';
import { toast } from 'sonner';

const WhatsAppConnect: React.FC = () => {
  const handleConnected = () => {
    // This function will be called when the WhatsApp is successfully connected
    console.log('WhatsApp connected successfully');
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Conexão WhatsApp</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <WhatsAppQRCode onConnect={handleConnected} />
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
                    Insira sua Chave API, Nome da Instância e URL do Servidor nos campos à esquerda.
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
                  <h3 className="font-medium">4. Pronto!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Após escanear, seu WhatsApp estará conectado e você poderá enviar mensagens a partir do sistema.
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
      </div>
    </DashboardLayout>
  );
};

export default WhatsAppConnect;
