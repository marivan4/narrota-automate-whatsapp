// Import from the new path
import { asaasService } from '@/services/asaas';
import { InvoiceFormData } from '@/models/invoice';
import { Client } from '@/models/client';
import { Invoice } from '@/models/invoice'; // Import Invoice from models
import { PHP_DB_CONFIG, executeQuery } from '@/utils/database';
import { toast } from 'sonner';

// Use import.meta.env instead of process.env for Vite
const API_URL = import.meta.env.VITE_API_URL || '';

export const invoiceService = {
  getInvoices: async (): Promise<Invoice[]> => {
    // Check if API_URL is configured, otherwise throw clear error
    if (!API_URL) {
      console.log("API URL not configured, checking database connection");
      try {
        // Try database connection directly if API_URL is not available
        const queryResult = await executeQuery("SELECT * FROM invoices ORDER BY due_date DESC");
        if (queryResult && queryResult.data) {
          return queryResult.data;
        }
        throw new Error('Não foi possível obter dados de faturas do banco de dados');
      } catch (dbError) {
        console.error("Database error:", dbError);
        toast.error("Erro ao buscar faturas do banco de dados");
        throw new Error(`Configuração de API/Banco de dados incorreta. Configure a variável de ambiente VITE_API_URL ou verifique a conexão com o banco de dados.`);
      }
    }
    
    try {
      const response = await fetch(`${API_URL}/api/invoices`);
      if (!response.ok) {
        throw new Error(`Falha ao buscar faturas: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      toast.error("Erro ao buscar faturas da API");
      throw error;
    }
  },

  getInvoiceById: async (id: string): Promise<Invoice> => {
    if (!API_URL) {
      throw new Error('API URL não configurada. Configure a variável de ambiente VITE_API_URL.');
    }
    
    const response = await fetch(`${API_URL}/api/invoices/${id}`);
    if (!response.ok) {
      throw new Error(`Falha ao buscar fatura: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  },

  createInvoice: async (data: InvoiceFormData): Promise<Invoice> => {
    if (!API_URL) {
      throw new Error('API URL não configurada. Configure a variável de ambiente VITE_API_URL.');
    }
    
    const response = await fetch(`${API_URL}/api/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Falha ao criar fatura: ${errorText}`);
    }
    return await response.json();
  },

  updateInvoice: async (id: string, data: InvoiceFormData): Promise<Invoice> => {
    if (!API_URL) {
      throw new Error('API URL não configurada. Configure a variável de ambiente VITE_API_URL.');
    }
    
    const response = await fetch(`${API_URL}/api/invoices/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Falha ao atualizar fatura: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  },

  deleteInvoice: async (id: string): Promise<void> => {
    if (!API_URL) {
      throw new Error('API URL não configurada. Configure a variável de ambiente VITE_API_URL.');
    }
    
    const response = await fetch(`${API_URL}/api/invoices/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Falha ao excluir fatura: ${response.status} ${response.statusText}`);
    }
  },

  // Asaas integration - updated with better error handling
  createAsaasPayment: async (invoice: Invoice, client: Client, paymentType: 'PIX' | 'BOLETO'): Promise<any> => {
    try {
      console.log("Creating Asaas payment for invoice:", invoice.invoice_number);
      
      // 1. Sync client with Asaas
      console.log("Syncing customer with Asaas:", client.name);
      const asaas_id = await asaasService.syncCustomer(client);
      
      // Update client's asaas_id if sync was successful
      if (asaas_id) {
        client.asaas_id = asaas_id;
        console.log("Customer synced with Asaas ID:", asaas_id);
      }

      // 2. Create payment in Asaas
      console.log("Creating payment with type:", paymentType);
      const payment = await asaasService.createPayment(invoice, client, paymentType);
      console.log("Payment created:", payment.id);

      // 3. Get payment info based on payment type
      let payment_info;
      if (paymentType === 'PIX') {
        console.log("Getting PIX QR Code for payment:", payment.id);
        payment_info = await asaasService.getPixQrCode(payment.id);
      } else {
        console.log("Getting Boleto info for payment:", payment.id);
        const bankSlipUrl = await asaasService.getBoletoUrl(payment.id);
        const identificationField = await asaasService.getBoletoIdentificationField(payment.id);
        payment_info = {
          bankSlipUrl: bankSlipUrl,
          identificationField: identificationField
        };
      }

      console.log("Payment process completed successfully");
      return {
        payment_id: payment.id,
        status: payment.status,
        value: payment.value,
        payment_info: payment_info
      };
    } catch (error: any) {
      console.error("Erro ao criar pagamento Asaas:", error);
      toast.error(error.message || 'Falha ao criar pagamento Asaas');
      throw new Error(error.message || 'Falha ao criar pagamento Asaas');
    }
  },

  // Export invoices to CSV
  exportToCSV: async (): Promise<string> => {
    // Get invoices data from the actual API instead of mocks
    const invoices = await invoiceService.getInvoices();
    
    // Create CSV headers
    const headers = [
      'ID',
      'Número da Fatura',
      'ID do Contrato',
      'Cliente',
      'Data de Emissão',
      'Data de Vencimento',
      'Valor',
      'Impostos',
      'Total',
      'Status',
      'Data de Pagamento',
      'Método de Pagamento'
    ].join(',');
    
    // Format dates
    const formatDate = (date?: Date | string): string => {
      if (!date) return '';
      const d = date instanceof Date ? date : new Date(date);
      return !isNaN(d.getTime()) ? d.toLocaleDateString('pt-BR') : '';
    };

    // Create CSV rows
    const rows = invoices.map(invoice => [
      invoice.id,
      invoice.invoice_number,
      invoice.contract_id,
      invoice.client?.name || '',
      formatDate(invoice.issue_date),
      formatDate(invoice.due_date),
      invoice.amount.toFixed(2).replace('.', ','),
      invoice.tax_amount.toFixed(2).replace('.', ','),
      invoice.total_amount.toFixed(2).replace('.', ','),
      invoice.status,
      formatDate(invoice.payment_date),
      invoice.payment_method || ''
    ].join(','));

    // Combine headers and rows
    return [headers, ...rows].join('\n');
  }
};

// Re-export the Invoice type from models - using 'export type' for isolatedModules compatibility
export type { Invoice } from '@/models/invoice';
