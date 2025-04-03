
# Solução de Problemas - Sistema de Faturamento

## 1. Erro 404 ao Acessar as APIs

### Problema: 
As requisições para `/api/execute-query.php` ou outras APIs retornam 404.

### Solução:

1. Verifique se o módulo de alias do Apache está habilitado:
   ```bash
   sudo a2enmod alias
   sudo systemctl restart apache2
   ```

2. Verifique se a configuração do VirtualHost está correta:
   ```bash
   sudo nano /etc/apache2/sites-available/app7.narrota.com.br.conf
   ```
   
   Certifique-se de que existe a linha:
   ```
   Alias /api /var/www/html/faturamento/public/api
   ```

3. Certifique-se de que o diretório da API existe e tem as permissões corretas:
   ```bash
   ls -la /var/www/html/faturamento/public/api/
   sudo chmod 755 /var/www/html/faturamento/public/api/
   sudo chmod 755 /var/www/html/faturamento/public/api/*.php
   ```

4. Teste uma API simples para verificar se está funcionando:
   ```bash
   curl https://app7.narrota.com.br/api/test-connection.php
   ```

5. Verifique os logs de erro do Apache:
   ```bash
   sudo tail -f /var/log/apache2/app7.narrota.com.br_error.log
   ```

## 2. Problemas de Conexão com o Banco de Dados

### Problema:
O sistema não está conectando ao banco de dados MySQL.

### Solução:

1. Verifique se o MySQL está em execução:
   ```bash
   sudo systemctl status mysql
   ```

2. Verifique as credenciais no arquivo `.env`:
   ```bash
   cat /var/www/html/faturamento/.env
   ```
   
   Certifique-se de que contém:
   ```
   VITE_DB_HOST=localhost
   VITE_DB_USER=root (ou seu usuário)
   VITE_DB_PASSWORD=sua_senha
   VITE_DB_NAME=faturamento
   VITE_DB_PORT=3306
   ```

3. Verifique se o banco de dados existe:
   ```bash
   mysql -u root -p -e "SHOW DATABASES;"
   ```

4. Se o banco de dados não existir, crie-o:
   ```bash
   mysql -u root -p -e "CREATE DATABASE faturamento CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```

5. Execute o script para criar as tabelas:
   ```bash
   mysql -u root -p faturamento < /var/www/html/faturamento/src/database/schema.sql
   ```

6. Teste a API de verificação do banco:
   ```bash
   curl https://app7.narrota.com.br/api/verify-database.php
   ```

## 3. Verificação Rápida de Sistema

Execute o comando a seguir para verificar rapidamente o estado do sistema:

```bash
cd /var/www/html/faturamento
bash -c "
echo '=== Sistema Operacional ==='
lsb_release -a 2>/dev/null || cat /etc/os-release

echo -e '\n=== Versão do Apache ==='
apache2 -v

echo -e '\n=== Versão do PHP ==='
php -v

echo -e '\n=== Versão do MySQL ==='
mysql --version

echo -e '\n=== Status dos Serviços ==='
systemctl status apache2 --no-pager | head -n 10
systemctl status mysql --no-pager | head -n 10

echo -e '\n=== Diretório do Projeto ==='
ls -la /var/www/html/faturamento/

echo -e '\n=== Diretório API ==='
ls -la /var/www/html/faturamento/public/api/

echo -e '\n=== Arquivo .env ==='
cat /var/www/html/faturamento/.env 2>/dev/null || echo '.env não encontrado'

echo -e '\n=== Teste de API ==='
curl -s https://app7.narrota.com.br/api/test-connection.php || echo 'API inacessível'
"
```

## 4. Comandos para Instalação Completa

Para uma instalação limpa do sistema, execute os seguintes comandos:

```bash
# Instalar Apache, PHP e MySQL
sudo apt update
sudo apt install apache2 php8.1 php8.1-mysql php8.1-mbstring php8.1-xml php8.1-curl mysql-server

# Habilitar módulos do Apache necessários
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod ssl
sudo a2enmod alias

# Configurar o VirtualHost
sudo cp /var/www/html/faturamento/docs/apache-vhost-example.conf /etc/apache2/sites-available/app7.narrota.com.br.conf
sudo a2ensite app7.narrota.com.br.conf
sudo systemctl restart apache2

# Configurar o banco de dados
sudo mysql -e "CREATE DATABASE IF NOT EXISTS faturamento CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'faturamento_user'@'localhost' IDENTIFIED BY 'senha_segura';"
sudo mysql -e "GRANT ALL PRIVILEGES ON faturamento.* TO 'faturamento_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
sudo mysql faturamento < /var/www/html/faturamento/src/database/schema.sql

# Configurar o .env
cp /var/www/html/faturamento/.env.example /var/www/html/faturamento/.env
sed -i 's/senha_do_banco/senha_segura/g' /var/www/html/faturamento/.env
sed -i 's/root/faturamento_user/g' /var/www/html/faturamento/.env

# Configurar permissões
sudo chown -R www-data:www-data /var/www/html/faturamento
sudo chmod -R 755 /var/www/html/faturamento
```
