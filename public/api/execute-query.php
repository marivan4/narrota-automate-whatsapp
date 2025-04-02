
<?php
// Enable CORS
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
    $log_file = __DIR__ . '/query_log.txt';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message\n", FILE_APPEND);
}

log_message("Execute query requested");

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

// Get POST data
$post_data = json_decode(file_get_contents('php://input'), true);

if (!isset($post_data['query'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Consulta SQL não fornecida'
    ]);
    log_message("Query not provided");
    exit();
}

$query = $post_data['query'];
$params = isset($post_data['params']) ? $post_data['params'] : [];

log_message("Query: $query");
log_message("Params: " . json_encode($params));
log_message("Database config: " . json_encode($db_config));

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
                'database' => $db_config['dbname']
            ]
        ]);
        log_message("Database connection failed: " . $conn->connect_error);
        exit();
    }
    
    // Set charset
    $conn->set_charset("utf8mb4");
    
    // Prepare the statement
    $stmt = $conn->prepare($query);
    
    // If preparation failed
    if (!$stmt) {
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao preparar consulta: ' . $conn->error,
            'query' => $query
        ]);
        log_message("Prepare failed: " . $conn->error);
        $conn->close();
        exit();
    }
    
    // If there are parameters, bind them
    if (!empty($params)) {
        // Create param_type string and param_values array
        $param_type = '';
        $param_values = [];
        
        foreach ($params as $param) {
            if (is_int($param)) {
                $param_type .= 'i';
            } elseif (is_double($param)) {
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
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao executar consulta: ' . $stmt->error,
            'query' => $query
        ]);
        log_message("Execute failed: " . $stmt->error);
        $stmt->close();
        $conn->close();
        exit();
    }
    
    // Get result based on query type
    $result = [];
    
    if (strtoupper(substr(trim($query), 0, 6)) === 'SELECT') {
        // For SELECT queries
        $rs = $stmt->get_result();
        $data = [];
        
        while ($row = $rs->fetch_assoc()) {
            $data[] = $row;
        }
        
        $result = [
            'success' => true,
            'data' => $data
        ];
    } else {
        // For INSERT, UPDATE, DELETE
        $result = [
            'success' => true,
            'affectedRows' => $stmt->affected_rows,
            'insertId' => $conn->insert_id,
            'query' => $query
        ];
    }
    
    // Close statement and connection
    $stmt->close();
    $conn->close();
    
    // Return the result
    echo json_encode($result);
    log_message("Query executed successfully");
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Exceção: ' . $e->getMessage(),
        'query' => $query
    ]);
    log_message("Exception caught: " . $e->getMessage());
}
?>
