
# Manual de Instalação - Sistema de Faturamento e Gestão de Locação de Veículos

Este documento fornece instruções para instalar e configurar o sistema em um servidor Linux Ubuntu 22.04.5 LTS com MySQL e Apache.

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
CREATE DATABASE car_rental_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'usuario_sistema'@'localhost' IDENTIFIED BY 'sua_senha_forte';
GRANT ALL PRIVILEGES ON car_rental_system.* TO 'usuario_sistema'@'localhost';
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
sudo mkdir -p /var/www/car_rental_system
cd /var/www/car_rental_system

# Se estiver usando git
sudo git clone [URL_DO_REPOSITORIO] .

# OU se estiver transferindo arquivos manualmente via SFTP/SCP
# (Faça isso a partir da sua máquina local)
# scp -r project_files/* usuario@servidor:/var/www/car_rental_system/
```

### Configurar Permissões

```bash
sudo chown -R www-data:www-data /var/www/car_rental_system
sudo chmod -R 755 /var/www/car_rental_system
```

### Configurar o Banco de Dados

Execute os scripts SQL para criação das tabelas:

```bash
sudo mysql -u usuario_sistema -p car_rental_system < /var/www/car_rental_system/src/database/schema.sql
sudo mysql -u usuario_sistema -p car_rental_system < /var/www/car_rental_system/src/database/asaas_tables.sql
```

### Build do Frontend

```bash
cd /var/www/car_rental_system
sudo npm install
sudo npm run build
```

### Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto baseado no modelo `.env.example`:

```bash
sudo cp /var/www/car_rental_system/.env.example /var/www/car_rental_system/.env
sudo nano /var/www/car_rental_system/.env
```

Modifique as seguintes variáveis conforme necessário:

```
# API Configuration
VITE_API_URL=http://seu-dominio.com/api

# Database Configuration
VITE_DB_HOST=localhost
VITE_DB_USER=usuario_sistema
VITE_DB_PASSWORD=sua_senha_forte
VITE_DB_NAME=car_rental_system
VITE_DB_PORT=3306

# Asaas API Integration
# Defina como 'true' para usar um proxy para evitar problemas de CORS
VITE_USE_PROXY=true
VITE_PROXY_URL=/api/proxy.php
VITE_ASAAS_API_KEY=seu_token_da_api_asaas
VITE_ASAAS_ENVIRONMENT=sandbox

# Feature Flags
VITE_ENABLE_WHATSAPP=true
VITE_ENABLE_ASAAS=true

# Logging
VITE_ENABLE_DEBUG_LOGS=true
```

## 3. Configuração do Servidor Web

### Criar Virtual Host para o Frontend

```bash
sudo nano /etc/apache2/sites-available/car_rental_system.conf
```

Adicione a seguinte configuração:

```apache
<VirtualHost *:80>
    ServerName seu-dominio.com
    ServerAdmin webmaster@localhost
    DocumentRoot /var/www/car_rental_system/dist

    <Directory /var/www/car_rental_system/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # Configuração para a API PHP
    Alias /api /var/www/car_rental_system/public/api
    <Directory /var/www/car_rental_system/public/api>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Habilitar CORS
        Header set Access-Control-Allow-Origin "*"
        Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
        Header set Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/car_rental_system_error.log
    CustomLog ${APACHE_LOG_DIR}/car_rental_system_access.log combined
</VirtualHost>
```

### Habilitar o Site e Módulos Necessários

```bash
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2ensite car_rental_system.conf
sudo systemctl restart apache2
```

## 4. Configuração da API Proxy para Integração com Asaas

Para evitar problemas de CORS com a API Asaas, um proxy PHP é necessário. O arquivo já está incluído em `/public/api/proxy.php`, mas precisa ser configurado corretamente:

```bash
sudo nano /var/www/car_rental_system/public/api/proxy.php
```

Verifique se o conteúdo do arquivo está correto:

```php
<?php
// Configuração de cabeçalhos CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Responder imediatamente a requisições OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Obter a URL de destino da query string
$targetUrl = isset($_GET['url']) ? $_GET['url'] : '';

if (empty($targetUrl)) {
    http_response_code(400);
    echo json_encode(['error' => 'URL de destino não fornecida']);
    exit();
}

// Obter a chave da API Asaas do cabeçalho ou da variável de ambiente
$apiKey = '';

if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $apiKey = $_SERVER['HTTP_AUTHORIZATION'];
} else if (isset($_SERVER['HTTP_X_API_KEY'])) {
    $apiKey = $_SERVER['HTTP_X_API_KEY'];
}

// Inicializar cURL
$ch = curl_init();

// Configurar a requisição cURL
curl_setopt($ch, CURLOPT_URL, $targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

// Copiar o método da requisição
$method = $_SERVER['REQUEST_METHOD'];
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

// Adicionar headers da requisição
$headers = ['Content-Type: application/json'];
if (!empty($apiKey)) {
    $headers[] = "access_token: $apiKey";
}
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

// Para métodos POST, PUT, etc., enviar dados no corpo da requisição
if ($method !== 'GET' && $method !== 'HEAD' && $method !== 'OPTIONS') {
    $input = file_get_contents('php://input');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
}

// Executar a requisição
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

// Verificar erros
if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro cURL: ' . curl_error($ch)]);
    curl_close($ch);
    exit();
}

// Fechar a conexão cURL
curl_close($ch);

// Enviar a resposta com o mesmo código HTTP
http_response_code($httpCode);

// Se o content type for retornado, usá-lo
if ($contentType) {
    header("Content-Type: $contentType");
}

echo $response;
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

Para o frontend se comunicar com a API backend e com a API do Asaas, é importante definir corretamente as variáveis de ambiente. Edite o arquivo `.env`:

```bash
sudo nano /var/www/car_rental_system/.env
```

Atualize as variáveis conforme necessário:

```
VITE_API_URL=https://seu-dominio.com/api
VITE_USE_PROXY=true
VITE_PROXY_URL=/api/proxy.php
```

Reconstrua o frontend após qualquer alteração nas variáveis de ambiente:

```bash
sudo npm run build
```

## 7. Solução de Problemas Comuns

### Erro na Criação de Faturas

Se você estiver recebendo o erro "Erro ao criar fatura. Verifique os dados e tente novamente", verifique:

1. A conexão com o banco de dados está configurada corretamente
2. A integração com o Asaas está funcionando (verifique a chave API)
3. Os formatos de data estão corretos (o sistema agora lida automaticamente com a conversão entre string e objeto Date)
4. Verifique os logs do Apache para mais detalhes:
   ```bash
   sudo tail -f /var/log/apache2/car_rental_system_error.log
   ```

### Problemas na Persistência de Dados

Se as alterações no sistema não estiverem sendo refletidas no banco de dados:

1. Verifique se o usuário do MySQL tem permissões adequadas
2. Confira se as variáveis de ambiente do banco de dados estão configuradas corretamente no .env
3. Verifique se não há erros de validação nos formulários
4. Ative o modo de depuração (VITE_ENABLE_DEBUG_LOGS=true) para ver logs detalhados

### Erros de CORS com a API Asaas

Se estiver enfrentando problemas de CORS:

1. Confirme que VITE_USE_PROXY=true está definido no .env
2. Verifique se o proxy.php está funcionando corretamente
3. Certifique-se de que os módulos Apache estão habilitados:
   ```bash
   sudo a2enmod headers
   sudo systemctl restart apache2
   ```

## 8. Verificação e Manutenção

### Verificar a Instalação

Acesse https://seu-dominio.com no navegador para verificar se o sistema está funcionando corretamente.

### Configurar Backup Automático

Crie um script de backup:

```bash
sudo nano /usr/local/bin/backup-car-rental.sh
```

Adicione:

```bash
#!/bin/bash
DATE=$(date +%Y-%m-%d)
BACKUP_DIR="/backups/car_rental_system"

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Backup do banco de dados
mysqldump -u usuario_sistema -p'sua_senha_forte' car_rental_system > $BACKUP_DIR/car_rental_system_db_$DATE.sql

# Backup dos arquivos
tar -czf $BACKUP_DIR/car_rental_system_files_$DATE.tar.gz /var/www/car_rental_system

# Manter apenas os últimos 7 dias de backups
find $BACKUP_DIR -name "*.sql" -type f -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -type f -mtime +7 -delete
```

Torne o script executável:

```bash
sudo chmod +x /usr/local/bin/backup-car-rental.sh
```

Agende a execução diária:

```bash
sudo crontab -e
```

Adicione:

```
0 2 * * * /usr/local/bin/backup-car-rental.sh
```

## 9. Atualizações Recentes do Sistema

### Correção na Criação de Faturas
- Corrigido problema na conversão de datas entre formato string e objeto Date
- Melhorada a validação dos campos obrigatórios
- Adicionado tratamento de erros mais detalhado durante o processo de criação

### Melhorias na Persistência de Dados
- Otimizada a conexão com o banco de dados
- Implementada validação adicional antes de salvar os dados
- Corrigida a sincronização entre a interface e o banco de dados

### Integração com Asaas
- Implementado proxy PHP para evitar problemas de CORS
- Melhorado o processo de autenticação com a API
- Adicionada validação de resposta da API

### Outras Melhorias
- Otimização geral de desempenho
- Limpeza de código não utilizado
- Melhorias na interface do usuário

## 10. Contato de Suporte

Para mais informações ou suporte, entre em contato com:
- Email: suporte@seudominio.com
- Telefone: (XX) XXXX-XXXX
