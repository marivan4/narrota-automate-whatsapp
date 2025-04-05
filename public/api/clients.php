
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

// Include config file
require_once __DIR__ . '/config.php';

log_message("Client API requested - " . $_SERVER['REQUEST_METHOD'], "clients");

try {
    // Create connection using the function from config.php
    $conn = create_db_connection();
    
    // Route based on request method
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Check if requesting a specific client
            $client_id = isset($_GET['id']) ? $_GET['id'] : null;
            
            if ($client_id) {
                // Get specific client
                log_message("Getting client with ID: $client_id", "clients");
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
                log_message("Getting all clients", "clients");
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
            log_message("Creating new client: " . json_encode($data), "clients");
            
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
                log_message("Client created successfully with ID: $new_id", "clients");
                echo json_encode([
                    'success' => true,
                    'message' => 'Cliente criado com sucesso',
                    'id' => $new_id
                ]);
            } else {
                http_response_code(500);
                log_message("Create client failed: " . $conn->error, "clients");
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
            
            log_message("Updating client ID: $client_id with data: " . json_encode($data), "clients");
            
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
            log_message("Update query: $query", "clients");
            $stmt = $conn->prepare($query);
            
            // Create references array for bind_param
            $refs = array();
            $refs[] = $types;
            
            for ($i = 0; $i < count($values); $i++) {
                $refs[] = &$values[$i];
            }
            
            call_user_func_array(array($stmt, 'bind_param'), $refs);
            
            if ($stmt->execute()) {
                log_message("Client updated successfully", "clients");
                echo json_encode([
                    'success' => true,
                    'message' => 'Cliente atualizado com sucesso'
                ]);
            } else {
                http_response_code(500);
                log_message("Update client failed: " . $conn->error, "clients");
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
            
            log_message("Deleting client ID: $client_id", "clients");
            
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
                log_message("Client deleted successfully", "clients");
                echo json_encode([
                    'success' => true,
                    'message' => 'Cliente excluído com sucesso'
                ]);
            } else {
                http_response_code(500);
                log_message("Delete client failed: " . $conn->error, "clients");
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
    log_message("Exception: " . $e->getMessage(), "clients");
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Exceção: ' . $e->getMessage()
    ]);
}
?>
