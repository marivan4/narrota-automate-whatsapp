
# Manual de Instalação - Sistema de Faturamento de Locação de Veículos

Este documento fornece instruções para instalar e configurar o sistema em um servidor Linux Ubuntu 22.04 com MySQL e Apache.

## Requisitos do Sistema

- Ubuntu Server 22.04 LTS
- Apache 2.4+
- PHP 8.1+ com os seguintes módulos:
  - php-mysql
  - php-mbstring
  - php-xml
  - php-curl
  - php-zip
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
sudo apt install php8.1 libapache2-mod-php8.1 php8.1-mysql php8.1-mbstring php8.1-xml php8.1-curl php8.1-zip -y
```

### Instalar o MySQL

```bash
sudo apt install mysql-server -y
sudo mysql_secure_installation
```

Durante a instalação do MySQL, responda às perguntas de segurança conforme necessário.

### Criar Banco de Dados e Usuário

```bash
sudo mysql -u root -p
```

No prompt do MySQL, execute:

```sql
CREATE DATABASE faturamento CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'usuario_sistema'@'localhost' IDENTIFIED BY 'sua_senha_forte';
GRANT ALL PRIVILEGES ON faturamento.* TO 'usuario_sistema'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Instalar Node.js e npm (se necessário para o build)

```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs
```

## 2. Configuração do Projeto

### Transferir os Arquivos

```bash
sudo mkdir -p /var/www/html/faturamento
sudo chown -R $USER:$USER /var/www/html/faturamento

# Transferir arquivos para o servidor (a partir da máquina local)
scp -r * usuario@seu_servidor:/var/www/html/faturamento/
```

### Configurar Permissões

```bash
sudo chown -R www-data:www-data /var/www/html/faturamento
sudo chmod -R 755 /var/www/html/faturamento
```

### Configurar o Banco de Dados

Execute o script SQL para criação das tabelas:

```bash
sudo mysql -u usuario_sistema -p faturamento < /var/www/html/faturamento/src/database/schema.sql
```

### Build do Frontend (se necessário)

```bash
cd /var/www/html/faturamento
sudo npm install
sudo npm run build
```

### Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
sudo cp /var/www/html/faturamento/.env.example /var/www/html/faturamento/.env
sudo nano /var/www/html/faturamento/.env
```

Modifique as seguintes variáveis:

```
# API Configuration
VITE_API_URL=https://seu-dominio.com

# Database Configuration
VITE_DB_HOST=localhost
VITE_DB_USER=usuario_sistema
VITE_DB_PASSWORD=sua_senha_forte
VITE_DB_NAME=faturamento
VITE_DB_PORT=3306
```

## 3. Configuração do Apache

### Criar Virtual Host

```bash
sudo nano /etc/apache2/sites-available/faturamento.conf
```

Adicione a configuração conforme o exemplo em `docs/apache-vhost-example.conf`, adaptando para seu domínio.

### Habilitar o Site e Módulos Necessários

```bash
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2ensite faturamento.conf
sudo systemctl restart apache2
```

## 4. Configuração de SSL (HTTPS)

Para configurar HTTPS, use o Certbot para obter certificados Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-apache -y
sudo certbot --apache -d seu-dominio.com
```

## 5. Teste de Instalação

### Verificar Conexão com o Banco de Dados

Acesse `https://seu-dominio.com/api/test-connection.php` para verificar a conexão com o banco de dados. Você deve ver uma resposta JSON indicando sucesso.

### Verificar a API de Execução de Consultas

Teste a API de execução de consultas:

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"query":"SELECT * FROM users LIMIT 1"}' \
  https://seu-dominio.com/api/execute-query.php
```

### Acesso ao Sistema

Acesse `https://seu-dominio.com` e faça login com as credenciais padrão:

- Email: admin@example.com
- Senha: admin123

## 6. Solução de Problemas Comuns

### Erro 404 nas Rotas da API

Se estiver recebendo erros 404 ao acessar a API:

1. Verifique se o módulo de reescrita do Apache está habilitado:
   ```bash
   sudo a2enmod rewrite
   ```

2. Certifique-se de que o alias para a API está configurado corretamente no arquivo VirtualHost:
   ```
   Alias /api /var/www/html/faturamento/public/api
   ```

3. Verifique as permissões dos arquivos PHP:
   ```bash
   sudo chmod 755 /var/www/html/faturamento/public/api/*.php
   ```

### Problemas de Conexão com o Banco de Dados

Se houver problemas com a conexão ao banco de dados:

1. Verifique se as credenciais no arquivo `.env` estão corretas.

2. Teste a conexão diretamente com o MySQL:
   ```bash
   mysql -u usuario_sistema -p -h localhost faturamento
   ```

3. Verifique se o MySQL está em execução:
   ```bash
   sudo systemctl status mysql
   ```

### Dados Fictícios em Vez de Dados Reais

Se o sistema continuar mostrando dados de exemplo em vez dos dados do banco:

1. Verifique se a variável `VITE_API_URL` está configurada corretamente no `.env`.
2. Limpe o cache do navegador.
3. Verifique os registros do console para erros de conexão.

## 7. Manutenção

### Backup do Banco de Dados

Para fazer backup do banco de dados regularmente:

```bash
#!/bin/bash
BACKUP_DIR="/backups/faturamento"
DATE=$(date +%Y-%m-%d)

mkdir -p $BACKUP_DIR
mysqldump -u usuario_sistema -p'sua_senha_forte' faturamento > $BACKUP_DIR/faturamento_$DATE.sql
```

### Atualização do Sistema

Para atualizar o sistema:

1. Faça backup dos arquivos e banco de dados.
2. Substitua os arquivos conforme necessário.
3. Execute o script de migração se houver alterações no esquema do banco de dados.
4. Reconstrua o frontend se necessário: `npm run build`.

## 8. Suporte

Para obter suporte ou reportar problemas, entre em contato pelo e-mail:
- Email: suporte@seudominio.com
