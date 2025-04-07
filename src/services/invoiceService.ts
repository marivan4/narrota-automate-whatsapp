
import { Invoice } from '@/models/invoice';
import { mockDataService } from './mockDataService';

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
  }
};
