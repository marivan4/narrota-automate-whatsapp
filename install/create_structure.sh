
#!/bin/bash
#
# Script para criar a estrutura de diretórios do Sistema de Faturamento
# Autor: Sistema de Faturamento
# Data: 07/04/2025
#

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

# Verifica se está rodando como root
if [ "$EUID" -ne 0 ]; then
  log "WARN" "Este script não está sendo executado como root."
  echo -e "${YELLOW}Algumas operações podem falhar sem privilégios de root.${NC}"
  read -p "Deseja continuar mesmo assim? (s/n): " continue_anyway
  if [ "$continue_anyway" != "s" ]; then
    log "INFO" "Criação de estrutura cancelada pelo usuário."
    exit 1
  fi
fi

# Definir diretório de instalação
read -p "Digite o caminho para instalação (padrão: /var/www/html/faturamento): " INSTALL_DIR
INSTALL_DIR=${INSTALL_DIR:-/var/www/html/faturamento}

# Confirmação
echo -e "${YELLOW}Você escolheu instalar em: ${INSTALL_DIR}${NC}"
read -p "Confirma? (s/n): " confirm
if [ "$confirm" != "s" ]; then
  log "INFO" "Operação cancelada pelo usuário."
  exit 1
fi

# Criar diretórios principais
log "INFO" "Criando estrutura de diretórios principal..."
mkdir -p "${INSTALL_DIR}"
mkdir -p "${INSTALL_DIR}/src"
mkdir -p "${INSTALL_DIR}/public"
mkdir -p "${INSTALL_DIR}/dist"
mkdir -p "${INSTALL_DIR}/docs"
mkdir -p "${INSTALL_DIR}/install"
mkdir -p "${INSTALL_DIR}/logs"
mkdir -p "${INSTALL_DIR}/tmp"
mkdir -p "${INSTALL_DIR}/backups"

# Criar estrutura dentro de src
log "INFO" "Criando estrutura de código-fonte..."
mkdir -p "${INSTALL_DIR}/src/components"
mkdir -p "${INSTALL_DIR}/src/components/layout"
mkdir -p "${INSTALL_DIR}/src/components/shared"
mkdir -p "${INSTALL_DIR}/src/components/ui"
mkdir -p "${INSTALL_DIR}/src/contexts"
mkdir -p "${INSTALL_DIR}/src/hooks"
mkdir -p "${INSTALL_DIR}/src/pages"
mkdir -p "${INSTALL_DIR}/src/types"
mkdir -p "${INSTALL_DIR}/src/utils"
mkdir -p "${INSTALL_DIR}/src/assets/img"
mkdir -p "${INSTALL_DIR}/src/assets/css"
mkdir -p "${INSTALL_DIR}/src/routes"
mkdir -p "${INSTALL_DIR}/src/database"
mkdir -p "${INSTALL_DIR}/src/services"

# Criar estrutura dentro de public
log "INFO" "Criando estrutura pública..."
mkdir -p "${INSTALL_DIR}/public/api"
mkdir -p "${INSTALL_DIR}/public/assets/img"
mkdir -p "${INSTALL_DIR}/public/assets/css"
mkdir -p "${INSTALL_DIR}/public/assets/js"
mkdir -p "${INSTALL_DIR}/public/storage"
mkdir -p "${INSTALL_DIR}/public/storage/uploads"
mkdir -p "${INSTALL_DIR}/public/storage/invoices"
mkdir -p "${INSTALL_DIR}/public/storage/contracts"
mkdir -p "${INSTALL_DIR}/public/storage/checklists"
mkdir -p "${INSTALL_DIR}/public/storage/profiles"

# Criar diretórios para o banco de dados
log "INFO" "Criando estrutura para banco de dados..."
mkdir -p "${INSTALL_DIR}/src/database/migrations"
mkdir -p "${INSTALL_DIR}/src/database/seeds"
mkdir -p "${INSTALL_DIR}/src/database/models"

# Configurar permissões
if [ "$EUID" -eq 0 ]; then
  log "INFO" "Configurando permissões..."
  chown -R www-data:www-data "${INSTALL_DIR}"
  chmod -R 755 "${INSTALL_DIR}"
  
  # Diretórios que precisam de permissão de escrita
  chmod -R 775 "${INSTALL_DIR}/logs"
  chmod -R 775 "${INSTALL_DIR}/tmp"
  chmod -R 775 "${INSTALL_DIR}/backups"
  chmod -R 775 "${INSTALL_DIR}/public/storage"
  
  log "INFO" "Permissões configuradas com sucesso!"
else
  log "WARN" "Pulando a configuração de permissões (requer privilégios de root)."
  log "WARN" "Execute o seguinte comando manualmente para configurar permissões:"
  echo -e "${YELLOW}sudo chown -R www-data:www-data ${INSTALL_DIR}${NC}"
  echo -e "${YELLOW}sudo chmod -R 755 ${INSTALL_DIR}${NC}"
  echo -e "${YELLOW}sudo chmod -R 775 ${INSTALL_DIR}/logs ${INSTALL_DIR}/tmp ${INSTALL_DIR}/backups ${INSTALL_DIR}/public/storage${NC}"
fi

# Criar arquivo .env.example
log "INFO" "Criando arquivo .env.example..."
cat > "${INSTALL_DIR}/.env.example" << EOL
# Configurações do Sistema de Faturamento
# ATENÇÃO: Copie este arquivo para .env e atualize os valores conforme seu ambiente

# API Configuration
VITE_API_URL=http://localhost

# Database Configuration
VITE_DB_HOST=localhost
VITE_DB_USER=faturamento_user
VITE_DB_PASSWORD=senha_segura
VITE_DB_NAME=faturamento
VITE_DB_PORT=3306

# WhatsApp Integration
VITE_WHATSAPP_API_URL=https://evolutionapi.gpstracker-16.com.br
VITE_WHATSAPP_API_KEY=

# Asaas Integration
VITE_ASAAS_API_URL=https://api.asaas.com
VITE_ASAAS_API_KEY=
VITE_ASAAS_MODE=sandbox
EOL

# Criar arquivo README.md básico
log "INFO" "Criando arquivo README.md básico..."
cat > "${INSTALL_DIR}/README.md" << EOL
# Sistema de Faturamento

Sistema para gerenciamento de faturas, contratos, clientes e veículos com integração WhatsApp e Asaas.

## Requisitos

- PHP 8.1 ou superior
- MySQL 8.0 ou superior
- Apache/Nginx
- Node.js 16.x ou superior (para desenvolvimento)

## Instalação

Siga as instruções detalhadas em \`docs/MANUAL_INSTALACAO_DETALHADO.md\`.

## Documentação

- \`docs/MANUAL_BANCO_DADOS.md\` - Documentação do banco de dados
- \`docs/INSTALACAO.md\` - Manual de instalação resumido
- \`docs/MANUAL_INSTALACAO_DETALHADO.md\` - Manual de instalação detalhado

## Licença

Proprietária - Todos os direitos reservados.
EOL

# Resumo
echo -e "${BLUE}======================================================${NC}"
echo -e "${GREEN}ESTRUTURA DE DIRETÓRIOS CRIADA COM SUCESSO!${NC}"
echo -e "${BLUE}======================================================${NC}"
echo ""
echo -e "Diretório de instalação: ${YELLOW}${INSTALL_DIR}${NC}"
echo -e "Total de diretórios criados: ${YELLOW}$(find ${INSTALL_DIR} -type d | wc -l)${NC}"
echo ""
echo -e "${YELLOW}PRÓXIMOS PASSOS:${NC}"
echo -e "1. Execute o script ${GREEN}install/setup.sh${NC} para completar a instalação"
echo -e "2. Configure o arquivo ${GREEN}.env${NC} a partir do exemplo ${GREEN}.env.example${NC}"
echo -e "3. Crie o banco de dados utilizando o script em ${GREEN}src/database/schema.sql${NC}"
echo ""
echo -e "${BLUE}======================================================${NC}"

exit 0
