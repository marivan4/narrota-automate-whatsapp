
<?php
/**
 * API endpoint for invoices
 */

// Include config file
require_once __DIR__ . '/config.php';

// Setup CORS and required headers
setup_cors();

// Log the request
log_message("Invoices API request: " . $_SERVER['REQUEST_METHOD'] . " " . json_encode($_GET), "invoices");

try {
    // Create database connection
    $conn = create_db_connection();
    
    // Determine request method and route based on HTTP method
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            // Handle GET request (list or single)
            if (isset($_GET['id'])) {
                // Get single invoice
                getInvoice($conn, $_GET['id']);
            } else {
                // Get all invoices
                getAllInvoices($conn);
            }
            break;
            
        case 'POST':
            // Handle POST request (create)
            createInvoice($conn);
            break;
            
        case 'PUT':
            // Handle PUT request (update)
            updateInvoice($conn);
            break;
            
        case 'DELETE':
            // Handle DELETE request (delete)
            if (!isset($_GET['id'])) {
                throw new Exception("ID is required for DELETE request");
            }
            deleteInvoice($conn, $_GET['id']);
            break;
            
        default:
            // Method not allowed
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            break;
    }
    
    // Close the connection
    $conn->close();
    
} catch (Exception $e) {
    log_message("Exception in invoices.php: " . $e->getMessage(), "invoices");
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro no servidor: ' . $e->getMessage()
    ]);
}

/**
 * Get all invoices with client information
 */
function getAllInvoices($conn) {
    try {
        $query = "
            SELECT 
                i.*, 
                c.name as client_name, 
                c.email as client_email,
                c.phone as client_phone,
                c.document_id as client_document,
                c.address as client_address,
                c.city as client_city,
                c.state as client_state,
                c.zip_code as client_zipcode
            FROM 
                invoices i
            LEFT JOIN 
                clients c ON i.client_id = c.id
            ORDER BY 
                i.due_date DESC
        ";
        
        $result = execute_query($conn, $query);
        
        if ($result['success']) {
            // Fetch items for each invoice
            foreach ($result['data'] as &$invoice) {
                $invoice_id = $invoice['id'];
                $items_query = "
                    SELECT id, description, quantity, price
                    FROM invoice_items 
                    WHERE invoice_id = ?
                ";
                
                $items_result = execute_query($conn, $items_query, [$invoice_id]);
                
                if ($items_result['success']) {
                    $invoice['items'] = $items_result['data'];
                }
            }
            
            echo json_encode([
                'success' => true,
                'data' => $result['data']
            ]);
        } else {
            throw new Exception("Failed to fetch invoices: " . print_r($result, true));
        }
    } catch (Exception $e) {
        log_message("Error in getAllInvoices: " . $e->getMessage(), "invoices");
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error getting invoices: ' . $e->getMessage()
        ]);
    }
}

/**
 * Get a single invoice by ID
 */
function getInvoice($conn, $id) {
    try {
        $query = "
            SELECT 
                i.*, 
                c.name as client_name, 
                c.email as client_email,
                c.phone as client_phone,
                c.document_id as client_document,
                c.address as client_address,
                c.city as client_city,
                c.state as client_state,
                c.zip_code as client_zipcode
            FROM 
                invoices i
            LEFT JOIN 
                clients c ON i.client_id = c.id
            WHERE 
                i.id = ?
        ";
        
        $result = execute_query($conn, $query, [$id]);
        
        if ($result['success'] && count($result['data']) > 0) {
            $invoice = $result['data'][0];
            
            // Get invoice items
            $items_query = "
                SELECT id, description, quantity, price
                FROM invoice_items 
                WHERE invoice_id = ?
            ";
            
            $items_result = execute_query($conn, $items_query, [$id]);
            
            if ($items_result['success']) {
                $invoice['items'] = $items_result['data'];
            }
            
            echo json_encode([
                'success' => true,
                'data' => $invoice
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Invoice not found'
            ]);
        }
    } catch (Exception $e) {
        log_message("Error in getInvoice: " . $e->getMessage(), "invoices");
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error getting invoice: ' . $e->getMessage()
        ]);
    }
}

/**
 * Create a new invoice
 */
function createInvoice($conn) {
    try {
        // Get request body
        $request_body = file_get_contents('php://input');
        $data = json_decode($request_body, true);
        
        if (!$data) {
            throw new Exception("Invalid request data");
        }
        
        // Start transaction
        $conn->begin_transaction();
        
        // Insert into invoices table
        $invoice_query = "
            INSERT INTO invoices (
                invoice_number, contract_id, client_id, issue_date, due_date,
                amount, tax_amount, total_amount, status, payment_date,
                payment_method, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ";
        
        $invoice_params = [
            $data['invoice_number'],
            $data['contract_id'] ?? null,
            $data['client_id'] ?? null,
            $data['issue_date'],
            $data['due_date'],
            $data['amount'] ?? 0,
            $data['tax_amount'] ?? 0,
            $data['total_amount'] ?? 0,
            $data['status'] ?? 'pending',
            $data['payment_date'] ?? null,
            $data['payment_method'] ?? null,
            $data['notes'] ?? null
        ];
        
        $result = execute_query($conn, $invoice_query, $invoice_params);
        
        if (!$result['success']) {
            throw new Exception("Failed to create invoice: " . print_r($result, true));
        }
        
        $invoice_id = $result['insertId'];
        
        // Insert invoice items if provided
        if (isset($data['items']) && is_array($data['items']) && count($data['items']) > 0) {
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
                    $item['price'] ?? 0
                ];
                
                $item_result = execute_query($conn, $item_query, $item_params);
                
                if (!$item_result['success']) {
                    // Log error but continue with other items
                    log_message("Failed to insert invoice item: " . print_r($item_result, true), "invoices");
                }
            }
        }
        
        // Commit transaction
        $conn->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Invoice created successfully',
            'id' => $invoice_id
        ]);
    } catch (Exception $e) {
        // Rollback transaction on error
        if (isset($conn) && $conn->ping()) {
            $conn->rollback();
        }
        
        log_message("Error in createInvoice: " . $e->getMessage(), "invoices");
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error creating invoice: ' . $e->getMessage()
        ]);
    }
}

/**
 * Update an existing invoice
 */
function updateInvoice($conn) {
    try {
        // Get request body
        $request_body = file_get_contents('php://input');
        $data = json_decode($request_body, true);
        
        if (!$data || !isset($data['id'])) {
            throw new Exception("Invalid request data or missing ID");
        }
        
        $invoice_id = $data['id'];
        
        // Start transaction
        $conn->begin_transaction();
        
        // Update invoice
        $invoice_query = "
            UPDATE invoices SET
                invoice_number = ?,
                contract_id = ?,
                client_id = ?,
                issue_date = ?,
                due_date = ?,
                amount = ?,
                tax_amount = ?,
                total_amount = ?,
                status = ?,
                payment_date = ?,
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
            $data['amount'] ?? 0,
            $data['tax_amount'] ?? 0,
            $data['total_amount'] ?? 0,
            $data['status'] ?? 'pending',
            $data['payment_date'] ?? null,
            $data['payment_method'] ?? null,
            $data['notes'] ?? null,
            $invoice_id
        ];
        
        $result = execute_query($conn, $invoice_query, $invoice_params);
        
        if (!$result['success']) {
            throw new Exception("Failed to update invoice: " . print_r($result, true));
        }
        
        // Delete existing items to replace with new ones
        $delete_items_query = "DELETE FROM invoice_items WHERE invoice_id = ?";
        execute_query($conn, $delete_items_query, [$invoice_id]);
        
        // Insert invoice items if provided
        if (isset($data['items']) && is_array($data['items']) && count($data['items']) > 0) {
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
                    $item['price'] ?? 0
                ];
                
                $item_result = execute_query($conn, $item_query, $item_params);
                
                if (!$item_result['success']) {
                    // Log error but continue with other items
                    log_message("Failed to insert invoice item: " . print_r($item_result, true), "invoices");
                }
            }
        }
        
        // Commit transaction
        $conn->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Invoice updated successfully',
            'id' => $invoice_id
        ]);
    } catch (Exception $e) {
        // Rollback transaction on error
        if (isset($conn) && $conn->ping()) {
            $conn->rollback();
        }
        
        log_message("Error in updateInvoice: " . $e->getMessage(), "invoices");
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error updating invoice: ' . $e->getMessage()
        ]);
    }
}

/**
 * Delete an invoice
 */
function deleteInvoice($conn, $id) {
    try {
        // Start transaction
        $conn->begin_transaction();
        
        // Delete invoice items first (foreign key constraint)
        $delete_items_query = "DELETE FROM invoice_items WHERE invoice_id = ?";
        $items_result = execute_query($conn, $delete_items_query, [$id]);
        
        // Delete the invoice
        $delete_invoice_query = "DELETE FROM invoices WHERE id = ?";
        $invoice_result = execute_query($conn, $delete_invoice_query, [$id]);
        
        if (!$invoice_result['success']) {
            throw new Exception("Failed to delete invoice: " . print_r($invoice_result, true));
        }
        
        // Check if any rows were affected to determine if the invoice was found
        if ($invoice_result['affectedRows'] === 0) {
            $conn->rollback();
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Invoice not found'
            ]);
            return;
        }
        
        // Commit transaction
        $conn->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Invoice deleted successfully'
        ]);
    } catch (Exception $e) {
        // Rollback transaction on error
        if (isset($conn) && $conn->ping()) {
            $conn->rollback();
        }
        
        log_message("Error in deleteInvoice: " . $e->getMessage(), "invoices");
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error deleting invoice: ' . $e->getMessage()
        ]);
    }
}
?>
