
<?php
// API endpoint for invoices management
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
log_message("Received $request_method request to $request_path", 'invoices');

try {
    // Create database connection
    $conn = create_db_connection();
    log_message("Connected to database", 'invoices');
    
    // Determine action based on HTTP method
    switch ($request_method) {
        case 'GET':
            handleGetInvoices($conn);
            break;
        case 'POST':
            handleCreateInvoice($conn);
            break;
        case 'PUT':
            handleUpdateInvoice($conn);
            break;
        case 'DELETE':
            handleDeleteInvoice($conn);
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
    log_message("Error: " . $e->getMessage(), 'invoices');
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro: ' . $e->getMessage()
    ]);
}

// Function to handle GET requests (list or get single invoice)
function handleGetInvoices($conn) {
    log_message("Handling GET request", 'invoices');
    
    // Check if ID is provided (get single invoice)
    if (isset($_GET['id'])) {
        $invoice_id = $_GET['id'];
        log_message("Getting invoice with ID: $invoice_id", 'invoices');
        
        // Get invoice details
        $invoice_query = "
            SELECT i.*, 
                   c.name as client_name, 
                   c.email as client_email, 
                   c.phone as client_phone,
                   c.address as client_address,
                   c.document as client_document
            FROM invoices i 
            LEFT JOIN clients c ON i.client_id = c.id
            WHERE i.id = ?
        ";
        
        try {
            $invoice_result = execute_query($conn, $invoice_query, [$invoice_id]);
            
            if ($invoice_result['success'] && count($invoice_result['data']) > 0) {
                $invoice = $invoice_result['data'][0];
                
                // Get invoice items
                $items_query = "SELECT * FROM invoice_items WHERE invoice_id = ?";
                $items_result = execute_query($conn, $items_query, [$invoice_id]);
                
                $items = [];
                if ($items_result['success'] && count($items_result['data']) > 0) {
                    $items = $items_result['data'];
                }
                
                // Add items to invoice data
                $invoice['items'] = $items;
                
                // Create client object
                $invoice['client'] = [
                    'id' => $invoice['client_id'],
                    'name' => $invoice['client_name'] ?? '',
                    'email' => $invoice['client_email'] ?? '',
                    'phone' => $invoice['client_phone'] ?? '',
                    'address' => $invoice['client_address'] ?? '',
                    'document' => $invoice['client_document'] ?? '',
                ];
                
                // Remove duplicate client fields
                unset($invoice['client_name']);
                unset($invoice['client_email']);
                unset($invoice['client_phone']);
                unset($invoice['client_address']);
                unset($invoice['client_document']);
                
                echo json_encode($invoice);
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Fatura não encontrada'
                ]);
            }
        } catch (Exception $e) {
            log_message("Error getting invoice: " . $e->getMessage(), 'invoices');
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao buscar fatura: ' . $e->getMessage()
            ]);
        }
    } else {
        // List all invoices
        log_message("Listing all invoices", 'invoices');
        
        $query = "
            SELECT i.*, 
                   c.name as client_name, 
                   c.email as client_email, 
                   c.phone as client_phone
            FROM invoices i 
            LEFT JOIN clients c ON i.client_id = c.id
            ORDER BY i.due_date DESC
        ";
        
        try {
            $result = execute_query($conn, $query);
            
            if ($result['success']) {
                echo json_encode($result['data']);
            } else {
                throw new Exception("Falha ao consultar faturas");
            }
        } catch (Exception $e) {
            log_message("Error listing invoices: " . $e->getMessage(), 'invoices');
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao listar faturas: ' . $e->getMessage()
            ]);
        }
    }
}

// Function to handle POST requests (create invoice)
function handleCreateInvoice($conn) {
    log_message("Handling POST request", 'invoices');
    
    // Get JSON data from request
    $json_data = file_get_contents('php://input');
    $data = json_decode($json_data, true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Dados JSON inválidos'
        ]);
        return;
    }
    
    log_message("Creating invoice with data: " . json_encode($data), 'invoices');
    
    // Validate required fields
    $required_fields = ['invoice_number', 'issue_date', 'due_date', 'amount'];
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
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
        // Insert invoice
        $invoice_query = "
            INSERT INTO invoices (
                invoice_number, contract_id, client_id, issue_date, due_date, 
                payment_date, amount, tax_amount, total_amount, status, 
                payment_method, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ";
        
        $invoice_params = [
            $data['invoice_number'],
            $data['contract_id'] ?? null,
            $data['client_id'] ?? null,
            $data['issue_date'],
            $data['due_date'],
            $data['payment_date'] ?? null,
            $data['amount'],
            $data['tax_amount'] ?? 0,
            $data['total_amount'] ?? $data['amount'],
            $data['status'] ?? 'pending',
            $data['payment_method'] ?? null,
            $data['notes'] ?? null
        ];
        
        $invoice_result = execute_query($conn, $invoice_query, $invoice_params);
        
        if ($invoice_result['success']) {
            $invoice_id = $invoice_result['insertId'];
            log_message("Created invoice with ID: $invoice_id", 'invoices');
            
            // If items are provided, insert them
            if (isset($data['items']) && is_array($data['items']) && !empty($data['items'])) {
                foreach ($data['items'] as $item) {
                    $item_query = "
                        INSERT INTO invoice_items (
                            invoice_id, description, quantity, price
                        ) VALUES (?, ?, ?, ?)
                    ";
                    
                    $item_params = [
                        $invoice_id,
                        $item['description'],
                        $item['quantity'] ?? 1,
                        $item['price']
                    ];
                    
                    $item_result = execute_query($conn, $item_query, $item_params);
                    
                    if (!$item_result['success']) {
                        throw new Exception("Falha ao inserir item da fatura: " . $conn->error);
                    }
                }
            }
            
            // Commit transaction
            $conn->commit();
            
            echo json_encode([
                'success' => true,
                'message' => 'Fatura criada com sucesso',
                'id' => $invoice_id
            ]);
        } else {
            throw new Exception("Falha ao inserir fatura: " . $conn->error);
        }
    } catch (Exception $e) {
        // Rollback transaction
        $conn->rollback();
        
        log_message("Error creating invoice: " . $e->getMessage(), 'invoices');
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao criar fatura: ' . $e->getMessage()
        ]);
    }
}

// Function to handle PUT requests (update invoice)
function handleUpdateInvoice($conn) {
    log_message("Handling PUT request", 'invoices');
    
    // Get ID from query string
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'ID da fatura não fornecido'
        ]);
        return;
    }
    
    $invoice_id = $_GET['id'];
    
    // Get JSON data from request
    $json_data = file_get_contents('php://input');
    $data = json_decode($json_data, true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Dados JSON inválidos'
        ]);
        return;
    }
    
    log_message("Updating invoice $invoice_id with data: " . json_encode($data), 'invoices');
    
    // Start transaction
    $conn->begin_transaction();
    
    try {
        // Update invoice
        $invoice_query = "
            UPDATE invoices SET 
                invoice_number = ?, 
                contract_id = ?, 
                client_id = ?,
                issue_date = ?, 
                due_date = ?, 
                payment_date = ?,
                amount = ?, 
                tax_amount = ?, 
                total_amount = ?,
                status = ?, 
                payment_method = ?, 
                notes = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ";
        
        $invoice_params = [
            $data['invoice_number'],
            $data['contract_id'] ?? null,
            $data['client_id'] ?? null,
            $data['issue_date'],
            $data['due_date'],
            $data['payment_date'] ?? null,
            $data['amount'],
            $data['tax_amount'] ?? 0,
            $data['total_amount'] ?? $data['amount'],
            $data['status'] ?? 'pending',
            $data['payment_method'] ?? null,
            $data['notes'] ?? null,
            $invoice_id
        ];
        
        $invoice_result = execute_query($conn, $invoice_query, $invoice_params);
        
        if ($invoice_result['success']) {
            // Delete existing items
            $delete_query = "DELETE FROM invoice_items WHERE invoice_id = ?";
            $delete_result = execute_query($conn, $delete_query, [$invoice_id]);
            
            if (!$delete_result['success']) {
                throw new Exception("Falha ao limpar itens da fatura: " . $conn->error);
            }
            
            // If items are provided, insert them
            if (isset($data['items']) && is_array($data['items']) && !empty($data['items'])) {
                foreach ($data['items'] as $item) {
                    $item_query = "
                        INSERT INTO invoice_items (
                            invoice_id, description, quantity, price
                        ) VALUES (?, ?, ?, ?)
                    ";
                    
                    $item_params = [
                        $invoice_id,
                        $item['description'],
                        $item['quantity'] ?? 1,
                        $item['price']
                    ];
                    
                    $item_result = execute_query($conn, $item_query, $item_params);
                    
                    if (!$item_result['success']) {
                        throw new Exception("Falha ao inserir item da fatura: " . $conn->error);
                    }
                }
            }
            
            // Commit transaction
            $conn->commit();
            
            echo json_encode([
                'success' => true,
                'message' => 'Fatura atualizada com sucesso'
            ]);
        } else {
            throw new Exception("Falha ao atualizar fatura: " . $conn->error);
        }
    } catch (Exception $e) {
        // Rollback transaction
        $conn->rollback();
        
        log_message("Error updating invoice: " . $e->getMessage(), 'invoices');
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao atualizar fatura: ' . $e->getMessage()
        ]);
    }
}

// Function to handle DELETE requests
function handleDeleteInvoice($conn) {
    log_message("Handling DELETE request", 'invoices');
    
    // Get ID from query string
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'ID da fatura não fornecido'
        ]);
        return;
    }
    
    $invoice_id = $_GET['id'];
    log_message("Deleting invoice with ID: $invoice_id", 'invoices');
    
    // Start transaction
    $conn->begin_transaction();
    
    try {
        // Delete items first (due to foreign key constraint)
        $items_query = "DELETE FROM invoice_items WHERE invoice_id = ?";
        $items_result = execute_query($conn, $items_query, [$invoice_id]);
        
        if (!$items_result['success']) {
            throw new Exception("Falha ao excluir itens da fatura: " . $conn->error);
        }
        
        // Delete invoice
        $invoice_query = "DELETE FROM invoices WHERE id = ?";
        $invoice_result = execute_query($conn, $invoice_query, [$invoice_id]);
        
        if ($invoice_result['success']) {
            // Commit transaction
            $conn->commit();
            
            echo json_encode([
                'success' => true,
                'message' => 'Fatura excluída com sucesso'
            ]);
        } else {
            throw new Exception("Falha ao excluir fatura: " . $conn->error);
        }
    } catch (Exception $e) {
        // Rollback transaction
        $conn->rollback();
        
        log_message("Error deleting invoice: " . $e->getMessage(), 'invoices');
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao excluir fatura: ' . $e->getMessage()
        ]);
    }
}
?>
