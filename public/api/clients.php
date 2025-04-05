
<?php
// API endpoint for clients management
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include config and utilities
require_once __DIR__ . '/config.php';

// Log request
$request_method = $_SERVER['REQUEST_METHOD'];
$request_path = $_SERVER['REQUEST_URI'];
log_message("Received $request_method request to $request_path", 'clients');

try {
    // Create database connection
    $conn = create_db_connection();
    log_message("Connected to database", 'clients');
    
    // Determine action based on HTTP method
    switch ($request_method) {
        case 'GET':
            handleGetClients($conn);
            break;
        case 'POST':
            handleCreateClient($conn);
            break;
        case 'PUT':
            handleUpdateClient($conn);
            break;
        case 'DELETE':
            handleDeleteClient($conn);
            break;
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'message' => 'Método não permitido'
            ]);
    }
    
    $conn->close();
    
} catch (Exception $e) {
    log_message("Error: " . $e->getMessage(), 'clients');
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro: ' . $e->getMessage()
    ]);
}

// Function to handle GET requests (list or get single client)
function handleGetClients($conn) {
    log_message("Handling GET request", 'clients');
    
    // Check if ID is provided (get single client)
    if (isset($_GET['id'])) {
        $client_id = $_GET['id'];
        log_message("Getting client with ID: $client_id", 'clients');
        
        // Get client details
        $query = "SELECT * FROM clients WHERE id = ?";
        
        try {
            $result = execute_query($conn, $query, [$client_id]);
            
            if ($result['success'] && count($result['data']) > 0) {
                log_message("Client found, returning data", 'clients');
                echo json_encode($result['data'][0]);
            } else {
                log_message("Client not found", 'clients');
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Cliente não encontrado'
                ]);
            }
        } catch (Exception $e) {
            log_message("Error getting client: " . $e->getMessage(), 'clients');
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao buscar cliente: ' . $e->getMessage()
            ]);
        }
    } else {
        // List all clients
        log_message("Listing all clients", 'clients');
        
        $query = "SELECT * FROM clients ORDER BY name";
        
        try {
            $result = execute_query($conn, $query);
            
            if ($result['success']) {
                log_message("Returning " . count($result['data']) . " clients", 'clients');
                echo json_encode($result['data']);
            } else {
                throw new Exception("Falha ao consultar clientes");
            }
        } catch (Exception $e) {
            log_message("Error listing clients: " . $e->getMessage(), 'clients');
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao listar clientes: ' . $e->getMessage()
            ]);
        }
    }
}

// Function to handle POST requests (create client)
function handleCreateClient($conn) {
    log_message("Handling POST request", 'clients');
    
    // Get JSON data from request
    $json_data = file_get_contents('php://input');
    $data = json_decode($json_data, true);
    
    if (!$data) {
        log_message("Invalid JSON data", 'clients');
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Dados JSON inválidos'
        ]);
        return;
    }
    
    log_message("Creating client with data: " . json_encode($data), 'clients');
    
    // Validate required fields
    $required_fields = ['name', 'email'];
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            log_message("Required field missing: $field", 'clients');
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => "Campo obrigatório não fornecido: $field"
            ]);
            return;
        }
    }
    
    // Start transaction - not in a try block because we want any errors to propagate
    $conn->begin_transaction();
    
    try {
        // Insert client
        $query = "
            INSERT INTO clients (
                name, email, phone, document, document_type, address, city, state, zipCode, notes, asaas_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ";
        
        $params = [
            $data['name'],
            $data['email'],
            $data['phone'] ?? null,
            $data['document'] ?? null,
            $data['document_type'] ?? null,
            $data['address'] ?? null,
            $data['city'] ?? null,
            $data['state'] ?? null,
            $data['zipCode'] ?? null,
            $data['notes'] ?? null,
            $data['asaas_id'] ?? null
        ];
        
        $result = execute_query($conn, $query, $params);
        
        if ($result['success']) {
            $client_id = $result['insertId'];
            log_message("Created client with ID: $client_id", 'clients');
            
            // Commit transaction
            $conn->commit();
            
            // Return success with the new client ID
            echo json_encode([
                'success' => true,
                'message' => 'Cliente criado com sucesso',
                'id' => $client_id
            ]);
        } else {
            throw new Exception("Falha ao inserir cliente: " . $conn->error);
        }
    } catch (Exception $e) {
        // Rollback transaction
        $conn->rollback();
        
        log_message("Error creating client: " . $e->getMessage(), 'clients');
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao criar cliente: ' . $e->getMessage()
        ]);
    }
}

// Function to handle PUT requests (update client)
function handleUpdateClient($conn) {
    log_message("Handling PUT request", 'clients');
    
    // Get ID from query string
    if (!isset($_GET['id'])) {
        log_message("Client ID not provided", 'clients');
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'ID do cliente não fornecido'
        ]);
        return;
    }
    
    $client_id = $_GET['id'];
    
    // Get JSON data from request
    $json_data = file_get_contents('php://input');
    $data = json_decode($json_data, true);
    
    if (!$data) {
        log_message("Invalid JSON data", 'clients');
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Dados JSON inválidos'
        ]);
        return;
    }
    
    log_message("Updating client $client_id with data: " . json_encode($data), 'clients');
    
    // Validate required fields
    $required_fields = ['name', 'email'];
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            log_message("Required field missing: $field", 'clients');
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => "Campo obrigatório não fornecido: $field"
            ]);
            return;
        }
    }
    
    // Start transaction
    $conn->begin_transaction();
    
    try {
        // Update client
        $query = "
            UPDATE clients SET 
                name = ?, 
                email = ?, 
                phone = ?,
                document = ?, 
                document_type = ?, 
                address = ?,
                city = ?, 
                state = ?, 
                zipCode = ?,
                notes = ?,
                asaas_id = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ";
        
        $params = [
            $data['name'],
            $data['email'],
            $data['phone'] ?? null,
            $data['document'] ?? null,
            $data['document_type'] ?? null,
            $data['address'] ?? null,
            $data['city'] ?? null,
            $data['state'] ?? null,
            $data['zipCode'] ?? null,
            $data['notes'] ?? null,
            $data['asaas_id'] ?? null,
            $client_id
        ];
        
        $result = execute_query($conn, $query, $params);
        
        if ($result['success']) {
            // Commit transaction
            $conn->commit();
            
            log_message("Client updated successfully", 'clients');
            echo json_encode([
                'success' => true,
                'message' => 'Cliente atualizado com sucesso'
            ]);
        } else {
            throw new Exception("Falha ao atualizar cliente: " . $conn->error);
        }
    } catch (Exception $e) {
        // Rollback transaction
        $conn->rollback();
        
        log_message("Error updating client: " . $e->getMessage(), 'clients');
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao atualizar cliente: ' . $e->getMessage()
        ]);
    }
}

// Function to handle DELETE requests
function handleDeleteClient($conn) {
    log_message("Handling DELETE request", 'clients');
    
    // Get ID from query string
    if (!isset($_GET['id'])) {
        log_message("Client ID not provided", 'clients');
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'ID do cliente não fornecido'
        ]);
        return;
    }
    
    $client_id = $_GET['id'];
    log_message("Deleting client with ID: $client_id", 'clients');
    
    // Start transaction
    $conn->begin_transaction();
    
    try {
        // Check if client is used in contracts
        $check_query = "SELECT COUNT(*) as count FROM contracts WHERE client_id = ?";
        $check_result = execute_query($conn, $check_query, [$client_id]);
        
        if ($check_result['success'] && $check_result['data'][0]['count'] > 0) {
            log_message("Client has related contracts, cannot delete", 'clients');
            $conn->rollback();
            
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Este cliente possui contratos relacionados e não pode ser excluído'
            ]);
            return;
        }
        
        // Check if client is used in invoices
        $check_query = "SELECT COUNT(*) as count FROM invoices WHERE client_id = ?";
        $check_result = execute_query($conn, $check_query, [$client_id]);
        
        if ($check_result['success'] && $check_result['data'][0]['count'] > 0) {
            log_message("Client has related invoices, cannot delete", 'clients');
            $conn->rollback();
            
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Este cliente possui faturas relacionadas e não pode ser excluído'
            ]);
            return;
        }
        
        // Delete client
        $query = "DELETE FROM clients WHERE id = ?";
        $result = execute_query($conn, $query, [$client_id]);
        
        if ($result['success']) {
            // Commit transaction
            $conn->commit();
            
            log_message("Client deleted successfully", 'clients');
            echo json_encode([
                'success' => true,
                'message' => 'Cliente excluído com sucesso'
            ]);
        } else {
            throw new Exception("Falha ao excluir cliente: " . $conn->error);
        }
    } catch (Exception $e) {
        // Rollback transaction
        $conn->rollback();
        
        log_message("Error deleting client: " . $e->getMessage(), 'clients');
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao excluir cliente: ' . $e->getMessage()
        ]);
    }
}
?>
