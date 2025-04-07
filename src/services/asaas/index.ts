
import { asaasConfig } from './asaasConfig';
import { asaasCustomers } from './asaasCustomers';
import { asaasPayments } from './asaasPayments';

export const asaasService = {
  ...asaasConfig,
  ...asaasCustomers,
  ...asaasPayments,
  
  isConfigured: (): boolean => {
    return !!asaasConfig.getConfig()?.apiKey;
  }
};
