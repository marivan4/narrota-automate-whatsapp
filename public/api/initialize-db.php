
<?php
// API endpoint to initialize database with required tables
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Function to log to a file
function log_message($message) {
    $log_file = __DIR__ . '/api_log.txt';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] [initialize-db.php] $message\n", FILE_APPEND);
}

log_message("Database initialization requested");

// Read connection parameters from environment variables
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

// Check if schema file exists
$schema_file = __DIR__ . '/../../src/database/schema.sql';
if (!file_exists($schema_file)) {
    log_message("Schema file not found: " . $schema_file);
    echo json_encode([
        'success' => false,
        'message' => 'Arquivo de esquema SQL não encontrado'
    ]);
    exit();
}

try {
    // Create connection without database first to create it if needed
    $conn = new mysqli(
        $db_config['host'], 
        $db_config['user'], 
        $db_config['password'], 
        '',
        $db_config['port']
    );

    // Check connection
    if ($conn->connect_error) {
        log_message("Database connection failed: " . $conn->connect_error);
        echo json_encode([
            'success' => false,
            'message' => 'Conexão falhou: ' . $conn->connect_error
        ]);
        exit();
    }
    
    // Create database if not exists
    $create_db_query = "CREATE DATABASE IF NOT EXISTS `" . $db_config['dbname'] . "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
    if (!$conn->query($create_db_query)) {
        log_message("Failed to create database: " . $conn->error);
        echo json_encode([
            'success' => false,
            'message' => 'Falha ao criar banco de dados: ' . $conn->error
        ]);
        exit();
    }
    
    $conn->select_db($db_config['dbname']);
    
    // Read schema file
    $schema_sql = file_get_contents($schema_file);
    
    // Split into individual queries
    $queries = array_filter(array_map('trim', explode(';', $schema_sql)), 'strlen');
    
    // Execute each query
    $executed_queries = 0;
    $errors = [];
    
    foreach ($queries as $query) {
        if (!empty($query)) {
            if ($conn->query($query)) {
                $executed_queries++;
            } else {
                $errors[] = [
                    'query' => $query,
                    'error' => $conn->error
                ];
                log_message("Query failed: " . $conn->error . " - Query: " . substr($query, 0, 100) . "...");
            }
        }
    }
    
    // Check if we had any errors
    if (empty($errors)) {
        log_message("Database initialized successfully with $executed_queries queries");
        echo json_encode([
            'success' => true,
            'message' => "Banco de dados inicializado com sucesso. $executed_queries consultas executadas.",
            'queries_executed' => $executed_queries
        ]);
    } else {
        log_message("Database initialization completed with errors: " . count($errors) . " errors");
        echo json_encode([
            'success' => false,
            'message' => "Banco de dados inicializado com erros. $executed_queries consultas executadas com sucesso, " . count($errors) . " erros.",
            'queries_executed' => $executed_queries,
            'errors' => $errors
        ]);
    }
    
    $conn->close();
    
} catch (Exception $e) {
    log_message("Exception: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Exceção: ' . $e->getMessage()
    ]);
}
?>
