
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

// Set up detailed logging for debugging
function client_log($message, $level = 'info') {
    $logPrefix = 'clients';
    $detailedMessage = "[$level] $message";
    log_message($detailedMessage, $logPrefix);
}

client_log("Client API requested - " . $_SERVER['REQUEST_METHOD']);

try {
    // Create connection using the function from config.php
    $conn = create_db_connection();
    client_log("Database connection established successfully");
    
    // Route based on request method
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Check if requesting a specific client
            $client_id = isset($_GET['id']) ? $_GET['id'] : null;
            
            if ($client_id) {
                // Get specific client
                client_log("Getting client with ID: $client_id");
                $stmt = $conn->prepare("SELECT * FROM clients WHERE id = ?");
                $stmt->bind_param("s", $client_id);
                $stmt->execute();
                $result = $stmt->get_result();
                
                if ($result->num_rows > 0) {
                    $client = $result->fetch_assoc();
                    client_log("Found client: " . json_encode($client));
                    echo json_encode($client);
                } else {
                    http_response_code(404);
                    client_log("Client not found with ID: $client_id", "error");
                    echo json_encode(['message' => 'Cliente não encontrado']);
                }
            } else {
                // Get all clients
                client_log("Getting all clients");
                $result = $conn->query("SELECT * FROM clients ORDER BY name");
                $clients = [];
                
                while ($row = $result->fetch_assoc()) {
                    $clients[] = $row;
                }
                
                client_log("Retrieved " . count($clients) . " clients");
                echo json_encode($clients);
            }
            break;
            
        case 'POST':
            // Create a new client
            $data = json_decode(file_get_contents('php://input'), true);
            client_log("Creating new client: " . json_encode($data));
            
            // Validate required fields
            if (!isset($data['name']) || !isset($data['email'])) {
                http_response_code(400);
                client_log("Missing required fields for client creation", "error");
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
                client_log("Client created successfully with ID: $new_id");
                echo json_encode([
                    'success' => true,
                    'message' => 'Cliente criado com sucesso',
                    'id' => $new_id
                ]);
            } else {
                http_response_code(500);
                client_log("Create client failed: " . $conn->error, "error");
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
                client_log("Client ID not provided for update", "error");
                echo json_encode(['message' => 'ID do cliente não fornecido']);
                break;
            }
            
            client_log("Updating client ID: $client_id with data: " . json_encode($data));
            
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
                client_log("No fields provided for update", "error");
                echo json_encode(['message' => 'Nenhum campo para atualizar']);
                break;
            }
            
            // Add ID to values array and types
            $types .= 's';
            $values[] = $client_id;
            
            $query = "UPDATE clients SET " . implode(', ', $fields) . " WHERE id = ?";
            client_log("Update query: $query");
            $stmt = $conn->prepare($query);
            
            // Create references array for bind_param
            $refs = array();
            $refs[] = $types;
            
            for ($i = 0; $i < count($values); $i++) {
                $refs[] = &$values[$i];
            }
            
            call_user_func_array(array($stmt, 'bind_param'), $refs);
            
            if ($stmt->execute()) {
                client_log("Client updated successfully, affected rows: " . $stmt->affected_rows);
                
                // For debugging, check if any rows were actually affected
                if ($stmt->affected_rows === 0) {
                    client_log("Warning: No rows affected. Client may exist but no changes made.", "warning");
                }
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Cliente atualizado com sucesso',
                    'affected_rows' => $stmt->affected_rows
                ]);
            } else {
                http_response_code(500);
                client_log("Update client failed: " . $stmt->error, "error");
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
                client_log("Client ID not provided for deletion", "error");
                echo json_encode(['message' => 'ID do cliente não fornecido']);
                break;
            }
            
            client_log("Deleting client ID: $client_id");
            
            // Check if client exists
            $check = $conn->prepare("SELECT id FROM clients WHERE id = ?");
            $check->bind_param("s", $client_id);
            $check->execute();
            $result = $check->get_result();
            
            if ($result->num_rows === 0) {
                http_response_code(404);
                client_log("Client not found for deletion: $client_id", "error");
                echo json_encode(['message' => 'Cliente não encontrado']);
                break;
            }
            
            // Delete the client
            $stmt = $conn->prepare("DELETE FROM clients WHERE id = ?");
            $stmt->bind_param("s", $client_id);
            
            if ($stmt->execute()) {
                client_log("Client deleted successfully, affected rows: " . $stmt->affected_rows);
                echo json_encode([
                    'success' => true,
                    'message' => 'Cliente excluído com sucesso',
                    'affected_rows' => $stmt->affected_rows
                ]);
            } else {
                http_response_code(500);
                client_log("Delete client failed: " . $stmt->error, "error");
                echo json_encode([
                    'success' => false,
                    'message' => 'Falha ao excluir cliente: ' . $stmt->error
                ]);
            }
            break;
            
        default:
            http_response_code(405);
            client_log("Method not allowed: " . $_SERVER['REQUEST_METHOD'], "error");
            echo json_encode(['message' => 'Método não permitido']);
            break;
    }
    
    $conn->close();
    client_log("Database connection closed");
    
} catch (Exception $e) {
    client_log("Exception: " . $e->getMessage(), "error");
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Exceção: ' . $e->getMessage()
    ]);
}
?>
