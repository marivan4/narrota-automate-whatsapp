
<?php
// API endpoint for executing multiple SQL queries as a transaction
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
    file_put_contents($log_file, "[$timestamp] [transaction.php] $message\n", FILE_APPEND);
}

log_message("Transaction API requested");

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

// Get POST data - should be an array of queries
$post_data = json_decode(file_get_contents('php://input'), true);

if (!isset($post_data['queries']) || !is_array($post_data['queries'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Formato de consulta inválido. Esperado um array de objetos de consulta.'
    ]);
    log_message("Invalid query format");
    exit();
}

$queries = $post_data['queries'];
log_message("Received " . count($queries) . " queries for transaction");

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
    
    // Start transaction
    $conn->begin_transaction();
    log_message("Transaction started");
    
    $results = [];
    
    try {
        // Execute each query in the transaction
        foreach ($queries as $index => $query_data) {
            if (!isset($query_data['query'])) {
                throw new Exception("Query #$index não contém uma consulta SQL válida.");
            }
            
            $query = $query_data['query'];
            $params = isset($query_data['params']) ? $query_data['params'] : [];
            
            log_message("Executing query #$index: $query");
            
            // Prepare the statement
            $stmt = $conn->prepare($query);
            
            if (!$stmt) {
                throw new Exception("Erro ao preparar consulta #$index: " . $conn->error);
            }
            
            // If there are parameters, bind them
            if (!empty($params)) {
                // Create param_type string and param_values array
                $param_type = '';
                $param_values = [];
                
                foreach ($params as $param) {
                    if (is_int($param)) {
                        $param_type .= 'i';
                    } elseif (is_double($param) || is_float($param)) {
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
                throw new Exception("Erro ao executar consulta #$index: " . $stmt->error);
            }
            
            // Get result based on query type
            if (strtoupper(substr(trim($query), 0, 6)) === 'SELECT') {
                // For SELECT queries
                $rs = $stmt->get_result();
                $data = [];
                
                while ($row = $rs->fetch_assoc()) {
                    $data[] = $row;
                }
                
                $results[] = [
                    'success' => true,
                    'data' => $data
                ];
            } else {
                // For INSERT, UPDATE, DELETE
                $results[] = [
                    'success' => true,
                    'affectedRows' => $stmt->affected_rows,
                    'insertId' => $conn->insert_id
                ];
            }
            
            $stmt->close();
        }
        
        // Commit the transaction
        $conn->commit();
        log_message("Transaction committed successfully");
        
        // Return the results
        echo json_encode([
            'success' => true,
            'results' => $results
        ]);
        
    } catch (Exception $e) {
        // Rollback the transaction
        $conn->rollback();
        log_message("Transaction rolled back: " . $e->getMessage());
        
        echo json_encode([
            'success' => false,
            'message' => 'Transação falhou: ' . $e->getMessage()
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
