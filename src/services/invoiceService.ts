// Assuming the invoiceService file might import asaasService
// Import from the new path
import { asaasService } from '@/services/asaas';
import { Invoice, InvoiceFormData } from '@/models/invoice';
import { Client } from '@/models/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const invoiceService = {
  getInvoices: async (): Promise<Invoice[]> => {
    const response = await fetch(`${API_URL}/api/invoices`);
    if (!response.ok) {
      throw new Error('Failed to fetch invoices');
    }
    return await response.json();
  },

  getInvoiceById: async (id: string): Promise<Invoice> => {
    const response = await fetch(`${API_URL}/api/invoices/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch invoice');
    }
    return await response.json();
  },

  createInvoice: async (data: InvoiceFormData): Promise<Invoice> => {
    const response = await fetch(`${API_URL}/api/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create invoice');
    }
    return await response.json();
  },

  updateInvoice: async (id: string, data: InvoiceFormData): Promise<Invoice> => {
    const response = await fetch(`${API_URL}/api/invoices/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update invoice');
    }
    return await response.json();
  },

  deleteInvoice: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/api/invoices/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete invoice');
    }
  },

  // Asaas integration
  createAsaasPayment: async (invoice: Invoice, client: Client, paymentType: 'PIX' | 'BOLETO'): Promise<any> => {
    try {
      // 1. Sync client with Asaas
      const asaas_id = await asaasService.syncCustomer(client);
      
      // Update client's asaas_id if sync was successful
      if (asaas_id) {
        client.asaas_id = asaas_id;
      }

      // 2. Create payment in Asaas
      const payment = await asaasService.createPayment(invoice, client, paymentType);

      // 3. Get payment info based on payment type
      let payment_info;
      if (paymentType === 'PIX') {
        payment_info = await asaasService.getPixQrCode(payment.id);
      } else {
        const bankSlipUrl = await asaasService.getBoletoUrl(payment.id);
        const identificationField = await asaasService.getBoletoIdentificationField(payment.id);
        payment_info = {
          bankSlipUrl: bankSlipUrl,
          identificationField: identificationField
        };
      }

      return {
        payment_id: payment.id,
        status: payment.status,
        value: payment.value,
        payment_info: payment_info
      };
    } catch (error: any) {
      console.error("Erro ao criar pagamento Asaas:", error);
      throw new Error(error.message || 'Failed to create Asaas payment');
    }
  },
};
