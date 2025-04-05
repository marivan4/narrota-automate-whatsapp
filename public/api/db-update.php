
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

// Log the request
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
                if (!$defaultMigration) {
                    $defaultMigration = "-- Default migration schema\n-- Add tables here";
                }
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
    
    // Log the content of the migration file for debugging
    $migration_content = file_get_contents($migration_file);
    log_message("Migration file content (first 200 chars): " . substr($migration_content, 0, 200) . "...", "db-update");
    
    $migration_sql = $migration_content;
    // Make sure we have proper line endings
    $migration_sql = str_replace("\r\n", "\n", $migration_sql);
    
    // Split into individual queries (more robust method)
    $queries = [];
    $current_query = '';
    $lines = explode("\n", $migration_sql);
    
    foreach ($lines as $line) {
        // Skip empty lines and comments
        $trimmed_line = trim($line);
        if (empty($trimmed_line) || strpos($trimmed_line, '--') === 0) {
            continue;
        }
        
        $current_query .= $line . "\n";
        
        // When we reach a semicolon, it's the end of a query
        if (substr(trim($line), -1) === ';') {
            $queries[] = $current_query;
            $current_query = '';
        }
    }
    
    // Add any remaining query
    if (!empty(trim($current_query))) {
        $queries[] = $current_query;
    }
    
    log_message("Parsed " . count($queries) . " queries from migration file", "db-update");
    
    // Begin transaction
    $conn->begin_transaction();
    $executed = 0;
    $errors = [];
    
    try {
        foreach ($queries as $index => $query) {
            $query = trim($query);
            if (!empty($query)) {
                log_message("Executing query #$index: " . substr($query, 0, 100) . "...", "db-update");
                
                // Try to execute the query
                try {
                    if ($conn->query($query)) {
                        $executed++;
                        log_message("Query #$index executed successfully", "db-update");
                    } else {
                        // Only consider it an error if it's not a "table already exists" warning
                        if ($conn->errno != 1050 && $conn->errno != 1060) {
                            $errors[] = [
                                'query' => $query,
                                'error' => $conn->error,
                                'errno' => $conn->errno
                            ];
                            log_message("Query #$index failed: " . $conn->error . " (errno: " . $conn->errno . ")", "db-update");
                        } else {
                            log_message("Query #$index skipped (object already exists)", "db-update");
                            $executed++; // Count as executed since it's not a real error
                        }
                    }
                } catch (Exception $e) {
                    $errors[] = [
                        'query' => $query,
                        'error' => $e->getMessage()
                    ];
                    log_message("Query #$index exception: " . $e->getMessage(), "db-update");
                }
            }
        }
        
        if (empty($errors)) {
            $conn->commit();
            log_message("Database update completed successfully. $executed queries executed.", "db-update");
            
            echo json_encode([
                'success' => true,
                'message' => "Banco de dados atualizado com sucesso. $executed consultas executadas."
            ]);
        } else {
            // If there are non-fatal errors, we still commit and report them
            $conn->commit();
            log_message("Database update completed with some errors. $executed queries executed successfully, " . count($errors) . " failed.", "db-update");
            
            echo json_encode([
                'success' => true,
                'message' => "Banco de dados atualizado com alguns avisos. $executed consultas executadas.",
                'warnings' => $errors
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
