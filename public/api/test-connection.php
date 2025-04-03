
<?php
// API endpoint to test database connection
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Function to log to a file
function log_message($message) {
    $log_file = __DIR__ . '/api_log.txt';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] [test-connection.php] $message\n", FILE_APPEND);
}

log_message("Database connection test requested");

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
        log_message("Database connection failed: " . $conn->connect_error);
        echo json_encode([
            'success' => false,
            'message' => 'Conexão falhou: ' . $conn->connect_error,
            'config' => [
                'host' => $db_config['host'],
                'database' => $db_config['dbname'],
                'port' => $db_config['port']
            ]
        ]);
        exit();
    }
    
    // Test query to ensure database is working
    $query = "SELECT 1 as test";
    $result = $conn->query($query);
    
    if (!$result) {
        log_message("Test query failed: " . $conn->error);
        echo json_encode([
            'success' => false,
            'message' => 'Consulta de teste falhou: ' . $conn->error
        ]);
        exit();
    }
    
    $row = $result->fetch_assoc();
    
    // Success response
    log_message("Database connection successful");
    echo json_encode([
        'success' => true,
        'message' => 'Conexão com o banco de dados estabelecida com sucesso',
        'config' => [
            'host' => $db_config['host'],
            'database' => $db_config['dbname'],
            'version' => $conn->server_info
        ],
        'test_result' => $row
    ]);
    
    $conn->close();
    
} catch (Exception $e) {
    log_message("Exception: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Exceção: ' . $e->getMessage()
    ]);
}
?>
