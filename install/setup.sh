
#!/bin/bash

# Script de configuração para o Sistema de Faturamento
# Este script cria a estrutura de diretórios necessária e configura
# permissões para o sistema funcionar corretamente.

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para exibir mensagens com timestamp
log() {
  local level=$1
  local message=$2
  local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
  
  case $level in
    "INFO")
      echo -e "${GREEN}[INFO]${NC} ${timestamp} - ${message}"
      ;;
    "WARN")
      echo -e "${YELLOW}[WARN]${NC} ${timestamp} - ${message}"
      ;;
    "ERROR")
      echo -e "${RED}[ERROR]${NC} ${timestamp} - ${message}"
      ;;
    *)
      echo -e "${BLUE}[DEBUG]${NC} ${timestamp} - ${message}"
      ;;
  esac
}

# Função para verificar se um comando existe
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Função para criar diretórios
create_directory() {
  local dir=$1
  if [ ! -d "$dir" ]; then
    mkdir -p "$dir"
    log "INFO" "Diretório criado: $dir"
  else
    log "WARN" "Diretório já existe: $dir"
  fi
}

# Exibir cabeçalho
echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}     INSTALAÇÃO DO SISTEMA DE FATURAMENTO v1.0        ${NC}"
echo -e "${BLUE}======================================================${NC}"
echo ""
log "INFO" "Iniciando processo de instalação..."

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
  log "WARN" "Este script não está sendo executado como root."
  echo -e "${YELLOW}Algumas operações podem falhar sem privilégios de root.${NC}"
  echo -e "Execute com ${GREEN}sudo $0${NC} para funcionalidade completa."
  read -p "Deseja continuar mesmo assim? (s/n): " continue_anyway
  if [ "$continue_anyway" != "s" ]; then
    log "INFO" "Instalação cancelada pelo usuário."
    exit 1
  fi
fi

# Verificar dependências
log "INFO" "Verificando dependências..."
DEPENDENCIES=("php" "mysql" "apache2" "composer")
MISSING_DEPS=0

for dep in "${DEPENDENCIES[@]}"; do
  if command_exists $dep; then
    log "INFO" "$dep está instalado."
  else
    log "ERROR" "$dep não está instalado!"
    MISSING_DEPS=$((MISSING_DEPS+1))
  fi
done

if [ $MISSING_DEPS -gt 0 ]; then
  log "WARN" "Existem $MISSING_DEPS dependências faltando."
  echo -e "Execute: ${GREEN}sudo apt update && sudo apt install php mysql-server apache2 composer${NC}"
  read -p "Deseja continuar mesmo assim? (s/n): " continue_deps
  if [ "$continue_deps" != "s" ]; then
    log "INFO" "Instalação cancelada pelo usuário."
    exit 1
  fi
fi

# Definir diretório base
read -p "Digite o caminho para instalação (padrão: /var/www/html/faturamento): " INSTALL_DIR
INSTALL_DIR=${INSTALL_DIR:-/var/www/html/faturamento}

# Criar estrutura de diretórios
log "INFO" "Criando estrutura de diretórios em $INSTALL_DIR..."
create_directory "$INSTALL_DIR"
create_directory "$INSTALL_DIR/src"
create_directory "$INSTALL_DIR/public"
create_directory "$INSTALL_DIR/public/api"
create_directory "$INSTALL_DIR/public/assets"
create_directory "$INSTALL_DIR/public/assets/img"
create_directory "$INSTALL_DIR/public/assets/js"
create_directory "$INSTALL_DIR/public/assets/css"
create_directory "$INSTALL_DIR/dist"
create_directory "$INSTALL_DIR/logs"
create_directory "$INSTALL_DIR/tmp"
create_directory "$INSTALL_DIR/backups"
create_directory "$INSTALL_DIR/docs"

# Configurar permissões
log "INFO" "Configurando permissões..."
if [ "$EUID" -eq 0 ]; then
  # Se estiver rodando como root
  chown -R www-data:www-data "$INSTALL_DIR"
  chmod -R 755 "$INSTALL_DIR"
  chmod -R 777 "$INSTALL_DIR/logs"
  chmod -R 777 "$INSTALL_DIR/tmp"
  chmod -R 777 "$INSTALL_DIR/backups"
  log "INFO" "Permissões configuradas com sucesso."
else
  log "WARN" "Não foi possível configurar permissões (necessário privilégios de root)."
fi

# Criar arquivo de configuração para banco de dados
CONFIG_FILE="$INSTALL_DIR/.env"
log "INFO" "Criando arquivo de configuração em $CONFIG_FILE..."

if [ -f "$CONFIG_FILE" ]; then
  log "WARN" "Arquivo de configuração já existe. Sobrescrever? (s/n): "
  read overwrite_config
  if [ "$overwrite_config" != "s" ]; then
    log "INFO" "Mantendo arquivo de configuração existente."
  else
    create_config=true
  fi
else
  create_config=true
fi

if [ "$create_config" = true ]; then
  echo "# Configuração do Sistema de Faturamento" > "$CONFIG_FILE"
  echo "# Criado em $(date)" >> "$CONFIG_FILE"
  echo "" >> "$CONFIG_FILE"
  echo "# API Configuration" >> "$CONFIG_FILE"
  echo "VITE_API_URL=http://localhost" >> "$CONFIG_FILE"
  echo "" >> "$CONFIG_FILE"
  echo "# Database Configuration" >> "$CONFIG_FILE"
  echo "VITE_DB_HOST=localhost" >> "$CONFIG_FILE"
  echo "VITE_DB_USER=faturamento_user" >> "$CONFIG_FILE"
  echo "VITE_DB_PASSWORD=senha_segura" >> "$CONFIG_FILE"
  echo "VITE_DB_NAME=faturamento" >> "$CONFIG_FILE"
  echo "VITE_DB_PORT=3306" >> "$CONFIG_FILE"
  echo "" >> "$CONFIG_FILE"
  echo "# WhatsApp Integration" >> "$CONFIG_FILE"
  echo "VITE_WHATSAPP_API_URL=https://evolutionapi.gpstracker-16.com.br" >> "$CONFIG_FILE"
  echo "VITE_WHATSAPP_API_KEY=" >> "$CONFIG_FILE"
  
  log "INFO" "Arquivo de configuração criado com sucesso."
  log "WARN" "IMPORTANTE: Edite o arquivo $CONFIG_FILE e configure os parâmetros corretos de conexão."
fi

# Criar script de inicialização do banco de dados
DB_SCRIPT="$INSTALL_DIR/install-database.sh"
log "INFO" "Criando script de inicialização do banco de dados em $DB_SCRIPT..."

cat > "$DB_SCRIPT" << 'EOL'
#!/bin/bash

# Script para inicialização do banco de dados
# Execute este script para criar o banco de dados e as tabelas necessárias

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Carregar configurações do arquivo .env
if [ -f .env ]; then
  source <(grep -v '^#' .env | sed -E 's/^([^=]+)=(.*)$/export \1="\2"/g')
  echo -e "${GREEN}Configurações carregadas do arquivo .env${NC}"
else
  echo -e "${RED}Arquivo .env não encontrado!${NC}"
  echo -e "Crie o arquivo .env com as configurações de conexão ao banco de dados."
  exit 1
fi

# Solicitar senha do MySQL se não estiver no .env
if [ -z "$VITE_DB_PASSWORD" ]; then
  read -sp "Digite a senha do usuário MySQL: " MYSQL_PASSWORD
  echo ""
else
  MYSQL_PASSWORD="$VITE_DB_PASSWORD"
fi

# Confirmar antes de prosseguir
echo -e "${YELLOW}ATENÇÃO: Este script irá criar o banco de dados '$VITE_DB_NAME' e todas as tabelas necessárias.${NC}"
echo -e "${YELLOW}Qualquer banco de dados existente com o mesmo nome será excluído.${NC}"
read -p "Deseja continuar? (s/n): " CONTINUE
if [ "$CONTINUE" != "s" ]; then
  echo -e "${RED}Operação cancelada pelo usuário.${NC}"
  exit 1
fi

# Criar banco de dados e usuário
echo -e "${BLUE}Criando banco de dados e usuário...${NC}"

mysql -u root -p << EOF
CREATE DATABASE IF NOT EXISTS $VITE_DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$VITE_DB_USER'@'localhost' IDENTIFIED BY '$MYSQL_PASSWORD';
GRANT ALL PRIVILEGES ON $VITE_DB_NAME.* TO '$VITE_DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF

if [ $? -eq 0 ]; then
  echo -e "${GREEN}Banco de dados e usuário criados com sucesso!${NC}"
else
  echo -e "${RED}Erro ao criar banco de dados e usuário.${NC}"
  exit 1
fi

# Importar esquema do banco de dados
echo -e "${BLUE}Importando esquema do banco de dados...${NC}"
cat src/database/schema.sql | mysql -u $VITE_DB_USER -p$MYSQL_PASSWORD $VITE_DB_NAME

if [ $? -eq 0 ]; then
  echo -e "${GREEN}Esquema do banco de dados importado com sucesso!${NC}"
else
  echo -e "${RED}Erro ao importar esquema do banco de dados.${NC}"
  exit 1
fi

echo -e "${GREEN}Inicialização do banco de dados concluída com sucesso!${NC}"
echo -e "Você pode acessar o sistema com as seguintes credenciais padrão:"
echo -e "- Email: ${YELLOW}admin@example.com${NC}"
echo -e "- Senha: ${YELLOW}admin123${NC}"
echo -e "${RED}IMPORTANTE: Altere a senha padrão após o primeiro login!${NC}"
EOL

chmod +x "$DB_SCRIPT"
log "INFO" "Script de inicialização do banco de dados criado com sucesso."

# Resumo da instalação
echo -e "${BLUE}======================================================${NC}"
echo -e "${GREEN}INSTALAÇÃO CONCLUÍDA COM SUCESSO!${NC}"
echo -e "${BLUE}======================================================${NC}"
echo ""
echo -e "Diretório de instalação: ${YELLOW}$INSTALL_DIR${NC}"
echo -e "Arquivo de configuração: ${YELLOW}$CONFIG_FILE${NC}"
echo -e "Script de banco de dados: ${YELLOW}$DB_SCRIPT${NC}"
echo ""
echo -e "${YELLOW}PRÓXIMOS PASSOS:${NC}"
echo -e "1. Edite o arquivo ${GREEN}.env${NC} com as configurações corretas"
echo -e "2. Execute ${GREEN}./install-database.sh${NC} para criar o banco de dados"
echo -e "3. Configure o servidor web para apontar para ${GREEN}$INSTALL_DIR/dist${NC}"
echo -e "4. Acesse o sistema e altere a senha padrão"
echo ""
echo -e "${BLUE}Obrigado por instalar o Sistema de Faturamento!${NC}"
echo -e "${BLUE}======================================================${NC}"

exit 0
