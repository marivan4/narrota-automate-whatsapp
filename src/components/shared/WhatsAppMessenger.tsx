
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Send, AlertCircle, PhoneCall } from "lucide-react";
import { toast } from "sonner";

export interface WhatsAppMessengerProps {
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
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (!phoneNumber) {
      setError("O número de telefone é obrigatório");
      return;
    }

    if (!message) {
      setError("A mensagem é obrigatória");
      return;
    }

    // Validar formato do número de telefone
    const phoneRegex = /^\d{10,15}$/;
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      setError("Formato de telefone inválido. Use apenas números (DDD + número)");
      return;
    }

    setSending(true);
    setError(null);

    try {
      // Simular envio de mensagem (em um ambiente real, isto seria uma chamada à API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Em uma aplicação real, você faria uma chamada para a API real aqui
      // Exemplo simulado:
      // const response = await fetch(`${baseUrl}/message/text`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'apikey': apiKey
      //   },
      //   body: JSON.stringify({
      //     instance,
      //     to: cleanPhone,
      //     message: message
      //   })
      // });
      // const data = await response.json();
      
      // Simulação de sucesso
      toast.success("Mensagem enviada com sucesso!");
      setMessage(''); // Limpar a mensagem após envio
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
      setError("Erro ao enviar mensagem. Por favor, tente novamente.");
    } finally {
      setSending(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remover caracteres não numéricos
    const numericValue = value.replace(/\D/g, '');
    setPhoneNumber(numericValue);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Enviar Mensagem</h3>
        <div className="flex items-center">
          <div className={`h-3 w-3 rounded-full mr-2 ${
            connectionState === 'connected' ? 'bg-green-500' : 
            connectionState === 'loading' ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm text-muted-foreground">
            {connectionState === 'connected' ? 'Conectado' : 
             connectionState === 'loading' ? 'Verificando...' : 'Desconectado'}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onCheckConnection}
            disabled={connectionState === 'loading'}
            className="ml-2"
          >
            {connectionState === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verificar"}
          </Button>
        </div>
      </div>

      {connectionState === 'disconnected' ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            WhatsApp não está conectado. Conecte-se antes de enviar mensagens.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Número de Telefone</Label>
            <div className="flex gap-2">
              <Input
                id="phoneNumber"
                placeholder="Ex: 11999999999"
                value={phoneNumber}
                onChange={(e) => formatPhoneNumber(e.target.value)}
                disabled={sending || connectionState !== 'connected'}
              />
              <Button 
                variant="outline" 
                size="icon" 
                className="flex-shrink-0"
                disabled={sending || connectionState !== 'connected'}
              >
                <PhoneCall className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Digite apenas números (DDD + número)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              placeholder="Digite sua mensagem..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              disabled={sending || connectionState !== 'connected'}
              className="resize-none"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full"
            onClick={handleSendMessage}
            disabled={sending || !phoneNumber || !message || connectionState !== 'connected'}
          >
            {sending ? (
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
        </>
      )}
    </div>
  );
};

export default WhatsAppMessenger;
