
import { Invoice, InvoiceFormData } from '@/models/invoice';
import { invoiceDataService } from './invoiceDataService';
import { invoiceExportService } from './invoiceExportService';
import { asaasService } from './asaasService';

// Re-export the invoice service functionality from its modules
export type { Invoice, InvoiceFormData } from '@/models/invoice';

export const invoiceService = {
  // Data operations
  getInvoices: invoiceDataService.getInvoices,
  getInvoiceById: invoiceDataService.getInvoiceById,
  createInvoice: invoiceDataService.createInvoice,
  updateInvoice: invoiceDataService.updateInvoice,
  deleteInvoice: invoiceDataService.deleteInvoice,
  
  // Export operations
  exportToCSV: invoiceExportService.exportToCSV,
  
  // Asaas integration
  async createAsaasPayment(invoice: Invoice, client: any, paymentType: 'PIX' | 'BOLETO') {
    try {
      if (!asaasService.isConfigured()) {
        throw new Error('API Asaas não configurada');
      }
      
      // Verifica se o cliente já está sincronizado com o Asaas
      let asaasCustomerId = client.asaas_id;
      
      // Se não estiver, sincroniza o cliente
      if (!asaasCustomerId) {
        asaasCustomerId = await asaasService.syncCustomer(client);
        // Aqui seria ideal atualizar o cliente no banco de dados
        // com o ID do Asaas, mas como estamos trabalhando com dados
        // simulados, vamos apenas logar a informação
        console.log(`Cliente sincronizado com Asaas: ${asaasCustomerId}`);
      }
      
      // Cria o pagamento
      const payment = await asaasService.createPayment(
        invoice, 
        { ...client, asaas_id: asaasCustomerId }, 
        paymentType
      );
      
      // Retorna os detalhes do pagamento
      return {
        payment_id: payment.id,
        status: payment.status,
        due_date: payment.dueDate,
        value: payment.value,
        description: payment.description,
        payment_type: paymentType,
        // Depende do tipo de pagamento
        payment_info: paymentType === 'PIX' 
          ? await asaasService.getPixQrCode(payment.id)
          : { bankSlipUrl: payment.bankSlipUrl }
      };
    } catch (error) {
      console.error('Erro ao criar pagamento no Asaas:', error);
      throw error;
    }
  }
};
