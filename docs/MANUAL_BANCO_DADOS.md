
# Manual Completo do Banco de Dados - Sistema de Faturamento

## Índice

1. [Introdução](#introdução)
2. [Diagrama de Entidade-Relacionamento](#diagrama-de-entidade-relacionamento)
3. [Detalhamento das Tabelas](#detalhamento-das-tabelas)
4. [Configuração do MySQL](#configuração-do-mysql)
5. [Acesso e Gerenciamento](#acesso-e-gerenciamento)
6. [Backup e Restauração](#backup-e-restauração)
7. [Manutenção e Otimização](#manutenção-e-otimização)
8. [Integração com o Sistema](#integração-com-o-sistema)

## Introdução

O banco de dados do Sistema de Faturamento foi projetado para armazenar e gerenciar todas as informações relacionadas a clientes, contratos, veículos, faturas, integrações com WhatsApp e processos de checklist. O sistema utiliza MySQL 8.0 ou superior, aproveitando seus recursos de integridade referencial, triggers e procedimentos armazenados.

## Diagrama de Entidade-Relacionamento

```
+------------+       +------------+       +------------+
|   Users    |       |  Clients   |       |  Vehicles  |
+------------+       +------------+       +------------+
| id         |<---+  | id         |<---+  | id         |
| name       |    |  | name       |    |  | make       |
| email      |    |  | email      |    |  | model      |
| password   |    |  | phone      |    |  | year       |
| role       |    |  | document_id|    |  | license_pl.|
| ...        |    |  | ...        |    |  | ...        |
+------------+    |  +------------+    |  +------------+
                  |                    |
                  |                    |
+------------+    |  +------------+    |  +------------+
| user_profi.|<---+  | contracts  |----+--| checklists |
+------------+    |  +------------+    |  +------------+
| id         |    +--| client_id  |    +--| id         |
| user_id    |       | vehicle_id |       | name       |
| address    |       | user_id    |       | type       |
| city       |       | start_date |       | ...        |
| ...        |       | end_date   |       +------------+
+------------+       | ...        |
                     +------------+
                          |
                          |
                     +------------+       +------------+
                     |  invoices  |-------| inv_items  |
                     +------------+       +------------+
                     | id         |       | id         |
                     | inv_number |       | invoice_id |
                     | contract_id|       | description|
                     | client_id  |       | quantity   |
                     | amount     |       | price      |
                     | due_date   |       | ...        |
                     +------------+       +------------+
                     
+------------+       +------------+       +------------+
| whatsapp_  |       | completed_ |       | invoice_   |
| configs    |       | checklists |       | attachments|
+------------+       +------------+       +------------+
| id         |       | id         |       | id         |
| user_id    |       | contract_id|       | invoice_id |
| instance   |       | checklist  |       | file_name  |
| api_key    |       | completed  |       | file_path  |
| connected  |       | ...        |       | ...        |
+------------+       +------------+       +------------+
```

## Detalhamento das Tabelas

### users
Armazena informações de usuários do sistema.

| Campo       | Tipo         | Descrição                           | Chave      |
|-------------|--------------|-------------------------------------|------------|
| id          | INT          | Identificador único                 | PK         |
| name        | VARCHAR(100) | Nome completo                       |            |
| email       | VARCHAR(100) | Email (único)                       | UNIQUE     |
| password    | VARCHAR(255) | Senha criptografada                 |            |
| role        | ENUM         | Função: ADMIN, MANAGER, USER        |            |
| phone       | VARCHAR(20)  | Telefone de contato                 |            |
| avatar_url  | VARCHAR(255) | URL da imagem de perfil             |            |
| created_at  | TIMESTAMP    | Data de criação                     |            |
| updated_at  | TIMESTAMP    | Data de atualização                 |            |

### user_profiles
Informações adicionais de perfil de usuário.

| Campo        | Tipo         | Descrição                           | Chave      |
|--------------|--------------|-------------------------------------|------------|
| id           | INT          | Identificador único                 | PK         |
| user_id      | INT          | Referência ao usuário               | FK         |
| address      | VARCHAR(255) | Endereço                            |            |
| city         | VARCHAR(100) | Cidade                              |            |
| state        | VARCHAR(50)  | Estado                              |            |
| zip_code     | VARCHAR(20)  | CEP                                 |            |
| document_id  | VARCHAR(50)  | Documento de identificação          |            |
| document_type| VARCHAR(50)  | Tipo de documento                   |            |
| birth_date   | DATE         | Data de nascimento                  |            |
| notes        | TEXT         | Observações                         |            |
| created_at   | TIMESTAMP    | Data de criação                     |            |
| updated_at   | TIMESTAMP    | Data de atualização                 |            |

### clients
Informações de clientes.

| Campo       | Tipo         | Descrição                           | Chave      |
|-------------|--------------|-------------------------------------|------------|
| id          | INT          | Identificador único                 | PK         |
| name        | VARCHAR(100) | Nome do cliente                     |            |
| email       | VARCHAR(100) | Email                               |            |
| phone       | VARCHAR(20)  | Telefone                            |            |
| document_id | VARCHAR(50)  | Documento (CPF/CNPJ)                |            |
| address     | VARCHAR(255) | Endereço                            |            |
| city        | VARCHAR(100) | Cidade                              |            |
| state       | VARCHAR(50)  | Estado                              |            |
| zip_code    | VARCHAR(20)  | CEP                                 |            |
| created_by  | INT          | Usuário que criou o registro        | FK         |
| status      | ENUM         | Status: ACTIVE, INACTIVE, BLOCKED   |            |
| created_at  | TIMESTAMP    | Data de criação                     |            |
| updated_at  | TIMESTAMP    | Data de atualização                 |            |

### vehicles
Veículos cadastrados no sistema.

| Campo          | Tipo         | Descrição                           | Chave      |
|----------------|--------------|-------------------------------------|------------|
| id             | INT          | Identificador único                 | PK         |
| make           | VARCHAR(50)  | Fabricante                          |            |
| model          | VARCHAR(50)  | Modelo                              |            |
| year           | INT          | Ano de fabricação                   |            |
| license_plate  | VARCHAR(20)  | Placa (única)                       | UNIQUE     |
| color          | VARCHAR(30)  | Cor                                 |            |
| chassis_number | VARCHAR(50)  | Número do chassi                    | UNIQUE     |
| current_mileage| INT          | Quilometragem atual                 |            |
| fuel_type      | ENUM         | Tipo de combustível                 |            |
| status         | ENUM         | Status do veículo                   |            |
| daily_rate     | DECIMAL(10,2)| Valor da diária                     |            |
| created_at     | TIMESTAMP    | Data de criação                     |            |
| updated_at     | TIMESTAMP    | Data de atualização                 |            |

### contracts
Contratos de locação.

| Campo           | Tipo          | Descrição                          | Chave      |
|-----------------|---------------|-----------------------------------|------------|
| id              | INT           | Identificador único                | PK         |
| client_id       | INT           | Cliente associado                  | FK         |
| vehicle_id      | INT           | Veículo associado                  | FK         |
| user_id         | INT           | Usuário responsável                | FK         |
| start_date      | DATE          | Data de início                     |            |
| end_date        | DATE          | Data de término                    |            |
| actual_return_date | DATE      | Data real de devolução             |            |
| start_mileage   | INT           | Quilometragem inicial              |            |
| end_mileage     | INT           | Quilometragem final                |            |
| daily_rate      | DECIMAL(10,2) | Valor da diária                    |            |
| total_amount    | DECIMAL(10,2) | Valor total                        |            |
| deposit_amount  | DECIMAL(10,2) | Valor de caução                    |            |
| status          | ENUM          | Status do contrato                 |            |
| payment_status  | ENUM          | Status de pagamento                |            |
| notes           | TEXT          | Observações                        |            |
| created_at      | TIMESTAMP     | Data de criação                    |            |
| updated_at      | TIMESTAMP     | Data de atualização                |            |

### invoices
Faturas emitidas para clientes.

| Campo           | Tipo          | Descrição                          | Chave      |
|-----------------|---------------|-----------------------------------|------------|
| id              | INT           | Identificador único                | PK         |
| contract_id     | INT           | Contrato associado                 | FK         |
| invoice_number  | VARCHAR(50)   | Número da fatura                   | UNIQUE     |
| issue_date      | DATE          | Data de emissão                    |            |
| due_date        | DATE          | Data de vencimento                 |            |
| amount          | DECIMAL(10,2) | Valor base                         |            |
| tax_amount      | DECIMAL(10,2) | Valor de impostos                  |            |
| total_amount    | DECIMAL(10,2) | Valor total                        |            |
| status          | ENUM          | Status de pagamento                |            |
| payment_date    | DATE          | Data de pagamento                  |            |
| payment_method  | VARCHAR(50)   | Método de pagamento                |            |
| payment_reference | VARCHAR(100) | Referência de pagamento           |            |
| sent_reminder   | BOOLEAN       | Lembrete enviado?                  |            |
| sent_whatsapp   | BOOLEAN       | Enviado por WhatsApp?              |            |
| user_id         | INT           | Usuário que criou                  | FK         |
| notes           | TEXT          | Observações                        |            |
| created_at      | TIMESTAMP     | Data de criação                    |            |
| updated_at      | TIMESTAMP     | Data de atualização                |            |

### invoice_items
Itens de cada fatura.

| Campo         | Tipo          | Descrição                          | Chave      |
|---------------|---------------|-----------------------------------|------------|
| id            | INT           | Identificador único                | PK         |
| invoice_id    | INT           | Fatura associada                   | FK         |
| description   | VARCHAR(255)  | Descrição do item                  |            |
| quantity      | DECIMAL(10,2) | Quantidade                         |            |
| unit_price    | DECIMAL(10,2) | Preço unitário                     |            |
| tax_rate      | DECIMAL(5,2)  | Taxa de imposto                    |            |
| amount        | DECIMAL(10,2) | Valor total do item                |            |
| created_at    | TIMESTAMP     | Data de criação                    |            |

### whatsapp_configs
Configurações de integração com WhatsApp.

| Campo          | Tipo          | Descrição                          | Chave      |
|----------------|---------------|-----------------------------------|------------|
| id             | INT           | Identificador único                | PK         |
| user_id        | INT           | Usuário associado                  | FK         |
| instance_name  | VARCHAR(100)  | Nome da instância                  |            |
| api_key        | VARCHAR(255)  | Chave de API                       |            |
| base_url       | VARCHAR(255)  | URL base da API                    |            |
| is_connected   | BOOLEAN       | Estado de conexão                  |            |
| last_connected | TIMESTAMP     | Última conexão                     |            |
| created_at     | TIMESTAMP     | Data de criação                    |            |
| updated_at     | TIMESTAMP     | Data de atualização                |            |

### checklists
Modelos de checklists.

| Campo       | Tipo         | Descrição                           | Chave      |
|-------------|--------------|-------------------------------------|------------|
| id          | INT          | Identificador único                 | PK         |
| name        | VARCHAR(100) | Nome do checklist                   |            |
| description | TEXT         | Descrição                           |            |
| type        | ENUM         | Tipo de checklist                   |            |
| created_by  | INT          | Usuário que criou                   | FK         |
| is_active   | BOOLEAN      | Ativo?                              |            |
| created_at  | TIMESTAMP    | Data de criação                     |            |
| updated_at  | TIMESTAMP    | Data de atualização                 |            |

## Configuração do MySQL

### Requisitos Mínimos

- MySQL 8.0 ou MariaDB 10.5+
- InnoDB como engine padrão
- Conjunto de caracteres UTF-8 (utf8mb4)
- Collation utf8mb4_unicode_ci

### Instalação no Ubuntu/Debian

```bash
# Instalação
sudo apt update
sudo apt install mysql-server

# Configuração segura
sudo mysql_secure_installation

# Verificar status
sudo systemctl status mysql
```

### Criação do Banco e Usuário

```sql
-- Conecte como root
mysql -u root -p

-- Criar banco de dados
CREATE DATABASE faturamento CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Criar usuário com privilégios
CREATE USER 'faturamento_user'@'localhost' IDENTIFIED BY 'senha_segura';
GRANT ALL PRIVILEGES ON faturamento.* TO 'faturamento_user'@'localhost';
FLUSH PRIVILEGES;
```

### Importação do Esquema

```bash
# Importar estrutura do banco
mysql -u faturamento_user -p faturamento < /caminho/para/schema.sql

# Verificar tabelas criadas
mysql -u faturamento_user -p -e "SHOW TABLES FROM faturamento;"
```

### Configuração do My.cnf

Edite o arquivo `/etc/mysql/my.cnf` e adicione:

```ini
[mysqld]
# Performance
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
max_connections = 150

# Caracteres
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# Logs
general_log = 0
slow_query_log = 1
slow_query_log_file = /var/log/mysql/mysql-slow.log
long_query_time = 2
```

## Acesso e Gerenciamento

### Conexão via Terminal

```bash
# Conectar ao MySQL
mysql -u faturamento_user -p faturamento

# Listar tabelas
SHOW TABLES;

# Examinar estrutura
DESCRIBE nome_da_tabela;
```

### Conexão via PHP (exemplo)

```php
<?php
$host = 'localhost';
$db   = 'faturamento';
$user = 'faturamento_user';
$pass = 'senha_segura';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
     echo "Conexão bem-sucedida!";
} catch (\PDOException $e) {
     echo "Erro de conexão: " . $e->getMessage();
}
```

## Backup e Restauração

### Backup Completo

```bash
# Backup da estrutura e dados
mysqldump -u faturamento_user -p --opt faturamento > backup_completo_$(date +%Y%m%d).sql

# Backup apenas da estrutura
mysqldump -u faturamento_user -p --no-data faturamento > backup_estrutura_$(date +%Y%m%d).sql

# Backup compactado
mysqldump -u faturamento_user -p --opt faturamento | gzip > backup_completo_$(date +%Y%m%d).sql.gz
```

### Restauração

```bash
# Restaurar backup não compactado
mysql -u faturamento_user -p faturamento < backup_completo.sql

# Restaurar backup compactado
zcat backup_completo.sql.gz | mysql -u faturamento_user -p faturamento
```

### Script de Backup Automatizado

```bash
#!/bin/bash
# Script para backup automático do banco de dados
# Salve como /usr/local/bin/backup_faturamento.sh

DB_USER="faturamento_user"
DB_PASS="senha_segura"
DB_NAME="faturamento"
BACKUP_DIR="/var/backups/mysql"
DATE=$(date +%Y-%m-%d)
RETENTION_DAYS=30

# Criar diretório se não existir
mkdir -p $BACKUP_DIR

# Realizar backup
mysqldump -u $DB_USER -p$DB_PASS --opt $DB_NAME | gzip > $BACKUP_DIR/$DB_NAME-$DATE.sql.gz

# Remover backups antigos
find $BACKUP_DIR -name "$DB_NAME-*.sql.gz" -mtime +$RETENTION_DAYS -delete
```

Adicione ao crontab:
```
0 2 * * * /usr/local/bin/backup_faturamento.sh
```

## Manutenção e Otimização

### Otimização de Tabelas

```sql
-- Otimizar todas as tabelas
OPTIMIZE TABLE users, clients, contracts, invoices, vehicles;

-- Verificar status
SHOW TABLE STATUS;
```

### Análise de Consultas Lentas

```sql
-- Habilitar log de consultas lentas
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1; -- em segundos
SET GLOBAL slow_query_log_file = '/var/log/mysql/mysql-slow.log';

-- Verificar variáveis
SHOW VARIABLES LIKE '%slow%';
```

### Verificação de Integridade

```sql
-- Verificar todas as tabelas
CHECK TABLE users, clients, contracts, invoices;

-- Reparar tabela (se necessário)
REPAIR TABLE nome_da_tabela;
```

## Integração com o Sistema

### Conexão no PHP via PDO

```php
// Arquivo: src/database/connection.php
<?php
function getConnection() {
    $host = $_ENV['DB_HOST'] ?? 'localhost';
    $db   = $_ENV['DB_NAME'] ?? 'faturamento';
    $user = $_ENV['DB_USER'] ?? 'faturamento_user';
    $pass = $_ENV['DB_PASS'] ?? 'senha_segura';
    $charset = 'utf8mb4';

    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];

    try {
        return new PDO($dsn, $user, $pass, $options);
    } catch (\PDOException $e) {
        throw new \PDOException($e->getMessage(), (int)$e->getCode());
    }
}
```

### Modelo de Acesso aos Dados

```php
// Arquivo: src/models/client.php
<?php
class ClientModel {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function getAll() {
        $stmt = $this->db->query("SELECT * FROM clients WHERE status = 'ACTIVE'");
        return $stmt->fetchAll();
    }
    
    public function getById($id) {
        $stmt = $this->db->prepare("SELECT * FROM clients WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }
    
    public function create($data) {
        $stmt = $this->db->prepare("
            INSERT INTO clients (name, email, phone, document_id, address, city, state, zip_code, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        return $stmt->execute([
            $data['name'], 
            $data['email'],
            $data['phone'] ?? null,
            $data['document_id'] ?? null,
            $data['address'] ?? null,
            $data['city'] ?? null,
            $data['state'] ?? null,
            $data['zip_code'] ?? null,
            $data['created_by']
        ]);
    }
    
    // Outros métodos (update, delete, etc.)
}
```

### Configuração no .env da Aplicação

```
# Database Configuration
VITE_DB_HOST=localhost
VITE_DB_USER=faturamento_user
VITE_DB_PASSWORD=senha_segura
VITE_DB_NAME=faturamento
VITE_DB_PORT=3306
```
