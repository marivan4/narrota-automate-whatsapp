
<?php
// API endpoint for database initialization
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
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
    file_put_contents($log_file, "[$timestamp] [initialize-database.php] $message\n", FILE_APPEND);
}

log_message("Database initialization requested");

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
        echo json_encode([
            'success' => false,
            'message' => 'Conexão falhou: ' . $conn->connect_error
        ]);
        log_message("Database connection failed: " . $conn->connect_error);
        exit();
    }
    
    // Set charset
    $conn->set_charset("utf8mb4");
    log_message("Connected to database successfully");
    
    // Check which tables exist
    $tables = array();
    $tables_result = $conn->query("SHOW TABLES");
    
    if ($tables_result) {
        while ($row = $tables_result->fetch_array()) {
            $tables[] = $row[0];
        }
    }
    
    log_message("Existing tables: " . implode(", ", $tables));
    
    // Define required tables
    $required_tables = array(
        'clients',
        'contracts',
        'invoices',
        'invoice_items',
        'users',
        'settings'
    );
    
    // Create tables that don't exist
    $missing_tables = array_diff($required_tables, $tables);
    
    if (empty($missing_tables)) {
        log_message("All required tables exist");
        echo json_encode([
            'success' => true,
            'message' => 'Todas as tabelas necessárias já existem',
            'tables' => $tables
        ]);
        exit();
    }
    
    log_message("Missing tables: " . implode(", ", $missing_tables));
    
    // Begin transaction for table creation
    $conn->begin_transaction();
    
    try {
        // Create missing tables
        foreach ($missing_tables as $table) {
            log_message("Creating table: $table");
            
            switch ($table) {
                case 'clients':
                    $sql = "CREATE TABLE clients (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        email VARCHAR(255),
                        phone VARCHAR(50),
                        document_id VARCHAR(50),
                        document_type VARCHAR(20),
                        address TEXT,
                        city VARCHAR(100),
                        state VARCHAR(50),
                        zip_code VARCHAR(20),
                        asaas_id VARCHAR(50),
                        notes TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )";
                    break;
                    
                case 'contracts':
                    $sql = "CREATE TABLE contracts (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        contract_number VARCHAR(50) NOT NULL,
                        client_id INT,
                        start_date DATE,
                        end_date DATE,
                        value DECIMAL(10,2) DEFAULT 0,
                        status VARCHAR(20) DEFAULT 'active',
                        description TEXT,
                        payment_terms TEXT,
                        vehicle_id INT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
                    )";
                    break;
                    
                case 'invoices':
                    $sql = "CREATE TABLE invoices (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        invoice_number VARCHAR(50) NOT NULL,
                        contract_id INT,
                        client_id INT,
                        issue_date DATE,
                        due_date DATE,
                        amount DECIMAL(10,2) NOT NULL DEFAULT 0,
                        tax_amount DECIMAL(10,2) DEFAULT 0,
                        total_amount DECIMAL(10,2) DEFAULT 0,
                        status VARCHAR(20) DEFAULT 'pendente',
                        payment_method VARCHAR(50),
                        payment_date DATE,
                        asaas_payment_id VARCHAR(50),
                        notes TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE SET NULL,
                        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
                    )";
                    break;
                    
                case 'invoice_items':
                    $sql = "CREATE TABLE invoice_items (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        invoice_id INT NOT NULL,
                        description VARCHAR(255) NOT NULL,
                        quantity DECIMAL(10,2) DEFAULT 1,
                        unit_price DECIMAL(10,2) NOT NULL,
                        amount DECIMAL(10,2) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
                    )";
                    break;
                    
                case 'users':
                    $sql = "CREATE TABLE users (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        email VARCHAR(255) NOT NULL UNIQUE,
                        password VARCHAR(255) NOT NULL,
                        role VARCHAR(20) DEFAULT 'user',
                        active BOOLEAN DEFAULT TRUE,
                        last_login TIMESTAMP,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )";
                    break;
                    
                case 'settings':
                    $sql = "CREATE TABLE settings (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        setting_key VARCHAR(50) NOT NULL UNIQUE,
                        setting_value TEXT,
                        setting_type VARCHAR(20) DEFAULT 'STRING',
                        is_public BOOLEAN DEFAULT FALSE,
                        description TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )";
                    break;
                    
                default:
                    continue 2; // Skip to next table if not recognized
            }
            
            if (!$conn->query($sql)) {
                throw new Exception("Erro ao criar tabela $table: " . $conn->error);
            }
            
            log_message("Table $table created successfully");
        }
        
        // Create admin user if users table was just created
        if (in_array('users', $missing_tables)) {
            log_message("Creating default admin user");
            
            // Default password is 'admin123' - should be changed immediately
            $default_password = password_hash('admin123', PASSWORD_DEFAULT);
            
            $sql = "INSERT INTO users (name, email, password, role) VALUES ('Administrador', 'admin@example.com', ?, 'admin')";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("s", $default_password);
            
            if (!$stmt->execute()) {
                throw new Exception("Erro ao criar usuário administrador: " . $stmt->error);
            }
            
            log_message("Default admin user created");
        }
        
        // Add default settings if settings table was just created
        if (in_array('settings', $missing_tables)) {
            log_message("Adding default settings");
            
            $default_settings = [
                ['company_name', 'Minha Empresa', 'STRING', true, 'Nome da empresa'],
                ['company_address', 'Endereço da empresa, 123', 'STRING', true, 'Endereço da empresa'],
                ['company_phone', '(11) 1234-5678', 'STRING', true, 'Telefone da empresa'],
                ['company_email', 'contato@minhaempresa.com', 'STRING', true, 'Email da empresa'],
                ['company_document', '12.345.678/0001-90', 'STRING', true, 'CNPJ da empresa'],
                ['invoice_due_days', '30', 'NUMBER', true, 'Dias padrão para vencimento de faturas'],
                ['enable_asaas', 'true', 'BOOLEAN', true, 'Habilitar integração com Asaas'],
                ['theme_primary_color', '#0066cc', 'STRING', true, 'Cor primária do tema']
            ];
            
            foreach ($default_settings as $setting) {
                $sql = "INSERT INTO settings (setting_key, setting_value, setting_type, is_public, description) VALUES (?, ?, ?, ?, ?)";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("sssss", $setting[0], $setting[1], $setting[2], $setting[3], $setting[4]);
                
                if (!$stmt->execute()) {
                    throw new Exception("Erro ao adicionar configuração {$setting[0]}: " . $stmt->error);
                }
            }
            
            log_message("Default settings added");
        }
        
        // Commit the transaction
        $conn->commit();
        log_message("Database initialization completed successfully");
        
        echo json_encode([
            'success' => true,
            'message' => 'Inicialização do banco de dados concluída com sucesso',
            'tables_created' => $missing_tables
        ]);
        
    } catch (Exception $e) {
        // Rollback in case of error
        $conn->rollback();
        log_message("Database initialization failed: " . $e->getMessage());
        
        echo json_encode([
            'success' => false,
            'message' => 'Inicialização falhou: ' . $e->getMessage()
        ]);
    }
    
    $conn->close();
    
} catch (Exception $e) {
    log_message("Exception: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Exceção: ' . $e->getMessage()
    ]);
}
?>
