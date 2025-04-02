
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
            'config' => [
                'host' => $db_config['host'],
                'database' => $db_config['dbname'],
                'port' => $db_config['port']
            ]
        ]);
        exit();
    }
    
    // Get all tables
    $tables_result = $conn->query("SHOW TABLES");
    $tables = [];
    
    while ($row = $tables_result->fetch_array()) {
        $tables[] = $row[0];
    }
    
    // Check for required tables
    $required_tables = [
        'users', 'clients', 'vehicles', 'contracts', 'invoices', 
        'invoice_items', 'settings', 'whatsapp_configs'
    ];
    
    $missing_tables = [];
    foreach ($required_tables as $table) {
        if (!in_array($table, $tables)) {
            $missing_tables[] = $table;
        }
    }
    
    // Get row counts for main tables
    $table_counts = [];
    foreach ($tables as $table) {
        $count_result = $conn->query("SELECT COUNT(*) as total FROM `$table`");
        if ($count_result) {
            $count = $count_result->fetch_assoc()['total'];
            $table_counts[$table] = $count;
        } else {
            $table_counts[$table] = 'Error counting rows';
        }
    }
    
    // Return the result
    echo json_encode([
        'success' => true,
        'message' => 'Verificação do banco de dados concluída',
        'tables_found' => count($tables),
        'tables' => $tables,
        'missing_tables' => $missing_tables,
        'table_counts' => $table_counts,
        'database_name' => $db_config['dbname'],
        'host' => $db_config['host']
    ]);
    
    $conn->close();
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Exceção: ' . $e->getMessage()
    ]);
}
?>
