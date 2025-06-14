# 00 - Visão Geral do Sistema
## Sistema de Investimentos - Arquitetura de Microservices

### Introdução

O Sistema de Investimentos é uma plataforma completa para gestão de investimentos financeiros, desenvolvida com arquitetura de microservices. O sistema permite que investidores gerenciem suas carteiras, executem transações e acompanhem a performance de seus investimentos.

### Contexto do Sistema

```mermaid
graph TB
    subgraph "Usuários"
        Investidor["👤 Investidor<br/>Pessoa física que<br/>investe em ativos"]
        Admin["👨‍💼 Administrador<br/>Gerencia o sistema<br/>e monitora operações"]
    end
    
    subgraph "Sistema de Investimentos"
        SistemaInvestimentos["🏦 Sistema de Investimentos<br/>Plataforma de investimentos<br/>baseada em microservices<br/><br/>• Gestão de carteiras<br/>• Execução de ordens<br/>• Análise de performance<br/>• Controle financeiro"]
    end
    
    subgraph "Sistemas Externos"
        BolsaValores["📈 Bolsa de Valores<br/>Fornece cotações<br/>e dados de mercado"]
        SistemaBancario["🏛️ Sistema Bancário<br/>Processa depósitos<br/>e transferências"]
        Regulador["⚖️ Órgão Regulador<br/>CVM - Comissão de<br/>Valores Mobiliários"]
        NotificacaoEmail["📧 Serviço de Email<br/>Envio de notificações<br/>e relatórios"]
    end
    
    %% Relacionamentos Usuários -> Sistema
    Investidor -->|"Acessa via web/mobile<br/>Realiza investimentos<br/>Consulta carteira"| SistemaInvestimentos
    Admin -->|"Monitora sistema<br/>Configura parâmetros<br/>Gera relatórios"| SistemaInvestimentos
    
    %% Relacionamentos Sistema -> Sistemas Externos
    SistemaInvestimentos -->|"Consulta preços<br/>Obtém dados de mercado<br/>HTTPS/REST"| BolsaValores
    SistemaInvestimentos -->|"Processa pagamentos<br/>Valida saldos<br/>API Banking"| SistemaBancario
    SistemaInvestimentos -->|"Reporta transações<br/>Compliance<br/>HTTPS/XML"| Regulador
    SistemaInvestimentos -->|"Envia notificações<br/>Relatórios mensais<br/>SMTP/API"| NotificacaoEmail
    
    %% Estilos
    classDef userStyle fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef systemStyle fill:#c8e6c9,stroke:#2e7d32,stroke-width:3px
    classDef externalStyle fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    
    class Investidor,Admin userStyle
    class SistemaInvestimentos systemStyle
    class BolsaValores,SistemaBancario,Regulador,NotificacaoEmail externalStyle
```

### Atores do Sistema

#### **👤 Investidor**
- **Perfil**: Pessoa física que utiliza a plataforma para investir
- **Objetivos**: 
  - Construir e gerenciar carteiras de investimento
  - Executar ordens de compra e venda
  - Acompanhar performance dos investimentos
  - Receber relatórios e análises
- **Canais de Acesso**: Web browser, aplicativo mobile

#### **👨‍💼 Administrador**
- **Perfil**: Responsável pela operação e gestão do sistema
- **Objetivos**:
  - Monitorar saúde e performance do sistema
  - Configurar parâmetros operacionais
  - Gerar relatórios gerenciais
  - Garantir compliance regulatório
- **Canais de Acesso**: Dashboard administrativo, ferramentas de monitoramento

### Sistemas Externos

#### **📈 Bolsa de Valores**
- **Função**: Fornece dados de mercado em tempo real
- **Dados Fornecidos**:
  - Cotações de ações, fundos e outros ativos
  - Volume de negociação
  - Dados históricos de preços
  - Eventos corporativos
- **Protocolo**: HTTPS/REST API

#### **🏛️ Sistema Bancário**
- **Função**: Processa movimentações financeiras
- **Serviços Oferecidos**:
  - Depósitos e saques
  - Transferências entre contas
  - Validação de saldos
  - Histórico de movimentações
- **Protocolo**: API Banking (Open Banking)

#### **⚖️ Órgão Regulador (CVM)**
- **Função**: Supervisão e compliance
- **Relatórios Enviados**:
  - Transações realizadas
  - Posições dos investidores
  - Movimentações suspeitas
  - Relatórios de compliance
- **Protocolo**: HTTPS/XML

#### **📧 Serviço de Email**
- **Função**: Comunicação com usuários
- **Tipos de Notificação**:
  - Confirmações de transação
  - Relatórios mensais
  - Alertas de mercado
  - Comunicados importantes
- **Protocolo**: SMTP/API

### Fluxos Principais de Negócio

#### **1. Fluxo de Investimento**
```mermaid
sequenceDiagram
    participant I as Investidor
    participant S as Sistema
    participant B as Bolsa
    participant SB as Sist. Bancário
    participant R as Regulador
    
    I->>S: 1. Login na plataforma
    I->>S: 2. Consulta ativos disponíveis
    S->>B: 3. Busca cotações atuais
    B-->>S: 4. Retorna preços
    S-->>I: 5. Exibe opções de investimento
    I->>S: 6. Realiza ordem de compra
    S->>SB: 7. Valida saldo disponível
    SB-->>S: 8. Confirma saldo
    S->>B: 9. Executa ordem na bolsa
    B-->>S: 10. Confirma execução
    S->>SB: 11. Processa pagamento
    S->>R: 12. Reporta transação
    S-->>I: 13. Confirma investimento
```

#### **2. Fluxo de Monitoramento**
```mermaid
sequenceDiagram
    participant S as Sistema
    participant B as Bolsa
    participant I as Investidor
    participant E as Email Service
    participant A as Admin
    
    loop Atualização Contínua
        S->>B: 1. Coleta dados de mercado
        B-->>S: 2. Retorna cotações
        S->>S: 3. Atualiza valores das carteiras
        S->>S: 4. Calcula performance
    end
    
    alt Evento Significativo
        S->>E: 5. Envia notificação
        E->>I: 6. Email/SMS para investidor
    end
    
    S->>A: 7. Gera relatórios gerenciais
```

### Benefícios da Arquitetura

#### **🎯 Para o Negócio**
- **Escalabilidade**: Suporte a crescimento de usuários e transações
- **Disponibilidade**: Alta disponibilidade com redundância
- **Compliance**: Facilita atendimento a requisitos regulatórios
- **Time-to-Market**: Deploy rápido de novas funcionalidades

#### **🔧 Para a Tecnologia**
- **Manutenibilidade**: Código organizado por domínio
- **Testabilidade**: Testes isolados por serviço
- **Flexibilidade**: Tecnologias específicas por necessidade
- **Resiliência**: Falhas isoladas não afetam todo o sistema

#### **👥 Para os Usuários**
- **Performance**: Resposta rápida às operações
- **Confiabilidade**: Sistema estável e seguro
- **Funcionalidades**: Recursos avançados de análise
- **Experiência**: Interface intuitiva e responsiva

### Tecnologias Principais

#### **Backend**
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI

#### **Arquitetura**
- **Pattern**: Microservices
- **Communication**: HTTP/REST
- **Gateway**: API Gateway centralizado
- **Monitoring**: Health checks e métricas

#### **DevOps**
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Process Management**: PM2
- **Automation**: Scripts de deploy

### Próximos Passos

Esta visão geral será detalhada nos próximos documentos:

1. **01 - Arquitetura de Containers**: Decomposição em microservices
2. **02 - Componentes Internos**: Estrutura interna de cada serviço
3. **03 - Implementação de Código**: Detalhes de classes e interfaces

### Glossário

- **API Gateway**: Ponto único de entrada para todas as requisições
- **Microservice**: Serviço independente com responsabilidade específica
- **Container**: Unidade de deployment isolada
- **Compliance**: Conformidade com regulamentações
- **Circuit Breaker**: Padrão para lidar com falhas de serviços externos 