
/**
 * Main module for Asaas API integration
 */

import { asaasConfig } from './asaasConfig';
import { asaasCustomers } from './asaasCustomers';
import { asaasPayments } from './asaasPayments';
import { toast } from 'sonner';

// Export types
export * from './asaasTypes';

// Create a unified asaasService
export const asaasService = {
  // Configuration
  setConfig: asaasConfig.setConfig,
  getConfig: asaasConfig.getConfig,
  isConfigured: asaasConfig.isConfigured,
  setCompanyConfig: asaasConfig.setCompanyConfig,
  getCompanyConfig: asaasConfig.getCompanyConfig,
  setActiveCompany: asaasConfig.setActiveCompany,
  
  // Customer operations
  findCustomerByCpfCnpj: asaasCustomers.findCustomerByCpfCnpj,
  createCustomer: asaasCustomers.createCustomer,
  syncCustomer: asaasCustomers.syncCustomer,
  
  // Payment operations
  createPayment: asaasPayments.createPayment,
  getPixQrCode: asaasPayments.getPixQrCode,
  getBoletoUrl: asaasPayments.getBoletoUrl,
  getBoletoIdentificationField: asaasPayments.getBoletoIdentificationField,
  getPaymentStatus: asaasPayments.getPaymentStatus,
  getPayments: asaasPayments.getPayments,
  cancelPayment: asaasPayments.cancelPayment,
  refundPayment: asaasPayments.refundPayment,
  
  // Use internal methods to expose API for direct usage
  callApi: async <T>(endpoint: string, method: string = 'GET', data?: any): Promise<T> => {
    try {
      return await (await import('./asaasApi')).callAsaasApi<T>(endpoint, method, data);
    } catch (error) {
      // Re-throw the error
      throw error;
    }
  }
};
