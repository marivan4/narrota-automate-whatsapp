
import { Invoice, InvoiceFormData } from '@/models/invoice';
import { Client } from '@/models/client';
import { invoiceDataService } from './invoiceDataService';
import { invoiceExportService } from './invoiceExportService';
import { asaasService, AsaasPayment, AsaasPaymentsResponse, AsaasPixQrCodeResponse } from './asaas';

// Re-export the invoice service functionality from its modules
export type { Invoice, InvoiceFormData } from '@/models/invoice';

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
      
      // Get current configuration to identify the company
      const config = asaasService.getConfig();
      
      // Check if the client is already synchronized with Asaas
      let asaasCustomerId = client.asaas_id;
      
      // If not, synchronize the client
      if (!asaasCustomerId) {
        asaasCustomerId = await asaasService.syncCustomer(client);
        // Ideally we would update the client in the database
        // with the Asaas ID, but since we're working with simulated data,
        // we'll just log the information
        console.log(`Cliente sincronizado com Asaas: ${asaasCustomerId}`);
      }
      
      // Create the payment
      const payment = await asaasService.createPayment(
        invoice, 
        { ...client, asaas_id: asaasCustomerId }, 
        paymentType
      );
      
      let paymentInfo;
      
      // Generate specific payment type information
      if (paymentType === 'PIX') {
        paymentInfo = await asaasService.getPixQrCode(payment.id);
      } else {
        // For boleto, get URL and the identification field
        const identificationField = await asaasService.getBoletoIdentificationField(payment.id);
        paymentInfo = { 
          bankSlipUrl: payment.bankSlipUrl,
          identificationField
        };
      }
      
      // Return payment details
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
   * Find payments by filters
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
      
      // Build query string for search
      const queryParams = Object.entries(filters)
        .filter(([_, value]) => value && value !== 'ALL')
        .map(([key, value]) => {
          // Map keys to Asaas API parameter names
          const paramMap: Record<string, string> = {
            reference: 'externalReference',
            customer: 'customer',
            billingType: 'billingType',
            status: 'status'
          };
          
          return `${paramMap[key] || key}=${value}`;
        });
      
      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      
      // Get payments
      return await asaasService.getPayments(queryString);
    } catch (error) {
      console.error('Erro ao consultar pagamentos:', error);
      throw error;
    }
  }
};
