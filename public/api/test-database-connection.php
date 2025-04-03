
<?php
// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Read connection parameters from environment variables or use defaults
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
    echo json_encode([
        'message' => 'Testando conexão com o banco de dados...',
        'config' => [
            'host' => $db_config['host'],
            'user' => $db_config['user'],
            'dbname' => $db_config['dbname'],
            'port' => $db_config['port']
        ]
    ]);
    
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
            'message' => 'Conexão falhou: ' . $conn->connect_error,
            'error_code' => $conn->connect_errno
        ]);
        exit();
    }
    
    // Test query
    $test_result = $conn->query("SELECT 1 as test");
    $test_data = $test_result->fetch_assoc();
    
    echo json_encode([
        'success' => true,
        'message' => 'Conexão bem-sucedida com o banco de dados',
        'test_query_result' => $test_data,
        'server_info' => $conn->server_info
    ]);
    
    $conn->close();
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Exceção: ' . $e->getMessage()
    ]);
}
?>
