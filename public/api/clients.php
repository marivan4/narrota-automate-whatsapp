
<?php
/**
 * API endpoint for clients
 * Handles CRUD operations for clients
 */

// Setup headers and include configuration
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include configuration file
require_once __DIR__ . '/config.php';

// Function to log to a file
function log_api($message) {
    log_message($message, "clients-api");
}

// Get the request method and resource ID
$method = $_SERVER['REQUEST_METHOD'];
$id = null;

// Parse the URL to get the resource ID
$request_uri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '';
$uri_parts = explode('/', trim(parse_url($request_uri, PHP_URL_PATH), '/'));
$resource_index = array_search('clients', $uri_parts);

// Check if ID is provided in the URL
if ($resource_index !== false && isset($uri_parts[$resource_index + 1])) {
    $id = $uri_parts[$resource_index + 1];
}

// Log request details
log_api("Received {$method} request" . ($id ? " for client ID: {$id}" : ""));

try {
    // Create connection
    $conn = create_db_connection();
    log_api("Connected to database successfully");

    // Process based on HTTP method
    switch ($method) {
        case 'GET':
            // Retrieve client(s)
            if ($id) {
                // Get single client
                $query = "SELECT * FROM clients WHERE id = ?";
                log_api("Executing query to retrieve client with ID: {$id}");
                
                $stmt = $conn->prepare($query);
                $stmt->bind_param("s", $id);
                $stmt->execute();
                $result = $stmt->get_result();
                
                if ($result->num_rows > 0) {
                    $client = $result->fetch_assoc();
                    log_api("Client found and returned");
                    echo json_encode($client);
                } else {
                    log_api("Client not found");
                    http_response_code(404);
                    echo json_encode(["message" => "Cliente não encontrado"]);
                }
            } else {
                // Get all clients
                $query = "SELECT * FROM clients ORDER BY name";
                log_api("Executing query to retrieve all clients");
                
                $result = $conn->query($query);
                $clients = [];
                
                if ($result && $result->num_rows > 0) {
                    while ($row = $result->fetch_assoc()) {
                        $clients[] = $row;
                    }
                }
                
                log_api("Returned " . count($clients) . " clients");
                echo json_encode($clients);
            }
            break;
            
        case 'POST':
            // Create new client
            $data = json_decode(file_get_contents("php://input"), true);
            log_api("Received data for new client: " . json_encode($data));
            
            if (!$data) {
                log_api("Invalid data received");
                http_response_code(400);
                echo json_encode(["message" => "Dados inválidos"]);
                break;
            }
            
            $query = "INSERT INTO clients (
                name, email, phone, document_id, document_type, 
                address, city, state, zip_code, asaas_id, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $stmt = $conn->prepare($query);
            $stmt->bind_param(
                "sssssssssss", 
                $data['name'], 
                $data['email'], 
                $data['phone'], 
                $data['document_id'], 
                $data['document_type'], 
                $data['address'], 
                $data['city'], 
                $data['state'], 
                $data['zip_code'], 
                $data['asaas_id'], 
                $data['notes']
            );
            
            if ($stmt->execute()) {
                $client_id = $conn->insert_id;
                $client = [
                    'id' => $client_id,
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'phone' => $data['phone'],
                    'document_id' => $data['document_id'],
                    'document_type' => $data['document_type'],
                    'address' => $data['address'],
                    'city' => $data['city'],
                    'state' => $data['state'],
                    'zip_code' => $data['zip_code'],
                    'asaas_id' => $data['asaas_id'],
                    'notes' => $data['notes'],
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s')
                ];
                
                log_api("Client created successfully with ID: {$client_id}");
                http_response_code(201);
                echo json_encode($client);
            } else {
                log_api("Error creating client: " . $stmt->error);
                http_response_code(500);
                echo json_encode(["message" => "Erro ao criar cliente: " . $stmt->error]);
            }
            break;
            
        case 'PUT':
            // Update client
            if (!$id) {
                log_api("ID not provided for update");
                http_response_code(400);
                echo json_encode(["message" => "ID do cliente não fornecido"]);
                break;
            }
            
            $data = json_decode(file_get_contents("php://input"), true);
            log_api("Received data for updating client {$id}: " . json_encode($data));
            
            if (!$data) {
                log_api("Invalid data received");
                http_response_code(400);
                echo json_encode(["message" => "Dados inválidos"]);
                break;
            }
            
            $query = "UPDATE clients SET 
                name = ?, 
                email = ?, 
                phone = ?, 
                document_id = ?, 
                document_type = ?, 
                address = ?, 
                city = ?, 
                state = ?, 
                zip_code = ?, 
                asaas_id = ?, 
                notes = ?, 
                updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?";
            
            $stmt = $conn->prepare($query);
            $stmt->bind_param(
                "sssssssssssi", 
                $data['name'], 
                $data['email'], 
                $data['phone'], 
                $data['document_id'], 
                $data['document_type'], 
                $data['address'], 
                $data['city'], 
                $data['state'], 
                $data['zip_code'], 
                $data['asaas_id'], 
                $data['notes'], 
                $id
            );
            
            if ($stmt->execute()) {
                $client = [
                    'id' => $id,
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'phone' => $data['phone'],
                    'document_id' => $data['document_id'],
                    'document_type' => $data['document_type'],
                    'address' => $data['address'],
                    'city' => $data['city'],
                    'state' => $data['state'],
                    'zip_code' => $data['zip_code'],
                    'asaas_id' => $data['asaas_id'],
                    'notes' => $data['notes'],
                    'updated_at' => date('Y-m-d H:i:s')
                ];
                
                log_api("Client updated successfully");
                echo json_encode($client);
            } else {
                log_api("Error updating client: " . $stmt->error);
                http_response_code(500);
                echo json_encode(["message" => "Erro ao atualizar cliente: " . $stmt->error]);
            }
            break;
            
        case 'DELETE':
            // Delete client
            if (!$id) {
                log_api("ID not provided for deletion");
                http_response_code(400);
                echo json_encode(["message" => "ID do cliente não fornecido"]);
                break;
            }
            
            log_api("Attempting to delete client with ID: {$id}");
            
            // Check if there are related records
            $check_query = "SELECT COUNT(*) as count FROM contracts WHERE client_id = ?";
            $check_stmt = $conn->prepare($check_query);
            $check_stmt->bind_param("i", $id);
            $check_stmt->execute();
            $check_result = $check_stmt->get_result();
            $related_count = $check_result->fetch_assoc()['count'];
            
            if ($related_count > 0) {
                log_api("Client has related contracts and cannot be deleted");
                http_response_code(409);
                echo json_encode(["message" => "Este cliente possui contratos associados e não pode ser excluído"]);
                break;
            }
            
            $query = "DELETE FROM clients WHERE id = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("i", $id);
            
            if ($stmt->execute()) {
                log_api("Client deleted successfully");
                echo json_encode(["message" => "Cliente excluído com sucesso"]);
            } else {
                log_api("Error deleting client: " . $stmt->error);
                http_response_code(500);
                echo json_encode(["message" => "Erro ao excluir cliente: " . $stmt->error]);
            }
            break;
            
        default:
            log_api("Method not allowed: {$method}");
            http_response_code(405);
            echo json_encode(["message" => "Método não permitido"]);
            break;
    }
    
    // Close connection
    $conn->close();
    
} catch (Exception $e) {
    log_api("Exception: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message" => "Erro de servidor: " . $e->getMessage()]);
}
