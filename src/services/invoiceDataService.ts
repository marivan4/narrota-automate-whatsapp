
import { toast } from 'sonner';
import { createDatabaseConnection } from '@/utils/database';
import { Invoice, InvoiceFormData } from '@/models/invoice';
import { invoicesData } from '@/data/mockInvoices';

export const invoiceDataService = {
  // Get all invoices
  getInvoices: async (): Promise<Invoice[]> => {
    try {
      await createDatabaseConnection();
      // In a real implementation, this would fetch from a database
      return invoicesData;
    } catch (error) {
      console.error('Erro ao buscar faturas:', error);
      toast.error('Erro ao buscar faturas');
      return [];
    }
  },

  // Get invoice by ID
  getInvoiceById: async (id: string): Promise<Invoice | null> => {
    try {
      await createDatabaseConnection();
      // In a real implementation, this would fetch from a database
      const invoice = invoicesData.find(inv => inv.id === id);
      return invoice || null;
    } catch (error) {
      console.error('Erro ao buscar fatura:', error);
      toast.error('Erro ao buscar detalhes da fatura');
      return null;
    }
  },

  // Create new invoice
  createInvoice: async (data: InvoiceFormData): Promise<Invoice | null> => {
    try {
      await createDatabaseConnection();
      // In a real implementation, this would save to a database
      const newInvoice: Invoice = {
        id: `INV-${String(invoicesData.length + 1).padStart(3, '0')}`,
        invoice_number: data.invoice_number,
        contract_id: data.contract_id,
        issue_date: data.issue_date,
        due_date: data.due_date,
        amount: data.amount,
        tax_amount: data.tax_amount || 0,
        total_amount: data.amount + (data.tax_amount || 0),
        status: data.status,
        payment_date: data.payment_date,
        payment_method: data.payment_method,
        notes: data.notes,
        client: {
          // In a real implementation, this would be fetched based on the contract
          id: 'CUST-999',
          name: 'Cliente Novo',
          email: 'cliente@exemplo.com',
          phone: '11999999999',
        },
        created_at: new Date(),
        updated_at: new Date(),
      };

      invoicesData.push(newInvoice);
      return newInvoice;
    } catch (error) {
      console.error('Erro ao criar fatura:', error);
      toast.error('Erro ao criar fatura');
      return null;
    }
  },

  // Update invoice
  updateInvoice: async (id: string, data: Partial<InvoiceFormData>): Promise<Invoice | null> => {
    try {
      await createDatabaseConnection();
      // In a real implementation, this would update in a database
      const index = invoicesData.findIndex(inv => inv.id === id);
      if (index === -1) return null;

      const updatedInvoice: Invoice = {
        ...invoicesData[index],
        ...(data.invoice_number !== undefined && { invoice_number: data.invoice_number }),
        ...(data.contract_id !== undefined && { contract_id: data.contract_id }),
        ...(data.issue_date !== undefined && { issue_date: data.issue_date }),
        ...(data.due_date !== undefined && { due_date: data.due_date }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.tax_amount !== undefined && { tax_amount: data.tax_amount }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.payment_date !== undefined && { payment_date: data.payment_date }),
        ...(data.payment_method !== undefined && { payment_method: data.payment_method }),
        ...(data.notes !== undefined && { notes: data.notes }),
        total_amount: (data.amount !== undefined ? data.amount : invoicesData[index].amount) + 
                      (data.tax_amount !== undefined ? data.tax_amount : invoicesData[index].tax_amount),
        updated_at: new Date()
      };

      invoicesData[index] = updatedInvoice;
      return updatedInvoice;
    } catch (error) {
      console.error('Erro ao atualizar fatura:', error);
      toast.error('Erro ao atualizar fatura');
      return null;
    }
  },

  // Delete invoice
  deleteInvoice: async (id: string): Promise<boolean> => {
    try {
      await createDatabaseConnection();
      // In a real implementation, this would delete from a database
      const initialLength = invoicesData.length;
      const newInvoicesData = invoicesData.filter(inv => inv.id !== id);
      
      // Update the reference
      invoicesData.length = 0;
      invoicesData.push(...newInvoicesData);
      
      return initialLength > invoicesData.length;
    } catch (error) {
      console.error('Erro ao excluir fatura:', error);
      toast.error('Erro ao excluir fatura');
      return false;
    }
  },
};
