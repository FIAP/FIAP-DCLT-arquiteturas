#!/bin/bash

# Script para iniciar todos os microservices do Sistema de Investimentos
# Autor: Sistema Investimentos
# Versão: 1.0.0

echo "🚀 Iniciando Sistema de Investimentos - Microservices"
echo "=================================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Função para verificar se o Node.js está instalado
check_node() {
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js não está instalado. Por favor, instale o Node.js primeiro.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Node.js encontrado: $(node --version)${NC}"
}

# Função para verificar se o npm está instalado
check_npm() {
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm não está instalado. Por favor, instale o npm primeiro.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ npm encontrado: $(npm --version)${NC}"
}

# Função para instalar dependências de um serviço
install_dependencies() {
    local service_name=$1
    local service_path=$2
    
    echo -e "${YELLOW}📦 Instalando dependências para ${service_name}...${NC}"
    cd "$service_path"
    
    if [ ! -d "node_modules" ]; then
        npm install
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Dependências instaladas para ${service_name}${NC}"
        else
            echo -e "${RED}❌ Erro ao instalar dependências para ${service_name}${NC}"
            return 1
        fi
    else
        echo -e "${CYAN}ℹ️  Dependências já instaladas para ${service_name}${NC}"
    fi
    
    cd - > /dev/null
}

# Função para iniciar um serviço em background
start_service() {
    local service_name=$1
    local service_path=$2
    local port=$3
    local color=$4
    
    echo -e "${color}🔄 Iniciando ${service_name} na porta ${port}...${NC}"
    cd "$service_path"
    
    # Criar arquivo de log
    mkdir -p ../logs
    local log_file="../logs/${service_name}.log"
    
    # Iniciar serviço em background
    npm run dev > "$log_file" 2>&1 &
    local pid=$!
    
    # Salvar PID para poder parar depois
    echo $pid > "../logs/${service_name}.pid"
    
    echo -e "${GREEN}✅ ${service_name} iniciado (PID: $pid)${NC}"
    echo -e "${CYAN}📋 Log: $log_file${NC}"
    
    cd - > /dev/null
    
    # Aguardar um pouco para o serviço inicializar
    sleep 2
}

# Função para verificar se uma porta está em uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}⚠️  Porta $port já está em uso${NC}"
        return 1
    fi
    return 0
}

# Função para parar todos os serviços
stop_all_services() {
    echo -e "${YELLOW}🛑 Parando todos os serviços...${NC}"
    
    if [ -d "logs" ]; then
        for pid_file in logs/*.pid; do
            if [ -f "$pid_file" ]; then
                local pid=$(cat "$pid_file")
                local service_name=$(basename "$pid_file" .pid)
                
                if kill -0 $pid 2>/dev/null; then
                    echo -e "${YELLOW}🛑 Parando ${service_name} (PID: $pid)...${NC}"
                    kill $pid
                    rm "$pid_file"
                else
                    echo -e "${CYAN}ℹ️  ${service_name} já estava parado${NC}"
                    rm "$pid_file"
                fi
            fi
        done
    fi
    
    echo -e "${GREEN}✅ Todos os serviços foram parados${NC}"
}

# Função para mostrar status dos serviços
show_status() {
    echo -e "${BLUE}📊 Status dos Serviços:${NC}"
    echo "========================"
    
    local services=(
        "identity-service:3001"
        "asset-service:3002"
        "portfolio-service:3003"
        "transaction-service:3004"
        "financial-service:3005"
        "api-gateway:3000"
    )
    
    for service_port in "${services[@]}"; do
        local service_name=$(echo $service_port | cut -d: -f1)
        local port=$(echo $service_port | cut -d: -f2)
        
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
            echo -e "${GREEN}✅ ${service_name} - Rodando na porta ${port}${NC}"
        else
            echo -e "${RED}❌ ${service_name} - Não está rodando na porta ${port}${NC}"
        fi
    done
    
    echo ""
    echo -e "${CYAN}🌐 URLs dos Serviços:${NC}"
    echo "  • API Gateway: http://localhost:3000"
    echo "  • Identity Service: http://localhost:3001"
    echo "  • Asset Service: http://localhost:3002"
    echo "  • Portfolio Service: http://localhost:3003"
    echo "  • Transaction Service: http://localhost:3004"
    echo "  • Financial Service: http://localhost:3005"
    echo ""
    echo -e "${PURPLE}📚 Documentação: http://localhost:3000/api-docs${NC}"
    echo -e "${PURPLE}📊 Status Geral: http://localhost:3000/services/status${NC}"
}

# Função principal
main() {
    # Verificar argumentos
    case "$1" in
        "start")
            echo -e "${BLUE}🚀 Iniciando todos os microservices...${NC}"
            ;;
        "stop")
            stop_all_services
            exit 0
            ;;
        "status")
            show_status
            exit 0
            ;;
        "restart")
            echo -e "${YELLOW}🔄 Reiniciando todos os microservices...${NC}"
            stop_all_services
            sleep 3
            ;;
        *)
            echo "Uso: $0 {start|stop|status|restart}"
            echo ""
            echo "Comandos:"
            echo "  start   - Inicia todos os microservices"
            echo "  stop    - Para todos os microservices"
            echo "  status  - Mostra status dos serviços"
            echo "  restart - Reinicia todos os microservices"
            exit 1
            ;;
    esac
    
    # Verificar pré-requisitos
    echo -e "${BLUE}🔍 Verificando pré-requisitos...${NC}"
    check_node
    check_npm
    
    # Criar diretório de logs
    mkdir -p logs
    
    # Verificar se estamos no diretório correto
    if [ ! -d "identity-service" ] || [ ! -d "api-gateway" ]; then
        echo -e "${RED}❌ Execute este script do diretório microservices${NC}"
        exit 1
    fi
    
    # Instalar dependências para todos os serviços
    echo -e "${BLUE}📦 Instalando dependências...${NC}"
    install_dependencies "Identity Service" "identity-service" || exit 1
    install_dependencies "Asset Service" "asset-service" || exit 1
    install_dependencies "Portfolio Service" "portfolio-service" || exit 1
    install_dependencies "Transaction Service" "transaction-service" || exit 1
    install_dependencies "Financial Service" "financial-service" || exit 1
    install_dependencies "API Gateway" "api-gateway" || exit 1
    
    echo ""
    echo -e "${BLUE}🚀 Iniciando serviços...${NC}"
    
    # Iniciar serviços na ordem correta (dependências primeiro)
    start_service "identity-service" "identity-service" "3001" "$GREEN"
    start_service "asset-service" "asset-service" "3002" "$YELLOW"
    start_service "portfolio-service" "portfolio-service" "3003" "$BLUE"
    start_service "transaction-service" "transaction-service" "3004" "$PURPLE"
    start_service "financial-service" "financial-service" "3005" "$CYAN"
    
    # Aguardar um pouco mais para os serviços estabilizarem
    echo -e "${YELLOW}⏳ Aguardando serviços estabilizarem...${NC}"
    sleep 5
    
    # Iniciar API Gateway por último
    start_service "api-gateway" "api-gateway" "3000" "$RED"
    
    echo ""
    echo -e "${GREEN}🎉 Todos os microservices foram iniciados!${NC}"
    echo ""
    
    # Aguardar mais um pouco e mostrar status
    sleep 3
    show_status
    
    echo ""
    echo -e "${YELLOW}💡 Dicas:${NC}"
    echo "  • Use 'tail -f logs/[service-name].log' para ver logs em tempo real"
    echo "  • Use '$0 stop' para parar todos os serviços"
    echo "  • Use '$0 status' para verificar o status"
    echo "  • Use Ctrl+C para sair (serviços continuarão rodando)"
    echo ""
    echo -e "${GREEN}✨ Sistema pronto para uso!${NC}"
}

# Capturar Ctrl+C para limpeza
trap 'echo -e "\n${YELLOW}👋 Script finalizado. Serviços continuam rodando.${NC}"; exit 0' INT

# Executar função principal
main "$@" 