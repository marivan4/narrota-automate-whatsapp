
<?php
// API endpoint for updating database structure
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
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
    file_put_contents($log_file, "[$timestamp] [db-update.php] $message\n", FILE_APPEND);
}

log_message("Database update requested");

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
        echo json_encode([
            'success' => false,
            'message' => 'Conexão falhou: ' . $conn->connect_error
        ]);
        log_message("Database connection failed: " . $conn->connect_error);
        exit();
    }
    
    // Set charset
    $conn->set_charset("utf8mb4");
    log_message("Connected to database successfully");
    
    // Read migration SQL file - check multiple possible locations
    $migration_file_paths = [
        __DIR__ . '/../../src/database/migration_updates.sql',
        __DIR__ . '/../src/database/migration_updates.sql',
        __DIR__ . '/migration_updates.sql'
    ];
    
    $migration_file = null;
    foreach ($migration_file_paths as $path) {
        if (file_exists($path)) {
            $migration_file = $path;
            log_message("Found migration file at: " . $path);
            break;
        }
    }
    
    if (!$migration_file) {
        echo json_encode([
            'success' => false,
            'message' => 'Arquivo de migração não encontrado. Verifique as seguintes localizações: ' . implode(', ', $migration_file_paths)
        ]);
        log_message("Migration file not found in any of the checked locations");
        exit();
    }
    
    $migration_sql = file_get_contents($migration_file);
    $queries = array_filter(explode(';', $migration_sql), 'trim');
    
    // Begin transaction
    $conn->begin_transaction();
    $executed = 0;
    $errors = [];
    
    try {
        foreach ($queries as $query) {
            $query = trim($query);
            if (!empty($query)) {
                log_message("Executing query: " . substr($query, 0, 100) . "...");
                if ($conn->query($query)) {
                    $executed++;
                } else {
                    $errors[] = [
                        'query' => $query,
                        'error' => $conn->error
                    ];
                    log_message("Query failed: " . $conn->error);
                }
            }
        }
        
        if (empty($errors)) {
            $conn->commit();
            log_message("Database update completed successfully. $executed queries executed.");
            
            echo json_encode([
                'success' => true,
                'message' => "Banco de dados atualizado com sucesso. $executed consultas executadas."
            ]);
        } else {
            $conn->rollback();
            log_message("Database update failed with errors.");
            
            echo json_encode([
                'success' => false,
                'message' => "Atualização falhou com erros. Verificar logs.",
                'errors' => $errors
            ]);
        }
        
    } catch (Exception $e) {
        $conn->rollback();
        log_message("Exception during transaction: " . $e->getMessage());
        
        echo json_encode([
            'success' => false,
            'message' => 'Exceção durante a transação: ' . $e->getMessage()
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
