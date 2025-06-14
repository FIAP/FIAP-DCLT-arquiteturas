# 🚀 Guia de Execução - Microservices

## Pré-requisitos

### Para Execução Local:
- **Node.js** (versão 16 ou superior)
- **npm** (versão 8 ou superior)
- **Git** (para clonar o repositório)

### Para Execução com Docker:
- **Docker** (versão 20 ou superior)
- **Docker Compose** (versão 2 ou superior)

## 📋 Passo a Passo - Execução Local

### 1. Navegar para o diretório dos microservices
```bash
cd microservices
```

### 2. Dar permissão de execução ao script
```bash
chmod +x start-all-services.sh
```

### 3. Executar o script de inicialização
```bash
./start-all-services.sh start
```

### 4. Verificar status dos serviços
```bash
./start-all-services.sh status
```

### 5. Acessar o sistema
- **API Gateway**: http://localhost:3000
- **Documentação**: http://localhost:3000/api-docs
- **Status Geral**: http://localhost:3000/services/status

### 6. Parar todos os serviços
```bash
./start-all-services.sh stop
```

## 🐳 Passo a Passo - Execução com Docker

### 1. Navegar para o diretório dos microservices
```bash
cd microservices
```

### 2. Dar permissão de execução ao script
```bash
chmod +x start-docker.sh
```

### 3. Iniciar com Docker Compose
```bash
./start-docker.sh start
```

### 4. Verificar status dos containers
```bash
./start-docker.sh status
```

### 5. Acessar o sistema
- **API Gateway**: http://localhost:3000
- **Documentação**: http://localhost:3000/api-docs
- **Status Geral**: http://localhost:3000/services/status

### 6. Parar todos os containers
```bash
./start-docker.sh stop
```

## 🔧 Comandos Disponíveis

### Script Local (`start-all-services.sh`)
```bash
# Iniciar todos os serviços
./start-all-services.sh start

# Parar todos os serviços
./start-all-services.sh stop

# Verificar status
./start-all-services.sh status

# Reiniciar todos os serviços
./start-all-services.sh restart
```

### Script Docker (`start-docker.sh`)
```bash
# Iniciar containers
./start-docker.sh start

# Parar containers
./start-docker.sh stop

# Verificar status
./start-docker.sh status

# Ver logs
./start-docker.sh logs

# Ver logs de um serviço específico
./start-docker.sh logs identity-service

# Reconstruir imagens
./start-docker.sh build

# Abrir shell em um container
./start-docker.sh shell api-gateway

# Limpeza completa
./start-docker.sh cleanup
```

## 📊 Monitoramento

### URLs de Health Check:
- **API Gateway**: http://localhost:3000/health
- **Identity Service**: http://localhost:3001/health
- **Asset Service**: http://localhost:3002/health
- **Portfolio Service**: http://localhost:3003/health
- **Transaction Service**: http://localhost:3004/health
- **Financial Service**: http://localhost:3005/health

### Status Consolidado:
- **Todos os serviços**: http://localhost:3000/services/status

### Logs (Execução Local):
```bash
# Ver logs em tempo real
tail -f microservices/logs/identity-service.log
tail -f microservices/logs/api-gateway.log

# Ver todos os logs
ls microservices/logs/
```

## 🛠️ Execução Manual (Alternativa)

Se preferir executar manualmente cada serviço:

### 1. Identity Service
```bash
cd identity-service
npm install
npm run dev
# Rodará na porta 3001
```

### 2. Asset Service
```bash
cd asset-service
npm install
npm run dev
# Rodará na porta 3002
```

### 3. Portfolio Service
```bash
cd portfolio-service
npm install
npm run dev
# Rodará na porta 3003
```

### 4. Transaction Service
```bash
cd transaction-service
npm install
npm run dev
# Rodará na porta 3004
```

### 5. Financial Service
```bash
cd financial-service
npm install
npm run dev
# Rodará na porta 3005
```

### 6. API Gateway
```bash
cd api-gateway
npm install
npm run dev
# Rodará na porta 3000
```

## 🔍 Verificação de Funcionamento

### 1. Teste básico do API Gateway
```bash
curl http://localhost:3000/health
```

### 2. Teste de status de todos os serviços
```bash
curl http://localhost:3000/services/status
```

### 3. Teste de documentação
Acesse: http://localhost:3000/api-docs

### 4. Teste de um endpoint específico
```bash
# Listar ativos (exemplo)
curl http://localhost:3000/api/assets
```

## ⚠️ Solução de Problemas

### Problema: Porta já em uso
```bash
# Verificar qual processo está usando a porta
lsof -i :3000

# Matar processo se necessário
kill -9 <PID>
```

### Problema: Dependências não instaladas
```bash
# Instalar dependências manualmente
cd [service-directory]
npm install
```

### Problema: Serviço não responde
```bash
# Verificar logs
tail -f logs/[service-name].log

# Ou para Docker
./start-docker.sh logs [service-name]
```

### Problema: Docker não inicia
```bash
# Verificar se Docker está rodando
docker info

# Verificar se há conflitos de porta
docker ps -a

# Limpar containers antigos
docker-compose down
docker system prune -f
```

## 📈 Próximos Passos

Após ter o sistema rodando:

1. **Teste a API**: Use a documentação Swagger em http://localhost:3000/api-docs
2. **Monitore os logs**: Acompanhe os logs para verificar o comportamento
3. **Teste endpoints**: Faça chamadas para diferentes endpoints
4. **Verifique performance**: Monitore o uso de recursos
5. **Implemente bancos de dados**: Próximo passo da arquitetura

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs dos serviços
2. Confirme que todas as portas estão livres
3. Verifique se Node.js/Docker estão instalados corretamente
4. Consulte a documentação de cada serviço
5. Verifique o status de todos os serviços

---

**Dica**: Use sempre os scripts automatizados para facilitar o gerenciamento dos microservices! 