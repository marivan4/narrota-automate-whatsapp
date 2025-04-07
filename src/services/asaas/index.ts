
import { asaasConfig } from './asaasConfig';
import { asaasCustomers } from './asaasCustomers';
import { asaasPayments } from './asaasPayments';
import { callAsaasApi, callApi } from './asaasApi';
import { 
  AsaasPayment, 
  AsaasPaymentsResponse, 
  AsaasPaymentResponse, 
  AsaasCustomer,
  AsaasCustomersResponse,
  AsaasPixQrCodeResponse,
  AsaasIdentificationFieldResponse
} from './asaasTypes';

// Re-export types
export type {
  AsaasPayment,
  AsaasPaymentsResponse,
  AsaasPaymentResponse,
  AsaasCustomer,
  AsaasCustomersResponse,
  AsaasPixQrCodeResponse,
  AsaasIdentificationFieldResponse
};

export const asaasService = {
  ...asaasConfig,
  ...asaasCustomers,
  ...asaasPayments,
  
  isConfigured: (): boolean => {
    return !!asaasConfig.getConfig()?.apiKey;
  },
  
  // Add direct API access methods
  callApi: callAsaasApi
};
