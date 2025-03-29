import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Loader2, Printer, Download, Send, ArrowLeft } from 'lucide-react';
import { mockInvoices } from '@/data/mockInvoices';
import { Invoice } from '@/models/invoice';

const InvoicePrint: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInvoice = async () => {
      setLoading(true);
      try {
        // In a real application, this would be an API call
        // For now, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        
        const foundInvoice = mockInvoices.find(inv => inv.id === id);
        if (foundInvoice) {
          setInvoice(foundInvoice);
        } else {
          toast.error("Fatura não encontrada");
          navigate('/invoices');
        }
      } catch (error) {
        console.error("Error loading invoice:", error);
        toast.error("Erro ao carregar a fatura");
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [id, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    if (!invoice) return;

    try {
      const doc = new jsPDF();
      
      // Add company logo/header
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text("Fatura", 14, 22);
      
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text("GPS Tracker Sistemas de Rastreamento", 14, 32);
      doc.text("CNPJ: 12.345.678/0001-99", 14, 38);
      doc.text("contato@gpstracker.com.br | (11) 5555-5555", 14, 44);
      
      // Add invoice information
      doc.setFontSize(10);
      doc.text(`Fatura #: ${invoice.invoice_number}`, 140, 32);
      doc.text(`Data de Emissão: ${new Date(invoice.issue_date).toLocaleDateString('pt-BR')}`, 140, 38);
      doc.text(`Vencimento: ${new Date(invoice.due_date).toLocaleDateString('pt-BR')}`, 140, 44);
      
      // Add client information
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      doc.text("Cliente:", 14, 60);
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(10);
      doc.text(invoice.client.name, 14, 66);
      doc.text(`CPF/CNPJ: ${invoice.client.document || 'N/A'}`, 14, 72);
      doc.text(`${invoice.client.address || 'Endereço não informado'}`, 14, 78);
      doc.text(`${invoice.client.city || ''}, ${invoice.client.state || ''}, ${invoice.client.zipCode || ''}`, 14, 84);
      doc.text(`Email: ${invoice.client.email}`, 14, 90);
      doc.text(`Telefone: ${invoice.client.phone}`, 14, 96);
      
      // Add status
      const statusText = invoice.status === 'paid' ? 'PAGO' : 
                        invoice.status === 'pending' ? 'PENDENTE' : 
                        invoice.status === 'overdue' ? 'VENCIDO' : 'CANCELADO';
      
      doc.setFontSize(12);
      doc.setTextColor(
        invoice.status === 'paid' ? 0 : 
        invoice.status === 'pending' ? 100 : 
        invoice.status === 'overdue' ? 200 : 100, 
        
        invoice.status === 'paid' ? 150 : 
        invoice.status === 'pending' ? 100 : 
        invoice.status === 'overdue' ? 0 : 100, 
        
        invoice.status === 'paid' ? 0 : 
        invoice.status === 'pending' ? 0 : 
        invoice.status === 'overdue' ? 0 : 100
      );
      doc.text(statusText, 140, 60);
      
      // Add items table
      // @ts-ignore
      doc.autoTable({
        startY: 110,
        head: [['Item', 'Descrição', 'Quantidade', 'Preço Unitário', 'Total']],
        body: (invoice.items || []).map((item: any, index: number) => [
          index + 1,
          item.description,
          item.quantity.toString(),
          `R$ ${item.price.toFixed(2)}`,
          `R$ ${(item.quantity * item.price).toFixed(2)}`
        ]),
        foot: [
          ['', '', '', 'Subtotal:', `R$ ${invoice.amount.toFixed(2)}`],
          ['', '', '', 'Imposto:', `R$ ${invoice.tax_amount.toFixed(2)}`],
          ['', '', '', 'Total:', `R$ ${invoice.total_amount.toFixed(2)}`],
        ],
        theme: 'striped',
        headStyles: {
          fillColor: [60, 60, 60],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        footStyles: {
          fillColor: [240, 240, 240],
          textColor: [80, 80, 80],
          fontStyle: 'bold',
        },
      });
      
      // Add payment information
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      doc.text("Informações de Pagamento:", 14, finalY);
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text("Banco: Banco do Brasil", 14, finalY + 6);
      doc.text("Agência: 1234-5", 14, finalY + 12);
      doc.text("Conta: 12345-6", 14, finalY + 18);
      doc.text("PIX: 12.345.678/0001-99", 14, finalY + 24);
      
      // Add notes
      if (invoice.notes) {
        doc.setFontSize(11);
        doc.setTextColor(40, 40, 40);
        doc.text("Observações:", 14, finalY + 36);
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(invoice.notes, 14, finalY + 42);
      }
      
      // Add footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("Gerado por GPS Tracker Sistema de Rastreamento", 14, 280);
      
      // Save the PDF
      doc.save(`fatura_${invoice.invoice_number.replace(/\//g, '-')}.pdf`);
      toast.success("PDF da fatura gerado com sucesso!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Erro ao gerar o PDF da fatura");
    }
  };

  const handleSendWhatsApp = () => {
    if (!invoice) return;
    
    // In a real app, this would send the invoice via WhatsApp
    toast.success("Enviando fatura por WhatsApp...");
    
    setTimeout(() => {
      toast.success("Fatura enviada por WhatsApp com sucesso!");
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="w-full max-w-3xl p-8 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Carregando fatura...</p>
        </Card>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="w-full max-w-3xl p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Fatura não encontrada</h2>
            <p className="text-muted-foreground mt-2">A fatura solicitada não existe ou foi removida</p>
            <Button className="mt-4" onClick={() => navigate('/invoices')}>
              Voltar para Faturas
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Print-only header */}
      <div className="hidden print:block print:p-4">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold">GPS Tracker</h1>
          <p className="text-sm text-muted-foreground">Sistema de Rastreamento Veicular</p>
        </div>
      </div>
      
      {/* Header with buttons - hidden when printing */}
      <div className="bg-background print:hidden flex items-center justify-between p-4 border-b">
        <Button variant="ghost" onClick={() => navigate('/invoices')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Faturas
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleSendWhatsApp}>
            <Send className="h-4 w-4 mr-2" />
            Enviar por WhatsApp
          </Button>
          <Button variant="outline" onClick={handleDownloadPdf}>
            <Download className="h-4 w-4 mr-2" />
            Baixar PDF
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>
      
      {/* Invoice content */}
      <div className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
        <div className="bg-white rounded-lg shadow-sm print:shadow-none p-6 print:p-0">
          {/* Company and Invoice Info */}
          <div className="flex flex-col md:flex-row justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">GPS Tracker</h1>
              <p className="text-muted-foreground">Sistema de Rastreamento Veicular</p>
              <p className="text-muted-foreground">CNPJ: 12.345.678/0001-99</p>
              <p className="text-muted-foreground">contato@gpstracker.com.br</p>
              <p className="text-muted-foreground">(11) 5555-5555</p>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <h2 className="text-lg font-semibold">Fatura</h2>
              <p className="text-muted-foreground">#{invoice.invoice_number}</p>
              <p className="text-muted-foreground">
                <span className="font-medium">Emissão:</span>{' '}
                {new Date(invoice.issue_date).toLocaleDateString('pt-BR')}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium">Vencimento:</span>{' '}
                {new Date(invoice.due_date).toLocaleDateString('pt-BR')}
              </p>
              <div className="mt-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold ${
                    invoice.status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : invoice.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : invoice.status === 'overdue'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {invoice.status === 'paid'
                    ? 'PAGO'
                    : invoice.status === 'pending'
                    ? 'PENDENTE'
                    : invoice.status === 'overdue'
                    ? 'VENCIDO'
                    : 'CANCELADO'}
                </span>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="mb-8">
            <h3 className="font-semibold mb-2">Cliente</h3>
            <div className="border rounded-md p-4">
              <p className="font-medium">{invoice.client.name}</p>
              <p className="text-muted-foreground">CPF/CNPJ: {invoice.client.document}</p>
              <p className="text-muted-foreground">{invoice.client.address}</p>
              <p className="text-muted-foreground">
                {invoice.client.city}, {invoice.client.state}, {invoice.client.zipCode}
              </p>
              <p className="text-muted-foreground">Email: {invoice.client.email}</p>
              <p className="text-muted-foreground">Telefone: {invoice.client.phone}</p>
            </div>
          </div>

          {/* Items */}
          <div className="mb-8">
            <h3 className="font-semibold mb-2">Itens</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantidade
                    </th>
                    <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preço Unitário
                    </th>
                    <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.id}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.description}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                        R$ {item.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                        R$ {(item.quantity * item.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-8">
            <div className="flex flex-col space-y-2 md:w-64 ml-auto">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>R$ {invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Desconto:</span>
                <span>R$ {invoice.discount.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>R$ {(invoice.subtotal - invoice.discount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mb-8">
            <h3 className="font-semibold mb-2">Informações de Pagamento</h3>
            <div className="border rounded-md p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Banco do Brasil</p>
                  <p className="text-sm text-muted-foreground">Agência: 1234-5</p>
                  <p className="text-sm text-muted-foreground">Conta: 12345-6</p>
                </div>
                <div>
                  <p className="text-sm font-medium">PIX</p>
                  <p className="text-sm text-muted-foreground">CNPJ: 12.345.678/0001-99</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-8">
              <h3 className="font-semibold mb-2">Observações</h3>
              <div className="border rounded-md p-4">
                <p className="text-sm text-muted-foreground">{invoice.notes}</p>
              </div>
            </div>
          )}

          {/* Footer - visible in print as well */}
          <div className="text-center text-xs text-muted-foreground mt-8 pt-8 border-t">
            <p>GPS Tracker - Sistema de Rastreamento Veicular</p>
            <p>CNPJ: 12.345.678/0001-99 | contato@gpstracker.com.br | (11) 5555-5555</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrint;
