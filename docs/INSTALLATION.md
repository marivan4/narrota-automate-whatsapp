
# Instalação do Sistema de Faturamento

Este guia contém os passos necessários para instalar o sistema de faturamento.

## Requisitos

- Servidor Linux (Ubuntu 22.04 ou superior)
- Apache 2.4 ou superior
- PHP 8.1 ou superior
- MySQL 8.0 ou superior
- Certificado SSL válido

## 1. Configuração do Servidor

### 1.1 Instalação de dependências

```bash
sudo apt update
sudo apt install -y apache2 php8.1 php8.1-mysql php8.1-mbstring php8.1-xml php8.1-curl mysql-server

# Módulos do Apache necessários
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod ssl
sudo a2enmod alias
```

### 1.2 Permissões de diretório

```bash
sudo chown -R www-data:www-data /var/www/html/faturamento
sudo chmod -R 755 /var/www/html/faturamento
```

## 2. Configuração do Apache

### 2.1 Criar VirtualHost

Crie um arquivo de configuração para o site:

```bash
sudo nano /etc/apache2/sites-available/app7.narrota.com.br.conf
```

Copie e cole o conteúdo do arquivo `docs/apache-vhost-example.conf` ou utilize o seguinte modelo:

```apache
<VirtualHost *:443>
    ServerName app7.narrota.com.br
    ServerAdmin webmaster@narrota.com.br
    DocumentRoot /var/www/html/faturamento/dist

    # Enable SSL
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/app7.narrota.com.br/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/app7.narrota.com.br/privkey.pem

    # API Alias - IMPORTANTE: não remova esta linha
    Alias /api /var/www/html/faturamento/public/api

    # API directory configuration
    <Directory "/var/www/html/faturamento/public/api">
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Enable CORS for API
        Header always set Access-Control-Allow-Origin "*"
        Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
        Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
    </Directory>

    # React app SPA routing
    <Directory "/var/www/html/faturamento/dist">
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # Security headers
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Frame-Options "SAMEORIGIN"
</VirtualHost>

<VirtualHost *:80>
    ServerName app7.narrota.com.br
    Redirect permanent / https://app7.narrota.com.br/
</VirtualHost>
```

### 2.2 Ativar o site

```bash
sudo a2ensite app7.narrota.com.br.conf
sudo systemctl restart apache2
```

## 3. Configuração do Banco de Dados

### 3.1 Criar banco de dados e usuário

```bash
sudo mysql
```

No prompt do MySQL:

```sql
CREATE DATABASE faturamento CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'faturamento_user'@'localhost' IDENTIFIED BY 'senha_segura';
GRANT ALL PRIVILEGES ON faturamento.* TO 'faturamento_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3.2 Inicializar o esquema do banco de dados

Você pode usar o script de inicialização automático:

```bash
bash /var/www/html/faturamento/docs/initialize-database.sh
```

Ou executar manualmente:

```bash
mysql -u faturamento_user -p faturamento < /var/www/html/faturamento/src/database/schema.sql
mysql -u faturamento_user -p faturamento < /var/www/html/faturamento/src/database/asaas_tables.sql
```

## 4. Configuração do Ambiente

### 4.1 Criar arquivo .env

```bash
cp /var/www/html/faturamento/.env.example /var/www/html/faturamento/.env
```

Edite o arquivo `.env` com suas configurações:

```bash
sudo nano /var/www/html/faturamento/.env
```

Ajuste as configurações conforme necessário:

```
VITE_API_URL=https://app7.narrota.com.br
VITE_DB_HOST=localhost
VITE_DB_USER=faturamento_user
VITE_DB_PASSWORD=senha_segura
VITE_DB_NAME=faturamento
VITE_DB_PORT=3306
```

### 4.2 Permissões para o arquivo .env

```bash
sudo chown www-data:www-data /var/www/html/faturamento/.env
sudo chmod 644 /var/www/html/faturamento/.env
```

## 5. Script de Reparo (em caso de problemas)

Se você encontrar problemas com a API, execute o script de reparo:

```bash
sudo bash /var/www/html/faturamento/docs/fix-api-access.sh
```

## 6. Verificação da Instalação

### 6.1 Testar a API

```bash
curl https://app7.narrota.com.br/api/test-connection.php
```

### 6.2 Verificar o banco de dados

```bash
curl https://app7.narrota.com.br/api/verify-database.php
```

### 6.3 Diagnóstico completo

```bash
curl https://app7.narrota.com.br/api/diagnose.php
```

## 7. Implantação de Atualizações

Para implantar atualizações, use o script:

```bash
cd /var/www/html/faturamento
sudo bash docs/deploy.sh
```

## 8. Solução de Problemas

Consulte o arquivo `docs/TROUBLESHOOTING.md` para soluções de problemas comuns.

## Acesso ao Sistema

Após a instalação, acesse o sistema em:

https://app7.narrota.com.br/

Se você usou o script de inicialização do banco de dados, um usuário admin foi criado:

- Email: admin@example.com
- Senha: password

**Importante:** Altere a senha do usuário admin após o primeiro login.
