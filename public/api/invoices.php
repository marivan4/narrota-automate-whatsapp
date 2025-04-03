
<?php
// API endpoint for invoice operations
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
    file_put_contents($log_file, "[$timestamp] [invoices.php] $message\n", FILE_APPEND);
}

log_message("Invoice API requested - " . $_SERVER['REQUEST_METHOD']);

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
    
    // Parse the URL path to extract ID parameter if not in query string
    $path_parts = explode('/', trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'));
    $api_endpoint = end($path_parts);
    
    // If path has ID (format: /api/invoices/123)
    if (is_numeric($api_endpoint)) {
        $_GET['id'] = $api_endpoint;
    }
    
    // Route based on request method
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Check if requesting a specific invoice
            $invoice_id = isset($_GET['id']) ? $_GET['id'] : null;
            
            if ($invoice_id) {
                // Get specific invoice with related data
                $query = "SELECT i.*, c.name as client_name, c.email as client_email, 
                          ct.contract_number
                          FROM invoices i 
                          LEFT JOIN clients c ON i.client_id = c.id 
                          LEFT JOIN contracts ct ON i.contract_id = ct.id
                          WHERE i.id = ?";
                $stmt = $conn->prepare($query);
                $stmt->bind_param("s", $invoice_id);
                $stmt->execute();
                $result = $stmt->get_result();
                
                if ($result->num_rows > 0) {
                    $invoice = $result->fetch_assoc();
                    
                    // Get invoice items if needed
                    $items_query = "SELECT * FROM invoice_items WHERE invoice_id = ?";
                    $items_stmt = $conn->prepare($items_query);
                    $items_stmt->bind_param("s", $invoice_id);
                    $items_stmt->execute();
                    $items_result = $items_stmt->get_result();
                    
                    $items = [];
                    while ($item = $items_result->fetch_assoc()) {
                        $items[] = $item;
                    }
                    
                    $invoice['items'] = $items;
                    echo json_encode($invoice);
                } else {
                    http_response_code(404);
                    echo json_encode(['message' => 'Fatura não encontrada']);
                }
            } else {
                // Get all invoices with client names
                $query = "SELECT i.*, c.name as client_name, c.email as client_email
                          FROM invoices i 
                          LEFT JOIN clients c ON i.client_id = c.id 
                          ORDER BY i.due_date DESC";
                $result = $conn->query($query);
                $invoices = [];
                
                while ($row = $result->fetch_assoc()) {
                    $invoices[] = $row;
                }
                
                echo json_encode($invoices);
            }
            break;
            
        case 'POST':
            // Create a new invoice
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            if (!isset($data['invoice_number']) || !isset($data['contract_id']) || !isset($data['amount'])) {
                http_response_code(400);
                echo json_encode(['message' => 'Campos obrigatórios não fornecidos']);
                break;
            }
            
            // Format dates
            $issue_date = isset($data['issue_date']) ? date('Y-m-d', strtotime($data['issue_date'])) : date('Y-m-d');
            $due_date = isset($data['due_date']) ? date('Y-m-d', strtotime($data['due_date'])) : null;
            $payment_date = isset($data['payment_date']) ? date('Y-m-d', strtotime($data['payment_date'])) : null;
            
            // Calculate total_amount
            $amount = floatval($data['amount']);
            $tax_amount = isset($data['tax_amount']) ? floatval($data['tax_amount']) : 0;
            $total_amount = $amount + $tax_amount;
            
            // Begin transaction
            $conn->begin_transaction();
            
            try {
                // Insert new invoice
                $stmt = $conn->prepare("INSERT INTO invoices (
                    invoice_number, contract_id, client_id, issue_date, due_date, amount, tax_amount, 
                    total_amount, status, payment_method, payment_date, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                
                $status = isset($data['status']) ? $data['status'] : 'pendente';
                $payment_method = isset($data['payment_method']) ? $data['payment_method'] : null;
                
                $stmt->bind_param("sssssdddssss", 
                    $data['invoice_number'],
                    $data['contract_id'],
                    $data['client_id'] ?? null,
                    $issue_date,
                    $due_date,
                    $amount,
                    $tax_amount,
                    $total_amount,
                    $status,
                    $payment_method,
                    $payment_date,
                    $data['notes'] ?? null
                );
                
                if (!$stmt->execute()) {
                    throw new Exception("Erro ao criar fatura: " . $stmt->error);
                }
                
                $new_id = $conn->insert_id;
                
                // Add invoice items if provided
                if (isset($data['items']) && is_array($data['items'])) {
                    $item_stmt = $conn->prepare("INSERT INTO invoice_items (
                        invoice_id, description, quantity, unit_price, amount
                    ) VALUES (?, ?, ?, ?, ?)");
                    
                    foreach ($data['items'] as $item) {
                        $item_amount = floatval($item['quantity']) * floatval($item['unit_price']);
                        
                        $item_stmt->bind_param("isddd",
                            $new_id,
                            $item['description'],
                            $item['quantity'],
                            $item['unit_price'],
                            $item_amount
                        );
                        
                        if (!$item_stmt->execute()) {
                            throw new Exception("Erro ao adicionar item da fatura: " . $item_stmt->error);
                        }
                    }
                }
                
                // Commit the transaction
                $conn->commit();
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Fatura criada com sucesso',
                    'id' => $new_id
                ]);
                
            } catch (Exception $e) {
                // Rollback in case of error
                $conn->rollback();
                http_response_code(500);
                log_message("Create invoice failed: " . $e->getMessage());
                echo json_encode([
                    'success' => false,
                    'message' => 'Falha ao criar fatura: ' . $e->getMessage()
                ]);
            }
            break;
            
        case 'PUT':
            // Update an existing invoice
            $data = json_decode(file_get_contents('php://input'), true);
            $invoice_id = isset($_GET['id']) ? $_GET['id'] : null;
            
            if (!$invoice_id) {
                http_response_code(400);
                echo json_encode(['message' => 'ID da fatura não fornecido']);
                break;
            }
            
            // Format dates if provided
            if (isset($data['issue_date'])) {
                $data['issue_date'] = date('Y-m-d', strtotime($data['issue_date']));
            }
            
            if (isset($data['due_date'])) {
                $data['due_date'] = date('Y-m-d', strtotime($data['due_date']));
            }
            
            if (isset($data['payment_date'])) {
                $data['payment_date'] = !empty($data['payment_date']) ? 
                    date('Y-m-d', strtotime($data['payment_date'])) : null;
            }
            
            // Calculate total_amount if amount or tax_amount provided
            if (isset($data['amount']) || isset($data['tax_amount'])) {
                // Get current values if not provided
                if (!isset($data['amount']) || !isset($data['tax_amount'])) {
                    $query = "SELECT amount, tax_amount FROM invoices WHERE id = ?";
                    $stmt = $conn->prepare($query);
                    $stmt->bind_param("s", $invoice_id);
                    $stmt->execute();
                    $result = $stmt->get_result();
                    $current = $result->fetch_assoc();
                    
                    if (!isset($data['amount'])) {
                        $data['amount'] = $current['amount'];
                    }
                    
                    if (!isset($data['tax_amount'])) {
                        $data['tax_amount'] = $current['tax_amount'];
                    }
                }
                
                $data['total_amount'] = floatval($data['amount']) + floatval($data['tax_amount']);
            }
            
            // Begin transaction
            $conn->begin_transaction();
            
            try {
                // Build update query dynamically based on provided fields
                $fields = [];
                $types = '';
                $values = [];
                
                $field_types = [
                    'invoice_number' => 's',
                    'contract_id' => 's',
                    'client_id' => 's',
                    'issue_date' => 's',
                    'due_date' => 's',
                    'amount' => 'd',
                    'tax_amount' => 'd',
                    'total_amount' => 'd',
                    'status' => 's',
                    'payment_method' => 's',
                    'payment_date' => 's',
                    'notes' => 's'
                ];
                
                foreach ($field_types as $field => $type) {
                    if (isset($data[$field])) {
                        $fields[] = "$field = ?";
                        $types .= $type;
                        $values[] = $data[$field];
                    }
                }
                
                if (empty($fields)) {
                    throw new Exception("Nenhum campo para atualizar");
                }
                
                // Add ID to values array and types
                $types .= 's';
                $values[] = $invoice_id;
                
                $query = "UPDATE invoices SET " . implode(', ', $fields) . " WHERE id = ?";
                $stmt = $conn->prepare($query);
                
                // Create references array for bind_param
                $refs = array();
                $refs[] = $types;
                
                for ($i = 0; $i < count($values); $i++) {
                    $refs[] = &$values[$i];
                }
                
                call_user_func_array(array($stmt, 'bind_param'), $refs);
                
                if (!$stmt->execute()) {
                    throw new Exception("Erro ao atualizar fatura: " . $stmt->error);
                }
                
                // Update items if provided
                if (isset($data['items']) && is_array($data['items'])) {
                    // Delete existing items
                    $delete_stmt = $conn->prepare("DELETE FROM invoice_items WHERE invoice_id = ?");
                    $delete_stmt->bind_param("s", $invoice_id);
                    
                    if (!$delete_stmt->execute()) {
                        throw new Exception("Erro ao remover itens antigos: " . $delete_stmt->error);
                    }
                    
                    // Add new items
                    $item_stmt = $conn->prepare("INSERT INTO invoice_items (
                        invoice_id, description, quantity, unit_price, amount
                    ) VALUES (?, ?, ?, ?, ?)");
                    
                    foreach ($data['items'] as $item) {
                        $item_amount = floatval($item['quantity']) * floatval($item['unit_price']);
                        
                        $item_stmt->bind_param("isddd",
                            $invoice_id,
                            $item['description'],
                            $item['quantity'],
                            $item['unit_price'],
                            $item_amount
                        );
                        
                        if (!$item_stmt->execute()) {
                            throw new Exception("Erro ao adicionar item da fatura: " . $item_stmt->error);
                        }
                    }
                }
                
                // Commit the transaction
                $conn->commit();
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Fatura atualizada com sucesso'
                ]);
                
            } catch (Exception $e) {
                // Rollback in case of error
                $conn->rollback();
                http_response_code(500);
                log_message("Update invoice failed: " . $e->getMessage());
                echo json_encode([
                    'success' => false,
                    'message' => 'Falha ao atualizar fatura: ' . $e->getMessage()
                ]);
            }
            break;
            
        case 'DELETE':
            // Delete an invoice
            $invoice_id = isset($_GET['id']) ? $_GET['id'] : null;
            
            if (!$invoice_id) {
                http_response_code(400);
                echo json_encode(['message' => 'ID da fatura não fornecido']);
                break;
            }
            
            // Check if invoice exists
            $check = $conn->prepare("SELECT id FROM invoices WHERE id = ?");
            $check->bind_param("s", $invoice_id);
            $check->execute();
            $result = $check->get_result();
            
            if ($result->num_rows === 0) {
                http_response_code(404);
                echo json_encode(['message' => 'Fatura não encontrada']);
                break;
            }
            
            // Begin transaction
            $conn->begin_transaction();
            
            try {
                // Delete invoice items first
                $item_stmt = $conn->prepare("DELETE FROM invoice_items WHERE invoice_id = ?");
                $item_stmt->bind_param("s", $invoice_id);
                
                if (!$item_stmt->execute()) {
                    throw new Exception("Erro ao remover itens da fatura: " . $item_stmt->error);
                }
                
                // Delete the invoice
                $stmt = $conn->prepare("DELETE FROM invoices WHERE id = ?");
                $stmt->bind_param("s", $invoice_id);
                
                if (!$stmt->execute()) {
                    throw new Exception("Erro ao excluir fatura: " . $stmt->error);
                }
                
                // Commit the transaction
                $conn->commit();
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Fatura excluída com sucesso'
                ]);
                
            } catch (Exception $e) {
                // Rollback in case of error
                $conn->rollback();
                http_response_code(500);
                log_message("Delete invoice failed: " . $e->getMessage());
                echo json_encode([
                    'success' => false,
                    'message' => 'Falha ao excluir fatura: ' . $e->getMessage()
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
