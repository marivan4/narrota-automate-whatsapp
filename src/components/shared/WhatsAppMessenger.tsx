
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Send, RefreshCw, PhoneOff, Key } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, WHATSAPP_DEFAULTS } from '@/types';

interface WhatsAppMessengerProps {
  baseUrl: string;
  apiKey: string;
  instance: string;
  connectionState: 'connected' | 'disconnected' | 'loading';
  onCheckConnection: () => void;
}

const WhatsAppMessenger: React.FC<WhatsAppMessengerProps> = ({ 
  baseUrl, 
  apiKey, 
  instance, 
  connectionState,
  onCheckConnection
}) => {
  const { authState } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [clientApiKey, setClientApiKey] = useState<string>(apiKey || '');
  const [messageData, setMessageData] = useState({
    number: '',
    text: '',
    delay: 0,
    linkPreview: false
  });

  const isAdmin = authState?.user?.role === UserRole.ADMIN;
  const isManager = authState?.user?.role === UserRole.MANAGER;
  const canEditApiKey = isAdmin || isManager;

  const sendMessage = async () => {
    if (!messageData.number || !messageData.text) {
      toast.error('Por favor, preencha o número e a mensagem.');
      return;
    }

    if (!instance || !clientApiKey) {
      toast.error('Configuração de WhatsApp incompleta. Por favor, configure a API Key do cliente.');
      return;
    }

    setIsLoading(true);
    try {
      // Format the phone number if needed
      let formattedNumber = messageData.number.replace(/\D/g, '');
      if (!formattedNumber.includes('@')) {
        // If not a group, ensure it has country code
        if (!formattedNumber.startsWith('55')) {
          formattedNumber = '55' + formattedNumber;
        }
      }

      const response = await fetch(`${baseUrl}/message/sendText/${instance}`, {
        method: 'POST',
        headers: {
          'apikey': clientApiKey, // Use client-specific API key for sending messages
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          number: formattedNumber,
          text: messageData.text,
          delay: messageData.delay,
          linkPreview: messageData.linkPreview
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success' || data.key) {
        toast.success('Mensagem enviada com sucesso!');
        // Clear the message text but keep the number
        setMessageData(prev => ({ ...prev, text: '' }));
      } else {
        throw new Error(data.message || 'Erro ao enviar mensagem');
      }
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      toast.error('Erro ao enviar mensagem. Verifique a API Key do cliente e a conexão com WhatsApp.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setMessageData(prev => ({ ...prev, [name]: val }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Enviar Mensagens WhatsApp</CardTitle>
            <CardDescription>
              Envie mensagens diretamente para seus clientes via WhatsApp
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                connectionState === 'connected' ? 'bg-green-500' :
                connectionState === 'loading' ? 'bg-yellow-500' :
                'bg-red-500'
              }`} />
              <span className="text-sm">
                {connectionState === 'connected' ? 'Conectado' :
                connectionState === 'loading' ? 'Verificando...' :
                'Desconectado'}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onCheckConnection}
              disabled={isLoading || !instance || !clientApiKey}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {connectionState === 'disconnected' ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <PhoneOff className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">WhatsApp não conectado</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              Você precisa conectar o WhatsApp antes de poder enviar mensagens. Por favor, vá para a aba "Conectar WhatsApp" e escaneie o código QR.
            </p>
            <Button variant="default" onClick={() => {
              const tabElements = document.querySelectorAll('[role="tab"]');
              if (tabElements && tabElements.length > 0) {
                (tabElements[0] as HTMLElement).click();
              }
            }}>
              Ir para Conexão
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Client-specific API Key input */}
            <div className="space-y-2 p-4 border rounded-md bg-muted/50">
              <Label htmlFor="clientApiKey" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                API Key do Cliente para Envio de Mensagens
              </Label>
              <Input
                id="clientApiKey"
                value={clientApiKey}
                onChange={(e) => setClientApiKey(e.target.value)}
                placeholder="Insira a API Key específica do cliente"
                disabled={!canEditApiKey || isLoading}
              />
              <p className="text-xs text-muted-foreground">
                {canEditApiKey 
                  ? "Esta é a API Key específica para o cliente, necessária para enviar notificações."
                  : "Você precisa ser administrador ou gerente para editar a API Key do cliente."}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="number">Número de Telefone</Label>
              <Input
                id="number"
                name="number"
                value={messageData.number}
                onChange={handleInputChange}
                placeholder="5511999999999 ou Nome do Grupo"
                disabled={isLoading || connectionState !== 'connected'}
              />
              <p className="text-xs text-muted-foreground">
                Digite o número com DDD e código do país (ex: 5511999999999) ou ID de grupo (@g.us).
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="text">Mensagem</Label>
              <Textarea
                id="text"
                name="text"
                value={messageData.text}
                onChange={handleInputChange}
                rows={5}
                placeholder="Digite sua mensagem aqui..."
                disabled={isLoading || connectionState !== 'connected'}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox"
                id="linkPreview"
                name="linkPreview"
                checked={messageData.linkPreview}
                onChange={handleInputChange}
                disabled={isLoading || connectionState !== 'connected'}
                className="rounded border-gray-300"
              />
              <Label htmlFor="linkPreview" className="text-sm cursor-pointer">
                Ativar pré-visualização de links
              </Label>
            </div>
            
            <Button 
              onClick={sendMessage} 
              disabled={isLoading || !messageData.number || !messageData.text || connectionState !== 'connected' || !clientApiKey} 
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Mensagem
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start border-t pt-4">
        <h4 className="text-sm font-medium mb-2">Dicas para envio:</h4>
        <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
          <li>Certifique-se de que o número está no formato correto com código do país.</li>
          <li>Para grupos, use o ID completo no formato: 123456789@g.us</li>
          <li>Você pode usar marcadores básicos como *texto* para negrito e _texto_ para itálico.</li>
          <li>A API Key do cliente é necessária para o envio de notificações.</li>
        </ul>
      </CardFooter>
    </Card>
  );
};

export default WhatsAppMessenger;
