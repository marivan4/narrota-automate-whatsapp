
<?php
// API endpoint for contract operations
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
    file_put_contents($log_file, "[$timestamp] [contracts.php] $message\n", FILE_APPEND);
}

log_message("Contract API requested - " . $_SERVER['REQUEST_METHOD']);

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
            // Check if requesting a specific contract
            $contract_id = isset($_GET['id']) ? $_GET['id'] : null;
            
            if ($contract_id) {
                // Get specific contract with client details
                $query = "SELECT c.*, cl.name as client_name, cl.email as client_email 
                          FROM contracts c 
                          LEFT JOIN clients cl ON c.client_id = cl.id 
                          WHERE c.id = ?";
                $stmt = $conn->prepare($query);
                $stmt->bind_param("s", $contract_id);
                $stmt->execute();
                $result = $stmt->get_result();
                
                if ($result->num_rows > 0) {
                    $contract = $result->fetch_assoc();
                    echo json_encode($contract);
                } else {
                    http_response_code(404);
                    echo json_encode(['message' => 'Contrato não encontrado']);
                }
            } else {
                // Get all contracts with client names
                $query = "SELECT c.*, cl.name as client_name 
                          FROM contracts c 
                          LEFT JOIN clients cl ON c.client_id = cl.id 
                          ORDER BY c.start_date DESC";
                $result = $conn->query($query);
                $contracts = [];
                
                while ($row = $result->fetch_assoc()) {
                    $contracts[] = $row;
                }
                
                echo json_encode($contracts);
            }
            break;
            
        case 'POST':
            // Create a new contract
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            if (!isset($data['contract_number']) || !isset($data['client_id']) || !isset($data['start_date'])) {
                http_response_code(400);
                echo json_encode(['message' => 'Campos obrigatórios não fornecidos']);
                break;
            }
            
            // Format dates
            $start_date = isset($data['start_date']) ? date('Y-m-d', strtotime($data['start_date'])) : null;
            $end_date = isset($data['end_date']) ? date('Y-m-d', strtotime($data['end_date'])) : null;
            
            // Insert new contract
            $stmt = $conn->prepare("INSERT INTO contracts (contract_number, client_id, start_date, end_date, value, status, description, payment_terms, vehicle_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("ssssdssss", 
                $data['contract_number'],
                $data['client_id'],
                $start_date,
                $end_date,
                $data['value'] ?? 0,
                $data['status'] ?? 'active',
                $data['description'] ?? '',
                $data['payment_terms'] ?? '',
                $data['vehicle_id'] ?? null
            );
            
            if ($stmt->execute()) {
                $new_id = $conn->insert_id;
                echo json_encode([
                    'success' => true,
                    'message' => 'Contrato criado com sucesso',
                    'id' => $new_id
                ]);
            } else {
                http_response_code(500);
                log_message("Create contract failed: " . $conn->error);
                echo json_encode([
                    'success' => false,
                    'message' => 'Falha ao criar contrato: ' . $stmt->error
                ]);
            }
            break;
            
        case 'PUT':
            // Update an existing contract
            $data = json_decode(file_get_contents('php://input'), true);
            $contract_id = isset($_GET['id']) ? $_GET['id'] : null;
            
            if (!$contract_id) {
                http_response_code(400);
                echo json_encode(['message' => 'ID do contrato não fornecido']);
                break;
            }
            
            // Format dates if provided
            if (isset($data['start_date'])) {
                $data['start_date'] = date('Y-m-d', strtotime($data['start_date']));
            }
            
            if (isset($data['end_date'])) {
                $data['end_date'] = date('Y-m-d', strtotime($data['end_date']));
            }
            
            // Build update query dynamically based on provided fields
            $fields = [];
            $types = '';
            $values = [];
            
            $field_types = [
                'contract_number' => 's',
                'client_id' => 's',
                'start_date' => 's',
                'end_date' => 's',
                'value' => 'd',
                'status' => 's',
                'description' => 's',
                'payment_terms' => 's',
                'vehicle_id' => 's'
            ];
            
            foreach ($field_types as $field => $type) {
                if (isset($data[$field])) {
                    $fields[] = "$field = ?";
                    $types .= $type;
                    $values[] = $data[$field];
                }
            }
            
            if (empty($fields)) {
                http_response_code(400);
                echo json_encode(['message' => 'Nenhum campo para atualizar']);
                break;
            }
            
            // Add ID to values array and types
            $types .= 's';
            $values[] = $contract_id;
            
            $query = "UPDATE contracts SET " . implode(', ', $fields) . " WHERE id = ?";
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
                    'message' => 'Contrato atualizado com sucesso'
                ]);
            } else {
                http_response_code(500);
                log_message("Update contract failed: " . $conn->error);
                echo json_encode([
                    'success' => false,
                    'message' => 'Falha ao atualizar contrato: ' . $stmt->error
                ]);
            }
            break;
            
        case 'DELETE':
            // Delete a contract
            $contract_id = isset($_GET['id']) ? $_GET['id'] : null;
            
            if (!$contract_id) {
                http_response_code(400);
                echo json_encode(['message' => 'ID do contrato não fornecido']);
                break;
            }
            
            // Check if contract exists
            $check = $conn->prepare("SELECT id FROM contracts WHERE id = ?");
            $check->bind_param("s", $contract_id);
            $check->execute();
            $result = $check->get_result();
            
            if ($result->num_rows === 0) {
                http_response_code(404);
                echo json_encode(['message' => 'Contrato não encontrado']);
                break;
            }
            
            // Check if contract has invoices
            $check = $conn->prepare("SELECT id FROM invoices WHERE contract_id = ? LIMIT 1");
            $check->bind_param("s", $contract_id);
            $check->execute();
            $result = $check->get_result();
            
            if ($result->num_rows > 0) {
                http_response_code(400);
                echo json_encode(['message' => 'Não é possível excluir: este contrato possui faturas associadas']);
                break;
            }
            
            // Delete the contract
            $stmt = $conn->prepare("DELETE FROM contracts WHERE id = ?");
            $stmt->bind_param("s", $contract_id);
            
            if ($stmt->execute()) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Contrato excluído com sucesso'
                ]);
            } else {
                http_response_code(500);
                log_message("Delete contract failed: " . $conn->error);
                echo json_encode([
                    'success' => false,
                    'message' => 'Falha ao excluir contrato: ' . $stmt->error
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
