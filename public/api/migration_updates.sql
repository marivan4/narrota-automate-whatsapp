
-- Migration updates to add or modify required tables

-- Ensure users table exists with all required fields
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'USER', 'MANAGER') NOT NULL DEFAULT 'USER',
  phone VARCHAR(20),
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Ensure user_profiles table exists
CREATE TABLE IF NOT EXISTS user_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  document_id VARCHAR(50),
  document_type VARCHAR(50),
  birth_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Ensure whatsapp_configs table exists
CREATE TABLE IF NOT EXISTS whatsapp_configs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  instance_name VARCHAR(100) NOT NULL,
  api_key VARCHAR(255) NOT NULL,
  base_url VARCHAR(255) NOT NULL DEFAULT 'https://evolutionapi.gpstracker-16.com.br',
  is_connected BOOLEAN DEFAULT FALSE,
  last_connected TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY (user_id, instance_name),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Ensure clients table exists with all required fields
CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  document VARCHAR(50),
  document_type VARCHAR(50),
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  zipCode VARCHAR(20),
  asaas_id VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Ensure contracts table exists
CREATE TABLE IF NOT EXISTS contracts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contract_number VARCHAR(50) NOT NULL,
  client_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  value DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  description TEXT,
  payment_terms TEXT,
  vehicle_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Ensure vehicles table exists (added missing table)
CREATE TABLE IF NOT EXISTS vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT,
  plate VARCHAR(20),
  model VARCHAR(100),
  brand VARCHAR(100),
  year VARCHAR(10),
  color VARCHAR(50),
  chassis VARCHAR(50),
  renavam VARCHAR(50),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active',
  tracker_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);

-- Ensure invoices table exists with the correct structure
CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(50) NOT NULL,
  contract_id VARCHAR(50),
  client_id INT,
  issue_date DATE,
  due_date DATE NOT NULL,
  payment_date DATE,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
  payment_method VARCHAR(20),
  payment_id VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);

-- Ensure invoice_items table exists with correct structure
CREATE TABLE IF NOT EXISTS invoice_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  description VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- Ensure checklists table exists
CREATE TABLE IF NOT EXISTS checklists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type ENUM('VEHICLE_PICKUP', 'VEHICLE_RETURN', 'MAINTENANCE', 'GENERAL') NOT NULL,
  created_by INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Ensure checklist_items table exists
CREATE TABLE IF NOT EXISTS checklist_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  checklist_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT FALSE,
  order_index INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (checklist_id) REFERENCES checklists(id) ON DELETE CASCADE
);

-- Create contract_checklists table if not exists
CREATE TABLE IF NOT EXISTS contract_checklists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contract_id INT NOT NULL,
  checklist_id INT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_by INT,
  completed_at TIMESTAMP NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
  FOREIGN KEY (checklist_id) REFERENCES checklists(id) ON DELETE CASCADE,
  FOREIGN KEY (completed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create completed_checklist_items table if not exists
CREATE TABLE IF NOT EXISTS completed_checklist_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contract_checklist_id INT NOT NULL,
  checklist_item_id INT NOT NULL,
  value TEXT,
  satisfied BOOLEAN DEFAULT FALSE,
  photo_url VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (contract_checklist_id) REFERENCES contract_checklists(id) ON DELETE CASCADE,
  FOREIGN KEY (checklist_item_id) REFERENCES checklist_items(id) ON DELETE CASCADE
);

-- Insert default admin user if not exists (password: admin123)
INSERT INTO users (name, email, password, role)
SELECT 'Admin User', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN'
FROM dual
WHERE NOT EXISTS (SELECT * FROM users WHERE email = 'admin@example.com');

-- Insert default manager user if not exists (password: manager123)
INSERT INTO users (name, email, password, role)
SELECT 'Manager User', 'manager@example.com', '$2y$10$DHWt7ILl6GdVx5HlEUVmdeZWlzYdv.f/grwOK/nJXvBzRUyt1FDaS', 'MANAGER'
FROM dual
WHERE NOT EXISTS (SELECT * FROM users WHERE email = 'manager@example.com');

-- Insert default user if not exists (password: user123)
INSERT INTO users (name, email, password, role)
SELECT 'Regular User', 'user@example.com', '$2y$10$UvObcJu9W1P7QYvImPd0I.j1I8z4qDOITbFRqhxxbcC3XGQ.Gu1c6', 'USER'
FROM dual
WHERE NOT EXISTS (SELECT * FROM users WHERE email = 'user@example.com');

-- Add some test data if tables are empty
INSERT INTO clients (name, email, phone, document, address, city, state)
SELECT 'Cliente Teste', 'cliente@teste.com', '(11) 99999-9999', '123.456.789-00', 'Rua dos Testes, 123', 'São Paulo', 'SP'
FROM dual
WHERE NOT EXISTS (SELECT * FROM clients LIMIT 1);

-- Add a test contract if table is empty
INSERT INTO contracts (contract_number, client_id, start_date, end_date, value, status)
SELECT 'CONT-001', 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 1200.00, 'active'
FROM dual
WHERE NOT EXISTS (SELECT * FROM contracts LIMIT 1);

-- Add a test invoice if table is empty
INSERT INTO invoices (invoice_number, contract_id, client_id, issue_date, due_date, amount, total_amount, status)
SELECT 'INV-001', 'CONT-001', 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 100.00, 100.00, 'pending'
FROM dual
WHERE NOT EXISTS (SELECT * FROM invoices LIMIT 1);

-- Add test invoice items if table is empty
INSERT INTO invoice_items (invoice_id, description, quantity, price)
SELECT 1, 'Mensalidade de rastreamento', 1, 100.00
FROM dual
WHERE NOT EXISTS (SELECT * FROM invoice_items LIMIT 1);
