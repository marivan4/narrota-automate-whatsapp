
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
    try {
      console.log("Buscando faturas, API_URL configurada:", API_URL ? "Sim" : "Não");
      
      // Check if API_URL is configured, otherwise try database connection
      if (!API_URL) {
        console.log("API URL not configured, checking database connection");
        try {
          // Try database connection directly if API_URL is not available
          const queryResult = await executeQuery("SELECT * FROM invoices ORDER BY due_date DESC");
          console.log("Resultado da consulta ao banco de dados:", queryResult);
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
      
      // If API_URL is configured, try to fetch from API
      const response = await fetch(`${API_URL}/api/invoices`);
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`API Error: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Falha ao buscar faturas: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Erro ao buscar faturas");
      throw error;
    }
  },

  getInvoiceById: async (id: string): Promise<Invoice> => {
    try {
      console.log(`Buscando fatura com ID: ${id}`);
      
      if (!API_URL) {
        console.log("API URL not configured, checking database connection");
        try {
          // Try database connection directly if API_URL is not available
          const queryResult = await executeQuery("SELECT * FROM invoices WHERE id = ?", [id]);
          console.log("Resultado da consulta ao banco de dados:", queryResult);
          if (queryResult && queryResult.data && queryResult.data[0]) {
            return queryResult.data[0];
          }
          throw new Error('Fatura não encontrada no banco de dados');
        } catch (dbError) {
          console.error("Database error:", dbError);
          toast.error("Erro ao buscar fatura do banco de dados");
          throw new Error(`Configuração de API/Banco de dados incorreta. Configure a variável de ambiente VITE_API_URL ou verifique a conexão com o banco de dados.`);
        }
      }
      
      // If API_URL is configured, try to fetch from API
      const response = await fetch(`${API_URL}/api/invoices/${id}`);
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`API Error: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Falha ao buscar fatura: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching invoice:", error);
      toast.error("Erro ao buscar fatura");
      throw error;
    }
  },

  createInvoice: async (data: InvoiceFormData): Promise<Invoice> => {
    try {
      console.log("Criando fatura com dados:", data);
      
      if (!API_URL) {
        console.log("API URL not configured, checking database connection");
        try {
          // Validate required fields
          if (!data.invoice_number || !data.contract_id || !data.amount) {
            throw new Error('Campos obrigatórios não preenchidos');
          }
          
          // Format dates for database
          const formattedData = {
            ...data,
            issue_date: data.issue_date instanceof Date ? data.issue_date.toISOString().split('T')[0] : data.issue_date,
            due_date: data.due_date instanceof Date ? data.due_date.toISOString().split('T')[0] : data.due_date,
            payment_date: data.payment_date instanceof Date ? data.payment_date.toISOString().split('T')[0] : data.payment_date,
            amount: Number(data.amount),
            tax_amount: Number(data.tax_amount || 0),
            total_amount: Number(data.amount) + Number(data.tax_amount || 0)
          };
          
          console.log("Dados formatados para inserção no banco:", formattedData);
          
          // Execute insert query
          const result = await executeQuery(
            `INSERT INTO invoices (invoice_number, contract_id, issue_date, due_date, amount, tax_amount, 
            total_amount, status, payment_method, notes, client_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              formattedData.invoice_number,
              formattedData.contract_id,
              formattedData.issue_date,
              formattedData.due_date,
              formattedData.amount,
              formattedData.tax_amount,
              formattedData.total_amount,
              formattedData.status,
              formattedData.payment_method || null,
              formattedData.notes || null,
              formattedData.client_id || null
            ]
          );
          
          console.log("Resultado da inserção no banco de dados:", result);
          
          if (result && result.success) {
            // Convert string dates back to Date objects for the returned Invoice
            return {
              id: result.insertId || 'temp-id',
              ...data,
              issue_date: data.issue_date instanceof Date ? data.issue_date : new Date(data.issue_date),
              due_date: data.due_date instanceof Date ? data.due_date : new Date(data.due_date),
              payment_date: data.payment_date instanceof Date ? data.payment_date : 
                           (data.payment_date ? new Date(data.payment_date) : undefined),
              total_amount: formattedData.total_amount,
              client: { id: formattedData.client_id || '', name: '', email: '', phone: '' },
              items: [],
              subtotal: formattedData.amount,
              discount: 0,
              created_at: new Date(),
              updated_at: new Date()
            };
          }
          throw new Error('Falha ao inserir fatura no banco de dados');
        } catch (dbError) {
          console.error("Database error:", dbError);
          toast.error("Erro ao criar fatura no banco de dados: " + (dbError instanceof Error ? dbError.message : String(dbError)));
          throw dbError;
        }
      }
      
      // If API_URL is configured, try to create using API
      console.log(`Enviando dados para API: ${API_URL}/api/invoices`);
      const response = await fetch(`${API_URL}/api/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`API Error: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Falha ao criar fatura: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Erro ao criar fatura: " + (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  },

  updateInvoice: async (id: string, data: InvoiceFormData): Promise<Invoice> => {
    try {
      console.log(`Atualizando fatura ${id} com dados:`, data);
      
      if (!API_URL) {
        console.log("API URL not configured, checking database connection");
        try {
          // Format dates for database
          const formattedData = {
            ...data,
            issue_date: data.issue_date instanceof Date ? data.issue_date.toISOString().split('T')[0] : data.issue_date,
            due_date: data.due_date instanceof Date ? data.due_date.toISOString().split('T')[0] : data.due_date,
            payment_date: data.payment_date instanceof Date ? data.payment_date.toISOString().split('T')[0] : data.payment_date,
            amount: Number(data.amount),
            tax_amount: Number(data.tax_amount || 0),
            total_amount: Number(data.amount) + Number(data.tax_amount || 0)
          };
          
          console.log("Dados formatados para atualização no banco:", formattedData);
          
          // Execute update query
          const result = await executeQuery(
            `UPDATE invoices SET 
            invoice_number = ?, 
            contract_id = ?, 
            issue_date = ?, 
            due_date = ?, 
            amount = ?, 
            tax_amount = ?, 
            total_amount = ?, 
            status = ?, 
            payment_method = ?, 
            notes = ? 
            WHERE id = ?`,
            [
              formattedData.invoice_number,
              formattedData.contract_id,
              formattedData.issue_date,
              formattedData.due_date,
              formattedData.amount,
              formattedData.tax_amount,
              formattedData.total_amount,
              formattedData.status,
              formattedData.payment_method || null,
              formattedData.notes || null,
              id
            ]
          );
          
          console.log("Resultado da atualização no banco de dados:", result);
          
          if (result && result.success) {
            // Convert string dates back to Date objects for the returned Invoice
            return {
              id,
              ...data,
              issue_date: data.issue_date instanceof Date ? data.issue_date : new Date(data.issue_date),
              due_date: data.due_date instanceof Date ? data.due_date : new Date(data.due_date),
              payment_date: data.payment_date instanceof Date ? data.payment_date : 
                           (data.payment_date ? new Date(data.payment_date) : undefined),
              total_amount: formattedData.total_amount,
              client: { id: formattedData.client_id || '', name: '', email: '', phone: '' },
              items: [],
              subtotal: formattedData.amount,
              discount: 0,
              created_at: new Date(),
              updated_at: new Date()
            };
          }
          throw new Error('Falha ao atualizar fatura no banco de dados');
        } catch (dbError) {
          console.error("Database error:", dbError);
          toast.error("Erro ao atualizar fatura no banco de dados");
          throw dbError;
        }
      }
      
      // If API_URL is configured, try to update using API
      const response = await fetch(`${API_URL}/api/invoices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`API Error: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Falha ao atualizar fatura: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error("Erro ao atualizar fatura");
      throw error;
    }
  },

  deleteInvoice: async (id: string): Promise<void> => {
    try {
      console.log(`Excluindo fatura com ID: ${id}`);
      
      if (!API_URL) {
        console.log("API URL not configured, checking database connection");
        try {
          // Execute delete query
          const result = await executeQuery("DELETE FROM invoices WHERE id = ?", [id]);
          
          console.log("Resultado da exclusão no banco de dados:", result);
          
          if (!(result && result.success)) {
            throw new Error('Falha ao excluir fatura do banco de dados');
          }
          return;
        } catch (dbError) {
          console.error("Database error:", dbError);
          toast.error("Erro ao excluir fatura do banco de dados");
          throw dbError;
        }
      }
      
      // If API_URL is configured, try to delete using API
      const response = await fetch(`${API_URL}/api/invoices/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`API Error: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Falha ao excluir fatura: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Erro ao excluir fatura");
      throw error;
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
