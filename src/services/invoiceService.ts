
import { toast } from 'sonner';
import { createDatabaseConnection } from '@/utils/database';

export interface Invoice {
  id: string;
  invoice_number: string;
  contract_id: string;
  issue_date: Date;
  due_date: Date;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  payment_date?: Date;
  payment_method?: string;
  notes?: string;
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  created_at: Date;
  updated_at: Date;
}

export type InvoiceFormData = {
  invoice_number: string;
  contract_id: string;
  issue_date: Date;
  due_date: Date;
  amount: number;
  tax_amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  payment_date?: Date;
  payment_method?: string;
  notes?: string;
  client_id?: string;
};

// Mock data for development
const mockInvoices = [
  {
    id: 'INV-001',
    invoice_number: 'INV-001',
    contract_id: 'CONT-001',
    issue_date: new Date(2023, 9, 15),
    due_date: new Date(2023, 10, 15),
    amount: 1500.0,
    tax_amount: 0,
    total_amount: 1500.0,
    status: 'paid' as const,
    payment_date: new Date(2023, 10, 10),
    payment_method: 'Cartão de Crédito',
    client: {
      id: 'CUST-001',
      name: 'João Silva',
      email: 'joao@exemplo.com',
      phone: '11987654321',
    },
    created_at: new Date(2023, 9, 15),
    updated_at: new Date(2023, 9, 15),
  },
  {
    id: 'INV-002',
    invoice_number: 'INV-002',
    contract_id: 'CONT-002',
    issue_date: new Date(2023, 10, 20),
    due_date: new Date(2023, 11, 20),
    amount: 750.5,
    tax_amount: 0,
    total_amount: 750.5,
    status: 'pending' as const,
    client: {
      id: 'CUST-002',
      name: 'Maria Oliveira',
      email: 'maria@exemplo.com',
      phone: '11987654322',
    },
    created_at: new Date(2023, 10, 20),
    updated_at: new Date(2023, 10, 20),
  },
  {
    id: 'INV-003',
    invoice_number: 'INV-003',
    contract_id: 'CONT-003',
    issue_date: new Date(2023, 8, 10),
    due_date: new Date(2023, 9, 10),
    amount: 2250.0,
    tax_amount: 100.0,
    total_amount: 2350.0,
    status: 'overdue' as const,
    client: {
      id: 'CUST-003',
      name: 'Carlos Santos',
      email: 'carlos@exemplo.com',
      phone: '11987654323',
    },
    created_at: new Date(2023, 8, 10),
    updated_at: new Date(2023, 8, 10),
  },
  {
    id: 'INV-004',
    invoice_number: 'INV-004',
    contract_id: 'CONT-004',
    issue_date: new Date(2023, 11, 5),
    due_date: new Date(2023, 12, 5),
    amount: 450.25,
    tax_amount: 30.0,
    total_amount: 480.25,
    status: 'cancelled' as const,
    client: {
      id: 'CUST-004',
      name: 'Ana Pereira',
      email: 'ana@exemplo.com',
      phone: '11987654324',
    },
    created_at: new Date(2023, 11, 5),
    updated_at: new Date(2023, 11, 5),
  },
  {
    id: 'INV-005',
    invoice_number: 'INV-005',
    contract_id: 'CONT-005',
    issue_date: new Date(2023, 10, 30),
    due_date: new Date(2023, 11, 30),
    amount: 1200.75,
    tax_amount: 75.0,
    total_amount: 1275.75,
    status: 'pending' as const,
    client: {
      id: 'CUST-005',
      name: 'Pedro Almeida',
      email: 'pedro@exemplo.com',
      phone: '11987654325',
    },
    created_at: new Date(2023, 10, 30),
    updated_at: new Date(2023, 10, 30),
  },
];

// Simulating a local storage to persist data during development
let invoicesData = [...mockInvoices];

export const invoiceService = {
  // Get all invoices
  getInvoices: async (): Promise<Invoice[]> => {
    try {
      await createDatabaseConnection();
      // In a real implementation, this would fetch from a database
      // For now, we return the mock data
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
      invoicesData = invoicesData.filter(inv => inv.id !== id);
      return invoicesData.length < initialLength;
    } catch (error) {
      console.error('Erro ao excluir fatura:', error);
      toast.error('Erro ao excluir fatura');
      return false;
    }
  },

  // Export invoices to CSV
  exportToCSV: (): string => {
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
    const formatDate = (date?: Date) => {
      if (!date) return '';
      return date.toLocaleDateString('pt-BR');
    };

    // Create CSV rows
    const rows = invoicesData.map(invoice => [
      invoice.id,
      invoice.invoice_number,
      invoice.contract_id,
      invoice.client.name,
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
