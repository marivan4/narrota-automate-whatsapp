
# Manual de Banco de Dados - Sistema de Faturamento

Este manual descreve a estrutura do banco de dados do Sistema de Faturamento, incluindo todas as tabelas, seus campos e relacionamentos, além de fornecer instruções detalhadas para configuração e manutenção.

## Índice

1. [Visão Geral](#visão-geral)
2. [Diagrama de Entidade-Relacionamento](#diagrama-de-entidade-relacionamento)
3. [Detalhamento das Tabelas](#detalhamento-das-tabelas)
4. [Configuração do MySQL](#configuração-do-mysql)
5. [Backup e Restauração](#backup-e-restauração)
6. [Manutenção e Otimização](#manutenção-e-otimização)
7. [Consultas Comuns](#consultas-comuns)
8. [Troubleshooting](#troubleshooting)

## Visão Geral

O sistema de faturamento utiliza um banco de dados MySQL 8.0+ para armazenar todas as informações necessárias ao funcionamento da aplicação. As principais entidades gerenciadas pelo sistema são:

- **Usuários**: Administradores e operadores do sistema
- **Clientes**: Pessoas ou empresas para as quais são emitidas faturas
- **Contratos**: Acordos de prestação de serviços
- **Veículos**: Veículos associados aos contratos
- **Faturas**: Cobranças emitidas para os clientes
- **Checklists**: Listas de verificação para processos padronizados
- **Configurações WhatsApp**: Configurações para integração com WhatsApp

O banco de dados foi projetado com foco em:
- Integridade referencial (uso de chaves estrangeiras)
- Normalização para evitar redundância de dados
- Performance (índices em campos de busca frequente)
- Segurança (uso de prepared statements na camada de acesso)

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
                     | ...        |       +------------+
                     +------------+
```

## Detalhamento das Tabelas

### Tabela: users

Esta tabela armazena os usuários do sistema, incluindo administradores e operadores.

| Campo       | Tipo           | Descrição                                      | Chave     |
|-------------|----------------|------------------------------------------------|-----------|
| id          | INT            | Identificador único do usuário                 | PK        |
| name        | VARCHAR(100)   | Nome completo do usuário                       |           |
| email       | VARCHAR(100)   | Email do usuário (usado para login)            | UNIQUE    |
| password    | VARCHAR(255)   | Hash da senha do usuário (bcrypt)              |           |
| role        | ENUM           | Função: 'ADMIN', 'USER', 'MANAGER'             |           |
| phone       | VARCHAR(20)    | Número de telefone                             |           |
| avatar_url  | VARCHAR(255)   | URL para a foto do perfil                      |           |
| created_at  | TIMESTAMP      | Data de criação do registro                    |           |
| updated_at  | TIMESTAMP      | Data da última atualização                     |           |

**Índices**:
- PRIMARY KEY (id)
- UNIQUE INDEX (email)

### Tabela: user_profiles

Armazena informações adicionais sobre usuários.

| Campo         | Tipo           | Descrição                                   | Chave     |
|---------------|----------------|--------------------------------------------|-----------|
| id            | INT            | Identificador único do perfil               | PK        |
| user_id       | INT            | Referência ao usuário                       | FK        |
| address       | VARCHAR(255)   | Endereço completo                           |           |
| city          | VARCHAR(100)   | Cidade                                      |           |
| state         | VARCHAR(50)    | Estado                                      |           |
| zip_code      | VARCHAR(20)    | CEP                                         |           |
| document_id   | VARCHAR(50)    | Número do documento (CPF/CNPJ)              |           |
| document_type | VARCHAR(50)    | Tipo do documento                           |           |
| birth_date    | DATE           | Data de nascimento                          |           |
| notes         | TEXT           | Observações adicionais                      |           |
| created_at    | TIMESTAMP      | Data de criação do registro                 |           |
| updated_at    | TIMESTAMP      | Data da última atualização                  |           |

**Índices**:
- PRIMARY KEY (id)
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

### Tabela: clients

Armazena informações sobre os clientes.

| Campo         | Tipo           | Descrição                                   | Chave     |
|---------------|----------------|--------------------------------------------|-----------|
| id            | INT            | Identificador único do cliente              | PK        |
| name          | VARCHAR(100)   | Nome completo do cliente                    |           |
| email         | VARCHAR(100)   | Email de contato                            |           |
| phone         | VARCHAR(20)    | Telefone de contato                         |           |
| document_id   | VARCHAR(50)    | Número do documento (CPF/CNPJ)              |           |
| document_type | VARCHAR(50)    | Tipo do documento                           |           |
| address       | VARCHAR(255)   | Endereço completo                           |           |
| city          | VARCHAR(100)   | Cidade                                      |           |
| state         | VARCHAR(50)    | Estado                                      |           |
| zip_code      | VARCHAR(20)    | CEP                                         |           |
| created_by    | INT            | Usuário que criou o registro                | FK        |
| status        | ENUM           | Status: 'ACTIVE', 'INACTIVE', 'BLOCKED'     |           |
| created_at    | TIMESTAMP      | Data de criação do registro                 |           |
| updated_at    | TIMESTAMP      | Data da última atualização                  |           |

**Índices**:
- PRIMARY KEY (id)
- INDEX (email)
- INDEX (document_id)
- FOREIGN KEY (created_by) REFERENCES users(id)

### Tabela: vehicles

Armazena informações sobre os veículos.

| Campo           | Tipo           | Descrição                                 | Chave     |
|-----------------|----------------|--------------------------------------------|-----------|
| id              | INT            | Identificador único do veículo             | PK        |
| make            | VARCHAR(50)    | Marca do veículo                           |           |
| model           | VARCHAR(50)    | Modelo do veículo                          |           |
| year            | INT            | Ano de fabricação                          |           |
| license_plate   | VARCHAR(20)    | Placa do veículo                           | UNIQUE    |
| color           | VARCHAR(30)    | Cor do veículo                             |           |
| chassis_number  | VARCHAR(50)    | Número do chassi                           | UNIQUE    |
| current_mileage | INT            | Quilometragem atual                        |           |
| fuel_type       | ENUM           | Tipo de combustível                        |           |
| status          | ENUM           | Status do veículo                          |           |
| daily_rate      | DECIMAL(10,2)  | Valor diário para locação                  |           |
| created_at      | TIMESTAMP      | Data de criação do registro                |           |
| updated_at      | TIMESTAMP      | Data da última atualização                 |           |

**Índices**:
- PRIMARY KEY (id)
- UNIQUE INDEX (license_plate)
- UNIQUE INDEX (chassis_number)
- INDEX (make, model)

### Tabela: contracts

Armazena informações sobre contratos.

| Campo             | Tipo           | Descrição                                | Chave     |
|-------------------|----------------|------------------------------------------|-----------|
| id                | INT            | Identificador único do contrato          | PK        |
| client_id         | INT            | Referência ao cliente                    | FK        |
| vehicle_id        | INT            | Referência ao veículo                    | FK        |
| user_id           | INT            | Usuário responsável                      | FK        |
| start_date        | DATE           | Data de início                           |           |
| end_date          | DATE           | Data de término                          |           |
| actual_return_date| DATE           | Data real de devolução                   |           |
| start_mileage     | INT            | Quilometragem inicial                    |           |
| end_mileage       | INT            | Quilometragem final                      |           |
| daily_rate        | DECIMAL(10,2)  | Valor diário                             |           |
| total_amount      | DECIMAL(10,2)  | Valor total do contrato                  |           |
| deposit_amount    | DECIMAL(10,2)  | Valor do depósito de segurança           |           |
| status            | ENUM           | Status: 'DRAFT', 'ACTIVE', 'COMPLETED'   |           |
| payment_status    | ENUM           | Status de pagamento                      |           |
| notes             | TEXT           | Observações                              |           |
| created_at        | TIMESTAMP      | Data de criação do registro              |           |
| updated_at        | TIMESTAMP      | Data da última atualização               |           |

**Índices**:
- PRIMARY KEY (id)
- FOREIGN KEY (client_id) REFERENCES clients(id)
- FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
- FOREIGN KEY (user_id) REFERENCES users(id)
- INDEX (start_date, end_date)
- INDEX (status)

### Tabela: invoices

Armazena as faturas emitidas para os clientes.

| Campo            | Tipo           | Descrição                                | Chave     |
|------------------|----------------|------------------------------------------|-----------|
| id               | INT            | Identificador único da fatura            | PK        |
| contract_id      | INT            | Referência ao contrato                   | FK        |
| invoice_number   | VARCHAR(50)    | Número da fatura                         | UNIQUE    |
| issue_date       | DATE           | Data de emissão                          |           |
| due_date         | DATE           | Data de vencimento                       |           |
| amount           | DECIMAL(10,2)  | Valor nominal                            |           |
| tax_amount       | DECIMAL(10,2)  | Valor de impostos                        |           |
| total_amount     | DECIMAL(10,2)  | Valor total                              |           |
| status           | ENUM           | Status: 'PENDING', 'PAID', 'OVERDUE'     |           |
| payment_date     | DATE           | Data do pagamento                        |           |
| payment_method   | VARCHAR(50)    | Método de pagamento                      |           |
| payment_reference| VARCHAR(100)   | Referência do pagamento                  |           |
| sent_reminder    | BOOLEAN        | Se o lembrete foi enviado                |           |
| user_id          | INT            | Usuário que criou a fatura               | FK        |
| notes            | TEXT           | Observações                              |           |
| created_at       | TIMESTAMP      | Data de criação do registro              |           |
| updated_at       | TIMESTAMP      | Data da última atualização               |           |

**Índices**:
- PRIMARY KEY (id)
- UNIQUE INDEX (invoice_number)
- FOREIGN KEY (contract_id) REFERENCES contracts(id)
- FOREIGN KEY (user_id) REFERENCES users(id)
- INDEX (due_date)
- INDEX (status)

### Tabela: invoice_items

Armazena os itens das faturas.

| Campo         | Tipo           | Descrição                                | Chave     |
|---------------|----------------|------------------------------------------|-----------|
| id            | INT            | Identificador único do item              | PK        |
| invoice_id    | INT            | Referência à fatura                      | FK        |
| description   | VARCHAR(255)   | Descrição do item                        |           |
| quantity      | DECIMAL(10,2)  | Quantidade                               |           |
| unit_price    | DECIMAL(10,2)  | Preço unitário                           |           |
| tax_rate      | DECIMAL(5,2)   | Taxa de imposto (%)                      |           |
| amount        | DECIMAL(10,2)  | Valor total do item                      |           |
| created_at    | TIMESTAMP      | Data de criação do registro              |           |
| updated_at    | TIMESTAMP      | Data da última atualização               |           |

**Índices**:
- PRIMARY KEY (id)
- FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE

### Tabela: whatsapp_configs

Armazena configurações de integração com WhatsApp.

| Campo           | Tipo           | Descrição                              | Chave     |
|-----------------|----------------|----------------------------------------|-----------|
| id              | INT            | Identificador único da configuração    | PK        |
| user_id         | INT            | Referência ao usuário                  | FK        |
| instance_name   | VARCHAR(100)   | Nome da instância                      |           |
| api_key         | VARCHAR(255)   | Chave de API                           |           |
| base_url        | VARCHAR(255)   | URL base da API                        |           |
| is_connected    | BOOLEAN        | Status da conexão                      |           |
| last_connected  | TIMESTAMP      | Última conexão bem-sucedida            |           |
| created_at      | TIMESTAMP      | Data de criação do registro            |           |
| updated_at      | TIMESTAMP      | Data da última atualização             |           |

**Índices**:
- PRIMARY KEY (id)
- UNIQUE KEY (user_id, instance_name)
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

## Configuração do MySQL

### Requisitos do Sistema

- MySQL 8.0 ou superior
- InnoDB como engine padrão
- Suporte a UTF-8 (charset utf8mb4)
- Mínimo de 4GB de RAM disponível para o servidor MySQL

### Criação do Banco de Dados

Para criar o banco de dados e o usuário específico para a aplicação:

```sql
CREATE DATABASE faturamento CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'faturamento_user'@'localhost' IDENTIFIED BY 'senha_segura';
GRANT ALL PRIVILEGES ON faturamento.* TO 'faturamento_user'@'localhost';
FLUSH PRIVILEGES;
```

### Configurações Recomendadas (my.cnf)

Para um desempenho otimizado do MySQL, adicione as seguintes configurações ao arquivo `my.cnf` (normalmente em `/etc/mysql/my.cnf` ou `/etc/my.cnf`):

```ini
[mysqld]
# Performance
innodb_buffer_pool_size = 1G  # Ajustar conforme RAM disponível
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT
max_connections = 150

# Caracteres e collation
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# Cache
query_cache_type = 1
query_cache_size = 64M

# Logs
slow_query_log = 1
slow_query_log_file = /var/log/mysql/mysql-slow.log
long_query_time = 2
```

### Configuração de Acesso Remoto (Opcional)

Se for necessário acessar o banco de dados remotamente, siga estas etapas:

1. Edite o arquivo de configuração do MySQL:
   ```bash
   sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
   ```

2. Substitua a linha `bind-address = 127.0.0.1` por:
   ```
   bind-address = 0.0.0.0
   ```

3. Crie um usuário com permissão de acesso remoto:
   ```sql
   CREATE USER 'faturamento_user'@'%' IDENTIFIED BY 'senha_segura';
   GRANT ALL PRIVILEGES ON faturamento.* TO 'faturamento_user'@'%';
   FLUSH PRIVILEGES;
   ```

4. Reinicie o MySQL:
   ```bash
   sudo systemctl restart mysql
   ```

5. Configure o firewall para permitir conexões na porta 3306:
   ```bash
   sudo ufw allow 3306/tcp
   ```

## Backup e Restauração

### Backup Completo do Banco

Para criar um backup completo do banco de dados:

```bash
mysqldump -u faturamento_user -p --opt faturamento > backup_faturamento_$(date +%Y%m%d).sql
```

### Backup Automático

Para configurar backups automáticos diários, crie um script `backup_db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y-%m-%d)
MYSQL_USER="faturamento_user"
MYSQL_PASSWORD="senha_segura"
DB_NAME="faturamento"

# Cria diretório de backup se não existir
mkdir -p $BACKUP_DIR

# Realiza o backup
mysqldump -u $MYSQL_USER -p$MYSQL_PASSWORD --opt $DB_NAME | gzip > $BACKUP_DIR/$DB_NAME-$DATE.sql.gz

# Remove backups com mais de 30 dias
find $BACKUP_DIR -name "*.sql.gz" -type f -mtime +30 -delete
```

Configure uma tarefa cron para executar o script diariamente:

```bash
chmod +x backup_db.sh
crontab -e
```

Adicione a seguinte linha para executar às 2:00 da manhã:

```
0 2 * * * /path/to/backup_db.sh
```

### Restauração de Backup

Para restaurar um backup:

```bash
# Para arquivo não compactado
mysql -u faturamento_user -p faturamento < backup_file.sql

# Para arquivo compactado com gzip
gunzip < backup_file.sql.gz | mysql -u faturamento_user -p faturamento
```

## Manutenção e Otimização

### Verificação de Integridade

Para verificar e reparar tabelas:

```sql
OPTIMIZE TABLE users, clients, vehicles, contracts, invoices;
```

### Análise de Índices

Para analisar os índices das tabelas principais:

```sql
ANALYZE TABLE users, clients, vehicles, contracts, invoices;
```

### Otimização de Consultas Lentas

Habilite o log de consultas lentas e analise-o periodicamente:

```bash
sudo tail -f /var/log/mysql/mysql-slow.log
```

Use o comando EXPLAIN para analisar consultas problemáticas:

```sql
EXPLAIN SELECT * FROM invoices WHERE client_id = 1 AND due_date > '2023-01-01';
```

## Consultas Comuns

### Consultas para Relatórios

**Faturamento por período:**

```sql
SELECT 
    SUM(total_amount) as total,
    MONTH(payment_date) as month,
    YEAR(payment_date) as year
FROM 
    invoices 
WHERE 
    status = 'PAID' 
    AND payment_date BETWEEN '2023-01-01' AND '2023-12-31'
GROUP BY 
    YEAR(payment_date), MONTH(payment_date)
ORDER BY 
    year, month;
```

**Clientes com faturas vencidas:**

```sql
SELECT 
    c.id, c.name, c.email, c.phone,
    COUNT(i.id) as overdue_invoices,
    SUM(i.total_amount) as total_overdue
FROM 
    clients c
JOIN 
    invoices i ON c.id = i.client_id
WHERE 
    i.status = 'OVERDUE'
    AND i.due_date < CURDATE()
GROUP BY 
    c.id
ORDER BY 
    total_overdue DESC;
```

**Uso de veículos por período:**

```sql
SELECT 
    v.id, v.make, v.model, v.license_plate,
    COUNT(c.id) as contract_count,
    SUM(DATEDIFF(c.end_date, c.start_date)) as total_days_used
FROM 
    vehicles v
LEFT JOIN 
    contracts c ON v.id = c.vehicle_id
WHERE 
    c.start_date BETWEEN '2023-01-01' AND '2023-12-31'
    AND c.status = 'COMPLETED'
GROUP BY 
    v.id
ORDER BY 
    total_days_used DESC;
```

## Troubleshooting

### Problemas Comuns e Soluções

**Conexão recusada ao banco de dados:**

1. Verifique se o serviço MySQL está em execução:
   ```bash
   sudo systemctl status mysql
   ```

2. Verifique as credenciais no arquivo de configuração da aplicação
3. Confirme se o usuário tem permissões corretas:
   ```sql
   SHOW GRANTS FOR 'faturamento_user'@'localhost';
   ```

**Queries lentas:**

1. Verifique o log de queries lentas
2. Use EXPLAIN para analisar a execução da query
3. Adicione índices para campos frequentemente usados em filtros (WHERE) e junções (JOIN)

**Problemas de codificação/caracteres especiais:**

1. Verifique se o banco de dados usa utf8mb4:
   ```sql
   SHOW VARIABLES LIKE 'character\_set\_%';
   SHOW VARIABLES LIKE 'collation\_%';
   ```

2. Se necessário, converta o banco de dados:
   ```sql
   ALTER DATABASE faturamento CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. Converta tabelas específicas:
   ```sql
   ALTER TABLE clients CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
