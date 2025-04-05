
<?php
// API endpoint for updating database structure
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include config file
require_once __DIR__ . '/config.php';

// Function to log to a file (already defined in config.php)
// function log_message($message) {...}

log_message("Database update requested", "db-update");

try {
    // Create connection using the function from config.php
    $conn = create_db_connection();
    log_message("Connected to database successfully", "db-update");
    
    // Read migration SQL file - check multiple possible locations
    $migration_file_paths = [
        __DIR__ . '/../../src/database/migration_updates.sql',
        __DIR__ . '/../src/database/migration_updates.sql',
        __DIR__ . '/migration_updates.sql'
    ];
    
    $migration_file = null;
    foreach ($migration_file_paths as $path) {
        if (file_exists($path)) {
            $migration_file = $path;
            log_message("Found migration file at: " . $path, "db-update");
            break;
        }
    }
    
    if (!$migration_file) {
        $errorPaths = implode(', ', $migration_file_paths);
        log_message("Migration file not found in any of the checked locations: $errorPaths", "db-update");
        
        // Create the migration file in the current directory if it doesn't exist
        $defaultMigrationPath = __DIR__ . '/migration_updates.sql';
        if (!file_exists($defaultMigrationPath)) {
            // Copy from src/database if it exists
            if (file_exists(__DIR__ . '/../../src/database/migration_updates.sql')) {
                copy(__DIR__ . '/../../src/database/migration_updates.sql', $defaultMigrationPath);
                log_message("Copied migration file from src/database to current directory", "db-update");
            } else {
                // Create default migration file content
                $defaultMigration = file_get_contents(__DIR__ . '/schema.sql');
                file_put_contents($defaultMigrationPath, $defaultMigration);
                log_message("Created default migration file in current directory", "db-update");
            }
        }
        
        if (file_exists($defaultMigrationPath)) {
            $migration_file = $defaultMigrationPath;
            log_message("Using migration file from current directory", "db-update");
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Arquivo de migração não encontrado. Verifique as seguintes localizações: ' . $errorPaths
            ]);
            exit();
        }
    }
    
    $migration_sql = file_get_contents($migration_file);
    $queries = array_filter(explode(';', $migration_sql), 'trim');
    
    // Begin transaction
    $conn->begin_transaction();
    $executed = 0;
    $errors = [];
    
    try {
        foreach ($queries as $query) {
            $query = trim($query);
            if (!empty($query)) {
                log_message("Executing query: " . substr($query, 0, 100) . "...", "db-update");
                if ($conn->query($query)) {
                    $executed++;
                    log_message("Query executed successfully", "db-update");
                } else {
                    $errors[] = [
                        'query' => $query,
                        'error' => $conn->error
                    ];
                    log_message("Query failed: " . $conn->error, "db-update");
                }
            }
        }
        
        if (empty($errors)) {
            $conn->commit();
            log_message("Database update completed successfully. $executed queries executed.", "db-update");
            
            // Verifique se a tabela invoice_items existe
            $result = $conn->query("SHOW TABLES LIKE 'invoice_items'");
            if ($result->num_rows == 0) {
                // Crie a tabela invoice_items se não existir
                $create_items_table = "
                CREATE TABLE IF NOT EXISTS invoice_items (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  invoice_id INT NOT NULL,
                  description VARCHAR(255) NOT NULL,
                  quantity INT NOT NULL DEFAULT 1,
                  price DECIMAL(10,2) NOT NULL,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
                )";
                
                if ($conn->query($create_items_table)) {
                    log_message("Created invoice_items table", "db-update");
                    $executed++;
                } else {
                    log_message("Failed to create invoice_items table: " . $conn->error, "db-update");
                }
            }
            
            echo json_encode([
                'success' => true,
                'message' => "Banco de dados atualizado com sucesso. $executed consultas executadas."
            ]);
        } else {
            $conn->rollback();
            log_message("Database update failed with errors.", "db-update");
            
            echo json_encode([
                'success' => false,
                'message' => "Atualização falhou com erros. Verificar logs.",
                'errors' => $errors
            ]);
        }
        
    } catch (Exception $e) {
        $conn->rollback();
        log_message("Exception during transaction: " . $e->getMessage(), "db-update");
        
        echo json_encode([
            'success' => false,
            'message' => 'Exceção durante a transação: ' . $e->getMessage()
        ]);
    }
    
    $conn->close();
    
} catch (Exception $e) {
    log_message("Exception: " . $e->getMessage(), "db-update");
    echo json_encode([
        'success' => false,
        'message' => 'Exceção: ' . $e->getMessage()
    ]);
}
?>
