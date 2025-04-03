
<?php
// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

$response = [
    'success' => true,
    'timestamp' => date('Y-m-d H:i:s'),
    'server' => [
        'software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
        'name' => $_SERVER['SERVER_NAME'] ?? 'Unknown',
        'address' => $_SERVER['SERVER_ADDR'] ?? 'Unknown',
        'protocol' => $_SERVER['SERVER_PROTOCOL'] ?? 'Unknown',
        'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown',
        'script_filename' => $_SERVER['SCRIPT_FILENAME'] ?? 'Unknown',
        'php_version' => PHP_VERSION,
        'os' => PHP_OS,
        'sapi' => php_sapi_name()
    ],
    'request' => [
        'method' => $_SERVER['REQUEST_METHOD'] ?? 'Unknown',
        'uri' => $_SERVER['REQUEST_URI'] ?? 'Unknown',
        'query_string' => $_SERVER['QUERY_STRING'] ?? 'Unknown',
        'remote_addr' => $_SERVER['REMOTE_ADDR'] ?? 'Unknown',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
        'time' => $_SERVER['REQUEST_TIME'] ?? 'Unknown'
    ],
    'paths' => [
        'script_filename' => $_SERVER['SCRIPT_FILENAME'] ?? 'Unknown',
        'script_name' => $_SERVER['SCRIPT_NAME'] ?? 'Unknown',
        'physical_path' => __FILE__,
        'expected_path' => '/var/www/html/faturamento/public/api/diagnose.php',
        'parent_dir' => dirname(__FILE__),
        'grandparent_dir' => dirname(dirname(__FILE__))
    ],
    'environment' => []
];

// Check for .env file
$env_file = __DIR__ . '/../../.env';
$response['environment']['env_file_exists'] = file_exists($env_file);

if ($response['environment']['env_file_exists']) {
    $env_content = file_get_contents($env_file);
    $response['environment']['env_file_size'] = strlen($env_content);
    
    // Parse .env file
    $lines = explode("\n", $env_content);
    $env_vars = [];
    
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            
            // Only show partial values for security
            if (strpos(strtolower($key), 'password') !== false || 
                strpos(strtolower($key), 'key') !== false || 
                strpos(strtolower($key), 'secret') !== false) {
                $value = substr($value, 0, 3) . '***' . substr($value, -2);
            }
            
            $env_vars[$key] = $value;
        }
    }
    
    $response['environment']['parsed_vars'] = $env_vars;
}

// Test file permissions
$response['file_system'] = [
    'api_dir_writable' => is_writable(__DIR__),
    'parent_dir_writable' => is_writable(dirname(__DIR__)),
    'current_file_permissions' => substr(sprintf('%o', fileperms(__FILE__)), -4),
    'parent_dir_permissions' => substr(sprintf('%o', fileperms(dirname(__FILE__))), -4)
];

// Check if we can create and write to a test file
$test_file = __DIR__ . '/test_write.txt';
$write_test = file_put_contents($test_file, "Test: " . date('Y-m-d H:i:s'));
$response['file_system']['write_test'] = $write_test !== false;

if ($write_test !== false) {
    // Clean up after successful test
    unlink($test_file);
    $response['file_system']['cleanup'] = true;
}

// Test database connection
try {
    // Read database config from .env or use defaults
    $db_config = [
        'host' => $env_vars['VITE_DB_HOST'] ?? 'localhost',
        'user' => $env_vars['VITE_DB_USER'] ?? 'root',
        'password' => $env_vars['VITE_DB_PASSWORD'] ?? '',
        'dbname' => $env_vars['VITE_DB_NAME'] ?? 'faturamento',
        'port' => intval($env_vars['VITE_DB_PORT'] ?? 3306)
    ];
    
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
        $response['database'] = [
            'connected' => false,
            'error' => $conn->connect_error,
            'error_code' => $conn->connect_errno
        ];
    } else {
        // Test query
        $test_result = $conn->query("SELECT 1 as test");
        $test_data = $test_result ? $test_result->fetch_assoc() : null;
        
        // Get existing tables
        $tables = [];
        $tables_result = $conn->query("SHOW TABLES");
        if ($tables_result) {
            while ($row = $tables_result->fetch_array()) {
                $tables[] = $row[0];
            }
        }
        
        $response['database'] = [
            'connected' => true,
            'server_info' => $conn->server_info,
            'host_info' => $conn->host_info,
            'protocol_version' => $conn->protocol_version,
            'test_query_result' => $test_data,
            'tables' => $tables,
            'table_count' => count($tables)
        ];
        
        $conn->close();
    }
} catch (Exception $e) {
    $response['database'] = [
        'connected' => false,
        'exception' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ];
}

// Check if we can execute other PHP API scripts
$script_tests = [
    'execute-query.php' => file_exists(__DIR__ . '/execute-query.php'),
    'test-connection.php' => file_exists(__DIR__ . '/test-connection.php'),
    'verify-database.php' => file_exists(__DIR__ . '/verify-database.php')
];

$response['api_scripts'] = $script_tests;

// Check installed PHP modules
$response['php_modules'] = [
    'mysqli' => extension_loaded('mysqli'),
    'pdo' => extension_loaded('pdo'),
    'pdo_mysql' => extension_loaded('pdo_mysql'),
    'json' => extension_loaded('json'),
    'curl' => extension_loaded('curl'),
    'mbstring' => extension_loaded('mbstring')
];

// Output the response
echo json_encode($response, JSON_PRETTY_PRINT);
?>
