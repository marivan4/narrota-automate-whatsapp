
/**
 * Enhanced Database Utilities for the Faturamento System
 * Provides functions for database operations with improved error handling and logging
 */
import { toast } from "sonner";

// Database configuration - read from environment variables with proper fallbacks
export const DB_CONFIG = {
  host: import.meta.env.VITE_DB_HOST || "localhost",
  user: import.meta.env.VITE_DB_USER || "root",
  password: import.meta.env.VITE_DB_PASSWORD || "",
  database: import.meta.env.VITE_DB_NAME || "faturamento",
  port: parseInt(import.meta.env.VITE_DB_PORT || "3306")
};

// API URL configuration
export const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Enhanced error handler for database operations
 * 
 * @param error The error object
 * @param operation Description of the operation that failed
 * @returns Error object with enhanced message
 */
export const handleDatabaseError = (error: unknown, operation: string): Error => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const enhancedError = new Error(`${operation} falhou: ${errorMessage}`);
  
  console.error(`Erro de banco de dados (${operation}):`, error);
  toast.error(enhancedError.message);
  
  return enhancedError;
};

/**
 * Log operation to console with additional details
 * 
 * @param operation Description of the operation
 * @param details Additional details to log
 */
export const logOperation = (operation: string, details?: any): void => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [DB] ${operation}`);
  
  if (details) {
    console.log('Detalhes:', details);
  }
};

/**
 * Check database connection
 * 
 * @returns Promise resolving to true if connection succeeds, false otherwise
 */
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    logOperation('Verificando conexão com o banco de dados');
    
    // Validate database configuration
    if (!validateDatabaseConfig()) {
      return false;
    }
    
    // Check API connection to the backend
    if (!API_URL) {
      toast.error("API URL não configurada. Configure a variável VITE_API_URL no arquivo .env");
      return false;
    }
    
    // Test connection to backend
    const response = await fetch(`${API_URL}/api/test-connection.php`);
    if (!response.ok) {
      console.error("Falha na conexão com a API:", response.status, response.statusText);
      toast.error("Falha na conexão com a API. Verifique se o backend está rodando corretamente.");
      return false;
    }
    
    const data = await response.json();
    if (!data.success) {
      console.error("Erro de conexão reportado pelo backend:", data.message);
      toast.error(`Erro de conexão com o banco de dados: ${data.message}`);
      return false;
    }
    
    console.log("Conectado ao banco de dados com sucesso");
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Check database schema and tables
 * 
 * @returns Promise resolving to array of table names if successful
 */
export const checkDatabaseSchema = async (): Promise<string[]> => {
  try {
    logOperation('Verificando esquema do banco de dados');
    
    const response = await fetch(`${API_URL}/api/simple-query.php`);
    if (!response.ok) {
      throw new Error(`Falha ao verificar esquema: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Falha ao verificar esquema');
    }
    
    return data.tables || [];
  } catch (error) {
    handleDatabaseError(error, 'Verificação de esquema');
    return [];
  }
};

/**
 * Execute a database query with better error handling
 * 
 * @param query SQL query string
 * @param params Array of parameters for the query
 * @returns Promise resolving to the query results
 */
export const executeQuery = async (query: string, params: any[] = []): Promise<any> => {
  try {
    logOperation(`Executando consulta: ${query}`, { params });
    
    if (!API_URL) {
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
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Erro da API: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    
    // Log success with row count or affected rows
    if (data.data) {
      logOperation(`Consulta retornou ${data.data.length} registros`);
    } else if (data.affectedRows) {
      logOperation(`Consulta afetou ${data.affectedRows} registros`);
    }
    
    return data;
  } catch (error) {
    throw handleDatabaseError(error, 'Consulta SQL');
  }
};

/**
 * Executes a parameterized query with optimized error handling
 * 
 * @param query SQL query to execute
 * @param params Parameters to bind to the query
 * @returns Promise with query results
 */
export const executeParameterizedQuery = async (query: string, params: any[] = []): Promise<any> => {
  try {
    // Remove parameter markers from log to avoid confusion
    const logQuery = query.replace(/\?/g, '•');
    logOperation(`Executando consulta parametrizada: ${logQuery}`, { params });
    
    return await executeQuery(query, params);
  } catch (error) {
    throw handleDatabaseError(error, 'Consulta parametrizada');
  }
};

/**
 * Executes multiple queries in a transaction
 * 
 * @param queries Array of query objects with SQL and params
 * @returns Promise resolving when all queries complete successfully
 */
export const executeTransaction = async (
  queries: Array<{ query: string; params?: any[] }>
): Promise<any[]> => {
  try {
    logOperation('Iniciando transação', { queryCount: queries.length });
    
    if (!API_URL) {
      toast.error("API URL não configurada. Configure a variável VITE_API_URL no arquivo .env");
      throw new Error("API URL não configurada");
    }
    
    // Execute transaction through the PHP API
    const response = await fetch(`${API_URL}/api/execute-transaction.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ queries })
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Erro da API: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const results = await response.json();
    logOperation('Transação concluída com sucesso');
    
    return results;
  } catch (error) {
    throw handleDatabaseError(error, 'Transação SQL');
  }
};

/**
 * Verifies if the database tables exist and creates them if they don't
 *
 * @returns Promise resolving to true if tables exist or were created, false otherwise
 */
export const ensureDatabaseTables = async (): Promise<boolean> => {
  try {
    logOperation('Verificando tabelas do banco de dados');
    
    // Check if tables exist
    const tables = await checkDatabaseSchema();
    const requiredTables = ['clients', 'contracts', 'invoices', 'invoice_items'];
    
    // Check if all required tables exist
    const missingTables = requiredTables.filter(table => !tables.includes(table));
    
    if (missingTables.length === 0) {
      console.log('Todas as tabelas necessárias existem no banco de dados');
      return true;
    }
    
    // Prepare the SQL to create missing tables
    console.log('Tabelas faltando:', missingTables);
    toast.warning(`As seguintes tabelas estão faltando e serão criadas: ${missingTables.join(', ')}`);
    
    // Create tables using schema SQL files
    const response = await fetch(`${API_URL}/api/initialize-database.php`);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Erro ao inicializar banco de dados: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      toast.success('Tabelas do banco de dados criadas com sucesso');
      return true;
    } else {
      toast.error(`Falha ao criar tabelas: ${result.message}`);
      return false;
    }
  } catch (error) {
    handleDatabaseError(error, 'Verificação de tabelas');
    return false;
  }
};

/**
 * Verifies if the database configuration is valid
 * 
 * @returns boolean indicating if configuration is valid
 */
export const validateDatabaseConfig = (): boolean => {
  const isValid = Boolean(
    DB_CONFIG.host && 
    DB_CONFIG.user && 
    DB_CONFIG.database
  );
  
  if (!isValid) {
    console.warn("Configuração de banco de dados incompleta:", {
      host: Boolean(DB_CONFIG.host),
      user: Boolean(DB_CONFIG.user),
      database: Boolean(DB_CONFIG.database)
    });
    
    toast.error("Configuração de banco de dados incompleta. Verifique o arquivo .env");
  }
  
  return isValid;
};

/**
 * Enhanced database connection interface for frontend access
 * Combines all database utility functions
 */
export const dbUtils = {
  checkConnection: checkDatabaseConnection,
  checkSchema: checkDatabaseSchema,
  executeQuery,
  executeParameterizedQuery,
  executeTransaction,
  ensureTables: ensureDatabaseTables,
  validateConfig: validateDatabaseConfig,
};

export default dbUtils;
