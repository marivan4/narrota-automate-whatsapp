
-- Criação das tabelas para armazenar dados do Asaas no MySQL

USE faturamento;

-- Tabela para armazenar as configurações de integração com o Asaas
CREATE TABLE IF NOT EXISTS asaas_configurations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) NOT NULL,
    environment ENUM('sandbox', 'production') NOT NULL DEFAULT 'sandbox',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_company (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela para armazenar os clientes sincronizados com o Asaas
CREATE TABLE IF NOT EXISTS asaas_customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id VARCHAR(255) NOT NULL COMMENT 'ID do cliente no sistema',
    asaas_id VARCHAR(255) NOT NULL COMMENT 'ID do cliente no Asaas',
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    document VARCHAR(20) NOT NULL COMMENT 'CPF ou CNPJ',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_client (client_id),
    UNIQUE KEY unique_asaas (asaas_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela para armazenar os pagamentos do Asaas
CREATE TABLE IF NOT EXISTS asaas_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asaas_id VARCHAR(255) NOT NULL COMMENT 'ID do pagamento no Asaas',
    invoice_id VARCHAR(255) COMMENT 'ID da fatura no sistema (opcional)',
    customer_id INT NOT NULL COMMENT 'Referência para asaas_customers.id',
    description VARCHAR(255),
    value DECIMAL(10,2) NOT NULL,
    net_value DECIMAL(10,2),
    status VARCHAR(50) NOT NULL,
    billing_type VARCHAR(50) NOT NULL COMMENT 'BOLETO, PIX, CREDIT_CARD, etc',
    due_date DATE NOT NULL,
    payment_date DATE,
    external_reference VARCHAR(255),
    invoice_url VARCHAR(255),
    bank_slip_url VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_asaas_payment (asaas_id),
    FOREIGN KEY (customer_id) REFERENCES asaas_customers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela para armazenar detalhes de pagamentos PIX
CREATE TABLE IF NOT EXISTS asaas_pix_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id INT NOT NULL,
    qrcode_image MEDIUMTEXT COMMENT 'Imagem do QR code em base64',
    qrcode_payload TEXT COMMENT 'Payload do PIX',
    expiration_date DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES asaas_payments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela para armazenar detalhes de pagamentos por boleto
CREATE TABLE IF NOT EXISTS asaas_boleto_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id INT NOT NULL,
    identification_field VARCHAR(255) COMMENT 'Linha digitável do boleto',
    barcode VARCHAR(255) COMMENT 'Código de barras do boleto',
    nossa_numero VARCHAR(50),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES asaas_payments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela para armazenar webhooks recebidos do Asaas
CREATE TABLE IF NOT EXISTS asaas_webhooks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event VARCHAR(100) NOT NULL,
    payment_id VARCHAR(255),
    webhook_data JSON NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME,
    INDEX idx_payment (payment_id),
    INDEX idx_event (event)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices adicionais para melhorar performance de buscas comuns
CREATE INDEX idx_status ON asaas_payments(status);
CREATE INDEX idx_due_date ON asaas_payments(due_date);
CREATE INDEX idx_payment_date ON asaas_payments(payment_date);
CREATE INDEX idx_external_reference ON asaas_payments(external_reference);
CREATE INDEX idx_billing_type ON asaas_payments(billing_type);
