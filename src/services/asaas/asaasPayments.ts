
/**
 * Module for Asaas payment-related operations
 */

import { callAsaasApi } from './asaasApi';
import { 
  AsaasPaymentResponse, 
  AsaasPaymentsResponse, 
  AsaasPixQrCodeResponse,
  AsaasIdentificationFieldResponse
} from './asaasTypes';
import { Invoice } from '@/models/invoice';
import { Client } from '@/models/client';

export const asaasPayments = {
  /**
   * Create a PIX or Boleto payment
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
      const result = await callAsaasApi<AsaasPaymentResponse>('/payments', 'POST', paymentData);
      return result;
    } catch (error) {
      console.error(`Erro ao criar pagamento via ${paymentType}:`, error);
      throw error;
    }
  },

  /**
   * Get PIX QR Code for a payment
   */
  getPixQrCode: async (paymentId: string): Promise<AsaasPixQrCodeResponse> => {
    try {
      const result = await callAsaasApi<AsaasPixQrCodeResponse>(`/payments/${paymentId}/pixQrCode`);
      return result;
    } catch (error) {
      console.error('Erro ao obter QR Code PIX:', error);
      throw error;
    }
  },

  /**
   * Get boleto URL for a payment
   */
  getBoletoUrl: async (paymentId: string): Promise<string | undefined> => {
    try {
      const result = await callAsaasApi<AsaasPaymentResponse>(`/payments/${paymentId}`);
      return result.bankSlipUrl;
    } catch (error) {
      console.error('Erro ao obter URL do boleto:', error);
      throw error;
    }
  },

  /**
   * Get boleto identification field
   */
  getBoletoIdentificationField: async (paymentId: string): Promise<string> => {
    try {
      const result = await callAsaasApi<AsaasIdentificationFieldResponse>(`/payments/${paymentId}/identificationField`);
      return result.identificationField;
    } catch (error) {
      console.error('Erro ao obter linha digitável:', error);
      throw error;
    }
  },

  /**
   * Check payment status
   */
  getPaymentStatus: async (paymentId: string): Promise<string> => {
    try {
      const result = await callAsaasApi<AsaasPaymentResponse>(`/payments/${paymentId}`);
      return result.status;
    } catch (error) {
      console.error('Erro ao verificar status do pagamento:', error);
      throw error;
    }
  },

  /**
   * Get payments with complete URL (including query parameters)
   * @param queryParams Query parameters string, ex: "?customer=123&status=PENDING"
   * @returns Asaas API response with payments list
   */
  getPayments: async (queryParams: string = ''): Promise<AsaasPaymentsResponse> => {
    try {
      console.log(`Consultando pagamentos com parâmetros: ${queryParams}`);
      return await callAsaasApi<AsaasPaymentsResponse>(`/payments${queryParams}`);
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
      throw error;
    }
  },

  /**
   * Cancel a payment
   */
  cancelPayment: async (paymentId: string): Promise<AsaasPaymentResponse> => {
    try {
      const result = await callAsaasApi<AsaasPaymentResponse>(`/payments/${paymentId}/cancel`, 'POST');
      return result;
    } catch (error) {
      console.error('Erro ao cancelar pagamento:', error);
      throw error;
    }
  },

  /**
   * Refund a payment
   */
  refundPayment: async (paymentId: string, value?: number): Promise<AsaasPaymentResponse> => {
    try {
      const data = value ? { value } : undefined;
      const result = await callAsaasApi<AsaasPaymentResponse>(`/payments/${paymentId}/refund`, 'POST', data);
      return result;
    } catch (error) {
      console.error('Erro ao reembolsar pagamento:', error);
      throw error;
    }
  }
};
