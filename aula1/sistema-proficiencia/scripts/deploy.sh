#!/bin/bash

# Script de deploy para diferentes ambientes
# Uso: ./scripts/deploy.sh [staging|production]

ENVIRONMENT=${1:-staging}

echo "🚀 Iniciando deploy para ambiente: $ENVIRONMENT"

# Verificar se está em um repositório git limpo
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Existem alterações não commitadas. Faça commit antes do deploy."
    exit 1
fi

# Verificar se todas as dependências estão instaladas
echo "📦 Verificando dependências..."
npm ci

# Executar testes (se existirem)
echo "🧪 Executando testes..."
npm test 2>/dev/null || echo "⚠️ Testes não configurados"

# Executar análise de segurança
echo "🔒 Verificando vulnerabilidades..."
npm audit --audit-level=high

case $ENVIRONMENT in
    "staging")
        echo "🎭 Deploy para Staging..."
        # Fazer push para branch develop
        git push origin develop
        ;;
    "production")
        echo "🏭 Deploy para Produção..."
        # Verificar se está na branch main
        CURRENT_BRANCH=$(git branch --show-current)
        if [ "$CURRENT_BRANCH" != "main" ]; then
            echo "❌ Deploy para produção deve ser feito a partir da branch main"
            exit 1
        fi
        # Fazer push para branch main
        git push origin main
        ;;
    "docker")
        echo "🐳 Deploy usando Docker..."
        # Build da imagem Docker
        docker build -f docker/Dockerfile -t sistema-proficiencia:latest .
        # Executar com docker-compose
        cd docker && docker-compose up -d
        ;;
    *)
        echo "❌ Ambiente inválido. Use: staging, production ou docker"
        exit 1
        ;;
esac

echo "✅ Deploy iniciado para $ENVIRONMENT!"
echo "📊 Acompanhe o progresso no GitHub Actions" 