import { Invoice, InvoiceFormData } from '@/models/invoice';
import { mockInvoices, invoicesData } from '@/data/mockInvoices';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

/**
 * Service for managing invoices
 * Handles CRUD operations for invoices and connections to backend API
 */
class InvoiceService {
  private apiURL: string;
  private useBackend: boolean;

  constructor() {
    // Determine if we should use the PHP backend or mock data
    this.useBackend = true;
    this.apiURL = `${window.location.origin}/api`;
    
    // For development environments using Vite's dev server
    if (window.location.hostname === 'localhost' && window.location.port !== '') {
      this.apiURL = '/api';
    }
    
    console.log('Invoice service initialized with API URL:', this.apiURL);
  }

  /**
   * Get all invoices
   * Fetches either from backend API or returns mock data if no backend
   */
  async getInvoices(): Promise<Invoice[]> {
    try {
      if (this.useBackend) {
        const response = await fetch(`${this.apiURL}/invoices.php`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          // Format backend data to match frontend model
          return this.formatInvoices(data.data);
        } else {
          console.error('Error fetching invoices:', data.message);
          throw new Error(data.message || 'Failed to fetch invoices');
        }
      }
      
      // Fallback to mock data if backend fails or is disabled
      console.log('Using mock invoice data');
      return [...mockInvoices];
    } catch (error) {
      console.error('Error in getInvoices:', error);
      
      // In case of API failure, return mock data
      console.log('Falling back to mock invoice data due to error');
      return [...mockInvoices];
    }
  }

  /**
   * Format invoices from backend to match frontend model
   */
  private formatInvoices(invoices: any[]): Invoice[] {
    return invoices.map(invoice => {
      // Convert date strings to Date objects
      const issueDate = invoice.issue_date ? new Date(invoice.issue_date) : new Date();
      const dueDate = invoice.due_date ? new Date(invoice.due_date) : new Date();
      const createdAt = invoice.created_at ? new Date(invoice.created_at) : new Date();
      const updatedAt = invoice.updated_at ? new Date(invoice.updated_at) : new Date();
      const paymentDate = invoice.payment_date ? new Date(invoice.payment_date) : undefined;
      
      // Calculate some fields if missing
      const totalAmount = parseFloat(invoice.total_amount) || 0;
      const amount = parseFloat(invoice.amount) || 0;
      const taxAmount = parseFloat(invoice.tax_amount) || 0;
      const discount = parseFloat(invoice.discount) || 0;
      const subtotal = amount || 0;
      
      // Format items if they exist
      let items = [];
      if (invoice.items && Array.isArray(invoice.items)) {
        items = invoice.items.map((item: any) => ({
          id: item.id || uuidv4(),
          description: item.description || '',
          quantity: parseFloat(item.quantity) || 1,
          price: parseFloat(item.price) || 0
        }));
      }
      
      // Format client information
      const client = {
        id: invoice.client_id || '',
        name: invoice.client_name || '',
        email: invoice.client_email || '',
        phone: invoice.client_phone || '',
        document: invoice.client_document || '',
        address: invoice.client_address || '',
        city: invoice.client_city || '',
        state: invoice.client_state || '',
        zipCode: invoice.client_zipcode || ''
      };
      
      return {
        id: invoice.id.toString(),
        invoice_number: invoice.invoice_number || '',
        contract_id: invoice.contract_id || '',
        issue_date: issueDate,
        due_date: dueDate,
        amount: amount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        status: invoice.status as any,
        payment_date: paymentDate,
        payment_method: invoice.payment_method || '',
        notes: invoice.notes || '',
        client: client,
        items: items,
        subtotal: subtotal,
        discount: discount,
        created_at: createdAt,
        updated_at: updatedAt
      };
    });
  }

  /**
   * Get a single invoice by ID
   */
  async getInvoice(id: string): Promise<Invoice | null> {
    try {
      if (this.useBackend) {
        const response = await fetch(`${this.apiURL}/invoices.php?id=${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          // Format the invoice from backend
          const formattedInvoices = this.formatInvoices([data.data]);
          return formattedInvoices[0];
        } else {
          console.error('Error fetching invoice:', data.message);
          throw new Error(data.message || 'Failed to fetch invoice');
        }
      }
      
      // Fallback to mock data
      const mockInvoice = mockInvoices.find(inv => inv.id === id);
      return mockInvoice ? { ...mockInvoice } : null;
    } catch (error) {
      console.error('Error in getInvoice:', error);
      
      // In case of API failure, try to get from mock data
      const mockInvoice = mockInvoices.find(inv => inv.id === id);
      return mockInvoice ? { ...mockInvoice } : null;
    }
  }

  // Alias for getInvoice to maintain compatibility with existing code
  async getInvoiceById(id: string): Promise<Invoice | null> {
    return this.getInvoice(id);
  }

  /**
   * Create a new invoice
   */
  async createInvoice(invoiceData: InvoiceFormData): Promise<Invoice> {
    try {
      if (this.useBackend) {
        // Format data for the backend
        const formattedData = {
          invoice_number: invoiceData.invoice_number,
          contract_id: invoiceData.contract_id,
          client_id: invoiceData.client_id,
          issue_date: this.formatDateForBackend(invoiceData.issue_date),
          due_date: this.formatDateForBackend(invoiceData.due_date),
          amount: invoiceData.amount,
          tax_amount: invoiceData.tax_amount,
          total_amount: invoiceData.amount + invoiceData.tax_amount,
          status: invoiceData.status,
          payment_date: invoiceData.payment_date ? this.formatDateForBackend(invoiceData.payment_date) : null,
          payment_method: invoiceData.payment_method,
          notes: invoiceData.notes,
          items: invoiceData.items ? invoiceData.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            price: item.price
          })) : []
        };

        // Make API request
        const response = await fetch(`${this.apiURL}/invoices.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formattedData),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          toast.success('Fatura criada com sucesso!');
          
          // Get the created invoice from the backend
          return await this.getInvoice(data.id);
        } else {
          console.error('Error creating invoice:', data.message);
          throw new Error(data.message || 'Failed to create invoice');
        }
      }
      
      // Mock creation if backend is not used
      const newInvoice: Invoice = {
        id: uuidv4(),
        invoice_number: invoiceData.invoice_number,
        contract_id: invoiceData.contract_id,
        issue_date: invoiceData.issue_date,
        due_date: invoiceData.due_date,
        amount: invoiceData.amount,
        tax_amount: invoiceData.tax_amount,
        total_amount: invoiceData.amount + invoiceData.tax_amount,
        status: invoiceData.status,
        payment_date: invoiceData.payment_date,
        payment_method: invoiceData.payment_method,
        notes: invoiceData.notes,
        client: {
          id: invoiceData.client_id || '',
          name: 'Cliente',
          email: '',
          phone: '',
          document: '',
          address: '',
          city: '',
          state: '',
          zipCode: ''
        },
        items: invoiceData.items || [],
        subtotal: invoiceData.amount,
        discount: 0,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      mockInvoices.push(newInvoice);
      toast.success('Fatura criada com sucesso! (Modo Offline)');
      
      return newInvoice;
    } catch (error) {
      console.error('Error in createInvoice:', error);
      toast.error(`Falha ao criar fatura: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a payment in Asaas for an invoice
   */
  async createAsaasPayment(invoice: Invoice, client: any): Promise<any> {
    try {
      if (this.useBackend) {
        const response = await fetch(`${this.apiURL}/asaas-payment.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            invoice_id: invoice.id,
            client_id: client.id
          }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          toast.success('Pagamento criado com sucesso!');
          return data.payment;
        } else {
          console.error('Error creating payment:', data.message);
          throw new Error(data.message || 'Failed to create payment');
        }
      }
      
      // Mock creation if backend is not used
      toast.success('Pagamento criado com sucesso! (Modo Offline)');
      return {
        id: uuidv4(),
        invoiceId: invoice.id,
        status: 'PENDING',
        value: invoice.total_amount || 100,
        netValue: (invoice.total_amount || 100) * 0.975,
        description: `Pagamento para fatura #${invoice.invoice_number}`,
        billingType: 'BOLETO',
        dueDate: new Date(),
        paymentDate: null,
        clientId: client.id || 'mock-client-id',
        externalReference: invoice.id
      };
    } catch (error) {
      console.error('Error in createAsaasPayment:', error);
      toast.error(`Falha ao criar pagamento: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update an existing invoice
   */
  async updateInvoice(id: string, invoiceData: InvoiceFormData): Promise<Invoice> {
    try {
      if (this.useBackend) {
        // Format data for the backend
        const formattedData = {
          id,
          invoice_number: invoiceData.invoice_number,
          contract_id: invoiceData.contract_id,
          client_id: invoiceData.client_id,
          issue_date: this.formatDateForBackend(invoiceData.issue_date),
          due_date: this.formatDateForBackend(invoiceData.due_date),
          amount: invoiceData.amount,
          tax_amount: invoiceData.tax_amount,
          total_amount: invoiceData.amount + invoiceData.tax_amount,
          status: invoiceData.status,
          payment_date: invoiceData.payment_date ? this.formatDateForBackend(invoiceData.payment_date) : null,
          payment_method: invoiceData.payment_method,
          notes: invoiceData.notes,
          items: invoiceData.items ? invoiceData.items.map(item => ({
            id: item.id || null,
            description: item.description,
            quantity: item.quantity,
            price: item.price
          })) : []
        };

        // Make API request
        const response = await fetch(`${this.apiURL}/invoices.php`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formattedData),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          toast.success('Fatura atualizada com sucesso!');
          
          // Get the updated invoice from the backend
          return await this.getInvoice(id);
        } else {
          console.error('Error updating invoice:', data.message);
          throw new Error(data.message || 'Failed to update invoice');
        }
      }
      
      // Mock update if backend is not used
      const index = mockInvoices.findIndex(inv => inv.id === id);
      
      if (index !== -1) {
        const updatedInvoice: Invoice = {
          ...mockInvoices[index],
          invoice_number: invoiceData.invoice_number,
          contract_id: invoiceData.contract_id,
          issue_date: invoiceData.issue_date,
          due_date: invoiceData.due_date,
          amount: invoiceData.amount,
          tax_amount: invoiceData.tax_amount,
          total_amount: invoiceData.amount + invoiceData.tax_amount,
          status: invoiceData.status,
          payment_date: invoiceData.payment_date,
          payment_method: invoiceData.payment_method,
          notes: invoiceData.notes,
          items: invoiceData.items || mockInvoices[index].items,
          updated_at: new Date()
        };
        
        mockInvoices[index] = updatedInvoice;
        toast.success('Fatura atualizada com sucesso! (Modo Offline)');
        
        return updatedInvoice;
      } else {
        throw new Error('Invoice not found');
      }
    } catch (error) {
      console.error('Error in updateInvoice:', error);
      toast.error(`Falha ao atualizar fatura: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete an invoice
   */
  async deleteInvoice(id: string): Promise<boolean> {
    try {
      if (this.useBackend) {
        const response = await fetch(`${this.apiURL}/invoices.php?id=${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          toast.success('Fatura excluída com sucesso!');
          return true;
        } else {
          console.error('Error deleting invoice:', data.message);
          throw new Error(data.message || 'Failed to delete invoice');
        }
      }
      
      // Mock deletion if backend is not used
      const index = mockInvoices.findIndex(inv => inv.id === id);
      
      if (index !== -1) {
        mockInvoices.splice(index, 1);
        toast.success('Fatura excluída com sucesso! (Modo Offline)');
        return true;
      } else {
        throw new Error('Invoice not found');
      }
    } catch (error) {
      console.error('Error in deleteInvoice:', error);
      toast.error(`Falha ao excluir fatura: ${error.message}`);
      return false;
    }
  }

  /**
   * Helper method to format date for the backend (YYYY-MM-DD)
   */
  private formatDateForBackend(date: Date): string {
    if (!date) return '';
    
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
}

export const invoiceService = new InvoiceService();
