
<?php
// API endpoint for logging client-side errors
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Function to log to a file
function log_to_file($entries, $type = 'error') {
    $log_file = __DIR__ . "/{$type}_log.txt";
    
    foreach ($entries as $entry) {
        $timestamp = $entry['timestamp'] ?? date('Y-m-d H:i:s');
        $message = $entry['message'] ?? 'No message';
        $severity = $entry['severity'] ?? 'error';
        $source = $entry['source'] ?? 'unknown';
        
        $log_line = "[$timestamp] [$severity] [$source] $message";
        
        // Add stack trace if available
        if (isset($entry['stack']) && !empty($entry['stack'])) {
            $log_line .= "\nStack: " . $entry['stack'];
        }
        
        // Add data if available in a readable format
        if (isset($entry['data']) && !empty($entry['data'])) {
            $data_string = json_encode($entry['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            $log_line .= "\nData: $data_string";
        }
        
        $log_line .= "\n" . str_repeat('-', 80) . "\n";
        
        file_put_contents($log_file, $log_line, FILE_APPEND);
    }
    
    return true;
}

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Método não permitido. Use POST.'
    ]);
    exit();
}

// Get POST data
$post_data = json_decode(file_get_contents('php://input'), true);

if (!isset($post_data['entries']) || !is_array($post_data['entries'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Formato inválido. Esperado um array de entradas de log.'
    ]);
    exit();
}

$entries = $post_data['entries'];

// Log the entries
try {
    // Record errors in error_log.txt
    log_to_file($entries, 'error');
    
    echo json_encode([
        'success' => true,
        'message' => 'Logs registrados com sucesso',
        'count' => count($entries)
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Falha ao registrar logs: ' . $e->getMessage()
    ]);
}
?>
