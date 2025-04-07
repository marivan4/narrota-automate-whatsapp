
# Manual de Instalação Completo - Sistema de Faturamento

Este manual fornece instruções detalhadas para instalar, configurar e manter o Sistema de Faturamento, incluindo todas as integrações e configurações necessárias.

## Índice

1. [Requisitos do Sistema](#1-requisitos-do-sistema)
2. [Preparação do Ambiente](#2-preparação-do-ambiente)
3. [Instalação do MySQL](#3-instalação-do-mysql)
4. [Configuração do Banco de Dados](#4-configuração-do-banco-de-dados)
5. [Instalação da Aplicação](#5-instalação-da-aplicação)
6. [Configuração do Servidor Web](#6-configuração-do-servidor-web)
7. [Configuração HTTPS/SSL](#7-configuração-httpsssl)
8. [Integrações](#8-integrações)
9. [Primeiros Passos](#9-primeiros-passos)
10. [Manutenção e Backup](#10-manutenção-e-backup)
11. [Solução de Problemas](#11-solução-de-problemas)

## 1. Requisitos do Sistema

### Hardware Recomendado

- **CPU**: 2 núcleos ou superior
- **Memória RAM**: 4GB mínimo (8GB recomendado)
- **Armazenamento**: 20GB de espaço livre (SSD recomendado)
- **Conexão**: Internet estável

### Software Necessário

- **Sistema Operacional**: Ubuntu Server 22.04 LTS (recomendado)
- **Servidor Web**: Apache 2.4+
- **Banco de Dados**: MySQL 8.0+
- **PHP**: 8.1 ou superior com as seguintes extensões:
  - php-mysql
  - php-mbstring
  - php-xml
  - php-curl
  - php-zip
  - php-gd
- **Node.js**: 16+ (para build do frontend)
- **NPM**: 8+

## 2. Preparação do Ambiente

### Atualização do Sistema

```bash
sudo apt update
sudo apt upgrade -y
```

### Instalação de Dependências Básicas

```bash
sudo apt install -y software-properties-common apt-transport-https curl wget git unzip
```

### Instalação do PHP e Extensões

```bash
# Adicionar repositório para PHP 8.1
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update

# Instalar PHP e extensões necessárias
sudo apt install -y php8.1 php8.1-cli php8.1-common php8.1-fpm php8.1-mysql php8.1-zip php8.1-gd php8.1-mbstring php8.1-curl php8.1-xml php8.1-bcmath php8.1-soap
```

### Verificar Instalação do PHP

```bash
php -v
# Deve mostrar PHP 8.1.x
```

### Instalação do Apache

```bash
sudo apt install -y apache2 libapache2-mod-php8.1
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod ssl
sudo systemctl restart apache2
```

### Instalação do Node.js e NPM

```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs
node -v  # Verificar versão do Node.js
npm -v   # Verificar versão do NPM
```

## 3. Instalação do MySQL

### Instalação do Servidor MySQL

```bash
sudo apt install -y mysql-server
```

### Execução do Script de Segurança

```bash
sudo mysql_secure_installation
```

Durante a configuração, responda às perguntas:
- Configurar plugin de validação de senha? (opcional)
- Escolher nível de segurança da senha (recomendado: 1)
- Alterar senha do root? (se não foi definida durante a instalação)
- Remover usuários anônimos? (sim)
- Desabilitar login remoto root? (sim)
- Remover banco de teste? (sim)
- Recarregar privilégios? (sim)

### Verificação do Status do MySQL

```bash
sudo systemctl status mysql
```

## 4. Configuração do Banco de Dados

### Acesso ao MySQL

```bash
sudo mysql
```

### Criação do Banco de Dados e Usuário

```sql
-- Criar banco de dados
CREATE DATABASE faturamento CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Criar usuário com privilégios
CREATE USER 'faturamento_user'@'localhost' IDENTIFIED BY 'SuaSenhaSegura';
GRANT ALL PRIVILEGES ON faturamento.* TO 'faturamento_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**IMPORTANTE:** Substitua 'SuaSenhaSegura' por uma senha forte e única.

### Importação da Estrutura do Banco

```bash
# Primeiro, verifique se o arquivo existe
ls -la /var/www/html/faturamento/src/database/schema.sql

# Em seguida, importe
mysql -u faturamento_user -p faturamento < /var/www/html/faturamento/src/database/schema.sql

# Para verificar se as tabelas foram criadas
mysql -u faturamento_user -p -e "SHOW TABLES FROM faturamento;"
```

### Otimização do MySQL para Produção

Edite o arquivo de configuração do MySQL:

```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

Adicione ou ajuste as seguintes configurações sob a seção `[mysqld]`:

```ini
# Configurações de performance
innodb_buffer_pool_size = 1G  # Ajuste conforme RAM disponível
query_cache_size = 64M
query_cache_limit = 2M
sort_buffer_size = 4M
read_buffer_size = 2M

# Configurações de armazenamento
innodb_file_per_table = 1
innodb_flush_method = O_DIRECT
innodb_flush_log_at_trx_commit = 2

# Conexões
max_connections = 150
max_allowed_packet = 64M

# Logs
slow_query_log = 1
slow_query_log_file = /var/log/mysql/mysql-slow.log
long_query_time = 2
```

Reinicie o MySQL:

```bash
sudo systemctl restart mysql
```

## 5. Instalação da Aplicação

### Criação da Estrutura de Diretórios

Utilize o script fornecido para criar a estrutura de diretórios:

```bash
# Navegue até o diretório onde o script está localizado
cd /caminho/para/scripts

# Torne o script executável
chmod +x create_structure.sh

# Execute o script
sudo ./create_structure.sh
```

O script irá guiá-lo no processo de criação da estrutura de diretórios.

### Download/Transferência dos Arquivos

Se você possui um arquivo compactado do sistema:

```bash
# Extrair para o diretório de instalação
sudo unzip sistema-faturamento.zip -d /var/www/html/faturamento

# OU, se estiver em formato tar.gz
sudo tar -xzf sistema-faturamento.tar.gz -C /var/www/html/faturamento
```

Se você está usando um sistema de controle de versão (Git):

```bash
cd /var/www/html
sudo git clone https://seu-repositorio/sistema-faturamento.git faturamento
```

### Configuração do Arquivo .env

```bash
# Criar arquivo .env a partir do exemplo
sudo cp /var/www/html/faturamento/.env.example /var/www/html/faturamento/.env

# Editar o arquivo com suas configurações
sudo nano /var/www/html/faturamento/.env
```

Edite as seguintes configurações no arquivo `.env`:

```
# API Configuration
VITE_API_URL=https://seu-dominio.com

# Database Configuration
VITE_DB_HOST=localhost
VITE_DB_USER=faturamento_user
VITE_DB_PASSWORD=SuaSenhaSegura
VITE_DB_NAME=faturamento
VITE_DB_PORT=3306

# WhatsApp Integration (se aplicável)
VITE_WHATSAPP_API_URL=https://evolutionapi.gpstracker-16.com.br
VITE_WHATSAPP_API_KEY=SuaChaveApiWhatsApp

# Asaas Integration (se aplicável)
VITE_ASAAS_API_URL=https://api.asaas.com
VITE_ASAAS_API_KEY=SuaChaveApiAsaas
VITE_ASAAS_MODE=sandbox  # ou production para ambiente de produção
```

### Build do Frontend (para Ambiente de Produção)

```bash
cd /var/www/html/faturamento
npm install
npm run build
```

Isso irá gerar os arquivos otimizados para produção na pasta `dist`.

### Configuração de Permissões

```bash
sudo chown -R www-data:www-data /var/www/html/faturamento
sudo chmod -R 755 /var/www/html/faturamento
sudo chmod -R 775 /var/www/html/faturamento/logs
sudo chmod -R 775 /var/www/html/faturamento/tmp
sudo chmod -R 775 /var/www/html/faturamento/public/storage
```

## 6. Configuração do Servidor Web

### Configuração do Virtual Host Apache

Crie um arquivo de configuração para o site:

```bash
sudo nano /etc/apache2/sites-available/faturamento.conf
```

Adicione o seguinte conteúdo:

```apache
<VirtualHost *:80>
    ServerName seu-dominio.com
    ServerAdmin webmaster@seu-dominio.com
    DocumentRoot /var/www/html/faturamento/dist

    <Directory /var/www/html/faturamento/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # API Alias - IMPORTANTE
    Alias /api /var/www/html/faturamento/public/api

    <Directory /var/www/html/faturamento/public/api>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # CORS Headers para API
        Header always set Access-Control-Allow-Origin "*"
        Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
        Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
    </Directory>

    # Logging
    ErrorLog ${APACHE_LOG_DIR}/faturamento-error.log
    CustomLog ${APACHE_LOG_DIR}/faturamento-access.log combined
</VirtualHost>
```

**IMPORTANTE:** Substitua `seu-dominio.com` pelo seu domínio real.

### Ativação do Site

```bash
sudo a2ensite faturamento.conf
sudo systemctl restart apache2
```

### Teste da Configuração

```bash
sudo apache2ctl configtest
```

## 7. Configuração HTTPS/SSL

### Instalação do Certbot (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-apache
```

### Obtenção de Certificado SSL

```bash
sudo certbot --apache -d seu-dominio.com
```

Siga as instruções na tela. O Certbot automaticamente:
1. Obterá certificados válidos
2. Configurará o Apache para usar HTTPS
3. Redirecionará HTTP para HTTPS (recomendado)
4. Configurará a renovação automática

### Verificação da Renovação Automática

```bash
sudo certbot renew --dry-run
```

## 8. Integrações

### Integração com WhatsApp

O sistema oferece integração com WhatsApp através da API Evolution WhatsApp.

#### Configuração via Interface

1. Acesse o sistema com credenciais de administrador
2. Navegue até Configurações > WhatsApp
3. Preencha os dados de configuração:
   - Nome da instância (identificador único)
   - Chave de API (obtenha em https://evolutionapi.gpstracker-16.com.br)
   - URL base da API (por padrão: https://evolutionapi.gpstracker-16.com.br)
4. Clique em "Salvar Configurações"
5. Clique em "Conectar WhatsApp" e escaneie o QR Code com o aplicativo WhatsApp no seu celular

#### Configuração via Banco de Dados

Se preferir, você pode configurar diretamente via MySQL:

```sql
INSERT INTO whatsapp_configs (user_id, instance_name, api_key, base_url) 
VALUES (1, 'instance-name', 'sua-chave-api', 'https://evolutionapi.gpstracker-16.com.br');
```

### Integração com Asaas

Para integrar com a plataforma Asaas de pagamentos:

1. Crie uma conta no Asaas (https://www.asaas.com)
2. Obtenha sua chave de API no painel do Asaas
3. Configure no sistema:
   - Acesse Configurações > Integrações > Asaas
   - Selecione o ambiente (Sandbox para testes, Produção para ambiente real)
   - Insira sua chave de API
   - Clique em "Salvar"
   - Clique em "Testar Conexão" para verificar

## 9. Primeiros Passos

### Acesso ao Sistema

Após concluir a instalação, acesse o sistema pelo navegador:

```
https://seu-dominio.com
```

### Credenciais Padrão

O sistema vem com um usuário administrador padrão:

- **Email**: admin@example.com
- **Senha**: admin123

**IMPORTANTE**: Altere a senha padrão imediatamente após o primeiro login.

### Configurações Iniciais

Após o primeiro login, você deve:

1. Atualizar as informações da empresa em Configurações
2. Criar usuários adicionais com níveis de acesso adequados
3. Configurar as integrações (WhatsApp, Asaas, etc.)
4. Adicionar clientes, veículos e contratos iniciais

## 10. Manutenção e Backup

### Backup do Banco de Dados

Para backup manual:

```bash
mysqldump -u faturamento_user -p --opt faturamento > backup_faturamento_$(date +%Y%m%d).sql
```

Para backups automáticos, crie um script e configure um cron job:

```bash
sudo nano /usr/local/bin/backup_faturamento.sh
```

Conteúdo do script:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/faturamento"
DATE=$(date +%Y-%m-%d)
MYSQL_USER="faturamento_user"
MYSQL_PASSWORD="SuaSenhaSegura"
DB_NAME="faturamento"

# Criar diretório se não existir
mkdir -p $BACKUP_DIR

# Backup do banco de dados
mysqldump -u $MYSQL_USER -p$MYSQL_PASSWORD --opt $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup dos arquivos do sistema
tar -czf $BACKUP_DIR/files_$DATE.tar.gz -C /var/www/html faturamento

# Remover backups com mais de 30 dias
find $BACKUP_DIR -name "db_*.sql.gz" -type f -mtime +30 -delete
find $BACKUP_DIR -name "files_*.tar.gz" -type f -mtime +30 -delete

echo "Backup completed: $DATE" >> $BACKUP_DIR/backup.log
```

Torne o script executável e configure o cron:

```bash
sudo chmod +x /usr/local/bin/backup_faturamento.sh
sudo crontab -e
```

Adicione a linha para execução diária às 2h da manhã:

```
0 2 * * * /usr/local/bin/backup_faturamento.sh
```

### Atualizações do Sistema

Para atualizar o sistema:

1. Faça backup do sistema atual
2. Atualize os arquivos:
   ```bash
   cd /var/www/html/faturamento
   sudo git pull # Se estiver usando Git
   # OU extraia os novos arquivos
   ```
3. Atualize o banco de dados (se necessário):
   ```bash
   mysql -u faturamento_user -p faturamento < src/database/migration_updates.sql
   ```
4. Recompile o frontend:
   ```bash
   npm install
   npm run build
   ```
5. Verifique permissões:
   ```bash
   sudo chown -R www-data:www-data /var/www/html/faturamento
   ```

## 11. Solução de Problemas

### Logs do Sistema

Principais logs para diagnóstico de problemas:

- **Logs do Apache**:
  ```bash
  sudo tail -f /var/log/apache2/faturamento-error.log
  sudo tail -f /var/log/apache2/faturamento-access.log
  ```

- **Logs do MySQL**:
  ```bash
  sudo tail -f /var/log/mysql/error.log
  sudo tail -f /var/log/mysql/mysql-slow.log
  ```

- **Logs da Aplicação**:
  ```bash
  sudo tail -f /var/www/html/faturamento/logs/app.log
  ```

### Problemas Comuns e Soluções

#### Página em Branco ou Erro 500

Verificar logs do Apache:
```bash
sudo tail -f /var/log/apache2/faturamento-error.log
```

Possíveis causas e soluções:
- **Permissões inadequadas**: 
  ```bash
  sudo chown -R www-data:www-data /var/www/html/faturamento
  ```
- **Configuração do PHP**: Verifique se todas as extensões estão instaladas
- **Erro no .htaccess**: Verifique se o mod_rewrite está habilitado

#### Erro de Conexão com Banco de Dados

Verifique:
1. Se o MySQL está em execução:
   ```bash
   sudo systemctl status mysql
   ```
2. Se as credenciais no .env estão corretas
3. Se o usuário tem acesso ao banco:
   ```sql
   GRANT ALL PRIVILEGES ON faturamento.* TO 'faturamento_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

#### Problemas na Integração com WhatsApp

1. Verifique se o QR Code está sendo gerado corretamente
2. Certifique-se de que a URL da API está acessível
3. Verifique a validade da chave API
4. Tente reconectar escaneando um novo QR Code

### Contato de Suporte

Se você encontrar problemas que não consegue resolver:

- **Email de Suporte**: suporte@sistema-faturamento.com.br
- **Horário de Atendimento**: Segunda a Sexta, 9h às 18h

---

## Usuário Padrão do Sistema

Após a instalação, você poderá acessar o sistema com as seguintes credenciais:

- **Email**: admin@example.com
- **Senha**: admin123

**IMPORTANTE**: Por segurança, altere a senha padrão imediatamente após o primeiro login!

---

**Versão deste manual**: 1.0  
**Data da última atualização**: 07/04/2025
