
# Solução de Problemas Comuns

Este documento fornece orientações para resolver problemas comuns encontrados no sistema de locação de veículos.

## 1. Erro "404 Not Found" ao acessar o sistema

**Problema:** Quando você tenta acessar o sistema, recebe um erro 404.

**Solução:**

1. Verifique se o Apache está configurado corretamente:
   ```bash
   sudo apache2ctl -t
   ```

2. Verifique se o VirtualHost está habilitado:
   ```bash
   sudo a2ensite seu-arquivo-vhost.conf
   sudo systemctl reload apache2
   ```

3. Certifique-se de que a diretiva `DocumentRoot` no arquivo VirtualHost aponta para o diretório `dist` correto.

4. Verifique se os arquivos do React estão na pasta correta:
   ```bash
   ls -la /var/www/app7.narrota.com.br/dist
   ```

5. Certifique-se de que o arquivo `.htaccess` está presente no diretório dist com as configurações de rewrite corretas.

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

## 3. Dados Fictícios em Vez de Dados Reais

**Problema:** O sistema mostra dados de exemplo em vez dos dados reais do banco.

**Solução:**

1. Verifique se a conexão com o banco de dados está funcionando corretamente (veja a seção anterior).

2. Verifique se o ambiente de desenvolvimento está desativado. No arquivo `.env`:
   ```
   NODE_ENV=production
   ```

3. Certifique-se de que as variáveis de ambiente estão sendo carregadas corretamente:
   ```bash
   # Crie um script PHP para testar
   echo '<?php phpinfo(); ?>' > /var/www/app7.narrota.com.br/public/api/phpinfo.php
   ```
   Acesse https://app7.narrota.com.br/api/phpinfo.php e procure pelas variáveis de ambiente.

4. Verifique se os arquivos de serviço estão usando a API e não os dados mock:
   - Abra as ferramentas de desenvolvedor no navegador (F12)
   - Vá para a guia "Network" e observe as chamadas de API
   - Veja se há erros nas chamadas de API

5. Confira se o script `invoiceService.ts` está priorizando as chamadas de API.

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
   curl -X POST -H "Content-Type: application/json" -d '{"invoice_number":"TEST-001","contract_id":"CONT-001","client_id":"CLI-001","issue_date":"2023-05-15","due_date":"2023-06-15","amount":100,"status":"pending"}' https://app7.narrota.com.br/api/execute-query.php
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

## 5. Problemas com CORS e API Asaas

**Problema:** Erros de CORS ao tentar integrar com a API do Asaas.

**Solução:**

1. Verifique se o proxy PHP está configurado corretamente em `public/api/proxy.php`.

2. Certifique-se de que as variáveis de ambiente para o Asaas estão definidas:
   ```
   VITE_USE_PROXY=true
   VITE_PROXY_URL=/api/proxy.php
   VITE_ASAAS_API_KEY=seu_token_aqui
   VITE_ASAAS_ENVIRONMENT=sandbox
   ```

3. Verifique os logs do proxy:
   ```bash
   cat /var/www/app7.narrota.com.br/public/api/proxy_log.txt
   ```

4. Teste o proxy manualmente:
   ```bash
   curl -X POST -H "Content-Type: application/json" -d '{"url":"https://sandbox.asaas.com/api/v3/customers"}' https://app7.narrota.com.br/api/proxy.php
   ```

5. Verifique se os cabeçalhos CORS estão sendo enviados corretamente nos arquivos PHP.

## 6. Verificação do Ambiente Completo

Se você continua tendo problemas, execute o seguinte script para verificar o ambiente completo:

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

echo "=== Permissões do Diretório ==="
ls -la /var/www/app7.narrota.com.br
echo ""

echo "=== Verificação de Módulos do Apache ==="
apache2ctl -M | grep rewrite
apache2ctl -M | grep headers
echo ""

echo "=== Verificação do Banco de Dados ==="
mysql -e "SHOW DATABASES;" -u root -p
echo ""

echo "=== Teste de Conexão PHP-MySQL ==="
php -r "try { new PDO('mysql:host=localhost;dbname=car_rental_system', 'root', ''); echo 'Conexão OK\n'; } catch(PDOException \$e) { echo 'Erro: ' . \$e->getMessage() . '\n'; }"
echo ""

echo "===== Fim da Verificação ====="
```

## Contato de Suporte

Se os problemas persistirem após tentar as soluções acima, entre em contato com o suporte técnico:

- Email: suporte@narrota.com.br
- Telefone: (XX) XXXX-XXXX
