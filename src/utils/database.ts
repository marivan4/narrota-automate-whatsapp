
// Database connection utilities
import { toast } from "sonner";
import { logError, ErrorSeverity } from "./errorLogger";

// Database configuration - read from environment variables with proper fallbacks
const DB_CONFIG = {
  host: import.meta.env.VITE_DB_HOST || "localhost",
  user: import.meta.env.VITE_DB_USER || "root",
  password: import.meta.env.VITE_DB_PASSWORD || "",
  database: import.meta.env.VITE_DB_NAME || "faturamento",
  port: parseInt(import.meta.env.VITE_DB_PORT || "3306")
};

// Constants
const SOURCE = 'database.ts';

/**
 * Testa a conexão com o banco de dados via API
 */
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || '';
    if (!API_URL) {
      logError("API URL não configurada", ErrorSeverity.ERROR, SOURCE);
      return false;
    }
    
    console.log(`Testando conexão com o banco de dados via ${API_URL}/api/test-connection.php`);
    
    const response = await fetch(`${API_URL}/api/test-connection.php`);
    const data = await response.json();
    
    if (data.success) {
      console.log("Conexão com banco de dados testada com sucesso:", data);
      return true;
    } else {
      logError(`Falha na conexão com banco de dados: ${data.message}`, ErrorSeverity.ERROR, SOURCE, null, data);
      return false;
    }
  } catch (error) {
    logError("Erro ao testar conexão com banco de dados", ErrorSeverity.ERROR, SOURCE, error);
    return false;
  }
};

/**
 * Inicializa o banco de dados criando todas as tabelas necessárias
 */
export const initializeDatabase = async (): Promise<boolean> => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || '';
    if (!API_URL) {
      logError("API URL não configurada", ErrorSeverity.ERROR, SOURCE);
      return false;
    }
    
    console.log(`Inicializando banco de dados via ${API_URL}/api/initialize-db.php`);
    
    const response = await fetch(`${API_URL}/api/initialize-db.php`, {
      method: 'POST'
    });
    
    const data = await response.json();
    
    if (data.success) {
      toast.success("Banco de dados inicializado com sucesso!");
      console.log("Banco de dados inicializado:", data);
      return true;
    } else {
      logError(`Falha ao inicializar banco de dados: ${data.message}`, ErrorSeverity.ERROR, SOURCE, null, data);
      toast.error("Falha ao inicializar banco de dados");
      return false;
    }
  } catch (error) {
    logError("Erro ao inicializar banco de dados", ErrorSeverity.ERROR, SOURCE, error);
    toast.error("Erro ao inicializar banco de dados");
    return false;
  }
};

/**
 * Executa uma consulta SQL no banco de dados
 * @param query Consulta SQL
 * @param params Parâmetros para a consulta (opcional)
 * @returns Resultado da consulta
 */
export const executeQuery = async (query: string, params: any[] = []): Promise<any> => {
  try {
    console.log(`Executando consulta: ${query}`);
    if (params.length > 0) {
      console.log(`Com parâmetros: ${JSON.stringify(params)}`);
    }
    
    const API_URL = import.meta.env.VITE_API_URL || '';
    
    if (!API_URL) {
      logError("API URL não configurada para executeQuery", ErrorSeverity.ERROR, SOURCE);
      toast.error("API URL não configurada. Configure a variável VITE_API_URL no arquivo .env");
      throw new Error("API URL não configurada");
    }
    
    // Execute a consulta através da API PHP
    const response = await fetch(`${API_URL}/api/execute-query.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        params
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Erro desconhecido');
      logError(`Erro da API: ${response.status} ${response.statusText}`, ErrorSeverity.ERROR, SOURCE, null, { errorText });
      throw new Error(`Erro ao executar consulta: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Log error if query failed
    if (!data.success) {
      logError(`Falha na execução da consulta: ${data.message}`, ErrorSeverity.ERROR, SOURCE, null, { query, params });
      throw new Error(data.message || 'Erro na execução da consulta');
    }
    
    console.log("Resultado da consulta:", data);
    return data;
  } catch (error) {
    logError("Erro ao executar consulta no banco de dados", ErrorSeverity.ERROR, SOURCE, error, { query, params });
    toast.error("Erro ao executar consulta no banco de dados");
    throw error;
  }
};

/**
 * Executa múltiplas consultas como uma transação
 * @param queries Array de objetos { query, params }
 * @returns Resultados da transação
 */
export const executeTransaction = async (queries: { query: string, params?: any[] }[]): Promise<any> => {
  try {
    console.log(`Executando transação com ${queries.length} consultas`);
    
    const API_URL = import.meta.env.VITE_API_URL || '';
    
    if (!API_URL) {
      logError("API URL não configurada para executeTransaction", ErrorSeverity.ERROR, SOURCE);
      toast.error("API URL não configurada. Configure a variável VITE_API_URL no arquivo .env");
      throw new Error("API URL não configurada");
    }
    
    // Execute a transação através da API PHP
    const response = await fetch(`${API_URL}/api/execute-transaction.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        queries
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Erro desconhecido');
      logError(`Erro da API: ${response.status} ${response.statusText}`, ErrorSeverity.ERROR, SOURCE, null, { errorText });
      throw new Error(`Erro ao executar transação: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Log error if transaction failed
    if (!data.success) {
      logError(`Falha na execução da transação: ${data.message}`, ErrorSeverity.ERROR, SOURCE, null, { queries });
      throw new Error(data.message || 'Erro na execução da transação');
    }
    
    console.log("Resultado da transação:", data);
    return data;
  } catch (error) {
    logError("Erro ao executar transação no banco de dados", ErrorSeverity.ERROR, SOURCE, error, { queries });
    toast.error("Erro ao executar transação no banco de dados");
    throw error;
  }
};

// Export config and functions
export { DB_CONFIG };
export default {
  testConnection: testDatabaseConnection,
  initializeDatabase,
  executeQuery,
  executeTransaction,
  config: DB_CONFIG
};
