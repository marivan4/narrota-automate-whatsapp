
# Sistema de Faturamento

## Configuração do Banco de Dados

Este sistema requer um banco de dados MySQL para funcionar corretamente. Siga os passos abaixo para configurar:

### 1. Requisitos

- PHP 7.4 ou superior
- MySQL 5.7 ou superior
- Servidor web (Apache, Nginx, etc.)

### 2. Configuração do Banco de Dados

1. Crie um banco de dados MySQL com o nome `faturamento`:

```sql
CREATE DATABASE faturamento CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Crie um usuário para o banco de dados (opcional, mas recomendado):

```sql
CREATE USER 'faturamento_user'@'localhost' IDENTIFIED BY 'sua_senha_segura';
GRANT ALL PRIVILEGES ON faturamento.* TO 'faturamento_user'@'localhost';
FLUSH PRIVILEGES;
```

3. As tabelas serão criadas automaticamente na primeira execução do sistema.

### 3. Configuração do Ambiente

1. Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

2. Edite o arquivo `.env` com suas configurações:

```
VITE_API_URL=http://localhost/caminho_para_o_sistema/public
VITE_DB_HOST=localhost
VITE_DB_USER=faturamento_user
VITE_DB_PASSWORD=sua_senha_segura
VITE_DB_NAME=faturamento
VITE_DB_PORT=3306
```

**IMPORTANTE:** O `VITE_API_URL` deve apontar para a pasta `public` do projeto no seu servidor web.

### 4. Implantação dos arquivos PHP

Os arquivos PHP na pasta `public/api` devem ser acessíveis via servidor web. Certifique-se que seu servidor web esteja configurado para servir esses arquivos corretamente.

### 5. Verificação da Conexão

Após configurar, você pode verificar se a conexão está funcionando através do indicador de status do banco de dados na barra de navegação do sistema.

## Estrutura do Banco de Dados

O sistema utiliza as seguintes tabelas:

- `clients` - Cadastro de clientes
- `contracts` - Contratos vinculados a clientes
- `invoices` - Faturas geradas a partir de contratos
- `invoice_items` - Itens individuais de cada fatura

## Solução de Problemas

Se você encontrar problemas de conexão com o banco de dados:

1. Verifique se o servidor MySQL está em execução
2. Confirme se as credenciais no arquivo `.env` estão corretas
3. Certifique-se que o `VITE_API_URL` está apontando para o local correto
4. Verifique os logs de erro no arquivo `/public/api/api_log.txt`
