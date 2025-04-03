
<?php
// API endpoint for client operations
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
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
    file_put_contents($log_file, "[$timestamp] [clients.php] $message\n", FILE_APPEND);
}

log_message("Client API requested - " . $_SERVER['REQUEST_METHOD']);

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
        log_message("Connection failed: " . $conn->connect_error);
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Conexão falhou: ' . $conn->connect_error
        ]);
        exit();
    }
    
    // Set charset
    $conn->set_charset("utf8mb4");
    
    // Route based on request method
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Check if requesting a specific client
            $client_id = isset($_GET['id']) ? $_GET['id'] : null;
            
            if ($client_id) {
                // Get specific client
                $stmt = $conn->prepare("SELECT * FROM clients WHERE id = ?");
                $stmt->bind_param("s", $client_id);
                $stmt->execute();
                $result = $stmt->get_result();
                
                if ($result->num_rows > 0) {
                    $client = $result->fetch_assoc();
                    echo json_encode($client);
                } else {
                    http_response_code(404);
                    echo json_encode(['message' => 'Cliente não encontrado']);
                }
            } else {
                // Get all clients
                $result = $conn->query("SELECT * FROM clients ORDER BY name");
                $clients = [];
                
                while ($row = $result->fetch_assoc()) {
                    $clients[] = $row;
                }
                
                echo json_encode($clients);
            }
            break;
            
        case 'POST':
            // Create a new client
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            if (!isset($data['name']) || !isset($data['email'])) {
                http_response_code(400);
                echo json_encode(['message' => 'Campos obrigatórios não fornecidos']);
                break;
            }
            
            // Insert new client
            $stmt = $conn->prepare("INSERT INTO clients (name, email, phone, document_id, document_type, address, city, state, zip_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("sssssssss", 
                $data['name'],
                $data['email'],
                $data['phone'] ?? '',
                $data['document_id'] ?? '',
                $data['document_type'] ?? '',
                $data['address'] ?? '',
                $data['city'] ?? '',
                $data['state'] ?? '',
                $data['zip_code'] ?? ''
            );
            
            if ($stmt->execute()) {
                $new_id = $conn->insert_id;
                echo json_encode([
                    'success' => true,
                    'message' => 'Cliente criado com sucesso',
                    'id' => $new_id
                ]);
            } else {
                http_response_code(500);
                log_message("Create client failed: " . $conn->error);
                echo json_encode([
                    'success' => false,
                    'message' => 'Falha ao criar cliente: ' . $stmt->error
                ]);
            }
            break;
            
        case 'PUT':
            // Update an existing client
            $data = json_decode(file_get_contents('php://input'), true);
            $client_id = isset($_GET['id']) ? $_GET['id'] : null;
            
            if (!$client_id) {
                http_response_code(400);
                echo json_encode(['message' => 'ID do cliente não fornecido']);
                break;
            }
            
            // Build update query dynamically based on provided fields
            $fields = [];
            $types = '';
            $values = [];
            
            if (isset($data['name'])) {
                $fields[] = 'name = ?';
                $types .= 's';
                $values[] = $data['name'];
            }
            
            if (isset($data['email'])) {
                $fields[] = 'email = ?';
                $types .= 's';
                $values[] = $data['email'];
            }
            
            if (isset($data['phone'])) {
                $fields[] = 'phone = ?';
                $types .= 's';
                $values[] = $data['phone'];
            }
            
            if (isset($data['document_id'])) {
                $fields[] = 'document_id = ?';
                $types .= 's';
                $values[] = $data['document_id'];
            }
            
            if (isset($data['document_type'])) {
                $fields[] = 'document_type = ?';
                $types .= 's';
                $values[] = $data['document_type'];
            }
            
            if (isset($data['address'])) {
                $fields[] = 'address = ?';
                $types .= 's';
                $values[] = $data['address'];
            }
            
            if (isset($data['city'])) {
                $fields[] = 'city = ?';
                $types .= 's';
                $values[] = $data['city'];
            }
            
            if (isset($data['state'])) {
                $fields[] = 'state = ?';
                $types .= 's';
                $values[] = $data['state'];
            }
            
            if (isset($data['zip_code'])) {
                $fields[] = 'zip_code = ?';
                $types .= 's';
                $values[] = $data['zip_code'];
            }
            
            if (empty($fields)) {
                http_response_code(400);
                echo json_encode(['message' => 'Nenhum campo para atualizar']);
                break;
            }
            
            // Add ID to values array and types
            $types .= 's';
            $values[] = $client_id;
            
            $query = "UPDATE clients SET " . implode(', ', $fields) . " WHERE id = ?";
            $stmt = $conn->prepare($query);
            
            // Create references array for bind_param
            $refs = array();
            $refs[] = $types;
            
            for ($i = 0; $i < count($values); $i++) {
                $refs[] = &$values[$i];
            }
            
            call_user_func_array(array($stmt, 'bind_param'), $refs);
            
            if ($stmt->execute()) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Cliente atualizado com sucesso'
                ]);
            } else {
                http_response_code(500);
                log_message("Update client failed: " . $conn->error);
                echo json_encode([
                    'success' => false,
                    'message' => 'Falha ao atualizar cliente: ' . $stmt->error
                ]);
            }
            break;
            
        case 'DELETE':
            // Delete a client
            $client_id = isset($_GET['id']) ? $_GET['id'] : null;
            
            if (!$client_id) {
                http_response_code(400);
                echo json_encode(['message' => 'ID do cliente não fornecido']);
                break;
            }
            
            // Check if client exists
            $check = $conn->prepare("SELECT id FROM clients WHERE id = ?");
            $check->bind_param("s", $client_id);
            $check->execute();
            $result = $check->get_result();
            
            if ($result->num_rows === 0) {
                http_response_code(404);
                echo json_encode(['message' => 'Cliente não encontrado']);
                break;
            }
            
            // Delete the client
            $stmt = $conn->prepare("DELETE FROM clients WHERE id = ?");
            $stmt->bind_param("s", $client_id);
            
            if ($stmt->execute()) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Cliente excluído com sucesso'
                ]);
            } else {
                http_response_code(500);
                log_message("Delete client failed: " . $conn->error);
                echo json_encode([
                    'success' => false,
                    'message' => 'Falha ao excluir cliente: ' . $stmt->error
                ]);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['message' => 'Método não permitido']);
            break;
    }
    
    $conn->close();
    
} catch (Exception $e) {
    log_message("Exception: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Exceção: ' . $e->getMessage()
    ]);
}
?>
