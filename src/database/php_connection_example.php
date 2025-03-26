
<?php
/**
 * Example PHP connection file for the Car Rental System
 * This file demonstrates how to connect to the MySQL database and perform basic operations
 * Compatible with PHP 8.1
 */

// Database connection parameters
$host = 'localhost';
$dbname = 'car_rental_system';
$username = 'root';
$password = '';
$charset = 'utf8mb4';

// PDO connection options
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    // Create PDO instance
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=$charset",
        $username,
        $password,
        $options
    );

    echo "Connected successfully to the database.\n";

    // Example: Get all users
    function getAllUsers($pdo) {
        $stmt = $pdo->query('SELECT id, name, email, role FROM users');
        return $stmt->fetchAll();
    }

    // Example: Get user by ID
    function getUserById($pdo, $userId) {
        $stmt = $pdo->prepare('SELECT id, name, email, role FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        return $stmt->fetch();
    }

    // Example: Create a new client
    function createClient($pdo, $data) {
        $sql = "INSERT INTO clients (name, email, phone, document_id, document_type, address, city, state, zip_code, created_by)
                VALUES (:name, :email, :phone, :document_id, :document_type, :address, :city, :state, :zip_code, :created_by)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($data);
        return $pdo->lastInsertId();
    }

    // Example: Update WhatsApp configuration
    function updateWhatsAppConfig($pdo, $userId, $config) {
        // Check if configuration exists
        $stmt = $pdo->prepare('SELECT id FROM whatsapp_configs WHERE user_id = ? AND instance_name = ?');
        $stmt->execute([$userId, $config['instance_name']]);
        $existing = $stmt->fetch();

        if ($existing) {
            // Update existing configuration
            $sql = "UPDATE whatsapp_configs 
                    SET api_key = :api_key, 
                        base_url = :base_url, 
                        is_connected = :is_connected,
                        last_connected = :last_connected,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = :id";
            
            $config['id'] = $existing['id'];
            $stmt = $pdo->prepare($sql);
            return $stmt->execute($config);
        } else {
            // Insert new configuration
            $sql = "INSERT INTO whatsapp_configs (user_id, instance_name, api_key, base_url, is_connected, last_connected)
                    VALUES (:user_id, :instance_name, :api_key, :base_url, :is_connected, :last_connected)";
            
            $config['user_id'] = $userId;
            $stmt = $pdo->prepare($sql);
            return $stmt->execute($config);
        }
    }

    // Example: Get system settings
    function getSettings($pdo, $publicOnly = true) {
        $sql = 'SELECT setting_key, setting_value, setting_type FROM settings';
        if ($publicOnly) {
            $sql .= ' WHERE is_public = 1';
        }
        
        $stmt = $pdo->query($sql);
        $settings = [];
        
        while ($row = $stmt->fetch()) {
            // Convert value according to type
            $value = $row['setting_value'];
            switch ($row['setting_type']) {
                case 'NUMBER':
                    $value = (float) $value;
                    break;
                case 'BOOLEAN':
                    $value = (bool) $value;
                    break;
                case 'JSON':
                    $value = json_decode($value, true);
                    break;
            }
            
            $settings[$row['setting_key']] = $value;
        }
        
        return $settings;
    }

    // Usage examples
    /*
    $users = getAllUsers($pdo);
    print_r($users);

    $newClientId = createClient($pdo, [
        'name' => 'New Client',
        'email' => 'newclient@example.com',
        'phone' => '1122334455',
        'document_id' => '11223344',
        'document_type' => 'ID',
        'address' => '123 New St',
        'city' => 'New City',
        'state' => 'NC',
        'zip_code' => '12345',
        'created_by' => 1
    ]);
    echo "Created new client with ID: $newClientId\n";

    $settings = getSettings($pdo);
    print_r($settings);
    */

} catch (PDOException $e) {
    // Handle database connection error
    echo "Connection failed: " . $e->getMessage() . "\n";
    exit;
}
