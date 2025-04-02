
# Solução de Problemas Comuns

Este documento fornece orientações para resolver problemas comuns encontrados no sistema de locação de veículos.

## 1. Erro "404 Not Found" ao acessar o sistema ou APIs

**Problema:** Quando você tenta acessar o sistema ou APIs, recebe um erro 404.

**Solução:**

1. Verifique se o Apache está configurado corretamente:
   ```bash
   sudo apache2ctl -t
   ```

2. Certifique-se de que os módulos necessários estão habilitados:
   ```bash
   sudo a2enmod rewrite headers
   sudo systemctl restart apache2
   ```

3. Verifique se o VirtualHost está habilitado e configurado corretamente:
   ```bash
   ls -la /etc/apache2/sites-enabled/
   sudo a2ensite seu-arquivo-vhost.conf
   sudo systemctl reload apache2
   ```

4. Confirme que a diretiva `Alias /api` está configurada corretamente no arquivo VirtualHost:
   ```
   Alias /api /var/www/app7.narrota.com.br/public/api
   ```

5. Verifique se os arquivos da API estão no local correto:
   ```bash
   ls -la /var/www/app7.narrota.com.br/public/api/
   ```

6. Verifique se os arquivos têm as permissões corretas:
   ```bash
   sudo chmod 755 /var/www/app7.narrota.com.br/public/api/*.php
   sudo chown www-data:www-data /var/www/app7.narrota.com.br/public/api/*.php
   ```

7. Teste uma rota de API diretamente:
   ```bash
   curl -v https://app7.narrota.com.br/api/test-connection.php
   ```

## 2. Erro na Conexão com o Banco de Dados

**Problema:** O sistema não conecta ao banco de dados MySQL.

**Solução:**

1. Verifique se o MySQL está rodando:
   ```bash
   sudo systemctl status mysql
   ```

2. Teste a conexão manualmente:
   ```bash
   mysql -u seu_usuario -p -h localhost
   ```

3. Verifique as credenciais no arquivo `.env`:
   ```
   VITE_DB_HOST=localhost
   VITE_DB_USER=seu_usuario
   VITE_DB_PASSWORD=sua_senha
   VITE_DB_NAME=car_rental_system
   VITE_DB_PORT=3306
   ```

4. Verifique se o usuário do banco de dados tem as permissões necessárias:
   ```sql
   GRANT ALL PRIVILEGES ON car_rental_system.* TO 'seu_usuario'@'localhost';
   FLUSH PRIVILEGES;
   ```

5. Verifique os logs de erro do PHP:
   ```bash
   sudo tail -f /var/log/apache2/error.log
   ```

6. Teste o script de conexão diretamente:
   ```bash
   php -f /var/www/app7.narrota.com.br/public/api/test-connection.php
   ```

7. Verifique se o arquivo `.env` está no local correto e acessível:
   ```bash
   ls -la /var/www/app7.narrota.com.br/.env
   sudo chmod 644 /var/www/app7.narrota.com.br/.env
   ```

## 3. Dados Fictícios em Vez de Dados Reais

**Problema:** O sistema mostra dados de exemplo em vez dos dados reais do banco.

**Solução:**

1. Verifique se a conexão com o banco de dados está funcionando corretamente (veja a seção anterior).

2. Verifique se o ambiente de desenvolvimento está desativado. No arquivo `.env`:
   ```
   NODE_ENV=production
   ```

3. Certifique-se de que a variável `VITE_API_URL` está configurada corretamente no arquivo `.env`:
   ```
   VITE_API_URL=https://app7.narrota.com.br
   ```

4. Teste se a API está retornando dados reais:
   ```bash
   # Teste a API de conexão
   curl -v https://app7.narrota.com.br/api/test-connection.php
   
   # Tente executar uma consulta de teste
   curl -X POST -H "Content-Type: application/json" \
     -d '{"query":"SELECT 1 as test"}' \
     https://app7.narrota.com.br/api/execute-query.php
   ```

5. Verifique se as tabelas existem e contêm dados:
   ```sql
   USE car_rental_system;
   SHOW TABLES;
   SELECT COUNT(*) FROM invoices;
   SELECT COUNT(*) FROM clients;
   ```

6. Verifique os logs da API para debugar problemas:
   ```bash
   sudo tail -f /var/www/app7.narrota.com.br/public/api/query_log.txt
   ```

## 4. Erro ao Criar Faturas

**Problema:** O sistema apresenta erro ao tentar criar novas faturas.

**Solução:**

1. Verifique os erros no console do navegador (F12 > Console).

2. Verifique os logs do PHP para ver se há erros de backend:
   ```bash
   sudo tail -f /var/log/apache2/error.log
   ```

3. Teste a API de criação de faturas diretamente:
   ```bash
   curl -X POST -H "Content-Type: application/json" \
     -d '{"query":"INSERT INTO invoices (invoice_number, contract_id, client_id, issue_date, due_date, amount, status) VALUES (\"TEST-001\", \"CONT-001\", \"CLI-001\", \"2023-05-15\", \"2023-06-15\", 100, \"pending\")", "params":[]}' \
     https://app7.narrota.com.br/api/execute-query.php
   ```

4. Verifique se a tabela de faturas existe no banco de dados:
   ```sql
   SHOW TABLES LIKE 'invoices';
   DESCRIBE invoices;
   ```

5. Execute uma consulta manual para inserir uma fatura:
   ```sql
   INSERT INTO invoices (invoice_number, contract_id, client_id, issue_date, due_date, amount, status) 
   VALUES ('TEST-001', 'CONT-001', 'CLI-001', '2023-05-15', '2023-06-15', 100, 'pending');
   ```

## 5. Verificando a Configuração do .env

Para verificar se o arquivo `.env` está sendo lido corretamente:

1. Crie um script de teste:
   ```bash
   echo '<?php
   $env_file = __DIR__ . "/../../.env";
   if (file_exists($env_file)) {
       echo "Arquivo .env encontrado\n";
       $content = file_get_contents($env_file);
       echo "Conteúdo: " . htmlspecialchars($content) . "\n";
   } else {
       echo "Arquivo .env não encontrado\n";
       echo "Caminho buscado: " . realpath(__DIR__ . "/../..") . "/.env\n";
   }
   ?>' > /var/www/app7.narrota.com.br/public/api/check_env.php
   ```

2. Acesse o arquivo para ver os resultados:
   ```
   https://app7.narrota.com.br/api/check_env.php
   ```

## 6. Verificação do Ambiente Completo

Execute o seguinte script para verificar o ambiente completo:

```bash
#!/bin/bash

echo "===== Verificação do Ambiente ====="
echo "Data e hora: $(date)"
echo ""

echo "=== Sistema Operacional ==="
lsb_release -a
echo ""

echo "=== Versão do Apache ==="
apache2 -v
echo ""

echo "=== Versão do PHP ==="
php -v
echo ""

echo "=== Versão do MySQL ==="
mysql --version
echo ""

echo "=== Status dos Serviços ==="
systemctl status apache2 --no-pager
systemctl status mysql --no-pager
echo ""

echo "=== Configuração do VirtualHost ==="
grep -r "app7.narrota.com.br" /etc/apache2/sites-enabled/
echo ""

echo "=== Estrutura de Diretórios ==="
find /var/www/app7.narrota.com.br -type d | sort
echo ""

echo "=== Permissões do Diretório API ==="
ls -la /var/www/app7.narrota.com.br/public/api
echo ""

echo "=== Verificação de Módulos do Apache ==="
apache2ctl -M | grep rewrite
apache2ctl -M | grep headers
echo ""

echo "=== Teste de Acesso à API ==="
curl -s https://app7.narrota.com.br/api/test-connection.php
echo ""

echo "===== Fim da Verificação ====="
```

## Contato de Suporte

Se os problemas persistirem após tentar as soluções acima, entre em contato com o suporte técnico:

- Email: suporte@narrota.com.br
- Telefone: (XX) XXXX-XXXX
