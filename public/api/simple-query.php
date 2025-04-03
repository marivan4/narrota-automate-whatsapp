
<?php
// Simple API script for database queries
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Read environment variables
$env_file = __DIR__ . '/../../.env';
$host = 'localhost';
$user = 'root';
$password = '';
$dbname = 'faturamento';
$port = 3306;

// Try to read from .env file if it exists
if (file_exists($env_file)) {
    $env_content = file_get_contents($env_file);
    $lines = explode("\n", $env_content);
    
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            
            if ($key === 'VITE_DB_HOST') $host = $value;
            if ($key === 'VITE_DB_USER') $user = $value;
            if ($key === 'VITE_DB_PASSWORD') $password = $value;
            if ($key === 'VITE_DB_NAME') $dbname = $value;
            if ($key === 'VITE_DB_PORT') $port = intval($value);
        }
    }
}

// Create database connection
try {
    $conn = new mysqli($host, $user, $password, $dbname, $port);
    
    // Check connection
    if ($conn->connect_error) {
        echo json_encode([
            'success' => false,
            'message' => 'Database connection failed: ' . $conn->connect_error
        ]);
        exit();
    }
    
    // Set charset
    $conn->set_charset("utf8mb4");
    
    // Handle GET request (test connection)
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $tables = [];
        $tables_result = $conn->query("SHOW TABLES");
        
        if ($tables_result) {
            while ($row = $tables_result->fetch_array()) {
                $tables[] = $row[0];
            }
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Database connection successful',
            'tables' => $tables,
            'table_count' => count($tables)
        ]);
        exit();
    }
    
    // Handle POST request (execute query)
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['query'])) {
        echo json_encode([
            'success' => false,
            'message' => 'No query provided'
        ]);
        exit();
    }
    
    $query = $data['query'];
    $result = $conn->query($query);
    
    if (!$result) {
        echo json_encode([
            'success' => false,
            'message' => 'Query execution failed: ' . $conn->error
        ]);
        exit();
    }
    
    if ($result === true) {
        // For INSERT, UPDATE, DELETE
        echo json_encode([
            'success' => true,
            'affectedRows' => $conn->affected_rows,
            'insertId' => $conn->insert_id
        ]);
    } else {
        // For SELECT
        $rows = [];
        while ($row = $result->fetch_assoc()) {
            $rows[] = $row;
        }
        
        echo json_encode([
            'success' => true,
            'data' => $rows,
            'rowCount' => count($rows)
        ]);
    }
    
    $conn->close();
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Exception: ' . $e->getMessage()
    ]);
}
?>
