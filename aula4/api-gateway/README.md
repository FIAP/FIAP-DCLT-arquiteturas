# Exemplo de API Gateway com Microserviços

Este projeto demonstra o padrão **API Gateway**, onde um único ponto de entrada centraliza o acesso a múltiplos microserviços. O gateway atua como intermediário, oferecendo funcionalidades como autenticação, roteamento, rate limiting e monitoramento.

## 📋 Estrutura do Projeto

```
api-gateway/
├── package.json          # Dependências do projeto
├── gateway.js            # API Gateway (porta 8080)
├── cliente.js            # Cliente de teste
├── servicos/
│   ├── usuarios.js       # Microserviço de usuários (porta 3001)
│   ├── produtos.js       # Microserviço de produtos (porta 3002)
│   └── pedidos.js        # Microserviço de pedidos (porta 3003)
└── README.md             # Este arquivo
```

## 🏗️ Arquitetura

```
Cliente -> API Gateway (8080) -> Microserviços
                                   ├── Usuários (6001)
                                   ├── Produtos (6002)  
                                   └── Pedidos (6003)
```

### 🚪 API Gateway (porta 8080)
- **Ponto único de entrada** para todas as requisições
- **Autenticação centralizada** com tokens Bearer
- **Rate limiting** (10 requisições por minuto por IP)
- **Roteamento inteligente** para microserviços
- **Monitoramento** de saúde dos serviços
- **Logging centralizado** de todas as requisições

### 🔧 Microserviços

#### 👥 Usuários (porta 6001)
- Gerenciamento de usuários
- CRUD completo (Create, Read, Update, Delete)

#### 📦 Produtos (porta 6002)  
- Catálogo de produtos
- Verificação de estoque e disponibilidade
- Filtros por categoria

#### 🛒 Pedidos (porta 6003)
- Processamento de pedidos
- Validação com outros serviços
- Relatórios e estatísticas

## 🚀 Como Executar

### 1. Instalar Dependências
```bash
cd api-gateway
npm install
```

### 2. Opção A: Executar Tudo de Uma Vez
```bash
npm run start-all
```

### 3. Opção B: Executar Separadamente (4 terminais)
```bash
# Terminal 1 - Serviço de Usuários
npm run servico-usuarios

# Terminal 2 - Serviço de Produtos  
npm run servico-produtos

# Terminal 3 - Serviço de Pedidos
npm run servico-pedidos

# Terminal 4 - API Gateway
npm run gateway
```

### 4. Testar com Cliente
```bash
npm run cliente
# ou
npm test
```

## 🔑 Autenticação

O gateway requer autenticação para acessar os microserviços:

### Tokens Válidos:
- `token123`
- `admin456` 
- `user789`

### Como usar:
```bash
# Incluir header em todas as requisições (exceto /health)
Authorization: Bearer token123
```

## 🌐 Endpoints Disponíveis

### Gateway
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/health` | Status do gateway | ❌ |
| GET | `/servicos/status` | Status dos microserviços | ✅ |

### Usuários (via `/api/usuarios`)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/usuarios` | Listar usuários |
| GET | `/api/usuarios/:id` | Buscar por ID |
| POST | `/api/usuarios` | Criar usuário |
| PUT | `/api/usuarios/:id` | Atualizar usuário |
| DELETE | `/api/usuarios/:id` | Deletar usuário |

### Produtos (via `/api/produtos`)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/produtos` | Listar produtos |
| GET | `/api/produtos?categoria=X` | Filtrar por categoria |
| GET | `/api/produtos/:id` | Buscar por ID |
| GET | `/api/produtos/:id/disponibilidade` | Verificar estoque |
| POST | `/api/produtos` | Criar produto |
| PUT | `/api/produtos/:id` | Atualizar produto |
| DELETE | `/api/produtos/:id` | Deletar produto |

### Pedidos (via `/api/pedidos`)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/pedidos` | Listar pedidos |
| GET | `/api/pedidos/:id` | Buscar por ID |
| POST | `/api/pedidos` | Criar pedido |
| PUT | `/api/pedidos/:id/status` | Atualizar status |
| DELETE | `/api/pedidos/:id` | Cancelar pedido |
| GET | `/api/pedidos/relatorio/resumo` | Relatório |

## 🔧 Exemplos de Uso

### Usando curl:

```bash
# Verificar gateway
curl http://localhost:8080/health

# Verificar serviços (precisa de auth)
curl -H "Authorization: Bearer token123" \
     http://localhost:8080/servicos/status

# Listar usuários
curl -H "Authorization: Bearer token123" \
     http://localhost:8080/api/usuarios

# Criar usuário
curl -X POST \
     -H "Authorization: Bearer token123" \
     -H "Content-Type: application/json" \
     -d '{"nome":"João","email":"joao@test.com"}' \
     http://localhost:8080/api/usuarios

# Listar produtos por categoria
curl -H "Authorization: Bearer token123" \
     "http://localhost:8080/api/produtos?categoria=Eletrônicos"

# Criar pedido
curl -X POST \
     -H "Authorization: Bearer token123" \
     -H "Content-Type: application/json" \
     -d '{"usuario_id":1,"produto_id":1,"quantidade":2}' \
     http://localhost:8080/api/pedidos
```

## 📊 Fluxo de Requisição

```
1. Cliente envia requisição -> Gateway (8080)
2. Gateway valida autenticação
3. Gateway verifica rate limit
4. Gateway roteia para microserviço correto
5. Microserviço processa requisição
6. Microserviço retorna resposta
7. Gateway retorna resposta ao cliente
```

## 🎯 Funcionalidades do API Gateway

### ✅ Implementadas neste exemplo:
- **🔒 Autenticação centralizada**
- **🔄 Roteamento por path (`/api/usuarios`, `/api/produtos`, `/api/pedidos`)**
- **⚡ Rate limiting (10 req/min por IP)**
- **📝 Logging de requisições**
- **📊 Health check dos serviços**
- **🛡️ Tratamento de erros**
- **🔧 Proxy HTTP com reescrita de paths**

### 🚀 Funcionalidades avançadas (não implementadas):
- Load balancing entre instâncias
- Circuit breaker
- Caching de respostas
- Transformação de dados
- Versionamento de APIs
- Métricas e analytics

## 💡 Vantagens do API Gateway

### ✅ Para Clientes:
- **Ponto único de acesso** - uma URL para tudo
- **Autenticação simplificada** - um token para todos os serviços
- **Interface consistente** - padrões unificados

### ✅ Para Desenvolvedores:
- **Desacoplamento** - microserviços independentes
- **Funcionalidades transversais** centralizadas
- **Monitoramento** facilitado
- **Evolução independente** dos serviços

### ✅ Para Operações:
- **Controle de tráfego** centralizado
- **Políticas de segurança** unificadas
- **Observabilidade** melhorada

## 🌐 Casos de Uso Reais

Este padrão é muito usado em:
- **E-commerce**: Frontend único acessando usuários, produtos, pagamentos
- **Fintech**: Apps mobile acessando contas, transações, cartões
- **IoT**: Dashboards centralizando dados de diferentes sensores
- **SaaS**: Plataformas com múltiplos módulos (CRM, vendas, suporte)

## 🔍 Observando o Comportamento

Ao executar o exemplo, observe:
1. **Logs do Gateway** mostrando roteamento
2. **Logs dos Microserviços** processando requisições
3. **Validação de autenticação** bloqueando acessos sem token
4. **Rate limiting** em ação após muitas requisições
5. **Comunicação entre serviços** (pedidos validando usuários/produtos)

O API Gateway atua como o "porteiro" de toda a arquitetura! 🚪 