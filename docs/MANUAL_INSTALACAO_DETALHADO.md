
# Manual de Instalação Detalhado - Sistema de Faturamento

Este manual fornece instruções passo a passo para instalar, configurar e manter o Sistema de Faturamento de forma completa, incluindo todas as integrações.

## Índice

1. [Requisitos do Sistema](#1-requisitos-do-sistema)
2. [Instalação do Servidor](#2-instalação-do-servidor)
3. [Configuração do Banco de Dados MySQL](#3-configuração-do-banco-de-dados-mysql)
4. [Instalação da Aplicação](#4-instalação-da-aplicação)
5. [Configuração do Servidor Web](#5-configuração-do-servidor-web)
6. [Configuração de SSL/HTTPS](#6-configuração-de-sslhttps)
7. [Integrações](#7-integrações)
   - [WhatsApp](#integração-com-whatsapp)
   - [Asaas](#integração-com-asaas)
8. [Migração de Dados](#8-migração-de-dados)
9. [Backup e Restauração](#9-backup-e-restauração)
10. [Monitoramento e Logs](#10-monitoramento-e-logs)
11. [Atualização do Sistema](#11-atualização-do-sistema)
12. [Solução de Problemas](#12-solução-de-problemas)

## 1. Requisitos do Sistema

### Hardware Recomendado

- **CPU**: 2 núcleos ou mais
- **Memória RAM**: 4GB mínimo (8GB recomendado)
- **Armazenamento**: 20GB livres (SSD recomendado)
- **Conexão de Internet**: Estável, mínimo 5Mbps

### Software Necessário

- **Sistema Operacional**: Ubuntu Server 22.04 LTS (recomendado)
- **Servidor Web**: Apache 2.4+
- **Banco de Dados**: MySQL 8.0+ ou MariaDB 10.5+
- **PHP**: Versão 8.1 ou superior
- **Outros**: Composer, Node.js 16+, npm 8+

### Requisitos de Rede

- **Portas Abertas**: 80 (HTTP), 443 (HTTPS), 3306 (MySQL, apenas para acesso interno)
- **Nome de Domínio**: Recomendado para ambiente de produção
- **IP Fixo**: Recomendado para servidores de produção

## 2. Instalação do Servidor

### Atualização do Sistema

Atualize o sistema operacional antes de começar:

```bash
sudo apt update
sudo apt upgrade -y
```

### Instalação de Dependências Essenciais

Instale as dependências básicas necessárias:

```bash
sudo apt install -y wget curl git unzip software-properties-common apt-transport-https ca-certificates gnupg
```

### Instalação do Apache

```bash
sudo apt install -y apache2
sudo a2enmod rewrite ssl headers
sudo systemctl restart apache2
```

Verifique se o Apache está funcionando:

```bash
sudo systemctl status apache2
```

### Instalação do PHP e Extensões Necessárias

```bash
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php8.1 libapache2-mod-php8.1 php8.1-mysql php8.1-cli php8.1-common php8.1-fpm php8.1-soap php8.1-zip php8.1-bcmath php8.1-mbstring php8.1-dom php8.1-xml php8.1-curl php8.1-gd
```

Verifique a instalação do PHP:

```bash
php -v
```

### Instalação do Composer

```bash
curl -sS https://getcomposer.org/installer | sudo php -- --install-dir=/usr/local/bin --filename=composer
```

Verifique a instalação do Composer:

```bash
composer --version
```

### Instalação do Node.js e npm

```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs
```

Verifique as instalações:

```bash
node -v
npm -v
```

## 3. Configuração do Banco de Dados MySQL

### Instalação do MySQL

```bash
sudo apt install -y mysql-server
```

### Configuração Segura do MySQL

Execute o script de segurança:

```bash
sudo mysql_secure_installation
```

Responda às perguntas do assistente:
- Configurar plugin de validação de senha? (opcional)
- Escolha o nível de segurança de senha (recomendado: 1)
- Mudar a senha do root? (sim, se não configurada durante a instalação)
- Remover usuários anônimos? (sim)
- Desabilitar login remoto de root? (sim)
- Remover banco de dados de teste? (sim)
- Recarregar tabelas de privilégios? (sim)

### Criar Banco de Dados e Usuário

Acesse o MySQL:

```bash
sudo mysql -u root -p
```

Execute os comandos SQL:

```sql
CREATE DATABASE faturamento CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'faturamento_user'@'localhost' IDENTIFIED BY 'sua_senha_segura';
GRANT ALL PRIVILEGES ON faturamento.* TO 'faturamento_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

> **IMPORTANTE**: Substitua 'sua_senha_segura' por uma senha forte e única.

### Otimização do MySQL para Produção

Edite o arquivo de configuração do MySQL:

```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

Adicione ou ajuste as seguintes configurações na seção `[mysqld]`:

```ini
# Cache e buffers
innodb_buffer_pool_size = 1G
query_cache_size = 64M
query_cache_limit = 2M

# Performance
innodb_flush_method = O_DIRECT
innodb_flush_log_at_trx_commit = 2
innodb_file_per_table = 1

# Conexões
max_connections = 150
```

Reinicie o MySQL:

```bash
sudo systemctl restart mysql
```

## 4. Instalação da Aplicação

### Preparação do Diretório

```bash
sudo mkdir -p /var/www/html/faturamento
sudo chown -R $USER:$USER /var/www/html/faturamento
```

### Clonar/Transferir Arquivos para o Servidor

Se você baixou o pacote de instalação:

```bash
sudo unzip sistema-faturamento.zip -d /var/www/html/faturamento
```

### Configurar o Instalador Automático

O sistema inclui um script de instalação que automatiza várias etapas:

```bash
cd /var/www/html/faturamento
chmod +x install/setup.sh
sudo ./install/setup.sh
```

Este script irá:
1. Verificar as dependências necessárias
2. Criar a estrutura de diretórios
3. Configurar permissões
4. Criar o arquivo `.env` com configurações padrão
5. Gerar um script para inicialização do banco de dados

### Configuração do Ambiente

Edite o arquivo `.env` com suas configurações específicas:

```bash
nano /var/www/html/faturamento/.env
```

Ajuste as seguintes configurações:

```
# API Configuration
VITE_API_URL=https://seu-dominio.com

# Database Configuration
VITE_DB_HOST=localhost
VITE_DB_USER=faturamento_user
VITE_DB_PASSWORD=sua_senha_segura
VITE_DB_NAME=faturamento
VITE_DB_PORT=3306

# WhatsApp Integration
VITE_WHATSAPP_API_URL=https://evolutionapi.gpstracker-16.com.br
VITE_WHATSAPP_API_KEY=sua_chave_api_whatsapp
```

### Inicialização do Banco de Dados

Execute o script de criação das tabelas:

```bash
cd /var/www/html/faturamento
chmod +x install-database.sh
sudo ./install-database.sh
```

### Compilação do Frontend (para ambientes de produção)

```bash
cd /var/www/html/faturamento
npm install
npm run build
```

Isso irá gerar os arquivos otimizados na pasta `dist`.

### Configuração de Permissões

```bash
sudo chown -R www-data:www-data /var/www/html/faturamento
sudo chmod -R 755 /var/www/html/faturamento
sudo chmod -R 777 /var/www/html/faturamento/logs
sudo chmod -R 777 /var/www/html/faturamento/tmp
```

## 5. Configuração do Servidor Web

### Criar Virtual Host no Apache

Crie um arquivo de configuração para o site:

```bash
sudo nano /etc/apache2/sites-available/faturamento.conf
```

Adicione a seguinte configuração:

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

    ErrorLog ${APACHE_LOG_DIR}/faturamento-error.log
    CustomLog ${APACHE_LOG_DIR}/faturamento-access.log combined
</VirtualHost>
```

> **IMPORTANTE**: Substitua 'seu-dominio.com' pelo seu domínio real ou pelo IP do servidor.

### Ativar o Site e Reiniciar o Apache

```bash
sudo a2ensite faturamento.conf
sudo systemctl restart apache2
```

### Testar a Configuração

Para verificar se não há erros na configuração do Apache:

```bash
sudo apache2ctl configtest
```

## 6. Configuração de SSL/HTTPS

Para ambientes de produção, recomenda-se configurar HTTPS com um certificado SSL. Usaremos o Let's Encrypt para obter um certificado gratuito.

### Instalar o Certbot

```bash
sudo apt install -y certbot python3-certbot-apache
```

### Obter o Certificado SSL

```bash
sudo certbot --apache -d seu-dominio.com
```

Siga as instruções na tela. O Certbot irá:
1. Pedir seu endereço de e-mail para notificações
2. Solicitar que você concorde com os termos de serviço
3. Perguntar se deseja compartilhar seu e-mail
4. Perguntar se deseja redirecionar HTTP para HTTPS (recomendado)

### Verificar a Renovação Automática

Os certificados do Let's Encrypt expiram após 90 dias. O Certbot configura uma tarefa cron para renovação automática. Verifique:

```bash
sudo certbot renew --dry-run
```

## 7. Integrações

### Integração com WhatsApp

O sistema suporta integração com a API do WhatsApp para envio de mensagens, faturas e notificações.

#### Pré-requisitos

- Conta na plataforma de API Evolution WhatsApp (ou similar)
- Chave de API válida
- Número de telefone com WhatsApp cadastrado

#### Configuração

1. Acesse o sistema com uma conta de administrador
2. Navegue até "Configurações → WhatsApp"
3. Preencha:
   - Nome da instância (identificador único)
   - Chave de API (obtida na plataforma)
4. Clique em "Salvar Configurações"
5. Clique em "Conectar WhatsApp"
6. Escaneie o QR Code usando o WhatsApp do número a ser conectado

#### Testes

Após a configuração:
1. Navegue até a aba "Mensagens"
2. Digite um número de telefone no formato internacional (Ex: 5511999999999)
3. Digite uma mensagem de teste
4. Clique em "Enviar Mensagem"

### Integração com Asaas

O sistema suporta integração com a plataforma Asaas para gerenciamento de pagamentos.

#### Pré-requisitos

- Conta na plataforma Asaas (www.asaas.com)
- Chave de API válida (ambiente de produção ou sandbox)

#### Configuração

1. Acesse o sistema com uma conta de administrador
2. Navegue até "Configurações → Asaas"
3. Selecione o ambiente (Sandbox para testes, Produção para ambiente real)
4. Informe sua chave de API
5. Clique em "Salvar Configurações"
6. Clique em "Testar Conexão" para verificar a integração

#### Uso

A integração permite:
- Sincronizar clientes entre o sistema e o Asaas
- Gerar cobranças (boleto, cartão, pix) a partir de faturas
- Acompanhar status de pagamentos
- Emitir segunda via de cobranças

## 8. Migração de Dados

Se você possui dados em outro sistema, pode importá-los para o sistema de faturamento.

### Importação de Dados de Clientes

1. Prepare um arquivo CSV com os dados dos clientes com as seguintes colunas:
   - nome
   - email
   - telefone
   - documento
   - endereco
   - cidade
   - estado
   - cep

2. Acesse o sistema e vá para "Clientes → Importar"

3. Selecione o arquivo CSV e defina o delimitador (geralmente vírgula ou ponto-e-vírgula)

4. Mapeie as colunas do arquivo para os campos do sistema

5. Clique em "Importar" e aguarde a conclusão

### Importação de Dados de Veículos

Siga processo similar ao dos clientes, utilizando um CSV com as colunas adequadas para veículos.

### Importação com SQL Direto

Para importações mais complexas ou volumosas, você pode usar comandos SQL diretamente:

```bash
mysql -u faturamento_user -p faturamento < arquivo_importacao.sql
```

## 9. Backup e Restauração

### Backup do Banco de Dados

Para backup manual:

```bash
mysqldump -u faturamento_user -p --opt faturamento > backup_faturamento_$(date +%Y%m%d).sql
```

Para backup automático, crie um script e configure um cron job:

```bash
sudo nano /usr/local/bin/backup_faturamento.sh
```

Conteúdo do script:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/faturamento"
DATE=$(date +%Y-%m-%d)
MYSQL_USER="faturamento_user"
MYSQL_PASSWORD="sua_senha_segura"
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

### Restauração de Backup

Para restaurar um backup do banco de dados:

```bash
# Para arquivo não compactado
mysql -u faturamento_user -p faturamento < backup_file.sql

# Para arquivo compactado
gunzip < backup_file.sql.gz | mysql -u faturamento_user -p faturamento
```

Para restaurar arquivos do sistema:

```bash
sudo tar -xzf files_backup.tar.gz -C /var/www/html
sudo chown -R www-data:www-data /var/www/html/faturamento
```

## 10. Monitoramento e Logs

### Logs do Sistema

Os principais logs a serem monitorados são:

- **Logs do Apache**:
  ```bash
  sudo tail -f /var/log/apache2/faturamento-error.log
  sudo tail -f /var/log/apache2/faturamento-access.log
  ```

- **Logs do MySQL**:
  ```bash
  sudo tail -f /var/log/mysql/error.log
  ```

- **Logs da Aplicação**:
  ```bash
  sudo tail -f /var/www/html/faturamento/logs/app.log
  ```

### Monitoramento de Performance

Para monitorar o uso de recursos do servidor:

```bash
# Monitoramento em tempo real
htop

# Status do MySQL
mysqladmin -u root -p status

# Processos do MySQL
mysqladmin -u root -p processlist
```

Para monitoramento mais avançado, considere instalar ferramentas como:
- Prometheus + Grafana
- Netdata
- Monit

## 11. Atualização do Sistema

### Atualizando o Código-Fonte

1. Faça backup do sistema atual:
   ```bash
   sudo cp -R /var/www/html/faturamento /var/www/html/faturamento_backup_$(date +%Y%m%d)
   ```

2. Baixe os novos arquivos:
   ```bash
   # Se estiver usando Git
   cd /var/www/html/faturamento
   git pull origin main

   # Se estiver usando um arquivo zip
   sudo unzip novo_sistema.zip -d /var/www/html/faturamento_temp
   sudo cp -R /var/www/html/faturamento_temp/* /var/www/html/faturamento/
   ```

3. Atualize dependências:
   ```bash
   cd /var/www/html/faturamento
   composer install --no-dev
   npm install
   npm run build
   ```

4. Execute migrações do banco de dados (se necessário):
   ```bash
   mysql -u faturamento_user -p faturamento < src/database/migration_updates.sql
   ```

5. Atualize permissões:
   ```bash
   sudo chown -R www-data:www-data /var/www/html/faturamento
   sudo chmod -R 755 /var/www/html/faturamento
   ```

6. Reinicie o Apache:
   ```bash
   sudo systemctl restart apache2
   ```

### Verificação Pós-Atualização

Após atualizar, verifique:
- A página inicial abre corretamente
- Login funciona
- Faturas são exibidas corretamente
- Integração com WhatsApp e Asaas continua operacional

## 12. Solução de Problemas

### Problemas Comuns e Soluções

#### Página em Branco ou Erro 500

Verificar logs do Apache para identificar o erro:

```bash
sudo tail -f /var/log/apache2/faturamento-error.log
```

Possíveis causas e soluções:
- **Permissões**: Verifique se o usuário www-data tem acesso:
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

2. Se as credenciais no .env estão corretas:
   ```bash
   sudo nano /var/www/html/faturamento/.env
   ```

3. Se o usuário tem acesso ao banco:
   ```sql
   GRANT ALL PRIVILEGES ON faturamento.* TO 'faturamento_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

#### Erros na Integração com WhatsApp

1. Verifique se o QR Code está sendo gerado
2. Certifique-se de que a conexão foi estabelecida
3. Verifique logs da aplicação
4. Tente reconectar escaneando um novo QR Code

#### Lentidão no Sistema

1. Verifique uso de recursos do servidor:
   ```bash
   htop
   ```

2. Otimize o MySQL:
   ```bash
   sudo mysqltuner
   ```

3. Verifique se há consultas lentas:
   ```bash
   sudo tail -f /var/log/mysql/mysql-slow.log
   ```

### Contato de Suporte

Se você encontrar problemas que não consegue resolver:

- **Email de Suporte**: suporte@sistemafaturamento.com.br
- **Telefone**: (11) 99999-9999
- **WhatsApp**: (11) 99999-9999
- **Horário de Atendimento**: Segunda a Sexta, 9h às 18h

---

## Acesso ao Sistema

Após a instalação completa, você poderá acessar o sistema em:

```
http://seu-dominio.com
```

Ou, se configurou HTTPS:

```
https://seu-dominio.com
```

**Credenciais padrão**:
- Email: `admin@example.com`
- Senha: `admin123`

> **IMPORTANTE**: Altere a senha padrão imediatamente após o primeiro login por motivos de segurança.

---

**Desenvolvido por:** Sistema de Faturamento Ltda.  
**Versão do manual:** 1.0  
**Última atualização:** 07/04/2025
