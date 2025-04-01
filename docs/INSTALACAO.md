
# Manual de Instalação - Sistema de Faturamento

Este documento fornece instruções para instalar o sistema em um servidor Linux Ubuntu 22.04.5 LTS com MySQL e Apache.

## Requisitos do Sistema

- Ubuntu Server 22.04.5 LTS
- Apache 2.4+
- PHP 8.1+ com os seguintes módulos:
  - php-mysql
  - php-mbstring
  - php-xml
  - php-curl
  - php-zip
  - php-gd
  - php-opcache
- MySQL 8.0+
- Node.js 16+ e npm 8+ (para build do frontend)

## 1. Preparação do Servidor

### Atualizar o sistema

```bash
sudo apt update
sudo apt upgrade -y
```

### Instalar o Apache e PHP

```bash
sudo apt install apache2 -y
sudo apt install php8.1 libapache2-mod-php8.1 php8.1-mysql php8.1-mbstring php8.1-xml php8.1-curl php8.1-zip php8.1-gd php8.1-opcache -y
```

### Instalar o MySQL

```bash
sudo apt install mysql-server -y
sudo mysql_secure_installation
```

Durante a instalação do MySQL, responda às perguntas de segurança conforme sua política. É recomendável:
- Definir uma senha forte para o root
- Remover usuários anônimos
- Desabilitar login remoto do root
- Remover banco de dados de teste
- Recarregar as tabelas de privilégios

### Criar Banco de Dados e Usuário

```bash
sudo mysql -u root -p
```

No prompt do MySQL, execute:

```sql
CREATE DATABASE faturamento;
CREATE USER 'usuario_faturamento'@'localhost' IDENTIFIED BY 'sua_senha_forte';
GRANT ALL PRIVILEGES ON faturamento.* TO 'usuario_faturamento'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Instalar Node.js e npm

```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

## 2. Configuração do Projeto

### Clonar o Repositório (ou Transferir os Arquivos)

```bash
sudo mkdir -p /var/www/faturamento
cd /var/www/faturamento

# Se estiver usando git
sudo git clone [URL_DO_REPOSITORIO] .

# OU se estiver transferindo arquivos manualmente via SFTP/SCP
# (Faça isso a partir da sua máquina local)
# scp -r project_files/* usuario@servidor:/var/www/faturamento/
```

### Configurar Permissões

```bash
sudo chown -R www-data:www-data /var/www/faturamento
sudo chmod -R 755 /var/www/faturamento
```

### Configurar o Banco de Dados

Execute o script SQL para criação das tabelas:

```bash
sudo mysql -u usuario_faturamento -p faturamento < /var/www/faturamento/src/database/schema.sql
sudo mysql -u usuario_faturamento -p faturamento < /var/www/faturamento/src/database/asaas_tables.sql
```

### Build do Frontend

```bash
cd /var/www/faturamento
sudo npm install
sudo npm run build
```

### Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
sudo nano /var/www/faturamento/.env
```

Adicione as variáveis necessárias:

```
VITE_API_URL=http://seu-dominio.com/api
VITE_ASAAS_API_KEY=sua_chave_api_asaas
VITE_ASAAS_ENVIRONMENT=sandbox # ou production
```

## 3. Configuração do Servidor Web

### Criar Virtual Host para o Frontend

```bash
sudo nano /etc/apache2/sites-available/faturamento.conf
```

Adicione a seguinte configuração:

```apache
<VirtualHost *:80>
    ServerName seu-dominio.com
    ServerAdmin webmaster@localhost
    DocumentRoot /var/www/faturamento/dist

    <Directory /var/www/faturamento/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # Se você precisar implementar uma API em PHP separadamente:
    # Alias /api /var/www/faturamento/api
    # <Directory /var/www/faturamento/api>
    #     Options -Indexes +FollowSymLinks
    #     AllowOverride All
    #     Require all granted
    #     
    #     # Habilitar CORS
    #     Header set Access-Control-Allow-Origin "*"
    #     Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    #     Header set Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    # </Directory>

    ErrorLog ${APACHE_LOG_DIR}/faturamento_error.log
    CustomLog ${APACHE_LOG_DIR}/faturamento_access.log combined
</VirtualHost>
```

### Habilitar o Site e Módulos Necessários

```bash
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2ensite faturamento.conf
sudo systemctl restart apache2
```

## 4. Implementação de Backend API (Opcional)

Se for necessário implementar uma API backend separada, siga estas etapas:

### Criar Estrutura de Diretórios da API

```bash
sudo mkdir -p /var/www/faturamento/api/config
sudo mkdir -p /var/www/faturamento/api/controllers
sudo mkdir -p /var/www/faturamento/api/models
```

### Configurar Conexão com o Banco de Dados

```bash
sudo nano /var/www/faturamento/api/config/database.php
```

Adicione o seguinte conteúdo:

```php
<?php
return [
    'host' => 'localhost',
    'database' => 'faturamento',
    'username' => 'usuario_faturamento',
    'password' => 'sua_senha_forte',
    'charset' => 'utf8mb4',
];

// Função para criar conexão PDO
function getConnection() {
    $config = include __DIR__ . '/database.php';
    try {
        $dsn = "mysql:host={$config['host']};dbname={$config['database']};charset={$config['charset']}";
        $pdo = new PDO($dsn, $config['username'], $config['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        die("Erro de conexão: " . $e->getMessage());
    }
}
?>
```

### Criar Arquivo .htaccess para API

```bash
sudo nano /var/www/faturamento/api/.htaccess
```

Adicione o seguinte conteúdo para configurar o roteamento da API:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]

# Habilitar CORS
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header set Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization"
```

### Criar Ponto de Entrada da API

```bash
sudo nano /var/www/faturamento/api/index.php
```

Adicione um código inicial para a API:

```php
<?php
header('Content-Type: application/json');

// Definir constantes
define('ROOT_DIR', __DIR__);

// Permitir CORS para todas as requisições
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Importar configuração do banco de dados
require_once ROOT_DIR . '/config/database.php';

// Obter a URL requisitada
$request_uri = $_SERVER['REQUEST_URI'];
$base_path = '/api'; // Ajuste conforme necessário
$path = substr($request_uri, strlen($base_path));
$path = trim($path, '/');
$parts = explode('/', $path);
$resource = $parts[0] ?? '';

// Roteamento simples
switch ($resource) {
    case 'invoices':
        require_once ROOT_DIR . '/controllers/invoices.php';
        break;
    case 'clients':
        require_once ROOT_DIR . '/controllers/clients.php';
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Recurso não encontrado']);
        break;
}
?>
```

### Exemplo de Controlador de Faturas

```bash
sudo mkdir -p /var/www/faturamento/api/controllers
sudo nano /var/www/faturamento/api/controllers/invoices.php
```

Adicione um exemplo de controlador:

```php
<?php
// Obter o método HTTP
$method = $_SERVER['REQUEST_METHOD'];
$pdo = getConnection();

// ID do recurso (se fornecido)
$id = $parts[1] ?? null;

switch ($method) {
    case 'GET':
        if ($id) {
            // Obter fatura específica
            $stmt = $pdo->prepare("SELECT * FROM invoices WHERE id = ?");
            $stmt->execute([$id]);
            $invoice = $stmt->fetch();
            
            if ($invoice) {
                echo json_encode($invoice);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Fatura não encontrada']);
            }
        } else {
            // Listar todas as faturas
            $stmt = $pdo->query("SELECT * FROM invoices ORDER BY issue_date DESC");
            $invoices = $stmt->fetchAll();
            echo json_encode($invoices);
        }
        break;
        
    case 'POST':
        // Criar nova fatura
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validar dados
        if (!isset($data['invoice_number']) || !isset($data['amount'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Dados incompletos']);
            break;
        }
        
        try {
            $stmt = $pdo->prepare("INSERT INTO invoices 
                (invoice_number, contract_id, issue_date, due_date, amount, tax_amount, status, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                
            $stmt->execute([
                $data['invoice_number'],
                $data['contract_id'] ?? null,
                $data['issue_date'] ?? date('Y-m-d'),
                $data['due_date'] ?? null,
                $data['amount'],
                $data['tax_amount'] ?? 0,
                $data['status'] ?? 'PENDING',
                $data['notes'] ?? null
            ]);
            
            $newId = $pdo->lastInsertId();
            $stmt = $pdo->prepare("SELECT * FROM invoices WHERE id = ?");
            $stmt->execute([$newId]);
            $invoice = $stmt->fetch();
            
            http_response_code(201);
            echo json_encode($invoice);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao criar fatura: ' . $e->getMessage()]);
        }
        break;
        
    // Adicione casos para PUT e DELETE conforme necessário
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método não permitido']);
        break;
}
?>
```

## 5. Segurança

### Configurar SSL (HTTPS)

É altamente recomendável usar HTTPS. Você pode usar o Certbot para obter certificados Let's Encrypt gratuitos:

```bash
sudo apt install certbot python3-certbot-apache -y
sudo certbot --apache -d seu-dominio.com
```

### Configurar Firewall

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### Configurar PHP para Produção

```bash
sudo nano /etc/php/8.1/apache2/php.ini
```

Encontre e ajuste as seguintes configurações:

```
display_errors = Off
display_startup_errors = Off
error_reporting = E_ALL & ~E_DEPRECATED & ~E_STRICT
log_errors = On
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 30
memory_limit = 128M
```

Reinicie o Apache:

```bash
sudo systemctl restart apache2
```

## 6. Configuração dos Apontamentos no Frontend

Para o frontend se comunicar com a API backend, é importante definir corretamente as variáveis de ambiente. Edite o arquivo `.env`:

```bash
sudo nano /var/www/faturamento/.env
```

Atualize as variáveis conforme necessário:

```
VITE_API_URL=https://seu-dominio.com/api
```

Reconstrua o frontend após qualquer alteração nas variáveis de ambiente:

```bash
sudo npm run build
```

## 7. Verificação e Manutenção

### Verificar a Instalação

Acesse https://seu-dominio.com no navegador para verificar se o sistema está funcionando corretamente.

### Configurar Backup Automático

Crie um script de backup:

```bash
sudo nano /usr/local/bin/backup-faturamento.sh
```

Adicione:

```bash
#!/bin/bash
DATE=$(date +%Y-%m-%d)
BACKUP_DIR="/backups/faturamento"

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Backup do banco de dados
mysqldump -u usuario_faturamento -p'sua_senha_forte' faturamento > $BACKUP_DIR/faturamento_db_$DATE.sql

# Backup dos arquivos
tar -czf $BACKUP_DIR/faturamento_files_$DATE.tar.gz /var/www/faturamento

# Manter apenas os últimos 7 dias de backups
find $BACKUP_DIR -name "*.sql" -type f -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -type f -mtime +7 -delete
```

Torne o script executável:

```bash
sudo chmod +x /usr/local/bin/backup-faturamento.sh
```

Agende a execução diária:

```bash
sudo crontab -e
```

Adicione:

```
0 2 * * * /usr/local/bin/backup-faturamento.sh
```

## 8. Manutenção e Atualização

### Atualizar o Sistema

Para atualizar o sistema:

```bash
cd /var/www/faturamento
sudo git pull  # Se estiver usando git
sudo npm install
sudo npm run build
sudo chown -R www-data:www-data /var/www/faturamento
```

## 9. Solução de Problemas

### Verificar Logs do Apache

```bash
sudo tail -f /var/log/apache2/faturamento_error.log
```

### Verificar Logs do PHP

```bash
sudo tail -f /var/log/apache2/error.log
```

### Verificar Status do Apache

```bash
sudo systemctl status apache2
```

### Reiniciar Serviços

```bash
sudo systemctl restart apache2
sudo systemctl restart mysql
```

## 10. Contato de Suporte

Para mais informações ou suporte, entre em contato com:
- Email: suporte@seudominio.com
- Telefone: (XX) XXXX-XXXX
