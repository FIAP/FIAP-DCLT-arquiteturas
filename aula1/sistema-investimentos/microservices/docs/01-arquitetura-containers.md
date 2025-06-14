 

### Diagrama de Container

```mermaid
graph TB
    subgraph "Usuários"
        Investidor["👤 Investidor"]
        Admin["👨‍💼 Administrador"]
    end
    
    subgraph "Sistema de Investimentos"
        subgraph "API Gateway Layer"
            APIGateway["🌐 API Gateway<br/>Node.js/Express<br/>Porta: 3000<br/><br/>• Roteamento<br/>• Autenticação<br/>• Rate Limiting<br/>• Load Balancing"]
        end
        
        subgraph "Microservices Layer"
            IdentityService["🔐 Identity Service<br/>Node.js/Express<br/>Porta: 3001<br/><br/>• Autenticação JWT<br/>• Gestão de usuários<br/>• Controle de acesso"]
            
            AssetService["📊 Asset Service<br/>Node.js/Express<br/>Porta: 3002<br/><br/>• Catálogo de ativos<br/>• Dados de mercado<br/>• Cotações"]
            
            PortfolioService["💼 Portfolio Service<br/>Node.js/Express<br/>Porta: 3003<br/><br/>• Gestão de carteiras<br/>• Posições<br/>• Diversificação"]
            
            TransactionService["💳 Transaction Service<br/>Node.js/Express<br/>Porta: 3004<br/><br/>• Ordens de compra/venda<br/>• Histórico transações<br/>• Execução"]
            
            FinancialService["💰 Financial Service<br/>Node.js/Express<br/>Porta: 3005<br/><br/>• Saldos<br/>• P&L<br/>• Dividendos"]
        end
        
        subgraph "Database Layer"
            PostgresDB[("🗄️ PostgreSQL<br/>Database<br/>Porta: 5432<br/><br/>• Dados persistentes<br/>• Transações ACID<br/>• Relacionamentos")]
        end
        
        subgraph "Monitoring & Docs"
            SwaggerDocs["📚 Swagger UI<br/>Documentação API<br/>Porta: 3000/docs"]
            HealthMonitor["🏥 Health Monitor<br/>Status dos serviços<br/>Porta: 3000/health"]
        end
    end
    
    subgraph "Sistemas Externos"
        BolsaValores["📈 Bolsa de Valores<br/>API REST"]
        SistemaBancario["🏛️ Sistema Bancário<br/>API Banking"]
        NotificacaoEmail["📧 Serviço Email<br/>SMTP/API"]
    end
    
    %% Relacionamentos Usuários
    Investidor -->|"HTTPS/REST<br/>Web/Mobile"| APIGateway
    Admin -->|"HTTPS/REST<br/>Dashboard"| APIGateway
    
    %% API Gateway para Microservices
    APIGateway -->|"HTTP/REST<br/>Auth requests"| IdentityService
    APIGateway -->|"HTTP/REST<br/>Asset queries"| AssetService
    APIGateway -->|"HTTP/REST<br/>Portfolio mgmt"| PortfolioService
    APIGateway -->|"HTTP/REST<br/>Transactions"| TransactionService
    APIGateway -->|"HTTP/REST<br/>Financial data"| FinancialService
    
    %% Comunicação entre Microservices
    PortfolioService -.->|"HTTP/REST<br/>Asset validation"| AssetService
    TransactionService -.->|"HTTP/REST<br/>Portfolio update"| PortfolioService
    TransactionService -.->|"HTTP/REST<br/>Balance update"| FinancialService
    FinancialService -.->|"HTTP/REST<br/>Portfolio data"| PortfolioService
    
    %% Database Connections
    IdentityService -->|"SQL/TCP<br/>User data"| PostgresDB
    AssetService -->|"SQL/TCP<br/>Asset data"| PostgresDB
    PortfolioService -->|"SQL/TCP<br/>Portfolio data"| PostgresDB
    TransactionService -->|"SQL/TCP<br/>Transaction data"| PostgresDB
    FinancialService -->|"SQL/TCP<br/>Financial data"| PostgresDB
    
    %% Sistemas Externos
    AssetService -->|"HTTPS/REST<br/>Market data"| BolsaValores
    FinancialService -->|"HTTPS/API<br/>Banking ops"| SistemaBancario
    IdentityService -->|"SMTP/API<br/>Notifications"| NotificacaoEmail
    
    %% Monitoring
    APIGateway -.->|"Health checks"| HealthMonitor
    APIGateway -.->|"API docs"| SwaggerDocs
    
    %% Estilos
    classDef userStyle fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef gatewayStyle fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px
    classDef serviceStyle fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef databaseStyle fill:#fff8e1,stroke:#f57c00,stroke-width:2px
    classDef externalStyle fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef monitorStyle fill:#e0f2f1,stroke:#00695c,stroke-width:2px
    
    class Investidor,Admin userStyle
    class APIGateway gatewayStyle
    class IdentityService,AssetService,PortfolioService,TransactionService,FinancialService serviceStyle
    class PostgresDB databaseStyle
    class BolsaValores,SistemaBancario,NotificacaoEmail externalStyle
    class SwaggerDocs,HealthMonitor monitorStyle
```

### Descrição dos Containers

#### **API Gateway Layer:**
- **API Gateway**: Ponto único de entrada, gerencia roteamento, autenticação e balanceamento de carga

#### **Microservices Layer:**
- **Identity Service**: Gerencia autenticação, autorização e dados de usuários
- **Asset Service**: Mantém catálogo de ativos e dados de mercado
- **Portfolio Service**: Gerencia carteiras de investimento e posições
- **Transaction Service**: Processa ordens de compra/venda e histórico
- **Financial Service**: Controla saldos, P&L e dividendos

#### **Database Layer:**
- **PostgreSQL**: Banco de dados relacional compartilhado com isolamento por schema

#### **Monitoring & Documentation:**
- **Swagger UI**: Documentação interativa das APIs
- **Health Monitor**: Monitoramento de saúde dos serviços

### Padrões de Comunicação

#### **Comunicação Síncrona (HTTP/REST):**
- Cliente → API Gateway → Microservices
- Microservices entre si para operações críticas
- Microservices → Sistemas externos

#### **Fluxo de Comunicação Inter-Serviços:**

A comunicação direta entre serviços é **limitada e específica** para operações críticas:

```mermaid
sequenceDiagram
    participant C as Cliente
    participant GW as API Gateway
    participant PS as Portfolio Service
    participant AS as Asset Service
    participant TS as Transaction Service
    participant FS as Financial Service
    
    Note over C,FS: Exemplo: Fluxo de Compra de Ativo
    
    C->>GW: POST /api/transactions/buy
    GW->>TS: Processar ordem de compra
    
    TS->>AS: GET /assets/{id} - Validar ativo
    AS-->>TS: 200 OK - Dados do ativo
    
    TS->>PS: POST /portfolios/{id}/positions - Atualizar posição
    PS-->>TS: 201 Created - Posição criada
    
    TS->>FS: POST /balances/debit - Debitar saldo
    FS-->>TS: 200 OK - Saldo debitado
    
    TS-->>GW: 201 Created - Transação processada
    GW-->>C: 201 Created - Compra realizada
```

#### **Comunicação Assíncrona (Futura implementação):**
- Message Queue para eventos de transação
- Event Sourcing para auditoria
- Pub/Sub para notificações

### Portas e Protocolos

| Container | Porta | Protocolo | Descrição |
|-----------|-------|-----------|-----------|
| API Gateway | 3000 | HTTP/HTTPS | Entrada principal |
| Identity Service | 3001 | HTTP | Autenticação |
| Asset Service | 3002 | HTTP | Dados de ativos |
| Portfolio Service | 3003 | HTTP | Gestão carteiras |
| Transaction Service | 3004 | HTTP | Transações |
| Financial Service | 3005 | HTTP | Dados financeiros |
| PostgreSQL | 5432 | TCP/SQL | Banco de dados |

### Estratégias de Deployment

#### **Desenvolvimento:**
- Cada microservice roda em processo separado
- Banco PostgreSQL local
- Hot reload para desenvolvimento

#### **Produção:**
- Containers Docker independentes
- Kubernetes para orquestração
- Load balancers para alta disponibilidade
- Database clustering

### Padrões de Fluxo Implementados

#### **1. Gateway-Centric Pattern:**
- Todas as requisições externas passam pelo API Gateway
- Autenticação e autorização centralizadas
- Rate limiting e CORS aplicados globalmente
- Roteamento inteligente baseado em paths

#### **2. Service-to-Service Communication:**
- Comunicação direta limitada a operações críticas
- Validação de dados entre serviços relacionados
- Transações distribuídas para consistência
- Timeouts e circuit breakers para resiliência

#### **3. Database per Service:**
- Cada serviço possui seu próprio schema
- Isolamento de dados por contexto de negócio
- Transações locais dentro de cada serviço
- Eventual consistency entre serviços

### Benefícios da Arquitetura

- **Isolamento**: Cada serviço pode ser desenvolvido independentemente
- **Escalabilidade**: Escala horizontal por serviço conforme demanda
- **Tecnologia**: Flexibilidade para usar diferentes tecnologias por serviço
- **Deploy**: Deploy independente reduz riscos
- **Manutenção**: Facilita manutenção e debugging 