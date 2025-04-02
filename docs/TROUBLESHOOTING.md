
# Solução de Problemas Comuns - Sistema de Faturamento

Este documento fornece orientações para resolver problemas comuns encontrados no sistema de locação de veículos.

## 1. Erro 404 ao Acessar o Sistema ou APIs

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

3. Verifique se o VirtualHost está habilitado:
   ```bash
   ls -la /etc/apache2/sites-enabled/
   sudo a2ensite seu-arquivo-vhost.conf
   sudo systemctl reload apache2
   ```

4. Confirme que a diretiva `Alias /api` está configurada corretamente:
   ```
   Alias /api /var/www/html/faturamento/public/api
   ```

5. Verifique se os arquivos da API estão no local correto e têm permissões adequadas:
   ```bash
   ls -la /var/www/html/faturamento/public/api/
   sudo chmod 755 /var/www/html/faturamento/public/api/*.php
   sudo chown www-data:www-data /var/www/html/faturamento/public/api/*.php
   ```

6. Teste uma API diretamente:
   ```bash
   curl -v https://seu-dominio.com/api/test-connection.php
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
   mysql -u usuario_sistema -p -h localhost faturamento
   ```

3. Verifique as credenciais no arquivo `.env`:
   ```
   VITE_DB_HOST=localhost
   VITE_DB_USER=usuario_sistema
   VITE_DB_PASSWORD=sua_senha_forte
   VITE_DB_NAME=faturamento
   ```

4. Verifique se o arquivo `.env` está no local correto:
   ```bash
   ls -la /var/www/html/faturamento/.env
   sudo chmod 644 /var/www/html/faturamento/.env
   ```

5. Teste o script de conexão diretamente:
   ```bash
   php -f /var/www/html/faturamento/public/api/test-connection.php
   ```

6. Verifique os logs do Apache para erros do PHP:
   ```bash
   sudo tail -f /var/log/apache2/error.log
   ```

## 3. Dados Fictícios em Vez de Dados Reais

**Problema:** O sistema mostra dados de exemplo em vez dos dados reais do banco.

**Solução:**

1. Verifique se as APIs estão funcionando corretamente:
   ```bash
   curl -X POST -H "Content-Type: application/json" \
     -d '{"query":"SELECT COUNT(*) FROM clients"}' \
     https://seu-dominio.com/api/execute-query.php
   ```

2. Verifique se a variável `VITE_API_URL` está configurada corretamente:
   ```
   VITE_API_URL=https://seu-dominio.com
   ```

3. Limpe o cache do navegador ou tente em modo anônimo/privado.

4. Verifique se há erros no console do navegador (F12 > Console).

5. Verifique os logs da API para depuração:
   ```bash
   sudo cat /var/www/html/faturamento/public/api/query_log.txt
   ```

## 4. Problemas com a Interface do Usuário

**Problema:** A interface não carrega corretamente ou há problemas visuais.

**Solução:**

1. Verifique se os arquivos da build estão presentes:
   ```bash
   ls -la /var/www/html/faturamento/dist/
   ```

2. Reconstrua o frontend se necessário:
   ```bash
   cd /var/www/html/faturamento
   npm run build
   ```

3. Verifique se o arquivo `.htaccess` está configurado corretamente para servir uma SPA:
   ```bash
   cat /var/www/html/faturamento/dist/.htaccess
   ```

4. Verifique erros no console do navegador.

## 5. Erros ao Criar ou Atualizar Registros

**Problema:** Não é possível criar ou atualizar clientes, veículos, contratos ou faturas.

**Solução:**

1. Verifique se as tabelas estão criadas corretamente:
   ```sql
   SHOW TABLES;
   DESCRIBE clients;
   DESCRIBE vehicles;
   DESCRIBE contracts;
   DESCRIBE invoices;
   ```

2. Verifique se há erros ao executar consultas:
   ```bash
   curl -X POST -H "Content-Type: application/json" \
     -d '{"query":"INSERT INTO clients (name, email) VALUES (\"Teste\", \"teste@example.com\")"}' \
     https://seu-dominio.com/api/execute-query.php
   ```

3. Verifique os logs da API:
   ```bash
   sudo cat /var/www/html/faturamento/public/api/query_log.txt
   ```

## 6. Script de Verificação do Ambiente

Execute o seguinte script para verificar toda a configuração do ambiente:

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
grep -r "seu-dominio.com" /etc/apache2/sites-enabled/
echo ""

echo "=== Estrutura de Diretórios ==="
find /var/www/html/faturamento -type d | sort
echo ""

echo "=== Permissões do Diretório API ==="
ls -la /var/www/html/faturamento/public/api
echo ""

echo "=== Verificação de Módulos do Apache ==="
apache2ctl -M | grep rewrite
apache2ctl -M | grep headers
echo ""

echo "=== Teste de Conexão com MySQL ==="
mysql -u usuario_sistema -p'sua_senha_forte' -e "SELECT 1 as test;" faturamento
echo ""

echo "===== Fim da Verificação ====="
```

## 7. Verificação dos Logs

Para ajudar no diagnóstico, verifique os seguintes logs:

1. Logs do Apache:
   ```bash
   sudo tail -n 100 /var/log/apache2/error.log
   sudo tail -n 100 /var/log/apache2/access.log
   ```

2. Logs específicos da aplicação:
   ```bash
   tail -n 50 /var/www/html/faturamento/public/api/query_log.txt
   ```

3. Logs do MySQL:
   ```bash
   sudo tail -n 100 /var/log/mysql/error.log
   ```

## 8. Contato para Suporte

Se os problemas persistirem após tentar as soluções acima, entre em contato:

- Email: suporte@seudominio.com
- Telefone: (XX) XXXX-XXXX
