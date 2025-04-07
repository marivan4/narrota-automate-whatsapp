
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
    console.error('API Asaas não configurada. Token de acesso ausente.');
    throw new Error('API Asaas não configurada. Configure o token de acesso nas configurações.');
  }

  const baseUrl = BASE_URLS[environment];
  const url = `${baseUrl}${endpoint}`;
  
  // Debug logs
  console.log(`Chamando a API Asaas [${environment}]: ${method} ${url}`);
  
  try {
    // Check if we should use a proxy
    const useProxy = import.meta.env.VITE_USE_PROXY === 'true';
    const proxyUrl = import.meta.env.VITE_PROXY_URL || '/api/proxy.php';
    
    console.log(`Usar proxy: ${useProxy ? 'Sim' : 'Não'}, URL do proxy: ${proxyUrl}`);
    
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
      console.log(`Usando proxy para a API Asaas: ${proxyUrl}`);
      
      try {
        // Approach 1: Use query param in proxy URL
        const proxyWithQuery = `${proxyUrl}?url=${encodeURIComponent(url)}`;
        console.log(`Tentando abordagem 1 com proxy: ${proxyWithQuery}`);
        
        response = await fetch(proxyWithQuery, options);
        
        // If that fails, try the second approach
        if (!response.ok && response.status === 404) {
          console.log("Fallback para abordagem de proxy com path");
          
          // Approach 2: Use the proxy with the path directly
          const proxyOptions = {
            ...options,
            headers: {
              ...headers,
              'X-Target-URL': baseUrl,
            }
          };
          
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
      } catch (proxyError) {
        console.error("Erro ao usar o proxy:", proxyError);
        
        // Simplest fallback attempt - direct call with no-cors
        console.log("Tentativa final: chamada direta com no-cors");
        options.mode = 'no-cors';
        options.credentials = 'omit';
        response = await fetch(url, options);
      }
    } else {
      // Direct API call (will likely fail with CORS in production)
      console.log("Tentando chamada direta à API (pode falhar com CORS)");
      options.mode = 'cors';
      options.credentials = 'omit';
      response = await fetch(url, options);
    }
    
    // Log response for debugging
    console.log(`Resposta da API Asaas: status ${response.status}`);
    
    // If mode is 'no-cors', we can't access response details
    if (response.type === 'opaque') {
      console.log("Resposta opaca recebida (modo no-cors)");
      // We have to assume it worked and return an empty object
      return {} as T;
    }
    
    if (!response.ok) {
      let errorMessage = `Erro na API Asaas: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        console.error('Resposta de erro da API Asaas:', errorData);
        
        // Format a more friendly error message
        if (errorData?.errors?.[0]?.description) {
          errorMessage = `Erro API Asaas: ${errorData.errors[0].description}`;
        }
      } catch (jsonError) {
        console.error('Erro ao analisar resposta de erro JSON:', jsonError);
      }
      
      throw new Error(errorMessage);
    }
    
    try {
      return await response.json();
    } catch (jsonError) {
      console.error('Erro ao analisar resposta JSON:', jsonError);
      return {} as T;
    }
  } catch (error) {
    console.error('Erro na chamada à API Asaas:', error);
    
    // More detailed error handling with user-friendly messages
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('Possível erro de CORS ou conexão');
      const message = 'Erro de conexão com a API Asaas. Possível problema de CORS. ' +
        'Configure o proxy do servidor para resolver este problema. ' + 
        'Configure as variáveis de ambiente VITE_USE_PROXY=true e VITE_PROXY_URL=/api/proxy.php';
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
    } else {
      toast.error('Erro desconhecido na comunicação com a API Asaas');
    }
    throw error;
  }
}

// Export for direct API access
export const callApi = callAsaasApi;
