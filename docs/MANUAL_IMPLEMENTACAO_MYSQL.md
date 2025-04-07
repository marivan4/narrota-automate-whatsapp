
# Manual de Implementação com MySQL e React

Este manual fornece instruções detalhadas para implementar o Sistema de Faturamento utilizando MySQL como banco de dados e React para o frontend, facilitando a conexão com dados externos.

## Índice

1. [Requisitos do Sistema](#1-requisitos-do-sistema)
2. [Configuração do MySQL](#2-configuração-do-mysql)
3. [Estrutura do Banco de Dados](#3-estrutura-do-banco-de-dados)
4. [Configuração da API PHP](#4-configuração-da-api-php)
5. [Integração com React](#5-integração-com-react)
6. [Implementação de Serviços](#6-implementação-de-serviços)
7. [Conversão de Tipos de Dados](#7-conversão-de-tipos-de-dados)
8. [Segurança e Boas Práticas](#8-segurança-e-boas-práticas)
9. [Solução de Problemas Comuns](#9-solução-de-problemas-comuns)

## 1. Requisitos do Sistema

### Software Necessário

- **Servidor Web**: Apache 2.4+ ou Nginx
- **Banco de Dados**: MySQL 8.0+ ou MariaDB 10.5+
- **PHP**: 8.1+ com extensões:
  - php-mysql
  - php-json
  - php-curl
  - php-mbstring
- **Node.js**: 16+ para o desenvolvimento React
- **Ferramentas**: Composer (para dependências PHP), npm/yarn (para dependências JavaScript)

### Configuração do Ambiente de Desenvolvimento

```bash
# Criar diretório do projeto
mkdir -p faturamento/{backend,frontend}
cd faturamento

# Inicializar projeto React no frontend
cd frontend
npm create vite@latest . -- --template react-ts
npm install

# Voltar para a raiz do projeto
cd ..

# Configurar backend PHP
cd backend
composer init
composer require vlucas/phpdotenv
```

## 2. Configuração do MySQL

### Instalação do MySQL

Para sistemas Ubuntu/Debian:

```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

Para Windows, baixe o instalador do [site oficial do MySQL](https://dev.mysql.com/downloads/installer/).

### Criação do Banco de Dados

```sql
CREATE DATABASE faturamento CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'faturamento_user'@'localhost' IDENTIFIED BY 'SuaSenhaSegura';
GRANT ALL PRIVILEGES ON faturamento.* TO 'faturamento_user'@'localhost';
FLUSH PRIVILEGES;
```

### Configuração Otimizada do MySQL

Edite o arquivo `my.cnf` (Linux) ou `my.ini` (Windows) para otimizar o desempenho:

```ini
[mysqld]
# Configurações de performance
innodb_buffer_pool_size = 1G  # Ajuste conforme RAM disponível
max_connections = 150
query_cache_size = 64M

# Configurações de charset
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# Logs
slow_query_log = 1
slow_query_log_file = /var/log/mysql/mysql-slow.log
long_query_time = 2
```

## 3. Estrutura do Banco de Dados

### Criação das Tabelas

Execute o script SQL fornecido para criar as tabelas necessárias. Você pode encontrar o script em `src/database/schema.sql` ou usar o arquivo SQL simplificado abaixo:

```sql
-- Tabela de clientes
CREATE TABLE clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  document VARCHAR(50),
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  zipCode VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de contratos
CREATE TABLE contracts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contract_number VARCHAR(50) NOT NULL,
  client_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  value DECIMAL(10,2) DEFAULT 0.00,
  status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
  description TEXT,
  payment_terms TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Tabela de faturas
CREATE TABLE invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(50) NOT NULL,
  contract_id VARCHAR(50),
  client_id INT,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  tax_amount DECIMAL(10,2) DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
  payment_date DATE,
  payment_method VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Tabela de itens da fatura
CREATE TABLE invoice_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  description VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);
```

### Índices e Otimizações

```sql
-- Criar índices para melhorar a performance das consultas
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_invoices_contract ON invoices(contract_id);
CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_status ON invoices(status);
```

## 4. Configuração da API PHP

### Estrutura de Diretórios da API

```
backend/
├── api/
│   ├── clients/
│   │   ├── create.php
│   │   ├── delete.php
│   │   ├── read.php
│   │   └── update.php
│   ├── contracts/
│   │   └── ...
│   ├── invoices/
│   │   └── ...
│   └── test-connection.php
├── config/
│   ├── Database.php
│   └── ErrorHandler.php
├── models/
│   ├── Client.php
│   ├── Contract.php
│   └── Invoice.php
├── .env
├── .htaccess
└── index.php
```

### Arquivo de Configuração da Conexão

Crie o arquivo `backend/config/Database.php`:

```php
<?php
class Database {
    private $host;
    private $database;
    private $username;
    private $password;
    private $conn;

    public function __construct() {
        // Carregar variáveis de ambiente
        $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
        $dotenv->load();

        $this->host = $_ENV['DB_HOST'];
        $this->database = $_ENV['DB_NAME'];
        $this->username = $_ENV['DB_USER'];
        $this->password = $_ENV['DB_PASSWORD'];
    }

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host={$this->host};dbname={$this->database};charset=utf8",
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
        } catch(PDOException $e) {
            // Registrar erro, mas não expor detalhes sensíveis
            error_log("Erro de conexão: " . $e->getMessage());
            throw new Exception("Erro ao conectar ao banco de dados");
        }

        return $this->conn;
    }
}
```

### Exemplo de API para Clientes

Crie o arquivo `backend/api/clients/read.php`:

```php
<?php
// Cabeçalhos obrigatórios
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Incluir arquivos de configuração e modelo
include_once '../../config/Database.php';
include_once '../../models/Client.php';

// Instanciar banco de dados e objeto cliente
$database = new Database();
$db = $database->getConnection();

$client = new Client($db);

// Consultar clientes
$stmt = $client->read();
$num = $stmt->rowCount();

// Verificar se existem registros
if ($num > 0) {
    $clients_arr = array();
    $clients_arr["records"] = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);

        $client_item = array(
            "id" => $id,
            "name" => $name,
            "email" => $email,
            "phone" => $phone,
            "document" => $document,
            "address" => $address,
            "city" => $city,
            "state" => $state,
            "zipCode" => $zipCode,
            "created_at" => $created_at
        );

        array_push($clients_arr["records"], $client_item);
    }

    // Definir código de resposta - 200 OK
    http_response_code(200);

    // Mostrar os dados em formato JSON
    echo json_encode($clients_arr);
} else {
    // Definir código de resposta - 404 Not found
    http_response_code(404);

    // Informar ao usuário que não foram encontrados clientes
    echo json_encode(array("message" => "Nenhum cliente encontrado."));
}
```

### API de Teste de Conexão

Crie o arquivo `backend/api/test-connection.php`:

```php
<?php
// Cabeçalhos obrigatórios
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Incluir arquivo de configuração
include_once '../config/Database.php';

try {
    // Instanciar banco de dados e testar conexão
    $database = new Database();
    $db = $database->getConnection();
    
    // Se chegou aqui, a conexão foi bem-sucedida
    http_response_code(200);
    echo json_encode(array("success" => true, "message" => "Conexão com o banco de dados estabelecida com sucesso."));
    
} catch (Exception $e) {
    // Se houve erro na conexão
    http_response_code(500);
    echo json_encode(array("success" => false, "message" => $e->getMessage()));
}
```

## 5. Integração com React

### Configuração do Ambiente React

Primeiro, configure o arquivo `.env` na raiz do projeto React:

```
VITE_API_URL=http://localhost/faturamento/backend/api
VITE_DB_HOST=localhost
VITE_DB_USER=faturamento_user
VITE_DB_PASSWORD=SuaSenhaSegura
VITE_DB_NAME=faturamento
VITE_DB_PORT=3306
```

### Serviço HTTP para Comunicação com a API

Crie um arquivo para gerenciar requisições HTTP:

```typescript
// src/services/httpService.ts
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

export const httpService = {
  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_URL}/${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erro ao buscar ${endpoint}:`, error);
      toast.error(`Erro ao buscar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      throw error;
    }
  },
  
  async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erro ao enviar para ${endpoint}:`, error);
      toast.error(`Erro ao enviar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      throw error;
    }
  },
  
  async put<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${API_URL}/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erro ao atualizar ${endpoint}:`, error);
      toast.error(`Erro ao atualizar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      throw error;
    }
  },
  
  async delete<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_URL}/${endpoint}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erro ao excluir ${endpoint}:`, error);
      toast.error(`Erro ao excluir dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      throw error;
    }
  },
};
```

## 6. Implementação de Serviços

### Serviço de Clientes

```typescript
// src/services/clientService.ts
import { httpService } from './httpService';
import { Client } from '@/models/client';

export type ClientResponse = {
  records: Client[];
  message?: string;
};

export type ClientDetailResponse = {
  id: string;
  name: string;
  email: string;
  phone: string;
  document?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  created_at: string;
};

export const clientService = {
  // Obter todos os clientes
  getClients: async (): Promise<Client[]> => {
    try {
      const response = await httpService.get<ClientResponse>('clients/read.php');
      return response.records || [];
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      return [];
    }
  },

  // Obter cliente por ID
  getClientById: async (id: string): Promise<Client | null> => {
    try {
      const response = await httpService.get<ClientDetailResponse>(`clients/read_one.php?id=${id}`);
      
      if (!response.id) return null;
      
      return {
        id: response.id,
        name: response.name,
        email: response.email,
        phone: response.phone,
        document: response.document || '',
        address: response.address || '',
        city: response.city || '',
        state: response.state || '',
        zipCode: response.zipCode || '',
      };
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      return null;
    }
  },

  // Criar novo cliente
  createClient: async (client: Omit<Client, 'id'>): Promise<Client | null> => {
    try {
      const response = await httpService.post<ClientDetailResponse>('clients/create.php', client);
      
      if (!response.id) return null;
      
      return {
        id: response.id,
        name: response.name,
        email: response.email,
        phone: response.phone,
        document: response.document || '',
        address: response.address || '',
        city: response.city || '',
        state: response.state || '',
        zipCode: response.zipCode || '',
      };
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      return null;
    }
  },

  // Atualizar cliente
  updateClient: async (id: string, client: Partial<Client>): Promise<Client | null> => {
    try {
      const data = { id, ...client };
      const response = await httpService.put<ClientDetailResponse>('clients/update.php', data);
      
      if (!response.id) return null;
      
      return {
        id: response.id,
        name: response.name,
        email: response.email,
        phone: response.phone,
        document: response.document || '',
        address: response.address || '',
        city: response.city || '',
        state: response.state || '',
        zipCode: response.zipCode || '',
      };
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      return null;
    }
  },

  // Excluir cliente
  deleteClient: async (id: string): Promise<boolean> => {
    try {
      await httpService.delete(`clients/delete.php?id=${id}`);
      return true;
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      return false;
    }
  }
};
```

### Serviço de Faturas

```typescript
// src/services/invoiceService.ts
import { httpService } from './httpService';
import { Invoice, InvoiceFormData } from '@/models/invoice';
import { toast } from 'sonner';

export type InvoiceResponse = {
  records: Invoice[];
  message?: string;
};

export const invoiceService = {
  // Obter todas as faturas
  getInvoices: async (): Promise<Invoice[]> => {
    try {
      const response = await httpService.get<InvoiceResponse>('invoices/read.php');
      
      // Converter strings de data para o formato esperado pelo sistema
      const invoices = response.records || [];
      return invoices.map(invoice => ({
        ...invoice,
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        payment_date: invoice.payment_date
      }));
    } catch (error) {
      console.error('Erro ao buscar faturas:', error);
      toast.error('Erro ao buscar faturas');
      return [];
    }
  },

  // Obter fatura por ID
  getInvoiceById: async (id: string): Promise<Invoice | null> => {
    try {
      const response = await httpService.get<Invoice>(`invoices/read_one.php?id=${id}`);
      
      if (!response.id) return null;
      
      return {
        ...response,
        issue_date: response.issue_date,
        due_date: response.due_date,
        payment_date: response.payment_date
      };
    } catch (error) {
      console.error('Erro ao buscar fatura:', error);
      toast.error('Erro ao buscar detalhes da fatura');
      return null;
    }
  },

  // Criar nova fatura
  createInvoice: async (data: InvoiceFormData): Promise<Invoice | null> => {
    try {
      const response = await httpService.post<Invoice>('invoices/create.php', data);
      
      if (!response.id) return null;
      
      return {
        ...response,
        issue_date: response.issue_date,
        due_date: response.due_date,
        payment_date: response.payment_date
      };
    } catch (error) {
      console.error('Erro ao criar fatura:', error);
      toast.error('Erro ao criar fatura');
      return null;
    }
  },

  // Atualizar fatura
  updateInvoice: async (id: string, data: Partial<InvoiceFormData>): Promise<Invoice | null> => {
    try {
      const payload = { id, ...data };
      const response = await httpService.put<Invoice>('invoices/update.php', payload);
      
      if (!response.id) return null;
      
      return {
        ...response,
        issue_date: response.issue_date,
        due_date: response.due_date,
        payment_date: response.payment_date
      };
    } catch (error) {
      console.error('Erro ao atualizar fatura:', error);
      toast.error('Erro ao atualizar fatura');
      return null;
    }
  },

  // Excluir fatura
  deleteInvoice: async (id: string): Promise<boolean> => {
    try {
      await httpService.delete(`invoices/delete.php?id=${id}`);
      return true;
    } catch (error) {
      console.error('Erro ao excluir fatura:', error);
      toast.error('Erro ao excluir fatura');
      return false;
    }
  },
};
```

## 7. Conversão de Tipos de Dados

### Utilitários para Conversão de Datas

```typescript
// src/utils/dateUtils.ts

/**
 * Converte uma string de data para um objeto Date
 * 
 * @param dateStr String de data (formato ISO ou DD/MM/YYYY)
 * @returns Objeto Date ou null se a data for inválida
 */
export const parseDate = (dateStr?: string): Date | null => {
  if (!dateStr) return null;
  
  try {
    // Verifica se está no formato DD/MM/YYYY
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/').map(Number);
      return new Date(year, month - 1, day);
    }
    
    // Tenta converter diretamente (formato ISO)
    return new Date(dateStr);
  } catch (e) {
    console.error("Data inválida:", dateStr);
    return null;
  }
};

/**
 * Formata uma data para exibição no formato DD/MM/YYYY
 * 
 * @param date Data a ser formatada (string ou Date)
 * @returns String formatada ou string vazia se a data for inválida
 */
export const formatDateDisplay = (date?: string | Date): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('pt-BR');
  } catch (e) {
    console.error("Erro ao formatar data:", date);
    return '';
  }
};

/**
 * Converte uma data para string no formato ISO (YYYY-MM-DD)
 * 
 * @param date Data a ser convertida
 * @returns String no formato ISO ou string vazia se a data for inválida
 */
export const formatDateISO = (date?: Date | string): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
  } catch (e) {
    console.error("Erro ao formatar data ISO:", date);
    return '';
  }
};

/**
 * Verifica se uma data é válida
 * 
 * @param date Data a ser verificada
 * @returns true se for válida, false caso contrário
 */
export const isValidDate = (date: any): boolean => {
  if (!date) return false;
  
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return date instanceof Date && !isNaN(date.getTime());
};
```

### Utilitários para Conversão de Valores Monetários

```typescript
// src/utils/currencyUtils.ts

/**
 * Formata um valor para exibição como moeda brasileira
 * 
 * @param value Valor a ser formatado
 * @returns String formatada (ex: R$ 1.234,56)
 */
export const formatCurrency = (value?: number): string => {
  if (value === undefined || value === null) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Converte uma string de moeda para número
 * 
 * @param value String de moeda (ex: "R$ 1.234,56")
 * @returns Valor numérico
 */
export const parseCurrency = (value: string): number => {
  if (!value) return 0;
  
  // Remove símbolos de moeda e espaços
  const numericString = value
    .replace(/[R$\s.]/g, '')
    .replace(',', '.');
  
  return parseFloat(numericString) || 0;
};
```

## 8. Segurança e Boas Práticas

### Configuração do .htaccess para Segurança da API

```apache
# Impedir listagem de diretórios
Options -Indexes

# Desativar assinatura do servidor
ServerSignature Off

# Proteger arquivo .env
<Files .env>
  Order Allow,Deny
  Deny from all
</Files>

# Proteger arquivos de configuração
<FilesMatch "^\.">
  Order Allow,Deny
  Deny from all
</FilesMatch>

# Definir cabeçalhos de segurança
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-XSS-Protection "1; mode=block"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set Content-Security-Policy "default-src 'self'"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Redirecionar todas as requisições para o arquivo index.php (API REST)
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Permitir requisições para arquivos e diretórios reais
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d

  # Redirecionar para o ponto de entrada da API
  RewriteRule ^(.*)$ index.php [QSA,L]
</IfModule>
```

### Controlador de Erros para PHP

```php
<?php
// config/ErrorHandler.php
class ErrorHandler {
    public static function handleException(Throwable $exception) {
        // Registrar o erro
        error_log("Exception: " . $exception->getMessage() . " in file " . $exception->getFile() . " on line " . $exception->getLine());
        
        // Definir código de resposta
        http_response_code(500);
        
        // Retornar resposta JSON
        echo json_encode([
            "success" => false,
            "message" => "Ocorreu um erro no servidor. Tente novamente mais tarde."
        ]);
        
        exit;
    }
    
    public static function handleError($errno, $errstr, $errfile, $errline) {
        // Registrar o erro
        error_log("Error [$errno]: $errstr in file $errfile on line $errline");
        
        // Não mostrar erros triviais
        if (!(error_reporting() & $errno)) {
            return false;
        }
        
        // Definir código de resposta
        http_response_code(500);
        
        // Retornar resposta JSON
        echo json_encode([
            "success" => false,
            "message" => "Ocorreu um erro no servidor. Tente novamente mais tarde."
        ]);
        
        exit;
    }
    
    public static function register() {
        set_exception_handler([self::class, 'handleException']);
        set_error_handler([self::class, 'handleError']);
    }
}

// Registrar tratadores de erro
ErrorHandler::register();
```

### Autenticação JWT para a API

Para adicionar autenticação JWT à API, você pode usar a biblioteca `firebase/php-jwt`:

```php
<?php
// Instalar via Composer
// composer require firebase/php-jwt

// Exemplo de uso em auth/login.php
require_once '../../vendor/autoload.php';
include_once '../../config/Database.php';
include_once '../../models/User.php';

use Firebase\JWT\JWT;

// Configurar cabeçalhos
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Obter dados do POST
$data = json_decode(file_get_contents("php://input"));

// Verificar se email e senha foram fornecidos
if (!isset($data->email) || !isset($data->password)) {
    http_response_code(400);
    echo json_encode(["message" => "Email e senha são obrigatórios"]);
    exit();
}

// Conectar ao banco de dados
$database = new Database();
$db = $database->getConnection();

// Criar objeto de usuário
$user = new User($db);
$user->email = $data->email;
$email = $data->email;
$password = $data->password;

// Verificar se o usuário existe
$stmt = $user->findByEmail();

if ($stmt->rowCount() > 0) {
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Verificar a senha
    if (password_verify($password, $row['password'])) {
        // Token JWT
        $secret_key = "seu_segredo_jwt_aqui"; // Deve vir de variável de ambiente
        $issuer_claim = "localhost"; // Emissor
        $audience_claim = "localhost"; // Audiência
        $issuedat_claim = time(); // Emitido em
        $notbefore_claim = $issuedat_claim; // Não antes de
        $expire_claim = $issuedat_claim + 3600; // Expiração (1 hora)
        
        $token = [
            "iss" => $issuer_claim,
            "aud" => $audience_claim,
            "iat" => $issuedat_claim,
            "nbf" => $notbefore_claim,
            "exp" => $expire_claim,
            "data" => [
                "id" => $row['id'],
                "name" => $row['name'],
                "email" => $row['email'],
                "role" => $row['role']
            ]
        ];
        
        // Gerar JWT
        $jwt = JWT::encode($token, $secret_key, 'HS256');
        
        http_response_code(200);
        echo json_encode([
            "message" => "Login realizado com sucesso",
            "jwt" => $jwt,
            "user" => [
                "id" => $row['id'],
                "name" => $row['name'],
                "email" => $row['email'],
                "role" => $row['role']
            ]
        ]);
        
    } else {
        http_response_code(401);
        echo json_encode(["message" => "Senha incorreta"]);
    }
    
} else {
    http_response_code(404);
    echo json_encode(["message" => "Usuário não encontrado"]);
}
```

## 9. Solução de Problemas Comuns

### Problemas com Conexão ao Banco de Dados

1. **Erro de conexão MySQL**: Verifique se o serviço MySQL está ativo e acessível:
   ```bash
   # Verificar status do MySQL
   sudo systemctl status mysql
   
   # Reiniciar o serviço se necessário
   sudo systemctl restart mysql
   ```

2. **Erro de autenticação**: Verifique as credenciais no arquivo `.env`:
   ```
   # Credenciais corretas no formato:
   VITE_DB_HOST=localhost
   VITE_DB_USER=faturamento_user
   VITE_DB_PASSWORD=SuaSenhaSegura
   VITE_DB_NAME=faturamento
   ```

3. **Problemas de permissão**: Certifique-se de que o usuário do banco de dados tem as permissões necessárias:
   ```sql
   GRANT ALL PRIVILEGES ON faturamento.* TO 'faturamento_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Problemas com CORS

Se você encontrar erros de CORS (Cross-Origin Resource Sharing), adicione os seguintes cabeçalhos a todas as respostas da API:

```php
// Adicione no início de cada arquivo PHP da API:
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Para requisições OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
```

### Problemas com Conversão de Datas

Se você tiver problemas com a conversão de datas entre o MySQL e o formato esperado pelo React:

```typescript
// Função para garantir que datas sejam sempre strings no formato ISO
const ensureDateFormat = (date: any): string => {
  if (!date) return '';
  
  // Se for uma data válida
  if (date instanceof Date && !isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }
  
  // Se for uma string
  if (typeof date === 'string') {
    try {
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
    } catch (e) {
      console.error("Erro ao converter data:", date);
    }
  }
  
  return String(date);
};

// Exemplo de uso
const invoice = {
  ...response,
  issue_date: ensureDateFormat(response.issue_date),
  due_date: ensureDateFormat(response.due_date),
  payment_date: ensureDateFormat(response.payment_date)
};
```

### Tratamento de Erros no React

Use o React Query para gerenciar requisições à API com tratamento adequado de erros:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '@/services/invoiceService';
import { toast } from 'sonner';

// Hook para buscar faturas
export const useInvoices = () => {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: invoiceService.getInvoices,
    onError: (error) => {
      toast.error(`Erro ao buscar faturas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  });
};

// Hook para criar fatura
export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: invoiceService.createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Fatura criada com sucesso');
    },
    onError: (error) => {
      toast.error(`Erro ao criar fatura: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  });
};

// Hook para atualizar fatura
export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      invoiceService.updateInvoice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Fatura atualizada com sucesso');
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar fatura: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  });
};
```

---

Estas instruções fornecem um guia completo para implementar o Sistema de Faturamento com MySQL e React, abordando desde a configuração do banco de dados até a implementação de serviços no frontend. Ajuste os exemplos de código de acordo com as necessidades específicas do seu projeto.

Para mais detalhes sobre configurações avançadas ou integrações específicas, consulte a documentação oficial do MySQL, PHP e React.

