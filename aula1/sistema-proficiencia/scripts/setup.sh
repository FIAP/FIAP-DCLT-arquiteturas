#!/bin/bash

echo "🚀 Configurando ambiente de desenvolvimento..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js 18+"
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js versão 18+ é necessária. Versão atual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) encontrado"

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cat > .env << EOF
NODE_ENV=development
PORT=3001
JWT_SECRET=seu_jwt_secret_aqui
SESSION_SECRET=seu_session_secret_aqui
EOF
    echo "✅ Arquivo .env criado. Configure as variáveis conforme necessário."
fi

# Inicializar banco de dados
echo "🗄️ Inicializando banco de dados..."
node -e "const initDb = require('./src/database/init'); initDb();"

echo "✅ Setup concluído!"
echo ""
echo "Para iniciar o servidor:"
echo "  npm start"
echo ""
echo "Para desenvolvimento com auto-reload:"
echo "  npm run dev" 