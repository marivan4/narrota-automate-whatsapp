import { asaasService } from '@/services/asaas';
import { InvoiceFormData } from '@/models/invoice';
import { Client } from '@/models/client';
import { Invoice } from '@/models/invoice';
import { toast } from 'sonner';

// Use import.meta.env instead of process.env for Vite
const API_URL = import.meta.env.VITE_API_URL || '';

export const invoiceService = {
  getInvoices: async (): Promise<Invoice[]> => {
    try {
      console.log("Buscando faturas, API_URL configurada:", API_URL ? "Sim" : "Não");
      
      // Try direct fetch from API first
      if (API_URL) {
        try {
          const response = await fetch(`${API_URL}/api/invoices.php`);
          if (response.ok) {
            const data = await response.json();
            console.log("Dados recebidos da API:", data);
            
            if (data && Array.isArray(data)) {
              // Transform API data to the expected format
              return data.map((invoice: any) => ({
                id: invoice.id.toString(),
                invoice_number: invoice.invoice_number,
                contract_id: invoice.contract_id,
                issue_date: new Date(invoice.issue_date),
                due_date: new Date(invoice.due_date),
                payment_date: invoice.payment_date ? new Date(invoice.payment_date) : undefined,
                amount: parseFloat(invoice.amount),
                tax_amount: parseFloat(invoice.tax_amount || 0),
                total_amount: parseFloat(invoice.total_amount),
                subtotal: parseFloat(invoice.amount),
                discount: parseFloat(invoice.discount || 0),
                status: invoice.status,
                payment_method: invoice.payment_method,
                client: {
                  id: invoice.client_id?.toString() || '',
                  name: invoice.client_name || '',
                  email: invoice.client_email || '',
                  phone: invoice.client_phone || ''
                },
                items: invoice.items || [],
                created_at: new Date(invoice.created_at),
                updated_at: new Date(invoice.updated_at)
              }));
            }
          } else {
            console.error(`API Error: ${response.status} ${response.statusText}`);
            throw new Error(`Falha ao buscar faturas da API: ${response.status} ${response.statusText}`);
          }
        } catch (apiError) {
          console.error("API Error:", apiError);
          // If API fails, fall back to direct database connection
        }
      }
      
      // Direct database query as fallback
      console.log("Trying direct database query...");
      
      // URL to your execute-query.php file
      const queryEndpoint = `${API_URL}/api/execute-query.php`;
      
      const queryData = {
        query: `
          SELECT i.*, 
                 c.name as client_name, 
                 c.email as client_email, 
                 c.phone as client_phone
          FROM invoices i 
          LEFT JOIN clients c ON i.client_id = c.id
          ORDER BY i.due_date DESC
        `,
        params: []
      };
      
      const queryResponse = await fetch(queryEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(queryData),
      });
      
      if (!queryResponse.ok) {
        const errorText = await queryResponse.text();
        console.error("Database query failed:", errorText);
        
        // If direct database query also fails, return empty array (not mock data)
        toast.error("Erro ao buscar faturas do banco de dados");
        return [];
      }
      
      const queryResult = await queryResponse.json();
      console.log("Database query result:", queryResult);
      
      if (queryResult && queryResult.success && Array.isArray(queryResult.data)) {
        return queryResult.data.map((row: any) => ({
          id: row.id.toString(),
          invoice_number: row.invoice_number,
          contract_id: row.contract_id || '',
          issue_date: new Date(row.issue_date),
          due_date: new Date(row.due_date),
          payment_date: row.payment_date ? new Date(row.payment_date) : undefined,
          amount: parseFloat(row.amount) || 0,
          tax_amount: parseFloat(row.tax_amount || 0),
          total_amount: parseFloat(row.total_amount) || 0,
          subtotal: parseFloat(row.amount) || 0,
          discount: parseFloat(row.discount) || 0,
          status: row.status || 'pending',
          payment_method: row.payment_method || '',
          client: {
            id: row.client_id?.toString() || '',
            name: row.client_name || '',
            email: row.client_email || '',
            phone: row.client_phone || ''
          },
          items: [], // We'll need to make a separate query for items if needed
          created_at: new Date(row.created_at),
          updated_at: new Date(row.updated_at)
        }));
      }
      
      // If all methods fail, return empty array (not mock data)
      console.log("All attempts to fetch invoices failed, returning empty array");
      return [];
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Erro ao buscar faturas");
      return []; // Return empty array instead of mock data
    }
  },

  getInvoiceById: async (id: string): Promise<Invoice> => {
    try {
      console.log(`Buscando fatura com ID: ${id}`);
      
      // Try direct fetch from API first
      if (API_URL) {
        try {
          const response = await fetch(`${API_URL}/api/invoices.php?id=${id}`);
          if (response.ok) {
            const invoice = await response.json();
            if (invoice && invoice.id) {
              console.log("Invoice data from API:", invoice);
              
              // Convert string dates to Date objects
              return {
                ...invoice,
                issue_date: new Date(invoice.issue_date),
                due_date: new Date(invoice.due_date),
                payment_date: invoice.payment_date ? new Date(invoice.payment_date) : undefined,
                created_at: new Date(invoice.created_at),
                updated_at: new Date(invoice.updated_at),
                // Ensure numeric values are properly parsed
                amount: parseFloat(invoice.amount),
                tax_amount: parseFloat(invoice.tax_amount || 0),
                total_amount: parseFloat(invoice.total_amount),
                subtotal: parseFloat(invoice.subtotal || invoice.amount),
                discount: parseFloat(invoice.discount || 0),
                // Ensure client object exists
                client: invoice.client || { id: '', name: '', email: '', phone: '' },
                // Ensure items array exists
                items: invoice.items || []
              };
            }
          } else {
            console.error(`API Error: ${response.status} ${response.statusText}`);
          }
        } catch (apiError) {
          console.error("API Error:", apiError);
          // If API fails, fall back to direct database connection
        }
      }
      
      // Direct database query as fallback
      console.log("Trying direct database query for invoice:", id);
      
      // URL to your execute-query.php file
      const queryEndpoint = `${API_URL}/api/execute-query.php`;
      
      const queryData = {
        query: `
          SELECT i.*, 
                 c.name as client_name, 
                 c.email as client_email, 
                 c.phone as client_phone
          FROM invoices i 
          LEFT JOIN clients c ON i.client_id = c.id
          WHERE i.id = ?
        `,
        params: [id]
      };
      
      const queryResponse = await fetch(queryEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(queryData),
      });
      
      if (!queryResponse.ok) {
        const errorText = await queryResponse.text();
        console.error("Database query failed:", errorText);
        throw new Error(`Falha ao buscar fatura: ${errorText}`);
      }
      
      const queryResult = await queryResponse.json();
      console.log("Database query result:", queryResult);
      
      if (queryResult && queryResult.success && queryResult.data && queryResult.data.length > 0) {
        const row = queryResult.data[0];
        
        // Now get invoice items
        const itemsQueryData = {
          query: "SELECT * FROM invoice_items WHERE invoice_id = ?",
          params: [id]
        };
        
        const itemsResponse = await fetch(queryEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(itemsQueryData),
        });
        
        let items = [];
        if (itemsResponse.ok) {
          const itemsResult = await itemsResponse.json();
          if (itemsResult && itemsResult.success && itemsResult.data) {
            items = itemsResult.data.map((item: any) => ({
              id: item.id.toString(),
              description: item.description,
              quantity: parseFloat(item.quantity) || 1,
              price: parseFloat(item.price) || 0
            }));
          }
        }
        
        return {
          id: row.id.toString(),
          invoice_number: row.invoice_number,
          contract_id: row.contract_id || '',
          issue_date: new Date(row.issue_date),
          due_date: new Date(row.due_date),
          payment_date: row.payment_date ? new Date(row.payment_date) : undefined,
          amount: parseFloat(row.amount) || 0,
          tax_amount: parseFloat(row.tax_amount) || 0,
          total_amount: parseFloat(row.total_amount) || 0,
          subtotal: parseFloat(row.amount) || 0,
          discount: parseFloat(row.discount) || 0,
          status: row.status || 'pending',
          payment_method: row.payment_method || '',
          notes: row.notes || '',
          client: {
            id: row.client_id?.toString() || '',
            name: row.client_name || '',
            email: row.client_email || '',
            phone: row.client_phone || ''
          },
          items: items,
          created_at: new Date(row.created_at),
          updated_at: new Date(row.updated_at)
        };
      }
      
      throw new Error(`Fatura não encontrada: ${id}`);
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
        throw new Error('API URL not configured. Configure VITE_API_URL in your .env file.');
      }
      
      // Format data for the API
      const invoiceData = {
        invoice_number: data.invoice_number,
        contract_id: data.contract_id,
        client_id: data.client_id || null, // client_id might be derived from contract
        issue_date: data.issue_date instanceof Date ? data.issue_date.toISOString().split('T')[0] : data.issue_date,
        due_date: data.due_date instanceof Date ? data.due_date.toISOString().split('T')[0] : data.due_date,
        payment_date: data.payment_date instanceof Date ? data.payment_date.toISOString().split('T')[0] : data.payment_date,
        amount: Number(data.amount),
        tax_amount: Number(data.tax_amount || 0),
        total_amount: Number(data.amount) + Number(data.tax_amount || 0),
        status: data.status || 'pending',
        payment_method: data.payment_method || null,
        notes: data.notes || null,
        items: data.items || []
      };
      
      console.log("Formatted invoice data for API:", invoiceData);
      
      // Try direct API first
      try {
        const response = await fetch(`${API_URL}/api/invoices.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invoiceData),
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log("API response for create invoice:", result);
          
          if (result && result.success) {
            toast.success('Fatura criada com sucesso!');
            return {
              id: result.id || 'temp-id',
              ...data,
              issue_date: data.issue_date instanceof Date ? data.issue_date : new Date(data.issue_date),
              due_date: data.due_date instanceof Date ? data.due_date : new Date(data.due_date),
              payment_date: data.payment_date instanceof Date ? data.payment_date : 
                         (data.payment_date ? new Date(data.payment_date) : undefined),
              total_amount: invoiceData.total_amount,
              client: { id: invoiceData.client_id || '', name: '', email: '', phone: '' },
              items: invoiceData.items || [],
              subtotal: invoiceData.amount,
              discount: 0,
              created_at: new Date(),
              updated_at: new Date()
            };
          }
        } else {
          const errorText = await response.text();
          console.error("API Error:", response.status, errorText);
        }
      } catch (apiError) {
        console.error("API Error:", apiError);
        // Fall back to direct database query
      }
      
      // Direct database transaction as fallback
      console.log("Trying direct database transaction...");
      
      const queryEndpoint = `${API_URL}/api/execute-transaction.php`;
      
      // Create transaction queries
      const queries = [
        {
          query: `
            INSERT INTO invoices (
              invoice_number, contract_id, client_id, issue_date, due_date, 
              payment_date, amount, tax_amount, total_amount, status, 
              payment_method, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          params: [
            invoiceData.invoice_number,
            invoiceData.contract_id,
            invoiceData.client_id,
            invoiceData.issue_date,
            invoiceData.due_date,
            invoiceData.payment_date,
            invoiceData.amount,
            invoiceData.tax_amount,
            invoiceData.total_amount,
            invoiceData.status,
            invoiceData.payment_method,
            invoiceData.notes
          ]
        }
      ];
      
      // If items are included, add them too
      if (invoiceData.items && invoiceData.items.length > 0) {
        invoiceData.items.forEach(item => {
          queries.push({
            query: `
              INSERT INTO invoice_items (
                invoice_id, description, quantity, price
              ) VALUES (LAST_INSERT_ID(), ?, ?, ?)
            `,
            params: [
              item.description,
              item.quantity || 1,
              item.price
            ]
          });
        });
      }
      
      const transactionData = { queries };
      
      const transactionResponse = await fetch(queryEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });
      
      if (!transactionResponse.ok) {
        const errorText = await transactionResponse.text();
        console.error("Transaction failed:", errorText);
        throw new Error(`Falha ao criar fatura no banco de dados: ${errorText}`);
      }
      
      const transactionResult = await transactionResponse.json();
      console.log("Transaction result:", transactionResult);
      
      if (transactionResult && transactionResult.success) {
        // Get the insert ID from the first query result
        const insertId = transactionResult.results[0].insertId;
        
        toast.success('Fatura criada com sucesso!');
        
        return {
          id: insertId.toString(),
          ...data,
          issue_date: data.issue_date instanceof Date ? data.issue_date : new Date(data.issue_date),
          due_date: data.due_date instanceof Date ? data.due_date : new Date(data.due_date),
          payment_date: data.payment_date instanceof Date ? data.payment_date : 
                     (data.payment_date ? new Date(data.payment_date) : undefined),
          total_amount: invoiceData.total_amount,
          client: { id: invoiceData.client_id || '', name: '', email: '', phone: '' },
          items: invoiceData.items || [],
          subtotal: invoiceData.amount,
          discount: 0,
          created_at: new Date(),
          updated_at: new Date()
        };
      }
      
      throw new Error('Falha ao criar fatura no banco de dados');
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error(`Erro ao criar fatura: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  },

  updateInvoice: async (id: string, data: InvoiceFormData): Promise<Invoice> => {
    try {
      console.log(`Atualizando fatura ${id} com dados:`, data);
      
      if (!API_URL) {
        throw new Error('API URL not configured. Configure VITE_API_URL in your .env file.');
      }
      
      // Format data for the API
      const invoiceData = {
        id: id,
        invoice_number: data.invoice_number,
        contract_id: data.contract_id,
        client_id: data.client_id || null, // client_id might be derived from contract
        issue_date: data.issue_date instanceof Date ? data.issue_date.toISOString().split('T')[0] : data.issue_date,
        due_date: data.due_date instanceof Date ? data.due_date.toISOString().split('T')[0] : data.due_date,
        payment_date: data.payment_date instanceof Date ? data.payment_date.toISOString().split('T')[0] : data.payment_date,
        amount: Number(data.amount),
        tax_amount: Number(data.tax_amount || 0),
        total_amount: Number(data.amount) + Number(data.tax_amount || 0),
        status: data.status || 'pending',
        payment_method: data.payment_method || null,
        notes: data.notes || null,
        items: data.items || []
      };
      
      console.log("Formatted invoice data for API:", invoiceData);
      
      // Try direct API first
      try {
        const response = await fetch(`${API_URL}/api/invoices.php?id=${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invoiceData),
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log("API response for update invoice:", result);
          
          if (result && result.success) {
            toast.success('Fatura atualizada com sucesso!');
            return {
              id,
              ...data,
              issue_date: data.issue_date instanceof Date ? data.issue_date : new Date(data.issue_date),
              due_date: data.due_date instanceof Date ? data.due_date : new Date(data.due_date),
              payment_date: data.payment_date instanceof Date ? data.payment_date : 
                         (data.payment_date ? new Date(data.payment_date) : undefined),
              total_amount: invoiceData.total_amount,
              client: { id: invoiceData.client_id || '', name: '', email: '', phone: '' },
              items: invoiceData.items || [],
              subtotal: invoiceData.amount,
              discount: 0,
              created_at: new Date(),
              updated_at: new Date()
            };
          }
        } else {
          const errorText = await response.text();
          console.error("API Error:", response.status, errorText);
        }
      } catch (apiError) {
        console.error("API Error:", apiError);
        // Fall back to direct database query
      }
      
      // Direct database transaction as fallback
      console.log("Trying direct database transaction for update...");
      
      const queryEndpoint = `${API_URL}/api/execute-transaction.php`;
      
      // Create transaction queries
      const queries = [
        {
          query: `
            UPDATE invoices SET 
              invoice_number = ?, 
              contract_id = ?, 
              client_id = ?,
              issue_date = ?, 
              due_date = ?, 
              payment_date = ?,
              amount = ?, 
              tax_amount = ?, 
              total_amount = ?,
              status = ?, 
              payment_method = ?, 
              notes = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `,
          params: [
            invoiceData.invoice_number,
            invoiceData.contract_id,
            invoiceData.client_id,
            invoiceData.issue_date,
            invoiceData.due_date,
            invoiceData.payment_date,
            invoiceData.amount,
            invoiceData.tax_amount,
            invoiceData.total_amount,
            invoiceData.status,
            invoiceData.payment_method,
            invoiceData.notes,
            id
          ]
        },
        // Delete all existing items for this invoice
        {
          query: "DELETE FROM invoice_items WHERE invoice_id = ?",
          params: [id]
        }
      ];
      
      // If items are included, add them too
      if (invoiceData.items && invoiceData.items.length > 0) {
        invoiceData.items.forEach(item => {
          queries.push({
            query: `
              INSERT INTO invoice_items (
                invoice_id, description, quantity, price
              ) VALUES (?, ?, ?, ?)
            `,
            params: [
              id,
              item.description,
              item.quantity || 1,
              item.price
            ]
          });
        });
      }
      
      const transactionData = { queries };
      
      const transactionResponse = await fetch(queryEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });
      
      if (!transactionResponse.ok) {
        const errorText = await transactionResponse.text();
        console.error("Transaction failed:", errorText);
        throw new Error(`Falha ao atualizar fatura no banco de dados: ${errorText}`);
      }
      
      const transactionResult = await transactionResponse.json();
      console.log("Transaction result:", transactionResult);
      
      if (transactionResult && transactionResult.success) {
        toast.success('Fatura atualizada com sucesso!');
        
        return {
          id,
          ...data,
          issue_date: data.issue_date instanceof Date ? data.issue_date : new Date(data.issue_date),
          due_date: data.due_date instanceof Date ? data.due_date : new Date(data.due_date),
          payment_date: data.payment_date instanceof Date ? data.payment_date : 
                     (data.payment_date ? new Date(data.payment_date) : undefined),
          total_amount: invoiceData.total_amount,
          client: { id: invoiceData.client_id || '', name: '', email: '', phone: '' },
          items: invoiceData.items || [],
          subtotal: invoiceData.amount,
          discount: 0,
          created_at: new Date(),
          updated_at: new Date()
        };
      }
      
      throw new Error('Falha ao atualizar fatura no banco de dados');
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error(`Erro ao atualizar fatura: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  },

  deleteInvoice: async (id: string): Promise<void> => {
    try {
      console.log(`Excluindo fatura com ID: ${id}`);
      
      if (!API_URL) {
        throw new Error('API URL not configured. Configure VITE_API_URL in your .env file.');
      }
      
      // Try direct API first
      try {
        const response = await fetch(`${API_URL}/api/invoices.php?id=${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          console.log("API response for delete invoice:", await response.json());
          toast.success('Fatura excluída com sucesso!');
          return;
        } else {
          const errorText = await response.text();
          console.error("API Error:", response.status, errorText);
        }
      } catch (apiError) {
        console.error("API Error:", apiError);
        // Fall back to direct database query
      }
      
      // Direct database transaction as fallback
      console.log("Trying direct database transaction for delete...");
      
      const queryEndpoint = `${API_URL}/api/execute-transaction.php`;
      
      // Create transaction queries (delete items first due to foreign key constraint)
      const queries = [
        {
          query: "DELETE FROM invoice_items WHERE invoice_id = ?",
          params: [id]
        },
        {
          query: "DELETE FROM invoices WHERE id = ?",
          params: [id]
        }
      ];
      
      const transactionData = { queries };
      
      const transactionResponse = await fetch(queryEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });
      
      if (!transactionResponse.ok) {
        const errorText = await transactionResponse.text();
        console.error("Transaction failed:", errorText);
        throw new Error(`Falha ao excluir fatura no banco de dados: ${errorText}`);
      }
      
      const transactionResult = await transactionResponse.json();
      console.log("Transaction result:", transactionResult);
      
      if (transactionResult && transactionResult.success) {
        toast.success('Fatura excluída com sucesso!');
        return;
      }
      
      throw new Error('Falha ao excluir fatura no banco de dados');
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error(`Erro ao excluir fatura: ${error instanceof Error ? error.message : String(error)}`);
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

export type { Invoice } from '@/models/invoice';
