# Usar imagem oficial do Node.js
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production && npm cache clean --force

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copiar código da aplicação
COPY --chown=nodejs:nodejs . .

# Criar diretório para banco de dados
RUN mkdir -p /app/data && chown nodejs:nodejs /app/data

# Mudar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 3000

# Definir variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Comando de inicialização
CMD ["npm", "start"] 