#!/bin/bash

# Script para gerenciar microservices com Docker Compose
# Autor: Sistema Investimentos
# Versão: 1.0.0

echo "🐳 Sistema de Investimentos - Docker Compose"
echo "============================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Função para verificar se o Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker não está instalado. Por favor, instale o Docker primeiro.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Docker encontrado: $(docker --version)${NC}"
}

# Função para verificar se o Docker Compose está instalado
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Docker Compose encontrado: $(docker-compose --version)${NC}"
}

# Função para verificar se o Docker está rodando
check_docker_running() {
    if ! docker info &> /dev/null; then
        echo -e "${RED}❌ Docker não está rodando. Por favor, inicie o Docker primeiro.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Docker está rodando${NC}"
}

# Função para criar Dockerfiles se não existirem
create_dockerfiles() {
    local services=("identity-service" "asset-service" "portfolio-service" "transaction-service" "financial-service" "api-gateway")
    
    for service in "${services[@]}"; do
        if [ ! -f "$service/Dockerfile" ]; then
            echo -e "${YELLOW}📝 Criando Dockerfile para $service...${NC}"
            cat > "$service/Dockerfile" << EOF
FROM node:18-alpine

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY src/ ./src/

# Expor porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
EOF
            echo -e "${GREEN}✅ Dockerfile criado para $service${NC}"
        fi
    done
}

# Função para mostrar status dos containers
show_status() {
    echo -e "${BLUE}📊 Status dos Containers:${NC}"
    echo "=========================="
    
    docker-compose ps
    
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

# Função para mostrar logs
show_logs() {
    local service=$1
    
    if [ -z "$service" ]; then
        echo -e "${BLUE}📋 Logs de todos os serviços:${NC}"
        docker-compose logs -f
    else
        echo -e "${BLUE}📋 Logs do $service:${NC}"
        docker-compose logs -f "$service"
    fi
}

# Função para limpar recursos
cleanup() {
    echo -e "${YELLOW}🧹 Limpando recursos Docker...${NC}"
    
    # Parar e remover containers
    docker-compose down
    
    # Remover imagens órfãs (opcional)
    read -p "Deseja remover imagens não utilizadas? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker image prune -f
        echo -e "${GREEN}✅ Imagens não utilizadas removidas${NC}"
    fi
    
    # Remover volumes órfãos (opcional)
    read -p "Deseja remover volumes não utilizados? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker volume prune -f
        echo -e "${GREEN}✅ Volumes não utilizados removidos${NC}"
    fi
    
    echo -e "${GREEN}✅ Limpeza concluída${NC}"
}

# Função principal
main() {
    case "$1" in
        "start"|"up")
            echo -e "${BLUE}🚀 Iniciando microservices com Docker...${NC}"
            
            # Verificar pré-requisitos
            check_docker
            check_docker_compose
            check_docker_running
            
            # Criar Dockerfiles se necessário
            create_dockerfiles
            
            # Verificar se estamos no diretório correto
            if [ ! -f "docker-compose.yml" ]; then
                echo -e "${RED}❌ Execute este script do diretório microservices${NC}"
                exit 1
            fi
            
            echo -e "${YELLOW}🔨 Construindo e iniciando containers...${NC}"
            docker-compose up --build -d
            
            if [ $? -eq 0 ]; then
                echo ""
                echo -e "${GREEN}🎉 Todos os microservices foram iniciados!${NC}"
                echo ""
                
                # Aguardar um pouco para os serviços estabilizarem
                echo -e "${YELLOW}⏳ Aguardando serviços estabilizarem...${NC}"
                sleep 10
                
                show_status
                
                echo ""
                echo -e "${YELLOW}💡 Dicas:${NC}"
                echo "  • Use '$0 logs [service]' para ver logs"
                echo "  • Use '$0 status' para verificar o status"
                echo "  • Use '$0 stop' para parar todos os serviços"
                echo "  • Use '$0 restart' para reiniciar"
                echo ""
                echo -e "${GREEN}✨ Sistema pronto para uso!${NC}"
            else
                echo -e "${RED}❌ Erro ao iniciar os containers${NC}"
                exit 1
            fi
            ;;
            
        "stop"|"down")
            echo -e "${YELLOW}🛑 Parando todos os containers...${NC}"
            docker-compose down
            echo -e "${GREEN}✅ Todos os containers foram parados${NC}"
            ;;
            
        "restart")
            echo -e "${YELLOW}🔄 Reiniciando todos os containers...${NC}"
            docker-compose restart
            echo -e "${GREEN}✅ Todos os containers foram reiniciados${NC}"
            ;;
            
        "status"|"ps")
            show_status
            ;;
            
        "logs")
            show_logs "$2"
            ;;
            
        "build")
            echo -e "${YELLOW}🔨 Reconstruindo imagens...${NC}"
            create_dockerfiles
            docker-compose build --no-cache
            echo -e "${GREEN}✅ Imagens reconstruídas${NC}"
            ;;
            
        "cleanup")
            cleanup
            ;;
            
        "shell")
            if [ -z "$2" ]; then
                echo -e "${RED}❌ Especifique o serviço: $0 shell [service-name]${NC}"
                exit 1
            fi
            echo -e "${BLUE}🐚 Abrindo shell no container $2...${NC}"
            docker-compose exec "$2" /bin/sh
            ;;
            
        *)
            echo "Uso: $0 {start|stop|restart|status|logs|build|cleanup|shell}"
            echo ""
            echo "Comandos:"
            echo "  start/up    - Inicia todos os containers"
            echo "  stop/down   - Para todos os containers"
            echo "  restart     - Reinicia todos os containers"
            echo "  status/ps   - Mostra status dos containers"
            echo "  logs [svc]  - Mostra logs (opcionalmente de um serviço específico)"
            echo "  build       - Reconstrói as imagens Docker"
            echo "  cleanup     - Remove containers, imagens e volumes não utilizados"
            echo "  shell <svc> - Abre shell em um container específico"
            echo ""
            echo "Exemplos:"
            echo "  $0 start                    # Inicia todos os serviços"
            echo "  $0 logs api-gateway         # Mostra logs do API Gateway"
            echo "  $0 shell identity-service   # Abre shell no Identity Service"
            exit 1
            ;;
    esac
}

# Capturar Ctrl+C
trap 'echo -e "\n${YELLOW}👋 Script finalizado.${NC}"; exit 0' INT

# Executar função principal
main "$@" 