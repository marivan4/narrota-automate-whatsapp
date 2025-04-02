
<?php
// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Log the connection attempt
error_log("Test connection requested");

// Attempt to connect to the database
$result = array();

// Read connection parameters from environment variables or use defaults
$env_file = __DIR__ . '/../../.env';
$db_config = array(
    'host' => 'localhost',
    'user' => 'root',
    'password' => '',
    'dbname' => 'car_rental_system',
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
        $result = array(
            'success' => false,
            'message' => 'Conexão falhou: ' . $conn->connect_error
        );
        error_log("Database connection failed: " . $conn->connect_error);
    } else {
        // Test query
        $test_query = "SELECT 1 as test";
        $test_result = $conn->query($test_query);
        
        if ($test_result) {
            $result = array(
                'success' => true,
                'message' => 'Conexão bem sucedida com o banco de dados'
            );
            error_log("Database connection successful");
        } else {
            $result = array(
                'success' => false,
                'message' => 'Erro ao executar consulta de teste: ' . $conn->error
            );
            error_log("Query test failed: " . $conn->error);
        }
        
        // Close the connection
        $conn->close();
    }
} catch (Exception $e) {
    $result = array(
        'success' => false,
        'message' => 'Exceção: ' . $e->getMessage()
    );
    error_log("Exception caught: " . $e->getMessage());
}

// Return the result as JSON
echo json_encode($result);
?>
