# Arquitetura de Microservices - Sistema de Investimentos

## Visão Geral

Este projeto implementa uma arquitetura de microservices baseada nos bounded contexts identificados através de Domain-Driven Design (DDD). O sistema foi refatorado de um monólito para microservices independentes.

## Arquitetura

### Microservices

| Serviço | Porta | Responsabilidade | Bounded Context |
|---------|-------|------------------|-----------------|
| **API Gateway** | 3000 | Roteamento e agregação | - |
| **Identity Service** | 3001 | Autenticação e usuários | Identity & Access Management |
| **Asset Service** | 3002 | Gestão de ativos | Asset Management |
| **Portfolio Service** | 3003 | Carteiras e posições | Portfolio Management |
| **Transaction Service** | 3004 | Processamento de transações | Transaction Processing |
| **Financial Service** | 3005 | Gestão financeira e P&L | Financial Context |

### Fluxo de Comunicação

```
Cliente → API Gateway → Microservices
```

## Estrutura dos Microservices

### 1. Identity Service (Porta 3001)
**Responsabilidades:**
- Autenticação JWT
- Gestão de usuários
- Controle de acesso
- Perfil de risco

**Endpoints:**
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `PUT /api/auth/change-password` - Alterar senha
- `GET /api/auth/validate` - Validar token
- `GET /api/users/profile` - Perfil do usuário

### 2. Asset Service (Porta 3002)
**Responsabilidades:**
- Catálogo de ativos
- Dados de mercado
- Classificação por setor
- Informações de preços

**Endpoints:**
- `GET /api/assets` - Listar ativos
- `GET /api/assets/:id` - Detalhes do ativo
- `GET /api/market-data/:symbol` - Dados de mercado
- `GET /api/assets/top-gainers` - Maiores altas
- `GET /api/assets/top-losers` - Maiores baixas

### 3. Portfolio Service (Porta 3003)
**Responsabilidades:**
- Gestão de carteiras
- Posições de ativos
- Cálculo de diversificação
- Performance da carteira

**Endpoints:**
- `GET /api/portfolios` - Carteira do usuário
- `GET /api/positions` - Posições detalhadas
- `GET /api/portfolios/diversification` - Análise de diversificação
- `GET /api/portfolios/performance` - Performance da carteira

### 4. Transaction Service (Porta 3004)
**Responsabilidades:**
- Processamento de ordens
- Execução de transações
- Cálculo de taxas
- Histórico de transações

**Endpoints:**
- `POST /api/orders/buy` - Ordem de compra
- `POST /api/orders/sell` - Ordem de venda
- `GET /api/transactions` - Histórico de transações
- `GET /api/transactions/statistics` - Estatísticas

### 5. Financial Service (Porta 3005)
**Responsabilidades:**
- Gestão de saldo
- Cálculos de P&L
- Controle de dividendos
- Relatórios financeiros

**Endpoints:**
- `GET /api/balance` - Saldo do usuário
- `GET /api/pnl` - Lucro e prejuízo
- `GET /api/dividends` - Histórico de dividendos
- `POST /api/balance/deposit` - Depósito

### 6. API Gateway (Porta 3000)
**Responsabilidades:**
- Roteamento de requisições
- Agregação de respostas
- Rate limiting
- Documentação centralizada

**Endpoints Especiais:**
- `GET /health` - Status do gateway
- `GET /services/status` - Status de todos os serviços
- `GET /api-docs` - Documentação Swagger

## Comunicação entre Serviços

### Padrões de Comunicação:
1. **Síncrona**: HTTP/REST entre serviços
2. **Service Discovery**: URLs configuráveis via variáveis de ambiente
3. **Circuit Breaker**: Implementação futura para resiliência
4. **Load Balancing**: Via API Gateway

### Dependências:
- **Portfolio Service** → Identity Service, Asset Service
- **Transaction Service** → Identity Service, Asset Service, Portfolio Service, Financial Service
- **Financial Service** → Identity Service

## Executando os Microservices

### Opção 1: Docker Compose (Recomendado)
```bash
cd microservices
docker-compose up --build
```

### Opção 2: Execução Individual
```bash
# Terminal 1 - Identity Service
cd microservices/identity-service
npm install
npm run dev

# Terminal 2 - Asset Service
cd microservices/asset-service
npm install
npm run dev

# Terminal 3 - Portfolio Service
cd microservices/portfolio-service
npm install
npm run dev

# Terminal 4 - Transaction Service
cd microservices/transaction-service
npm install
npm run dev

# Terminal 5 - Financial Service
cd microservices/financial-service
npm install
npm run dev

# Terminal 6 - API Gateway
cd microservices/api-gateway
npm install
npm run dev
```

## Monitoramento

### Health Checks:
- **Gateway**: http://localhost:3000/health
- **Identity**: http://localhost:3001/health
- **Asset**: http://localhost:3002/health
- **Portfolio**: http://localhost:3003/health
- **Transaction**: http://localhost:3004/health
- **Financial**: http://localhost:3005/health

### Status Geral:
- **Todos os serviços**: http://localhost:3000/services/status

## Documentação API

- **Swagger UI**: http://localhost:3000/api-docs

## Vantagens da Arquitetura

### Benefícios:
1. **Escalabilidade Independente**: Cada serviço pode ser escalado conforme demanda
2. **Tecnologias Heterogêneas**: Cada serviço pode usar tecnologias diferentes
3. **Deployment Independente**: Atualizações sem afetar outros serviços
4. **Isolamento de Falhas**: Falha em um serviço não derruba o sistema
5. **Equipes Autônomas**: Cada equipe pode trabalhar independentemente

### Desafios:
1. **Complexidade de Rede**: Mais chamadas entre serviços
2. **Consistência de Dados**: Eventual consistency entre serviços
3. **Monitoramento**: Necessidade de observabilidade distribuída
4. **Testes**: Complexidade de testes de integração

## Próximos Passos

1. **Implementação de Banco de Dados**: Cada serviço terá sua própria base
2. **Message Broker**: Implementar comunicação assíncrona
3. **Service Mesh**: Istio ou Linkerd para comunicação segura
4. **Observabilidade**: Prometheus, Grafana, Jaeger
5. **CI/CD**: Pipeline automatizado para cada serviço 