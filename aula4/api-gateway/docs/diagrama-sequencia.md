# 📊 Diagramas de Sequência - API Gateway

## 🔄 Fluxo 1: Requisição Simples (GET /api/usuarios)

```mermaid
sequenceDiagram
    participant C as Cliente
    participant G as API Gateway<br/>(8080)
    participant U as Serviço Usuários<br/>(6001)
    
    C->>G: GET /api/usuarios<br/>Authorization: Bearer token123
    
    Note over G: 1. Validar Token
    G->>G: Verificar token123 em lista válida
    
    Note over G: 2. Rate Limiting
    G->>G: Verificar limite (10 req/min)
    
    Note over G: 3. Roteamento
    G->>U: GET /<br/>(proxy para localhost:6001)
    
    Note over U: 4. Processar Requisição
    U->>U: Buscar usuários no "banco"
    
    U->>G: 200 OK<br/>{"sucesso": true, "dados": [...]}
    
    G->>C: 200 OK<br/>Lista de usuários
```

## 🛒 Fluxo 2: Criação de Pedido (POST /api/pedidos)

```mermaid
sequenceDiagram
    participant C as Cliente
    participant G as API Gateway<br/>(8080)
    participant P as Serviço Pedidos<br/>(6003)
    participant U as Serviço Usuários<br/>(6001)
    participant PR as Serviço Produtos<br/>(6002)
    
    C->>G: POST /api/pedidos<br/>{"usuario_id": 1, "produto_id": 1, "quantidade": 2}
    
    Note over G: 1. Autenticação
    G->>G: Validar Bearer token
    
    Note over G: 2. Rate Limiting
    G->>G: Verificar limite por IP
    
    Note over G: 3. Roteamento
    G->>P: POST /<br/>(proxy para localhost:6003)
    
    Note over P: 4. Validações
    P->>U: GET /1<br/>(validar usuário existe)
    U->>P: 200 OK<br/>{"id": 1, "nome": "João"}
    
    P->>PR: GET /1<br/>(validar produto existe)
    PR->>P: 200 OK<br/>{"id": 1, "nome": "Notebook"}
    
    P->>PR: GET /1/disponibilidade<br/>(verificar estoque)
    PR->>P: 200 OK<br/>{"disponivel": true, "estoque": 10}
    
    Note over P: 5. Criar Pedido
    P->>P: Gerar ID e salvar pedido
    
    P->>G: 201 Created<br/>{"id": 1, "status": "pendente"}
    
    G->>C: 201 Created<br/>Pedido criado com sucesso
```

## 🔒 Fluxo 3: Requisição Sem Autenticação

```mermaid
sequenceDiagram
    participant C as Cliente
    participant G as API Gateway<br/>(8080)
    
    C->>G: GET /api/usuarios<br/>(sem Authorization header)
    
    Note over G: 1. Verificar Autenticação
    G->>G: Header Authorization ausente
    
    G->>C: 401 Unauthorized<br/>{"erro": "Token de acesso necessário"}
    
    Note over C,G: Requisição bloqueada<br/>Microserviço não é chamado
```

## ⚡ Fluxo 4: Rate Limiting Ativado

```mermaid
sequenceDiagram
    participant C as Cliente
    participant G as API Gateway<br/>(8080)
    
    Note over C,G: Cliente já fez 10 requisições no último minuto
    
    C->>G: GET /api/usuarios<br/>Authorization: Bearer token123
    
    Note over G: 1. Validar Token
    G->>G: Token válido ✅
    
    Note over G: 2. Rate Limiting
    G->>G: IP excedeu limite (10 req/min)
    
    G->>C: 429 Too Many Requests<br/>{"erro": "Muitas requisições"}
    
    Note over C,G: Requisição bloqueada<br/>Microserviço não é chamado
```

## 🏥 Fluxo 5: Health Check

```mermaid
sequenceDiagram
    participant C as Cliente
    participant G as API Gateway<br/>(8080)
    participant U as Serviço Usuários<br/>(6001)
    participant PR as Serviço Produtos<br/>(6002)
    participant P as Serviço Pedidos<br/>(6003)
    
    C->>G: GET /health
    
    Note over G: Verificar próprio status
    G->>G: Gateway funcionando ✅
    
    Note over G: Verificar microserviços
    G->>U: GET /health
    U->>G: 200 OK
    
    G->>PR: GET /health  
    PR->>G: 200 OK
    
    G->>P: GET /health
    P->>G: 200 OK
    
    G->>C: 200 OK<br/>{"status": "Gateway funcionando", "servicos": {...}}
```

## 🚨 Fluxo 6: Tratamento de Erro

```mermaid
sequenceDiagram
    participant C as Cliente
    participant G as API Gateway<br/>(8080)
    participant U as Serviço Usuários<br/>(6001)
    
    C->>G: GET /api/usuarios/999<br/>Authorization: Bearer token123
    
    Note over G: 1-3. Autenticação, Rate Limit, Roteamento OK
    G->>U: GET /999
    
    Note over U: Usuário não encontrado
    U->>G: 404 Not Found<br/>{"erro": "Usuário não encontrado"}
    
    Note over G: Repassar erro do microserviço
    G->>C: 404 Not Found<br/>{"erro": "Usuário não encontrado"}
```

## 📋 Legenda dos Componentes

| Componente | Porta | Responsabilidade |
|------------|-------|------------------|
| **Cliente** | - | Aplicação que consome a API |
| **API Gateway** | 8080 | Autenticação, Rate Limiting, Roteamento |
| **Serviço Usuários** | 6001 | CRUD de usuários |
| **Serviço Produtos** | 6002 | CRUD de produtos, estoque |
| **Serviço Pedidos** | 6003 | CRUD de pedidos, validações |

## 🔑 Tokens de Autenticação Válidos

- `token123`
- `admin456` 
- `user789`

## ⚙️ Configurações do Gateway

- **Rate Limit**: 10 requisições por minuto por IP
- **Timeout**: 30 segundos para microserviços
- **Retry**: Não implementado (melhoria futura)
- **Circuit Breaker**: Não implementado (melhoria futura) 