# 🏗️ Arquitetura do Sistema API Gateway

## 📐 Diagrama de Arquitetura Geral

```mermaid
graph TB
    subgraph "Cliente"
        C[Cliente/Browser<br/>curl/Postman]
    end
    
    subgraph "API Gateway - Porta 8080"
        G[API Gateway]
        Auth[Autenticação<br/>Bearer Token]
        RL[Rate Limiting<br/>10 req/min]
        Proxy[HTTP Proxy<br/>Roteamento]
        Log[Logging<br/>Morgan]
    end
    
    subgraph "Microserviços"
        U[👥 Usuários<br/>Porta 6001]
        P[📦 Produtos<br/>Porta 6002]
        O[🛒 Pedidos<br/>Porta 6003]
    end
    
    C --> G
    G --> Auth
    Auth --> RL
    RL --> Proxy
    Proxy --> Log
    
    Proxy --> U
    Proxy --> P
    Proxy --> O
    
    O -.->|Validar usuário| U
    O -.->|Validar produto| P
    
    style G fill:#e1f5fe
    style Auth fill:#fff3e0
    style RL fill:#fce4ec
    style U fill:#e8f5e8
    style P fill:#fff8e1
    style O fill:#f3e5f5
```

## 🔄 Fluxo de Dados

```mermaid
graph LR
    subgraph "Entrada"
        REQ[Requisição HTTP]
    end
    
    subgraph "Gateway Processing"
        AUTH{Autenticado?}
        RATE{Rate Limit OK?}
        ROUTE{Qual serviço?}
    end
    
    subgraph "Microserviços"
        SVC1[Usuários]
        SVC2[Produtos]
        SVC3[Pedidos]
    end
    
    subgraph "Saída"
        RESP[Resposta HTTP]
    end
    
    REQ --> AUTH
    AUTH -->|❌| RESP
    AUTH -->|✅| RATE
    RATE -->|❌| RESP
    RATE -->|✅| ROUTE
    
    ROUTE -->|/api/usuarios| SVC1
    ROUTE -->|/api/produtos| SVC2
    ROUTE -->|/api/pedidos| SVC3
    
    SVC1 --> RESP
    SVC2 --> RESP
    SVC3 --> RESP
    
    style AUTH fill:#ffcdd2
    style RATE fill:#f8bbd9
    style ROUTE fill:#c8e6c9
```

## 🌐 Mapeamento de Rotas

```mermaid
graph TD
    subgraph "Rotas Públicas"
        H[GET /health]
    end
    
    subgraph "Rotas Protegidas"
        S[GET /servicos/status]
    end
    
    subgraph "Proxy para Microserviços"
        U1[GET /api/usuarios/*]
        U2[POST /api/usuarios/*]
        U3[PUT /api/usuarios/*]
        U4[DELETE /api/usuarios/*]
        
        P1[GET /api/produtos/*]
        P2[POST /api/produtos/*]
        P3[PUT /api/produtos/*]
        P4[DELETE /api/produtos/*]
        
        O1[GET /api/pedidos/*]
        O2[POST /api/pedidos/*]
        O3[PUT /api/pedidos/*]
        O4[DELETE /api/pedidos/*]
    end
    
    subgraph "Destinos"
        US[Usuários:6001]
        PR[Produtos:6002]
        PE[Pedidos:6003]
    end
    
    U1 --> US
    U2 --> US
    U3 --> US
    U4 --> US
    
    P1 --> PR
    P2 --> PR
    P3 --> PR
    P4 --> PR
    
    O1 --> PE
    O2 --> PE
    O3 --> PE
    O4 --> PE
    
    style H fill:#c8e6c9
    style S fill:#fff3e0
    style US fill:#e8f5e8
    style PR fill:#fff8e1
    style PE fill:#f3e5f5
```

## 🔧 Componentes Técnicos

### API Gateway (gateway.js)
```mermaid
graph TB
    subgraph "Middlewares"
        CORS[CORS<br/>Cross-Origin]
        JSON[JSON Parser<br/>Body Parser]
        MORGAN[Morgan<br/>HTTP Logger]
        AUTH[Auth Middleware<br/>Bearer Token]
        RATE[Rate Limiter<br/>express-rate-limit]
    end
    
    subgraph "Proxy Configuration"
        PROXY1[http-proxy-middleware<br/>→ Usuários]
        PROXY2[http-proxy-middleware<br/>→ Produtos]
        PROXY3[http-proxy-middleware<br/>→ Pedidos]
    end
    
    subgraph "Routes"
        HEALTH[/health]
        STATUS[/servicos/status]
        CATCH[404 Handler]
    end
    
    CORS --> JSON
    JSON --> MORGAN
    MORGAN --> AUTH
    AUTH --> RATE
    RATE --> PROXY1
    RATE --> PROXY2
    RATE --> PROXY3
    RATE --> HEALTH
    RATE --> STATUS
    RATE --> CATCH
```

### Microserviço Padrão
```mermaid
graph TB
    subgraph "Express App"
        APP[Express Application]
        CORS2[CORS Middleware]
        JSON2[JSON Body Parser]
    end
    
    subgraph "Routes"
        HEALTH2[GET /health]
        LIST[GET /]
        GET[GET /:id]
        POST[POST /]
        PUT[PUT /:id]
        DELETE[DELETE /:id]
    end
    
    subgraph "Data Layer"
        MEMORY[In-Memory Data<br/>Arrays/Objects]
    end
    
    APP --> CORS2
    CORS2 --> JSON2
    JSON2 --> HEALTH2
    JSON2 --> LIST
    JSON2 --> GET
    JSON2 --> POST
    JSON2 --> PUT
    JSON2 --> DELETE
    
    LIST --> MEMORY
    GET --> MEMORY
    POST --> MEMORY
    PUT --> MEMORY
    DELETE --> MEMORY
```

## 📊 Padrões Implementados

### 1. **API Gateway Pattern**
- ✅ Ponto único de entrada
- ✅ Roteamento baseado em path
- ✅ Agregação de serviços

### 2. **Authentication & Authorization**
- ✅ Bearer Token validation
- ✅ Centralized auth logic
- ✅ Token-based access control

### 3. **Rate Limiting**
- ✅ Per-IP rate limiting
- ✅ Configurable limits
- ✅ HTTP 429 responses

### 4. **Service Discovery (Simples)**
- ✅ Static service configuration
- ✅ Health check endpoints
- ✅ Service status monitoring

### 5. **Logging & Monitoring**
- ✅ HTTP request logging
- ✅ Error tracking
- ✅ Performance metrics

## 🚀 Benefícios da Arquitetura

### ✅ **Para Clientes**
- Interface unificada
- Autenticação simplificada
- Controle de acesso centralizado

### ✅ **Para Desenvolvedores**
- Separação de responsabilidades
- Desenvolvimento independente
- Facilidade de manutenção

### ✅ **Para Operações**
- Monitoramento centralizado
- Controle de tráfego
- Políticas de segurança unificadas

## 🔮 Evoluções Futuras

### Próximas Implementações:
- [ ] **Circuit Breaker** - Falha rápida em serviços indisponíveis
- [ ] **Load Balancing** - Distribuição entre múltiplas instâncias
- [ ] **Caching** - Cache de respostas frequentes
- [ ] **Service Discovery** - Descoberta automática de serviços
- [ ] **Distributed Tracing** - Rastreamento de requisições
- [ ] **API Versioning** - Versionamento de APIs 