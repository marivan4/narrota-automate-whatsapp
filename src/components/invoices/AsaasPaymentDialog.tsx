
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { CreditCard, FileText, QrCode, Loader2 } from "lucide-react";
import { Invoice } from '@/models/invoice';
import { invoiceService } from '@/services/invoiceService';
import { asaasService } from '@/services/asaasService';

interface AsaasPaymentDialogProps {
  invoice: Invoice;
  client: any;
  onSuccess?: (paymentData: any) => void;
}

export function AsaasPaymentDialog({ invoice, client, onSuccess }: AsaasPaymentDialogProps) {
  const [paymentType, setPaymentType] = useState<'PIX' | 'BOLETO'>('PIX');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleGeneratePayment = async () => {
    if (!asaasService.isConfigured()) {
      toast.error("API Asaas não configurada");
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await invoiceService.createAsaasPayment(invoice, client, paymentType);
      setPaymentData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      toast.success(`Pagamento via ${paymentType === 'PIX' ? 'PIX' : 'Boleto'} gerado com sucesso!`);
    } catch (error) {
      console.error("Erro ao gerar pagamento:", error);
      toast.error("Erro ao gerar pagamento. Verifique os dados e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <CreditCard className="mr-2 h-4 w-4" />
          Gerar Pagamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gerar Pagamento - Fatura #{invoice.invoice_number}</DialogTitle>
          <DialogDescription>
            Gere um pagamento via PIX ou Boleto Bancário para esta fatura.
          </DialogDescription>
        </DialogHeader>

        {!paymentData ? (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Detalhes da Fatura</h3>
                <p className="text-sm text-muted-foreground">
                  Cliente: {client.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Valor: {formatCurrency(invoice.total_amount)}
                </p>
              </div>

              <RadioGroup
                value={paymentType}
                onValueChange={(value) => setPaymentType(value as 'PIX' | 'BOLETO')}
                className="grid grid-cols-2 gap-4"
              >
                <Label
                  htmlFor="pix-option"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                >
                  <RadioGroupItem
                    value="PIX"
                    id="pix-option"
                    className="sr-only"
                  />
                  <QrCode className="mb-3 h-6 w-6" />
                  <span className="text-center">PIX</span>
                </Label>
                <Label
                  htmlFor="boleto-option"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                >
                  <RadioGroupItem
                    value="BOLETO"
                    id="boleto-option"
                    className="sr-only"
                  />
                  <FileText className="mb-3 h-6 w-6" />
                  <span className="text-center">Boleto</span>
                </Label>
              </RadioGroup>
            </div>

            <DialogFooter>
              <Button
                onClick={handleGeneratePayment}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  'Gerar Pagamento'
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="space-y-6">
            {paymentType === 'PIX' ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-md">
                  <img 
                    src={`data:image/png;base64,${paymentData.payment_info.encodedImage}`}
                    alt="QR Code PIX"
                    className="w-40 h-40"
                  />
                </div>
                <div className="space-y-2 w-full">
                  <p className="text-sm font-medium">Código PIX Copia e Cola:</p>
                  <div className="flex">
                    <textarea
                      readOnly
                      className="w-full text-xs p-2 border rounded h-24"
                      value={paymentData.payment_info.payload}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={() => {
                        navigator.clipboard.writeText(paymentData.payment_info.payload);
                        toast.success("Código PIX copiado!");
                      }}
                    >
                      Copiar
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Button 
                    variant="outline"
                    onClick={() => window.open(paymentData.payment_info.bankSlipUrl, '_blank')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Visualizar Boleto
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Linha Digitável:</p>
                  <div className="flex">
                    <input
                      readOnly
                      className="w-full text-xs p-2 border rounded"
                      value={paymentData.payment_info.identificationField || "Carregando..."}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={() => {
                        navigator.clipboard.writeText(paymentData.payment_info.identificationField || "");
                        toast.success("Linha digitável copiada!");
                      }}
                    >
                      Copiar
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2 border-t pt-4">
              <p className="text-sm font-medium">Informações do Pagamento:</p>
              <p className="text-xs text-muted-foreground">ID: {paymentData.payment_id}</p>
              <p className="text-xs text-muted-foreground">Status: {paymentData.status}</p>
              <p className="text-xs text-muted-foreground">Valor: {formatCurrency(paymentData.value)}</p>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setPaymentData(null);
                  setIsOpen(false);
                }}
              >
                Fechar
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
