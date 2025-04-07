
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, QrCode } from "lucide-react";
import { toast } from "sonner";

export interface WhatsAppQRCodeProps {
  baseUrl: string;
  defaultApiKey: string;
  defaultInstance: string;
  onConnect: () => void;
  onConfigChange: (config: { baseUrl: string; apiKey: string; instance: string }) => void;
}

const WhatsAppQRCode: React.FC<WhatsAppQRCodeProps> = ({
  baseUrl,
  defaultApiKey,
  defaultInstance,
  onConnect,
  onConfigChange
}) => {
  const [apiKey, setApiKey] = useState(defaultApiKey);
  const [instance, setInstance] = useState(defaultInstance);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [baseUrlState, setBaseUrlState] = useState(baseUrl);

  useEffect(() => {
    // Atualizar estado se as props mudarem
    setApiKey(defaultApiKey);
    setInstance(defaultInstance);
    setBaseUrlState(baseUrl);
  }, [defaultApiKey, defaultInstance, baseUrl]);

  const generateQRCode = async () => {
    if (!apiKey) {
      setError("A chave de API é obrigatória");
      return;
    }

    if (!instance) {
      setError("O nome da instância é obrigatório");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Simulando a geração do QR code (em um ambiente real, isto seria uma chamada à API)
      // Simular uma operação assíncrona
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Em uma aplicação real, você faria uma chamada para a API real aqui
      // Exemplo simulado:
      // const response = await fetch(`${baseUrlState}/instance/connect?key=${apiKey}&instance=${instance}`);
      // const data = await response.json();
      
      // Simulação de sucesso - em um ambiente real você usaria a URL retornada pela API
      const fakeQrUrl = "data:image/png;base64,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";
      setQrCodeUrl(fakeQrUrl);
      onConfigChange({ baseUrl: baseUrlState, apiKey, instance });
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error);
      setError("Erro ao gerar QR Code. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    // Simular conexão bem-sucedida após escanear QR code
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setQrCodeUrl(null);
      onConnect();
      toast.success("WhatsApp conectado com sucesso!");
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">Chave de API</Label>
            <Input
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              type="password"
              placeholder="Sua chave de API"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="instance">Nome da Instância</Label>
            <Input
              id="instance"
              value={instance}
              onChange={(e) => setInstance(e.target.value)}
              placeholder="Ex: sistema-xyz123"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="baseUrl">URL Base da API</Label>
            <Input
              id="baseUrl"
              value={baseUrlState}
              onChange={(e) => setBaseUrlState(e.target.value)}
              placeholder="https://evolutionapi.gpstracker-16.com.br"
              disabled={loading}
            />
          </div>

          <Button
            onClick={generateQRCode}
            disabled={loading || !apiKey || !instance}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando QR Code...
              </>
            ) : (
              <>
                <QrCode className="mr-2 h-4 w-4" />
                Gerar QR Code
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        
        {qrCodeUrl && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Card className="w-full">
              <CardContent className="p-4 flex flex-col items-center">
                <p className="mb-2 text-sm text-muted-foreground">Escaneie o QR Code com o WhatsApp</p>
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code WhatsApp" 
                  className="w-48 h-48"
                />
                <Button
                  onClick={handleConnect}
                  className="mt-4"
                  variant="secondary"
                >
                  Já escaneei o QR Code
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppQRCode;
