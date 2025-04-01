
/**
 * API module for Asaas API integration
 */

import { asaasConfig, BASE_URLS } from './asaasConfig';

/**
 * Makes a call to the Asaas API with improved CORS handling
 */
export async function callAsaasApi<T>(endpoint: string, method: string = 'GET', data?: any): Promise<T> {
  const { apiKey, environment } = asaasConfig.getConfig();
  
  if (!apiKey) {
    throw new Error('API Asaas não configurada. Configure o token de acesso nas configurações.');
  }

  const baseUrl = BASE_URLS[environment];
  const url = `${baseUrl}${endpoint}`;
  
  // Debug logs
  console.log(`Calling Asaas API [${environment}]: ${method} ${url}`);
  
  try {
    // Updated API call with proper headers
    const options: RequestInit = {
      method,
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'access_token': apiKey
      },
      // Use no-cors only for GET requests if needed
      mode: 'cors',
      body: data ? JSON.stringify(data) : undefined
    };
    
    const response = await fetch(url, options);
    
    // Log response for debugging
    console.log(`Asaas API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Asaas API error:', errorData);
      
      // Format a more friendly error message
      let errorMessage = `Erro na API Asaas: ${response.status} ${response.statusText}`;
      if (errorData?.errors?.[0]?.description) {
        errorMessage = `Erro API Asaas: ${errorData.errors[0].description}`;
      }
      
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro na chamada à API Asaas:', error);
    
    // Specific error handling
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('Possível erro de CORS ou conexão');
      throw new Error('Erro de conexão com a API Asaas. Possível problema de CORS. Verifique se o token está correto e se a API está acessível.');
    } else if (error instanceof Error && error.message.includes('NetworkError')) {
      throw new Error('Erro de rede ao conectar à API Asaas. Verifique sua conexão de internet.');
    }
    
    throw error;
  }
}
