
-- Criação das tabelas para armazenar dados do Asaas no MySQL

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

-- Procedimento para sincronizar um pagamento do Asaas com o banco de dados local
DELIMITER //
CREATE PROCEDURE sync_asaas_payment(
    IN p_asaas_id VARCHAR(255),
    IN p_customer_id INT,
    IN p_invoice_id VARCHAR(255),
    IN p_description VARCHAR(255),
    IN p_value DECIMAL(10,2),
    IN p_net_value DECIMAL(10,2),
    IN p_status VARCHAR(50),
    IN p_billing_type VARCHAR(50),
    IN p_due_date DATE,
    IN p_payment_date DATE,
    IN p_external_reference VARCHAR(255),
    IN p_invoice_url VARCHAR(255),
    IN p_bank_slip_url VARCHAR(255)
)
BEGIN
    -- Verificar se o pagamento já existe
    DECLARE payment_exists INT;
    DECLARE payment_id INT;
    
    SELECT COUNT(*) INTO payment_exists FROM asaas_payments WHERE asaas_id = p_asaas_id;
    
    IF payment_exists > 0 THEN
        -- Atualizar pagamento existente
        UPDATE asaas_payments
        SET 
            customer_id = p_customer_id,
            invoice_id = p_invoice_id,
            description = p_description,
            value = p_value,
            net_value = p_net_value,
            status = p_status,
            billing_type = p_billing_type,
            due_date = p_due_date,
            payment_date = p_payment_date,
            external_reference = p_external_reference,
            invoice_url = p_invoice_url,
            bank_slip_url = p_bank_slip_url,
            updated_at = NOW()
        WHERE asaas_id = p_asaas_id;
        
        SELECT id INTO payment_id FROM asaas_payments WHERE asaas_id = p_asaas_id;
    ELSE
        -- Inserir novo pagamento
        INSERT INTO asaas_payments (
            asaas_id,
            customer_id,
            invoice_id,
            description,
            value,
            net_value,
            status,
            billing_type,
            due_date,
            payment_date,
            external_reference,
            invoice_url,
            bank_slip_url
        ) VALUES (
            p_asaas_id,
            p_customer_id,
            p_invoice_id,
            p_description,
            p_value,
            p_net_value,
            p_status,
            p_billing_type,
            p_due_date,
            p_payment_date,
            p_external_reference,
            p_invoice_url,
            p_bank_slip_url
        );
        
        SET payment_id = LAST_INSERT_ID();
    END IF;
    
    -- Retornar o ID do pagamento
    SELECT payment_id AS id;
END //
DELIMITER ;

-- Índices adicionais para melhorar performance de buscas comuns
CREATE INDEX idx_status ON asaas_payments(status);
CREATE INDEX idx_due_date ON asaas_payments(due_date);
CREATE INDEX idx_payment_date ON asaas_payments(payment_date);
CREATE INDEX idx_external_reference ON asaas_payments(external_reference);
CREATE INDEX idx_billing_type ON asaas_payments(billing_type);
