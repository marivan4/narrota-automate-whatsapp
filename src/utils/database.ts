
/**
 * Database Utilities for MySQL Integration
 */
import { toast } from "sonner";

// Database configuration
export const DB_CONFIG = {
  host: import.meta.env.VITE_DB_HOST || "localhost",
  user: import.meta.env.VITE_DB_USER || "root",
  password: import.meta.env.VITE_DB_PASSWORD || "Mari0307@", // Usando a senha dos seus logs
  database: import.meta.env.VITE_DB_NAME || "faturamento",
  port: parseInt(import.meta.env.VITE_DB_PORT || "3306")
};

// API URL configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/faturamento/public';

/**
 * Test database connection
 * @returns Promise resolving to true if connection succeeds
 */
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    console.log("Testing database connection with config:", {
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      database: DB_CONFIG.database,
    });
    
    if (!API_URL) {
      toast.error("API URL não configurada. Configure a variável VITE_API_URL no arquivo .env");
      console.error("API URL not configured");
      return false;
    }
    
    const response = await fetch(`${API_URL}/api/test-connection.php`);
    if (!response.ok) {
      console.error("Connection test failed:", response.status, response.statusText);
      toast.error("Falha na conexão com o banco de dados");
      return false;
    }
    
    const data = await response.json();
    if (!data.success) {
      console.error("Database connection error:", data.message);
      toast.error(`Erro de conexão com o banco de dados: ${data.message}`);
      return false;
    }
    
    console.log("Database connection successful");
    return true;
  } catch (error) {
    console.error("Database connection test error:", error);
    toast.error("Erro ao testar conexão com o banco de dados");
    return false;
  }
};

/**
 * Execute a database query
 * @param query SQL query string
 * @param params Array of parameters for the query
 * @returns Promise resolving to the query results
 */
export const executeQuery = async (query: string, params: any[] = []): Promise<any> => {
  try {
    if (!API_URL) {
      toast.error("API URL não configurada. Configure a variável VITE_API_URL no arquivo .env");
      throw new Error("API URL não configurada");
    }
    
    console.log("Executing query:", query, "with params:", params);
    
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
      const errorText = await response.text();
      console.error("Query execution failed:", response.status, response.statusText, errorText);
      throw new Error(`Erro ao executar consulta: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log("Query result:", result);
    
    if (!result.success) {
      console.error("Query failed:", result.message);
      throw new Error(result.message || "Erro ao executar consulta");
    }
    
    return result;
  } catch (error) {
    console.error("Query execution error:", error);
    throw error;
  }
};

/**
 * Initialize database tables if they don't exist
 */
export const initializeDatabase = async (): Promise<boolean> => {
  try {
    console.log("Initializing database tables");
    
    if (!API_URL) {
      toast.error("API URL não configurada. Configure a variável VITE_API_URL no arquivo .env");
      return false;
    }
    
    const response = await fetch(`${API_URL}/api/initialize-database.php`);
    if (!response.ok) {
      console.error("Database initialization failed:", response.status, response.statusText);
      toast.error("Falha na inicialização do banco de dados");
      return false;
    }
    
    const result = await response.json();
    console.log("Database initialization result:", result);
    
    if (!result.success) {
      console.error("Database initialization failed:", result.message);
      toast.error(`Falha na inicialização do banco de dados: ${result.message}`);
      return false;
    }
    
    if (result.tables_created && result.tables_created.length > 0) {
      toast.success(`Tabelas criadas com sucesso: ${result.tables_created.join(', ')}`);
    } else {
      console.log("All required tables already exist");
    }
    
    // Execute the database update script to make sure all tables are up-to-date
    try {
      console.log("Running database update script");
      const updateResponse = await fetch(`${API_URL}/api/db-update.php`);
      
      if (updateResponse.ok) {
        const updateResult = await updateResponse.json();
        console.log("Database update result:", updateResult);
        
        if (updateResult.success) {
          toast.success("Banco de dados atualizado com sucesso");
        } else {
          console.warn("Database update warning:", updateResult.message);
        }
      } else {
        console.error("Database update failed:", updateResponse.status, updateResponse.statusText);
      }
    } catch (updateError) {
      console.error("Database update error:", updateError);
    }
    
    return true;
  } catch (error) {
    console.error("Database initialization error:", error);
    toast.error("Erro ao inicializar banco de dados");
    return false;
  }
};

/**
 * Execute a database transaction with multiple queries
 * @param queries Array of query objects with SQL and parameters
 * @returns Promise resolving to the transaction results
 */
export const executeTransaction = async (queries: { sql: string; params: any[] }[]): Promise<any> => {
  try {
    if (!API_URL) {
      toast.error("API URL não configurada. Configure a variável VITE_API_URL no arquivo .env");
      throw new Error("API URL não configurada");
    }
    
    console.log("Executing transaction with", queries.length, "queries");
    
    const response = await fetch(`${API_URL}/api/execute-transaction.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ queries })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Transaction execution failed:", response.status, response.statusText, errorText);
      throw new Error(`Erro ao executar transação: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log("Transaction result:", result);
    
    if (!result.success) {
      console.error("Transaction failed:", result.message);
      throw new Error(result.message || "Erro ao executar transação");
    }
    
    return result;
  } catch (error) {
    console.error("Transaction execution error:", error);
    throw error;
  }
};
