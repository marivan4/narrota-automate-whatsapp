
<?php
/**
 * API endpoint for invoices
 * Handles CRUD operations for invoices
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
    log_message($message, "invoices-api");
}

// Get the request method and resource ID
$method = $_SERVER['REQUEST_METHOD'];
$id = null;

// Parse the URL to get the resource ID
$request_uri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '';
$uri_parts = explode('/', trim(parse_url($request_uri, PHP_URL_PATH), '/'));
$resource_index = array_search('invoices', $uri_parts);

// Check if ID is provided in the URL
if ($resource_index !== false && isset($uri_parts[$resource_index + 1])) {
    $id = $uri_parts[$resource_index + 1];
}

// Log request details
log_api("Received {$method} request" . ($id ? " for invoice ID: {$id}" : ""));

try {
    // Create connection
    $conn = create_db_connection();
    log_api("Connected to database successfully");

    // Process based on HTTP method
    switch ($method) {
        case 'GET':
            // Retrieve invoice(s)
            if ($id) {
                // Get single invoice
                $query = "SELECT i.*, c.name as client_name, c.email as client_email, c.phone as client_phone 
                        FROM invoices i 
                        LEFT JOIN clients c ON i.client_id = c.id 
                        WHERE i.id = ?";
                log_api("Executing query to retrieve invoice with ID: {$id}");
                
                $stmt = $conn->prepare($query);
                $stmt->bind_param("s", $id);
                $stmt->execute();
                $result = $stmt->get_result();
                
                if ($result->num_rows > 0) {
                    $invoice = $result->fetch_assoc();
                    
                    // Also get invoice items if they exist
                    $items_query = "SELECT * FROM invoice_items WHERE invoice_id = ?";
                    $items_stmt = $conn->prepare($items_query);
                    $items_stmt->bind_param("s", $id);
                    $items_stmt->execute();
                    $items_result = $items_stmt->get_result();
                    
                    $invoice['items'] = [];
                    while ($item = $items_result->fetch_assoc()) {
                        $invoice['items'][] = $item;
                    }
                    
                    log_api("Invoice found and returned");
                    echo json_encode($invoice);
                } else {
                    log_api("Invoice not found");
                    http_response_code(404);
                    echo json_encode(["message" => "Fatura não encontrada"]);
                }
            } else {
                // Get all invoices
                $query = "SELECT i.*, c.name as client_name, c.email as client_email, c.phone as client_phone 
                        FROM invoices i 
                        LEFT JOIN clients c ON i.client_id = c.id 
                        ORDER BY i.due_date DESC";
                log_api("Executing query to retrieve all invoices");
                
                $result = $conn->query($query);
                $invoices = [];
                
                if ($result && $result->num_rows > 0) {
                    while ($row = $result->fetch_assoc()) {
                        $invoices[] = $row;
                    }
                }
                
                log_api("Returned " . count($invoices) . " invoices");
                echo json_encode($invoices);
            }
            break;
            
        case 'POST':
            // Create new invoice
            $data = json_decode(file_get_contents("php://input"), true);
            log_api("Received data for new invoice: " . json_encode($data));
            
            if (!$data) {
                log_api("Invalid data received");
                http_response_code(400);
                echo json_encode(["message" => "Dados inválidos"]);
                break;
            }
            
            // Begin transaction
            $conn->begin_transaction();
            
            try {
                // Insert invoice
                $insert_query = "INSERT INTO invoices (
                    invoice_number, contract_id, client_id, issue_date, due_date, 
                    payment_date, amount, tax_amount, total_amount, discount, 
                    status, payment_method, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                
                $stmt = $conn->prepare($insert_query);
                
                // Set default values if not provided
                $data['tax_amount'] = $data['tax_amount'] ?? 0;
                $data['discount'] = $data['discount'] ?? 0;
                $data['total_amount'] = $data['amount'] + $data['tax_amount'] - $data['discount'];
                
                // Format dates
                $issue_date = isset($data['issue_date']) ? date('Y-m-d', strtotime($data['issue_date'])) : date('Y-m-d');
                $due_date = isset($data['due_date']) ? date('Y-m-d', strtotime($data['due_date'])) : date('Y-m-d');
                $payment_date = isset($data['payment_date']) ? date('Y-m-d', strtotime($data['payment_date'])) : null;
                
                // Prepare parameters
                $stmt->bind_param(
                    "ssisssddddss",
                    $data['invoice_number'],
                    $data['contract_id'],
                    $data['client_id'],
                    $issue_date,
                    $due_date,
                    $payment_date,
                    $data['amount'],
                    $data['tax_amount'],
                    $data['total_amount'],
                    $data['discount'],
                    $data['status'],
                    $data['payment_method'],
                    $data['notes']
                );
                
                // Execute query
                if ($stmt->execute()) {
                    $invoice_id = $conn->insert_id;
                    
                    // Insert invoice items if provided
                    if (isset($data['items']) && is_array($data['items'])) {
                        $item_query = "INSERT INTO invoice_items (
                            invoice_id, description, quantity, price
                        ) VALUES (?, ?, ?, ?)";
                        
                        $item_stmt = $conn->prepare($item_query);
                        
                        foreach ($data['items'] as $item) {
                            $item_stmt->bind_param(
                                "isid",
                                $invoice_id,
                                $item['description'],
                                $item['quantity'],
                                $item['price']
                            );
                            
                            if (!$item_stmt->execute()) {
                                throw new Exception("Erro ao inserir item: " . $item_stmt->error);
                            }
                        }
                    }
                    
                    // Commit transaction
                    $conn->commit();
                    
                    // Get the created invoice
                    $query = "SELECT i.*, c.name as client_name, c.email as client_email, c.phone as client_phone 
                            FROM invoices i 
                            LEFT JOIN clients c ON i.client_id = c.id 
                            WHERE i.id = ?";
                    
                    $stmt = $conn->prepare($query);
                    $stmt->bind_param("i", $invoice_id);
                    $stmt->execute();
                    $result = $stmt->get_result();
                    $invoice = $result->fetch_assoc();
                    
                    // Also get invoice items
                    $items_query = "SELECT * FROM invoice_items WHERE invoice_id = ?";
                    $items_stmt = $conn->prepare($items_query);
                    $items_stmt->bind_param("i", $invoice_id);
                    $items_stmt->execute();
                    $items_result = $items_stmt->get_result();
                    
                    $invoice['items'] = [];
                    while ($item = $items_result->fetch_assoc()) {
                        $invoice['items'][] = $item;
                    }
                    
                    log_api("Invoice created successfully with ID: {$invoice_id}");
                    http_response_code(201);
                    echo json_encode($invoice);
                    
                } else {
                    throw new Exception("Erro ao inserir fatura: " . $stmt->error);
                }
                
            } catch (Exception $e) {
                // Rollback transaction on error
                $conn->rollback();
                log_api("Error: " . $e->getMessage());
                http_response_code(500);
                echo json_encode(["message" => "Erro ao criar fatura: " . $e->getMessage()]);
            }
            break;
            
        case 'PUT':
            // Update invoice
            if (!$id) {
                log_api("ID not provided for update");
                http_response_code(400);
                echo json_encode(["message" => "ID da fatura não fornecido"]);
                break;
            }
            
            $data = json_decode(file_get_contents("php://input"), true);
            log_api("Received data for updating invoice {$id}: " . json_encode($data));
            
            if (!$data) {
                log_api("Invalid data received");
                http_response_code(400);
                echo json_encode(["message" => "Dados inválidos"]);
                break;
            }
            
            // Begin transaction
            $conn->begin_transaction();
            
            try {
                // Update invoice
                $update_query = "UPDATE invoices SET 
                    invoice_number = ?,
                    contract_id = ?,
                    client_id = ?,
                    issue_date = ?,
                    due_date = ?,
                    payment_date = ?,
                    amount = ?,
                    tax_amount = ?,
                    total_amount = ?,
                    discount = ?,
                    status = ?,
                    payment_method = ?,
                    notes = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?";
                
                $stmt = $conn->prepare($update_query);
                
                // Set default values if not provided
                $data['tax_amount'] = $data['tax_amount'] ?? 0;
                $data['discount'] = $data['discount'] ?? 0;
                $data['total_amount'] = $data['amount'] + $data['tax_amount'] - $data['discount'];
                
                // Format dates
                $issue_date = isset($data['issue_date']) ? date('Y-m-d', strtotime($data['issue_date'])) : date('Y-m-d');
                $due_date = isset($data['due_date']) ? date('Y-m-d', strtotime($data['due_date'])) : date('Y-m-d');
                $payment_date = isset($data['payment_date']) ? date('Y-m-d', strtotime($data['payment_date'])) : null;
                
                // Prepare parameters
                $stmt->bind_param(
                    "ssisssddddssi",
                    $data['invoice_number'],
                    $data['contract_id'],
                    $data['client_id'],
                    $issue_date,
                    $due_date,
                    $payment_date,
                    $data['amount'],
                    $data['tax_amount'],
                    $data['total_amount'],
                    $data['discount'],
                    $data['status'],
                    $data['payment_method'],
                    $data['notes'],
                    $id
                );
                
                // Execute query
                if ($stmt->execute()) {
                    // If items are provided, update them
                    if (isset($data['items']) && is_array($data['items'])) {
                        // First delete existing items
                        $delete_items = "DELETE FROM invoice_items WHERE invoice_id = ?";
                        $delete_stmt = $conn->prepare($delete_items);
                        $delete_stmt->bind_param("i", $id);
                        $delete_stmt->execute();
                        
                        // Then insert new items
                        $item_query = "INSERT INTO invoice_items (
                            invoice_id, description, quantity, price
                        ) VALUES (?, ?, ?, ?)";
                        
                        $item_stmt = $conn->prepare($item_query);
                        
                        foreach ($data['items'] as $item) {
                            $item_stmt->bind_param(
                                "isid",
                                $id,
                                $item['description'],
                                $item['quantity'],
                                $item['price']
                            );
                            
                            if (!$item_stmt->execute()) {
                                throw new Exception("Erro ao inserir item: " . $item_stmt->error);
                            }
                        }
                    }
                    
                    // Commit transaction
                    $conn->commit();
                    
                    // Get the updated invoice
                    $query = "SELECT i.*, c.name as client_name, c.email as client_email, c.phone as client_phone 
                            FROM invoices i 
                            LEFT JOIN clients c ON i.client_id = c.id 
                            WHERE i.id = ?";
                    
                    $stmt = $conn->prepare($query);
                    $stmt->bind_param("i", $id);
                    $stmt->execute();
                    $result = $stmt->get_result();
                    $invoice = $result->fetch_assoc();
                    
                    // Also get invoice items
                    $items_query = "SELECT * FROM invoice_items WHERE invoice_id = ?";
                    $items_stmt = $conn->prepare($items_query);
                    $items_stmt->bind_param("i", $id);
                    $items_stmt->execute();
                    $items_result = $items_stmt->get_result();
                    
                    $invoice['items'] = [];
                    while ($item = $items_result->fetch_assoc()) {
                        $invoice['items'][] = $item;
                    }
                    
                    log_api("Invoice updated successfully");
                    echo json_encode($invoice);
                    
                } else {
                    throw new Exception("Erro ao atualizar fatura: " . $stmt->error);
                }
                
            } catch (Exception $e) {
                // Rollback transaction on error
                $conn->rollback();
                log_api("Error: " . $e->getMessage());
                http_response_code(500);
                echo json_encode(["message" => "Erro ao atualizar fatura: " . $e->getMessage()]);
            }
            break;
            
        case 'DELETE':
            // Delete invoice
            if (!$id) {
                log_api("ID not provided for deletion");
                http_response_code(400);
                echo json_encode(["message" => "ID da fatura não fornecido"]);
                break;
            }
            
            log_api("Attempting to delete invoice with ID: {$id}");
            
            // Begin transaction
            $conn->begin_transaction();
            
            try {
                // First delete related invoice items
                $delete_items = "DELETE FROM invoice_items WHERE invoice_id = ?";
                $delete_items_stmt = $conn->prepare($delete_items);
                $delete_items_stmt->bind_param("i", $id);
                $delete_items_stmt->execute();
                
                // Then delete the invoice
                $delete_query = "DELETE FROM invoices WHERE id = ?";
                $stmt = $conn->prepare($delete_query);
                $stmt->bind_param("i", $id);
                
                if ($stmt->execute()) {
                    // Commit transaction
                    $conn->commit();
                    log_api("Invoice deleted successfully");
                    echo json_encode(["message" => "Fatura excluída com sucesso"]);
                } else {
                    throw new Exception("Erro ao excluir fatura: " . $stmt->error);
                }
                
            } catch (Exception $e) {
                // Rollback transaction on error
                $conn->rollback();
                log_api("Error: " . $e->getMessage());
                http_response_code(500);
                echo json_encode(["message" => "Erro ao excluir fatura: " . $e->getMessage()]);
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
