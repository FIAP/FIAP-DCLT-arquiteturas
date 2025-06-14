FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /usr/src/app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar todas as dependências (produção e desenvolvimento)
RUN npm install

# Copiar código fonte
COPY . .

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Mudar ownership dos arquivos
RUN chown -R nextjs:nodejs /usr/src/app
USER nextjs

# Expor porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"] 