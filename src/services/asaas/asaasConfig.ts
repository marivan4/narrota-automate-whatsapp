
/**
 * Configuration module for Asaas API integration
 */

export interface AsaasConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
  companyId?: string;
  companyName?: string;
}

// URLs base for environments
export const BASE_URLS = {
  sandbox: 'https://sandbox.asaas.com/api/v3',
  production: 'https://api.asaas.com/v3'
};

// Initialize with default values
let config: AsaasConfig = {
  apiKey: '',
  environment: 'sandbox'
};

export const asaasConfig = {
  /**
   * Configure Asaas API credentials
   */
  setConfig: (apiKey: string, environment: 'sandbox' | 'production' = 'sandbox', companyId?: string, companyName?: string) => {
    config.apiKey = apiKey;
    config.environment = environment;
    config.companyId = companyId;
    config.companyName = companyName;
    
    localStorage.setItem('asaas_config', JSON.stringify(config));
    return config;
  },

  /**
   * Retrieve stored configuration
   */
  getConfig: (): AsaasConfig => {
    const storedConfig = localStorage.getItem('asaas_config');
    if (storedConfig) {
      config = JSON.parse(storedConfig);
    }
    return config;
  },

  /**
   * Check if API is configured
   */
  isConfigured: (): boolean => {
    const { apiKey } = asaasConfig.getConfig();
    return !!apiKey;
  },

  /**
   * Save configuration for a specific company
   */
  setCompanyConfig: (companyId: string, companyName: string, apiKey: string, environment: 'sandbox' | 'production') => {
    const key = `asaas_config_${companyId}`;
    const companyConfig: AsaasConfig = {
      apiKey,
      environment,
      companyId,
      companyName
    };
    localStorage.setItem(key, JSON.stringify(companyConfig));
    
    // Also update current configuration if it's the active company
    if (config.companyId === companyId) {
      asaasConfig.setConfig(apiKey, environment, companyId, companyName);
    }
    
    return companyConfig;
  },
  
  /**
   * Get configuration for a specific company
   */
  getCompanyConfig: (companyId: string): AsaasConfig | null => {
    const key = `asaas_config_${companyId}`;
    const storedConfig = localStorage.getItem(key);
    if (storedConfig) {
      return JSON.parse(storedConfig);
    }
    return null;
  },
  
  /**
   * Set active company for Asaas operations
   */
  setActiveCompany: (companyId: string): boolean => {
    const companyConfig = asaasConfig.getCompanyConfig(companyId);
    if (companyConfig) {
      asaasConfig.setConfig(
        companyConfig.apiKey,
        companyConfig.environment,
        companyConfig.companyId,
        companyConfig.companyName
      );
      return true;
    }
    return false;
  }
};

// Load configuration from localStorage on initialization
asaasConfig.getConfig();
