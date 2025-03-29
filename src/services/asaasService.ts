
import { toast } from 'sonner';
import { Client } from '@/models/client';
import { Invoice, InvoiceFormData } from '@/models/invoice';

interface AsaasConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
}

// Inicializa com valores padrão
let config: AsaasConfig = {
  apiKey: '',
  environment: 'sandbox'
};

// URLs base para ambientes
const BASE_URLS = {
  sandbox: 'https://sandbox.asaas.com/api/v3',
  production: 'https://api.asaas.com/v3'
};

// Define response types for API calls
interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  mobilePhone?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  postalCode?: string;
  cpfCnpj: string;
  personType?: 'FISICA' | 'JURIDICA';
  city?: string;
  state?: string;
  country?: string;
  externalReference?: string;
  notificationDisabled?: boolean;
  additionalEmails?: string;
  municipalInscription?: string;
  stateInscription?: string;
  observations?: string;
}

interface AsaasCustomersResponse {
  data: AsaasCustomer[];
  hasMore: boolean;
  totalCount: number;
  limit: number;
  offset: number;
}

interface AsaasPaymentResponse {
  id: string;
  status: string;
  dueDate: string;
  value: number;
  description: string;
  bankSlipUrl?: string;
  invoiceUrl?: string;
}

interface AsaasPixQrCodeResponse {
  encodedImage: string;
  payload: string;
  expirationDate: string;
}

interface AsaasIdentificationFieldResponse {
  identificationField: string;
}

export const asaasService = {
  /**
   * Configura as credenciais da API Asaas
   */
  setConfig: (apiKey: string, environment: 'sandbox' | 'production' = 'sandbox') => {
    config.apiKey = apiKey;
    config.environment = environment;
    localStorage.setItem('asaas_config', JSON.stringify(config));
    return config;
  },

  /**
   * Recupera a configuração armazenada
   */
  getConfig: (): AsaasConfig => {
    const storedConfig = localStorage.getItem('asaas_config');
    if (storedConfig) {
      config = JSON.parse(storedConfig);
    }
    return config;
  },

  /**
   * Verifica se a API está configurada
   */
  isConfigured: (): boolean => {
    const { apiKey } = asaasService.getConfig();
    return !!apiKey;
  },

  /**
   * Faz uma chamada à API Asaas
   */
  callApi: async <T>(endpoint: string, method: string = 'GET', data?: any): Promise<T> => {
    const { apiKey, environment } = asaasService.getConfig();
    
    if (!apiKey) {
      throw new Error('API Asaas não configurada. Configure o token de acesso nas configurações.');
    }

    const baseUrl = BASE_URLS[environment];
    const url = `${baseUrl}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'access_token': apiKey
      },
      body: data ? JSON.stringify(data) : undefined
    };

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.description || 'Erro na chamada à API Asaas');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro na chamada à API Asaas:', error);
      throw error;
    }
  },

  /**
   * Verifica se um cliente existe pelo CPF/CNPJ
   */
  findCustomerByCpfCnpj: async (cpfCnpj: string): Promise<AsaasCustomer | null> => {
    try {
      const result = await asaasService.callApi<AsaasCustomersResponse>(`/customers?cpfCnpj=${cpfCnpj}`);
      return result.data.length > 0 ? result.data[0] : null;
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      return null;
    }
  },

  /**
   * Cria um cliente no Asaas
   */
  createCustomer: async (client: Client): Promise<string> => {
    const customerData = {
      name: client.name,
      email: client.email,
      phone: client.phone,
      cpfCnpj: client.document.replace(/[^0-9]/g, ''),
      address: client.address,
      addressNumber: '', // Campo opcional
      province: '', // Campo opcional
      postalCode: client.zipCode.replace(/[^0-9]/g, ''),
      city: client.city,
      state: client.state,
      externalReference: client.id, // Referência ao ID do cliente no sistema
      notificationDisabled: false
    };

    try {
      const result = await asaasService.callApi<{ id: string }>('/customers', 'POST', customerData);
      return result.id;
    } catch (error) {
      console.error('Erro ao criar cliente no Asaas:', error);
      throw error;
    }
  },

  /**
   * Cria ou atualiza um cliente no Asaas
   */
  syncCustomer: async (client: Client): Promise<string> => {
    try {
      // Verifica se o cliente já existe no Asaas
      const existingCustomer = await asaasService.findCustomerByCpfCnpj(client.document);
      
      if (existingCustomer) {
        // Cliente já existe, retorna o ID
        return existingCustomer.id;
      } else {
        // Cliente não existe, cria um novo
        return await asaasService.createCustomer(client);
      }
    } catch (error) {
      console.error('Erro ao sincronizar cliente com Asaas:', error);
      throw error;
    }
  },

  /**
   * Cria um pagamento via PIX ou Boleto
   */
  createPayment: async (invoice: Invoice, client: Client, paymentType: 'PIX' | 'BOLETO'): Promise<AsaasPaymentResponse> => {
    if (!client.asaas_id) {
      throw new Error('Cliente não sincronizado com Asaas');
    }

    const paymentData = {
      customer: client.asaas_id,
      billingType: paymentType,
      value: invoice.total_amount,
      dueDate: new Date(invoice.due_date).toISOString().split('T')[0],
      description: `Fatura #${invoice.invoice_number}`,
      externalReference: invoice.id,
      postalService: false
    };

    try {
      const result = await asaasService.callApi<AsaasPaymentResponse>('/payments', 'POST', paymentData);
      return result;
    } catch (error) {
      console.error(`Erro ao criar pagamento via ${paymentType}:`, error);
      throw error;
    }
  },

  /**
   * Obtém o QR Code PIX para um pagamento
   */
  getPixQrCode: async (paymentId: string): Promise<AsaasPixQrCodeResponse> => {
    try {
      const result = await asaasService.callApi<AsaasPixQrCodeResponse>(`/payments/${paymentId}/pixQrCode`);
      return result;
    } catch (error) {
      console.error('Erro ao obter QR Code PIX:', error);
      throw error;
    }
  },

  /**
   * Obtém a URL do boleto para um pagamento
   */
  getBoletoUrl: async (paymentId: string): Promise<string | undefined> => {
    try {
      const result = await asaasService.callApi<AsaasPaymentResponse>(`/payments/${paymentId}`);
      return result.bankSlipUrl;
    } catch (error) {
      console.error('Erro ao obter URL do boleto:', error);
      throw error;
    }
  },

  /**
   * Obtém a linha digitável do boleto
   */
  getBoletoIdentificationField: async (paymentId: string): Promise<string> => {
    try {
      const result = await asaasService.callApi<AsaasIdentificationFieldResponse>(`/payments/${paymentId}/identificationField`);
      return result.identificationField;
    } catch (error) {
      console.error('Erro ao obter linha digitável:', error);
      throw error;
    }
  },

  /**
   * Verifica o status de um pagamento
   */
  getPaymentStatus: async (paymentId: string): Promise<string> => {
    try {
      const result = await asaasService.callApi<AsaasPaymentResponse>(`/payments/${paymentId}`);
      return result.status;
    } catch (error) {
      console.error('Erro ao verificar status do pagamento:', error);
      throw error;
    }
  },

  /**
   * Cancela um pagamento
   */
  cancelPayment: async (paymentId: string) => {
    try {
      const result = await asaasService.callApi<AsaasPaymentResponse>(`/payments/${paymentId}/cancel`, 'POST');
      return result;
    } catch (error) {
      console.error('Erro ao cancelar pagamento:', error);
      throw error;
    }
  },

  /**
   * Reembolsa um pagamento
   */
  refundPayment: async (paymentId: string, value?: number) => {
    try {
      const data = value ? { value } : undefined;
      const result = await asaasService.callApi<AsaasPaymentResponse>(`/payments/${paymentId}/refund`, 'POST', data);
      return result;
    } catch (error) {
      console.error('Erro ao reembolsar pagamento:', error);
      throw error;
    }
  }
};

// Carrega a configuração do localStorage ao inicializar
asaasService.getConfig();
