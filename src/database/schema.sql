
-- Database Schema for Car Rental System
-- Compatible with MySQL and PHP 8.1

-- Create database
CREATE DATABASE IF NOT EXISTS faturamento CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE faturamento;

-- Users table
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

-- User profiles table (additional user information)
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

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  document_id VARCHAR(50),
  document_type VARCHAR(50),
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  created_by INT,
  status ENUM('ACTIVE', 'INACTIVE', 'BLOCKED') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  make VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  year INT NOT NULL,
  license_plate VARCHAR(20) NOT NULL UNIQUE,
  color VARCHAR(30),
  chassis_number VARCHAR(50) UNIQUE,
  current_mileage INT,
  fuel_type ENUM('GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID', 'FLEX'),
  status ENUM('AVAILABLE', 'RENTED', 'MAINTENANCE', 'SOLD') DEFAULT 'AVAILABLE',
  daily_rate DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  vehicle_id INT NOT NULL,
  user_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  actual_return_date DATE,
  start_mileage INT,
  end_mileage INT,
  daily_rate DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2),
  deposit_amount DECIMAL(10,2),
  status ENUM('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED') DEFAULT 'DRAFT',
  payment_status ENUM('PENDING', 'PARTIAL', 'PAID') DEFAULT 'PENDING',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Invoices table - Enhanced
CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contract_id INT NOT NULL,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2),
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('PENDING', 'PAID', 'OVERDUE', 'CANCELLED') DEFAULT 'PENDING',
  payment_date DATE,
  payment_method VARCHAR(50),
  payment_reference VARCHAR(100),
  sent_reminder BOOLEAN DEFAULT FALSE,
  sent_reminder_date DATETIME,
  sent_whatsapp BOOLEAN DEFAULT FALSE,
  sent_whatsapp_date DATETIME,
  sent_email BOOLEAN DEFAULT FALSE,
  sent_email_date DATETIME,
  is_recurrent BOOLEAN DEFAULT FALSE,
  recurrence_cycle VARCHAR(50),
  parent_invoice_id INT,
  user_id INT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (contract_id) REFERENCES contracts(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (parent_invoice_id) REFERENCES invoices(id) ON DELETE SET NULL
);

-- Invoice items table - New
CREATE TABLE IF NOT EXISTS invoice_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  description VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,2),
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- Invoice logs table - New
CREATE TABLE IF NOT EXISTS invoice_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  description TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Invoice attachments table - New
CREATE TABLE IF NOT EXISTS invoice_attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INT NOT NULL,
  uploaded_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Checklists table
CREATE TABLE IF NOT EXISTS checklists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type ENUM('VEHICLE_PICKUP', 'VEHICLE_RETURN', 'MAINTENANCE', 'GENERAL') NOT NULL,
  created_by INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Checklist items table
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

-- Contract checklists (completed checklists for contracts)
CREATE TABLE IF NOT EXISTS contract_checklists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contract_id INT NOT NULL,
  checklist_id INT NOT NULL,
  completed_by INT NOT NULL,
  completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (contract_id) REFERENCES contracts(id),
  FOREIGN KEY (checklist_id) REFERENCES checklists(id),
  FOREIGN KEY (completed_by) REFERENCES users(id)
);

-- Completed checklist items
CREATE TABLE IF NOT EXISTS completed_checklist_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contract_checklist_id INT NOT NULL,
  checklist_item_id INT NOT NULL,
  status ENUM('PASSED', 'FAILED', 'NA') NOT NULL,
  notes TEXT,
  image_url VARCHAR(255),
  completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contract_checklist_id) REFERENCES contract_checklists(id) ON DELETE CASCADE,
  FOREIGN KEY (checklist_item_id) REFERENCES checklist_items(id)
);

-- WhatsApp configurations table
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

-- WhatsApp messages table
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  whatsapp_config_id INT NOT NULL,
  message_type ENUM('TEXT', 'MEDIA', 'DOCUMENT', 'LOCATION') NOT NULL DEFAULT 'TEXT',
  recipient VARCHAR(50) NOT NULL,
  message_content TEXT NOT NULL,
  media_url VARCHAR(255),
  status ENUM('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED') NOT NULL DEFAULT 'PENDING',
  error_message TEXT,
  sent_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (whatsapp_config_id) REFERENCES whatsapp_configs(id) ON DELETE CASCADE
);

-- Reports table (for storing report configurations)
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  report_type ENUM('CONTRACT', 'INVOICE', 'CLIENT', 'VEHICLE', 'FINANCIAL', 'CUSTOM') NOT NULL,
  created_by INT NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  query_params JSON,
  last_run TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- System settings table
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type ENUM('STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'DATE') NOT NULL DEFAULT 'STRING',
  description TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO users (name, email, password, role) 
VALUES ('Admin', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN');

-- Insert default settings
INSERT INTO settings (setting_key, setting_value, setting_type, description)
VALUES 
('company_name', 'Sistema de Locação de Veículos', 'STRING', 'Nome da empresa exibido no sistema'),
('company_address', 'Rua Principal, 123, Centro', 'STRING', 'Endereço da empresa usado em documentos'),
('company_phone', '(99) 99999-9999', 'STRING', 'Telefone de contato da empresa'),
('company_email', 'contato@empresa.com.br', 'STRING', 'Email de contato da empresa'),
('default_contract_terms', 'Termos e condições padrão do contrato...', 'TEXT', 'Termos padrão usados em contratos'),
('whatsapp_global_api_key', '', 'STRING', 'Chave de API global para integração com WhatsApp'),
('whatsapp_base_url', 'https://evolutionapi.gpstracker-16.com.br', 'STRING', 'URL base para API do WhatsApp');

-- Sample data for testing
INSERT INTO clients (name, email, phone, document_id, address, city, state)
VALUES 
('João da Silva', 'joao@exemplo.com', '(99) 98888-7777', '123.456.789-00', 'Av. Cliente, 456', 'São Paulo', 'SP'),
('Maria Oliveira', 'maria@exemplo.com', '(99) 97777-6666', '987.654.321-00', 'Rua do Cliente, 789', 'Rio de Janeiro', 'RJ');

INSERT INTO vehicles (make, model, year, license_plate, color, chassis_number, current_mileage, fuel_type, daily_rate)
VALUES 
('Toyota', 'Corolla', 2022, 'ABC1234', 'Branco', 'TOYT12345678901', 5000, 'FLEX', 150.00),
('Honda', 'Civic', 2021, 'XYZ5678', 'Preto', 'HNDA98765432109', 8000, 'FLEX', 140.00);
