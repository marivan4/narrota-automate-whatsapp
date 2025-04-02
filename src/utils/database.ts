
// Database connection utilities
import { toast } from "sonner";

// Database configuration - read from environment variables with proper fallbacks
const DB_CONFIG = {
  host: import.meta.env.VITE_DB_HOST || "localhost",
  user: import.meta.env.VITE_DB_USER || "root",
  password: import.meta.env.VITE_DB_PASSWORD || "",
  database: import.meta.env.VITE_DB_NAME || "car_rental_system",
  port: parseInt(import.meta.env.VITE_DB_PORT || "3306")
};

// This is a connector for the PHP backend
export const createDatabaseConnection = async () => {
  try {
    console.log("Tentando conectar ao banco de dados com a configuração:", {
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      database: DB_CONFIG.database,
      port: DB_CONFIG.port
    });
    
    // Validate database configuration
    if (!DB_CONFIG.host || !DB_CONFIG.database) {
      console.error("Configuração de banco de dados incompleta");
      toast.error("Configuração de banco de dados incompleta. Verifique as variáveis de ambiente.");
      return false;
    }
    
    // Check API connection to the backend
    const API_URL = import.meta.env.VITE_API_URL || '';
    
    if (!API_URL) {
      console.error("API URL não configurada");
      toast.error("API URL não configurada. Configure a variável VITE_API_URL no arquivo .env");
      return false;
    }
    
    // Test connection to backend
    try {
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
      console.error("Erro ao conectar com a API:", error);
      toast.error("Não foi possível conectar ao backend. Verifique se o servidor está rodando.");
      return false;
    }
  } catch (error) {
    console.error("Erro de conexão com o banco de dados:", error);
    toast.error("Erro ao conectar com o banco de dados. Verifique as configurações.");
    return false;
  }
};

// MySQL connection parameters - these should match your actual database setup
export const PHP_DB_CONFIG = {
  servername: import.meta.env.VITE_DB_HOST || "localhost",
  username: import.meta.env.VITE_DB_USER || "root",
  password: import.meta.env.VITE_DB_PASSWORD || "",
  dbname: import.meta.env.VITE_DB_NAME || "car_rental_system",
  port: parseInt(import.meta.env.VITE_DB_PORT || "3306")
};

/**
 * Execução de consultas no banco de dados
 * Apenas para testes locais - em produção, todas as consultas devem ser feitas via API PHP
 */
export const executeQuery = async (query: string, params: any[] = []): Promise<any> => {
  try {
    console.log(`Executando consulta com configuração:`, {
      host: DB_CONFIG.host,
      database: DB_CONFIG.database
    });
    console.log(`Consulta: ${query}`);
    console.log(`Com parâmetros: ${JSON.stringify(params)}`);
    
    const API_URL = import.meta.env.VITE_API_URL || '';
    
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
      console.error(`Erro da API: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Erro ao executar consulta: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Resultado da consulta:", data);
    
    return data;
  } catch (error) {
    console.error("Erro na consulta ao banco de dados:", error);
    toast.error("Erro ao executar consulta no banco de dados");
    throw error;
  }
};

// Example PHP connection string (for reference in PHP implementations)
export const getPHPConnectionString = () => {
  return `<?php
$servername = "${PHP_DB_CONFIG.servername}";
$username = "${PHP_DB_CONFIG.username}";
$password = "${PHP_DB_CONFIG.password}";
$dbname = "${PHP_DB_CONFIG.dbname}";
$port = ${PHP_DB_CONFIG.port};

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname, $port);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

// Connection successful
echo "Connected successfully";
?>`;
};

// Verifica se as configurações do banco de dados estão completas
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
  }
  
  return isValid;
};
