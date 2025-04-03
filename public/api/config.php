
<?php
/**
 * Arquivo de configuração para APIs PHP
 * Centraliza funções e configurações comuns para todos os endpoints
 */

// Function to log to a file
function log_message($message, $file_prefix = 'api') {
    $log_file = __DIR__ . "/{$file_prefix}_log.txt";
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message\n", FILE_APPEND);
}

// Function to setup CORS and headers
function setup_cors() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Content-Type: application/json");
    
    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

// Function to get database configuration from .env file
function get_db_config() {
    $env_file = __DIR__ . '/../../.env';
    $db_config = array(
        'host' => 'localhost',
        'user' => 'root',
        'password' => '',
        'dbname' => 'faturamento',
        'port' => 3306
    );
    
    // Try to read from .env file if it exists
    if (file_exists($env_file)) {
        $env_content = file_get_contents($env_file);
        $lines = explode("\n", $env_content);
        
        foreach ($lines as $line) {
            if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                
                if ($key === 'VITE_DB_HOST') $db_config['host'] = $value;
                if ($key === 'VITE_DB_USER') $db_config['user'] = $value;
                if ($key === 'VITE_DB_PASSWORD') $db_config['password'] = $value;
                if ($key === 'VITE_DB_NAME') $db_config['dbname'] = $value;
                if ($key === 'VITE_DB_PORT') $db_config['port'] = intval($value);
            }
        }
    }
    
    return $db_config;
}

// Function to create database connection
function create_db_connection() {
    $db_config = get_db_config();
    
    try {
        // Create connection
        $conn = new mysqli(
            $db_config['host'], 
            $db_config['user'], 
            $db_config['password'], 
            $db_config['dbname'], 
            $db_config['port']
        );
        
        // Check connection
        if ($conn->connect_error) {
            log_message("Connection failed: " . $conn->connect_error);
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Conexão falhou: ' . $conn->connect_error
            ]);
            exit();
        }
        
        // Set charset
        $conn->set_charset("utf8mb4");
        
        return $conn;
    } catch (Exception $e) {
        log_message("Exception when creating connection: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Exceção ao criar conexão: ' . $e->getMessage()
        ]);
        exit();
    }
}

// Function to prepare and execute a query with parameters
function execute_query($conn, $query, $params = []) {
    try {
        // Prepare the statement
        $stmt = $conn->prepare($query);
        
        if (!$stmt) {
            throw new Exception("Erro na preparação da consulta: " . $conn->error);
        }
        
        // If there are parameters, bind them
        if (!empty($params)) {
            // Create param_type string and param_values array
            $param_type = '';
            $param_values = [];
            
            foreach ($params as $param) {
                if (is_int($param)) {
                    $param_type .= 'i';
                } elseif (is_double($param) || is_float($param)) {
                    $param_type .= 'd';
                } elseif (is_string($param)) {
                    $param_type .= 's';
                } else {
                    $param_type .= 's';
                    $param = strval($param);
                }
                $param_values[] = $param;
            }
            
            // Create references to params
            $refs = [];
            $refs[] = &$param_type;
            
            foreach ($param_values as $key => $value) {
                $refs[] = &$param_values[$key];
            }
            
            // Bind parameters
            call_user_func_array([$stmt, 'bind_param'], $refs);
        }
        
        // Execute the statement
        $stmt->execute();
        
        // Check for errors
        if ($stmt->errno) {
            throw new Exception("Erro ao executar consulta: " . $stmt->error);
        }
        
        // Get result based on query type
        if (strtoupper(substr(trim($query), 0, 6)) === 'SELECT') {
            // For SELECT queries
            $rs = $stmt->get_result();
            $data = [];
            
            while ($row = $rs->fetch_assoc()) {
                $data[] = $row;
            }
            
            $result = [
                'success' => true,
                'data' => $data,
                'rowCount' => count($data)
            ];
        } else {
            // For INSERT, UPDATE, DELETE
            $result = [
                'success' => true,
                'affectedRows' => $stmt->affected_rows,
                'insertId' => $conn->insert_id
            ];
        }
        
        $stmt->close();
        
        return $result;
    } catch (Exception $e) {
        log_message("Exception in execute_query: " . $e->getMessage());
        throw $e; // Re-throw to be caught by the caller
    }
}
?>
