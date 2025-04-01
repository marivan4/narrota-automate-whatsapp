
/**
 * API module for Asaas API integration
 */

import { asaasConfig, BASE_URLS } from './asaasConfig';
import { toast } from 'sonner';

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
    // First check if we should use a proxy
    const useProxy = import.meta.env.VITE_USE_PROXY === 'true';
    const proxyUrl = import.meta.env.VITE_PROXY_URL || '/api/proxy';
    
    // Headers for the request
    const headers: HeadersInit = {
      'accept': 'application/json',
      'content-type': 'application/json',
      'access_token': apiKey
    };
    
    // Request options
    const options: RequestInit = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined
    };
    
    let response;
    
    // Try using a proxy if configured
    if (useProxy) {
      console.log(`Using proxy for Asaas API: ${proxyUrl}`);
      
      // Modify for proxy usage
      const proxyOptions = {
        ...options,
        headers: {
          ...headers,
          'X-Target-URL': baseUrl,
        }
      };
      
      // Approach 1: Use query param in proxy URL
      const proxyWithQuery = `${proxyUrl}?url=${encodeURIComponent(url)}`;
      response = await fetch(proxyWithQuery, options);
      
      // If that fails, try the second approach
      if (!response.ok && response.status === 404) {
        console.log("Falling back to proxy with path approach");
        // Approach 2: Use the proxy with the path directly
        response = await fetch(`${proxyUrl}`, {
          ...proxyOptions,
          method: 'POST',
          body: JSON.stringify({
            url,
            method,
            data,
            headers: {
              'access_token': apiKey
            }
          })
        });
      }
    } else {
      // Direct API call (will likely fail with CORS in production)
      console.log("Attempting direct API call (may fail with CORS)");
      options.mode = 'cors';
      options.credentials = 'omit';
      response = await fetch(url, options);
    }
    
    // Log response for debugging
    console.log(`Asaas API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Asaas API error response:', errorData);
      
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
    
    // More detailed error handling with user-friendly messages
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('Possível erro de CORS ou conexão');
      const message = 'Erro de conexão com a API Asaas. Possível problema de CORS. ' +
        'Configure o proxy do servidor para resolver este problema. ' + 
        'Configure as variáveis de ambiente VITE_USE_PROXY=true e VITE_PROXY_URL=/api/proxy';
      toast.error(message);
      throw new Error(message);
    } else if (error instanceof Error && error.message.includes('NetworkError')) {
      const message = 'Erro de rede ao conectar à API Asaas. Verifique sua conexão de internet.';
      toast.error(message);
      throw new Error(message);
    }
    
    // Re-throw the original error if it's not one of the specific cases
    if (error instanceof Error) {
      toast.error(error.message);
    }
    throw error;
  }
}
