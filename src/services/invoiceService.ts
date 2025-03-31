
import { Invoice, InvoiceFormData } from '@/models/invoice';
import { Client } from '@/models/client';
import { invoiceDataService } from './invoiceDataService';
import { invoiceExportService } from './invoiceExportService';
import { asaasService, AsaasPaymentsResponse, AsaasPayment } from './asaasService';

// Re-export the invoice service functionality from its modules
export type { Invoice, InvoiceFormData } from '@/models/invoice';

interface AsaasPaymentResponse {
  id: string;
  status: string;
  dueDate: string;
  value: number;
  description: string;
  bankSlipUrl?: string;
}

interface AsaasPixQrCodeResponse {
  encodedImage: string;
  payload: string;
  expirationDate: string;
}

interface AsaasPaymentResult {
  payment_id: string;
  status: string;
  due_date: string;
  value: number;
  description: string;
  payment_type: 'PIX' | 'BOLETO';
  payment_info: AsaasPixQrCodeResponse | { bankSlipUrl?: string; identificationField?: string };
  company_id?: string;
  company_name?: string;
}

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
  async createAsaasPayment(invoice: Invoice, client: Client, paymentType: 'PIX' | 'BOLETO'): Promise<AsaasPaymentResult> {
    try {
      if (!asaasService.isConfigured()) {
        throw new Error('API Asaas não configurada');
      }
      
      // Obtém a configuração atual para identificar a empresa
      const config = asaasService.getConfig();
      
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
      
      let paymentInfo;
      
      // Gera informações específicas do tipo de pagamento
      if (paymentType === 'PIX') {
        paymentInfo = await asaasService.getPixQrCode(payment.id);
      } else {
        // Para boleto, obtém a URL e a linha digitável
        const identificationField = await asaasService.getBoletoIdentificationField(payment.id);
        paymentInfo = { 
          bankSlipUrl: payment.bankSlipUrl,
          identificationField
        };
      }
      
      // Retorna os detalhes do pagamento
      return {
        payment_id: payment.id,
        status: payment.status,
        due_date: payment.dueDate,
        value: payment.value,
        description: payment.description,
        payment_type: paymentType,
        payment_info: paymentInfo,
        company_id: config.companyId,
        company_name: config.companyName
      };
    } catch (error) {
      console.error('Erro ao criar pagamento no Asaas:', error);
      throw error;
    }
  },
  
  /**
   * Consulta pagamentos por filtros
   */
  async findPayments(filters: {
    reference?: string;
    customer?: string;
    billingType?: string;
    status?: string;
  }): Promise<AsaasPaymentsResponse> {
    try {
      if (!asaasService.isConfigured()) {
        throw new Error('API Asaas não configurada');
      }
      
      // Constrói a query string para a busca
      const queryParams = Object.entries(filters)
        .filter(([_, value]) => value && value !== 'ALL')
        .map(([key, value]) => {
          // Mapeia as chaves para os nomes de parâmetros da API Asaas
          const paramMap: Record<string, string> = {
            reference: 'externalReference',
            customer: 'customer',
            billingType: 'billingType',
            status: 'status'
          };
          
          return `${paramMap[key] || key}=${value}`;
        });
      
      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      
      // Busca os pagamentos
      return await asaasService.getPayments(queryString);
    } catch (error) {
      console.error('Erro ao consultar pagamentos:', error);
      throw error;
    }
  }
};
