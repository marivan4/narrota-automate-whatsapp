
<?php
// API endpoint to check system status and configuration
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
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
    file_put_contents($log_file, "[$timestamp] [check-system.php] $message\n", FILE_APPEND);
}

log_message("System check requested");

// Check if we can read .env file
$env_file = __DIR__ . '/../../.env';
$env_readable = file_exists($env_file) && is_readable($env_file);
$env_values = [];

if ($env_readable) {
    $env_content = file_get_contents($env_file);
    $lines = explode("\n", $env_content);
    
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            
            // Don't expose passwords and sensitive information
            if (strpos(strtolower($key), 'password') !== false || 
                strpos(strtolower($key), 'secret') !== false || 
                strpos(strtolower($key), 'key') !== false) {
                $value = '********';
            }
            
            $env_values[$key] = $value;
        }
    }
}

// Check database connection
$db_config = array(
    'host' => 'localhost',
    'user' => 'root',
    'password' => '',
    'dbname' => 'faturamento',
    'port' => 3306
);

if (isset($env_values['VITE_DB_HOST'])) $db_config['host'] = $env_values['VITE_DB_HOST'];
if (isset($env_values['VITE_DB_USER'])) $db_config['user'] = $env_values['VITE_DB_USER'];
if (isset($env_values['VITE_DB_PASSWORD'])) $db_config['password'] = '********';
if (isset($env_values['VITE_DB_NAME'])) $db_config['dbname'] = $env_values['VITE_DB_NAME'];
if (isset($env_values['VITE_DB_PORT'])) $db_config['port'] = intval($env_values['VITE_DB_PORT']);

$db_connection = false;
$db_error = '';
$db_tables = [];

try {
    // Create connection
    $conn = new mysqli(
        $db_config['host'], 
        $db_config['user'], 
        $db_config['password'] === '********' ? '' : $db_config['password'], 
        $db_config['dbname'], 
        $db_config['port']
    );

    // Check connection
    if ($conn->connect_error) {
        $db_error = $conn->connect_error;
    } else {
        $db_connection = true;
        
        // Get all tables in the database
        $result = $conn->query("SHOW TABLES");
        
        while ($row = $result->fetch_array()) {
            $table_name = $row[0];
            
            // Get number of rows in the table
            $count_result = $conn->query("SELECT COUNT(*) as count FROM `$table_name`");
            $count_row = $count_result->fetch_assoc();
            $row_count = $count_row['count'];
            
            $db_tables[] = [
                'name' => $table_name,
                'rows' => $row_count
            ];
        }
        
        $conn->close();
    }
} catch (Exception $e) {
    $db_error = $e->getMessage();
}

// Check PHP modules
$required_modules = [
    'mysqli', 
    'json', 
    'curl', 
    'mbstring'
];

$php_modules = [];
foreach ($required_modules as $module) {
    $php_modules[$module] = extension_loaded($module);
}

// Check file permissions
$api_dir = __DIR__;
$src_dir = __DIR__ . '/../../src';
$app_dir = __DIR__ . '/../..';

$file_permissions = [
    'api_directory' => [
        'path' => $api_dir,
        'writable' => is_writable($api_dir),
        'readable' => is_readable($api_dir)
    ],
    'src_directory' => [
        'path' => $src_dir,
        'writable' => is_writable($src_dir),
        'readable' => is_readable($src_dir)
    ],
    'app_directory' => [
        'path' => $app_dir,
        'writable' => is_writable($app_dir),
        'readable' => is_readable($app_dir)
    ]
];

// Collect API endpoints
$api_endpoints = [];
$api_files = glob($api_dir . '/*.php');
foreach ($api_files as $file) {
    $api_endpoints[] = [
        'file' => basename($file),
        'size' => filesize($file),
        'modified' => date('Y-m-d H:i:s', filemtime($file))
    ];
}

// Check log files
$log_files = glob($api_dir . '/*_log.txt');
$logs = [];
foreach ($log_files as $file) {
    $logs[] = [
        'file' => basename($file),
        'size' => filesize($file),
        'modified' => date('Y-m-d H:i:s', filemtime($file)),
        'last_lines' => count(file($file)) > 10 
            ? implode('', array_slice(file($file), -10)) 
            : file_get_contents($file)
    ];
}

// Build response
$response = [
    'success' => true,
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => PHP_VERSION,
    'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'env_file' => [
        'exists' => $env_readable,
        'values' => $env_values
    ],
    'database' => [
        'connected' => $db_connection,
        'error' => $db_error,
        'config' => $db_config,
        'tables' => $db_tables
    ],
    'php_modules' => $php_modules,
    'file_permissions' => $file_permissions,
    'api_endpoints' => $api_endpoints,
    'logs' => $logs,
    'server_path' => __DIR__
];

echo json_encode($response, JSON_PRETTY_PRINT);
?>
