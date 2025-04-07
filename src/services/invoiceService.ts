
import { Invoice } from '@/models/invoice';
import { mockDataService } from './mockDataService';
import { asaasService } from './asaas';

/**
 * Service for managing invoices
 * Uses mockDataService instead of PHP API
 */
export const invoiceService = {
  getInvoices: async (): Promise<Invoice[]> => {
    try {
      return await mockDataService.getInvoices();
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  },

  getInvoice: async (id: string): Promise<Invoice> => {
    try {
      const invoice = await mockDataService.getInvoice(id);
      if (!invoice) {
        throw new Error(`Invoice with ID ${id} not found`);
      }
      return invoice;
    } catch (error) {
      console.error(`Error fetching invoice ${id}:`, error);
      throw error;
    }
  },

  createInvoice: async (invoiceData: any): Promise<Invoice> => {
    try {
      // Calculate total_amount if not provided
      if (!invoiceData.total_amount && invoiceData.amount && invoiceData.tax_amount) {
        invoiceData.total_amount = parseFloat(invoiceData.amount) + parseFloat(invoiceData.tax_amount);
      }
      
      return await mockDataService.createInvoice(invoiceData);
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  },

  updateInvoice: async (id: string, invoiceData: any): Promise<Invoice> => {
    try {
      // Calculate total_amount if not provided
      if (!invoiceData.total_amount && invoiceData.amount && invoiceData.tax_amount) {
        invoiceData.total_amount = parseFloat(invoiceData.amount) + parseFloat(invoiceData.tax_amount);
      }
      
      const updatedInvoice = await mockDataService.updateInvoice(id, invoiceData);
      if (!updatedInvoice) {
        throw new Error(`Invoice with ID ${id} not found`);
      }
      return updatedInvoice;
    } catch (error) {
      console.error(`Error updating invoice ${id}:`, error);
      throw error;
    }
  },

  deleteInvoice: async (id: string): Promise<boolean> => {
    try {
      const result = await mockDataService.deleteInvoice(id);
      if (!result) {
        throw new Error(`Invoice with ID ${id} not found or could not be deleted`);
      }
      return true;
    } catch (error) {
      console.error(`Error deleting invoice ${id}:`, error);
      throw error;
    }
  },

  // Additional methods as needed
  generateInvoicePdf: async (id: string): Promise<string> => {
    try {
      // Mock PDF generation - in a real app this would create a PDF
      console.log(`Generating PDF for invoice ${id}`);
      // Return a mock URL
      return `data:application/pdf;base64,JVBERi0xLjMKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1IDAgUiAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0KeAFLSc00UlAoSyx`;
    } catch (error) {
      console.error(`Error generating PDF for invoice ${id}:`, error);
      throw error;
    }
  },

  sendInvoiceByEmail: async (id: string, email: string): Promise<boolean> => {
    try {
      // Mock email sending - in a real app this would send an email
      console.log(`Sending invoice ${id} to ${email}`);
      return true;
    } catch (error) {
      console.error(`Error sending invoice ${id} by email:`, error);
      throw error;
    }
  },

  // New method for creating Asaas payments
  createAsaasPayment: async (invoice: Invoice, client: any): Promise<any> => {
    try {
      console.log(`Creating Asaas payment for invoice ${invoice.invoice_number}`);
      
      if (!asaasService.isConfigured()) {
        throw new Error("Asaas service is not configured");
      }
      
      // Mock Asaas payment creation
      // In a real app, this would integrate with the Asaas API
      const paymentType = "PIX"; // Default to PIX
      
      const paymentResponse = {
        payment_id: `pay_${Date.now()}`,
        status: "PENDING",
        value: invoice.total_amount,
        payment_type: paymentType,
        payment_info: {
          encodedImage: "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",
          payload: "00020101021226790014br.gov.bcb.pix2557invoice-payment1234567890304050.015802BR5925Recipient Name6009SAO PAULO62070503***6304D23C",
          bankSlipUrl: "https://www.asaas.com/boleto/123456789",
          identificationField: "23793381286008322959"
        }
      };
      
      return paymentResponse;
    } catch (error) {
      console.error("Error creating Asaas payment:", error);
      throw error;
    }
  }
};
