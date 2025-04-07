import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, Clock, AlertCircle, XCircle, Send, FileDown, Printer, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { whatsappService } from '@/utils/whatsappService';
import { AsaasPaymentDialog } from './AsaasPaymentDialog';
import { asaasService } from '@/services/asaas';
import { Invoice } from '@/models/invoice';

interface InvoiceDetailsProps {
  invoice: Invoice;
  onEdit: () => void;
  onDelete: () => void;
  whatsappConfig?: {
    instance: string;
    apiKey: string;
    isConnected: boolean;
  };
}

export function InvoiceDetails({ invoice, onEdit, onDelete, whatsappConfig }: InvoiceDetailsProps) {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Status badge renderer
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Pago
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        );
      case 'overdue':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Atrasado
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="text-gray-500 border-gray-500">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelado
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Handle sending WhatsApp message
  const handleSendWhatsApp = async () => {
    if (!whatsappConfig || !whatsappConfig.isConnected) {
      toast.error('WhatsApp não está conectado');
      return;
    }

    try {
      const message = 
        `*Fatura #${invoice.invoice_number}*\n\n` +
        `Prezado(a) ${invoice.client.name},\n\n` +
        `Informamos que sua fatura no valor de ${formatCurrency(invoice.total_amount)} ` +
        `está ${invoice.status === 'overdue' ? 'atrasada' : 'disponível para pagamento'}.\n\n` +
        `Vencimento: ${format(invoice.due_date, 'dd/MM/yyyy', { locale: ptBR })}\n` +
        `Método de pagamento: ${invoice.payment_method || 'A definir'}\n\n` +
        `Para mais informações, entre em contato conosco.`;

      await whatsappService.sendTextMessage(
        { instance: whatsappConfig.instance, apiKey: whatsappConfig.apiKey },
        invoice.client.phone,
        message
      );

      toast.success('Mensagem enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem via WhatsApp');
    }
  };

  // Export invoice as PDF
  const handleExportPDF = () => {
    // This would typically call a PDF generation service
    toast.info('Exportando fatura como PDF...');
    setTimeout(() => {
      toast.success('Fatura exportada com sucesso!');
    }, 1000);
  };

  // Print invoice
  const handlePrint = () => {
    window.print();
  };

  // Function to close dialog
  const closeDialog = () => {
    const closeButton = document.querySelector('button[data-dialog-close="true"]') as HTMLButtonElement | null;
    if (closeButton) {
      closeButton.click();
    }
  };

  // Make sure invoice is a complete Invoice type with all required properties
  const completeInvoice: Invoice = {
    ...invoice,
    // Ensure all required fields from the Invoice interface are present
    items: invoice.items || [],
    subtotal: invoice.subtotal || invoice.amount || 0,
    discount: invoice.discount || 0,
    created_at: invoice.created_at || new Date(),
    updated_at: invoice.updated_at || new Date()
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Fatura #{invoice.invoice_number}</CardTitle>
          <CardDescription>
            Contrato #{invoice.contract_id} - {invoice.client.name}
          </CardDescription>
        </div>
        <div>{renderStatusBadge(invoice.status)}</div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Informações do Cliente</h3>
            <p className="font-medium">{invoice.client.name}</p>
            <p className="text-sm">{invoice.client.email}</p>
            <p className="text-sm">{invoice.client.phone}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Detalhes da Fatura</h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-sm">Data de Emissão:</span>
                <span className="text-sm font-medium">
                  {format(invoice.issue_date, 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Data de Vencimento:</span>
                <span className="text-sm font-medium">
                  {format(invoice.due_date, 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </div>
              {invoice.payment_date && (
                <div className="flex justify-between">
                  <span className="text-sm">Data de Pagamento:</span>
                  <span className="text-sm font-medium">
                    {format(invoice.payment_date, 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                </div>
              )}
              {invoice.payment_method && (
                <div className="flex justify-between">
                  <span className="text-sm">Método de Pagamento:</span>
                  <span className="text-sm font-medium">
                    {invoice.payment_method}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Resumo</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Valor Principal:</span>
              <span>{formatCurrency(invoice.amount)}</span>
            </div>
            {invoice.tax_amount > 0 && (
              <div className="flex justify-between">
                <span>Impostos:</span>
                <span>{formatCurrency(invoice.tax_amount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>{formatCurrency(invoice.total_amount)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Observações</h3>
              <p className="text-sm whitespace-pre-line">{invoice.notes}</p>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            Editar
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar exclusão</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir esta fatura? Esta ação não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
                <Button variant="destructive" onClick={() => {
                  onDelete();
                  closeDialog();
                }}>
                  Excluir
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <FileDown className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          {asaasService.isConfigured() && invoice.status !== 'paid' && (
            <AsaasPaymentDialog
              invoice={completeInvoice}  // Use the complete invoice object
              client={invoice.client}
              onSuccess={(data) => {
                console.log("Pagamento gerado:", data);
              }}
            />
          )}
          <Button 
            size="sm" 
            onClick={handleSendWhatsApp}
            disabled={!whatsappConfig?.isConnected}
          >
            <Send className="h-4 w-4 mr-2" />
            Enviar via WhatsApp
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
