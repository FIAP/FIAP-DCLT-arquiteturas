# 🛠️ Guia de Implementação - API Gateway

## 📋 Passo a Passo Completo

### 🎯 Fase 1: Preparação do Ambiente

#### 1.1 Estrutura de Pastas
```bash
mkdir api-gateway
cd api-gateway
mkdir servicos docs
```

#### 1.2 Inicialização do Projeto
```bash
npm init -y
```

#### 1.3 Instalação de Dependências
```bash
# Dependências principais
npm install express http-proxy-middleware axios cors morgan

# Dependências de desenvolvimento
npm install --save-dev concurrently
```

### 🏗️ Fase 2: Implementação dos Microserviços

#### 2.1 Microserviço de Usuários (`servicos/usuarios.js`)

**Funcionalidades implementadas:**
- ✅ CRUD completo de usuários
- ✅ Validação de dados
- ✅ Health check
- ✅ Estrutura de resposta padronizada

**Endpoints:**
```
GET    /health          - Status do serviço
GET    /               - Listar usuários
GET    /:id            - Buscar usuário por ID
POST   /               - Criar usuário
PUT    /:id            - Atualizar usuário
DELETE /:id            - Deletar usuário
```

**Dados de exemplo:**
```javascript
const usuarios = [
    { id: 1, nome: "João Silva", email: "joao@email.com", ativo: true },
    { id: 2, nome: "Maria Santos", email: "maria@email.com", ativo: true },
    { id: 3, nome: "Pedro Costa", email: "pedro@email.com", ativo: false }
];
```

#### 2.2 Microserviço de Produtos (`servicos/produtos.js`)

**Funcionalidades implementadas:**
- ✅ CRUD completo de produtos
- ✅ Filtro por categoria
- ✅ Verificação de disponibilidade/estoque
- ✅ Health check

**Endpoints:**
```
GET    /health                    - Status do serviço
GET    /                         - Listar produtos
GET    /?categoria=X             - Filtrar por categoria
GET    /:id                      - Buscar produto por ID
GET    /:id/disponibilidade      - Verificar estoque
POST   /                         - Criar produto
PUT    /:id                      - Atualizar produto
DELETE /:id                      - Deletar produto
```

#### 2.3 Microserviço de Pedidos (`servicos/pedidos.js`)

**Funcionalidades implementadas:**
- ✅ CRUD completo de pedidos
- ✅ Validação com outros microserviços
- ✅ Relatórios e estatísticas
- ✅ Comunicação inter-serviços

**Endpoints:**
```
GET    /health                   - Status do serviço
GET    /                        - Listar pedidos
GET    /:id                     - Buscar pedido por ID
POST   /                        - Criar pedido (com validações)
PUT    /:id/status              - Atualizar status
DELETE /:id                     - Cancelar pedido
GET    /relatorio/resumo        - Relatório resumido
```

**Validações implementadas:**
- ✅ Usuário existe (consulta ao serviço de usuários)
- ✅ Produto existe (consulta ao serviço de produtos)
- ✅ Produto disponível (verificação de estoque)

### 🚪 Fase 3: Implementação do API Gateway

#### 3.1 Configuração Base (`gateway.js`)

**Middlewares implementados:**
```javascript
// CORS para permitir requisições cross-origin
app.use(cors());

// Parser JSON para requisições
app.use(express.json());

// Logging HTTP com Morgan
app.use(morgan('combined'));
```

#### 3.2 Sistema de Autenticação

**Implementação:**
```javascript
const VALID_TOKENS = ['token123', 'admin456', 'user789'];

const authenticateToken = (req, res, next) => {
    // Verificar header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token || !VALID_TOKENS.includes(token)) {
        return res.status(401).json({ erro: 'Token de acesso necessário' });
    }
    
    next();
};
```

**Rotas protegidas:**
- ✅ Todos os endpoints `/api/*`
- ✅ Endpoint `/servicos/status`

**Rotas públicas:**
- ✅ `/health` (health check do gateway)

#### 3.3 Rate Limiting

**Configuração:**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 60 * 1000,    // 1 minuto
    max: 10,                // 10 requisições por minuto
    message: { erro: 'Muitas requisições. Tente novamente em 1 minuto.' }
});

app.use(limiter);
```

#### 3.4 Configuração de Proxy

**Roteamento implementado:**
```javascript
const { createProxyMiddleware } = require('http-proxy-middleware');

// Proxy para Usuários
app.use('/api/usuarios', createProxyMiddleware({
    target: 'http://localhost:6001',
    changeOrigin: true,
    pathRewrite: { '^/api/usuarios': '' }
}));

// Proxy para Produtos
app.use('/api/produtos', createProxyMiddleware({
    target: 'http://localhost:6002',
    changeOrigin: true,
    pathRewrite: { '^/api/produtos': '' }
}));

// Proxy para Pedidos
app.use('/api/pedidos', createProxyMiddleware({
    target: 'http://localhost:6003',
    changeOrigin: true,
    pathRewrite: { '^/api/pedidos': '' }
}));
```

### 🧪 Fase 4: Testes e Validação

#### 4.1 Cliente de Teste (`cliente.js`)

**Funcionalidades implementadas:**
- ✅ Teste de health check
- ✅ Teste de autenticação
- ✅ Teste de CRUD completo
- ✅ Teste de comunicação entre serviços
- ✅ Teste de rate limiting

**Fluxo de testes:**
1. Health check do gateway
2. Listar usuários
3. Listar produtos
4. Criar pedido (com validações)
5. Verificar pedido criado
6. Teste de rate limiting

#### 4.2 Scripts NPM (`package.json`)

```json
{
  "scripts": {
    "gateway": "node gateway.js",
    "servico-usuarios": "node servicos/usuarios.js",
    "servico-produtos": "node servicos/produtos.js",
    "servico-pedidos": "node servicos/pedidos.js",
    "cliente": "node cliente.js",
    "start-all": "concurrently \"npm run servico-usuarios\" \"npm run servico-produtos\" \"npm run servico-pedidos\" \"npm run gateway\"",
    "test": "node cliente.js"
  }
}
```

### 🔧 Fase 5: Configurações Avançadas

#### 5.1 Health Checks

**Gateway health check:**
```javascript
app.get('/health', (req, res) => {
    res.json({
        status: 'Gateway funcionando',
        timestamp: new Date().toISOString(),
        servicos: {
            usuarios: 'http://localhost:6001',
            produtos: 'http://localhost:6002',
            pedidos: 'http://localhost:6003'
        }
    });
});
```

**Status dos serviços:**
```javascript
app.get('/servicos/status', authenticateToken, async (req, res) => {
    // Verificar status de cada microserviço
    const servicos = await Promise.allSettled([
        axios.get('http://localhost:6001/health'),
        axios.get('http://localhost:6002/health'),
        axios.get('http://localhost:6003/health')
    ]);
    
    res.json({ servicos });
});
```

#### 5.2 Tratamento de Erros

**Middleware de erro global:**
```javascript
app.use((err, req, res, next) => {
    console.error('❌ [GATEWAY] Erro:', err.message);
    res.status(500).json({ 
        erro: 'Erro interno do servidor',
        timestamp: new Date().toISOString()
    });
});
```

**Handler 404:**
```javascript
app.use('*', (req, res) => {
    console.log(`❌ [GATEWAY] Rota não encontrada: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ 
        erro: 'Rota não encontrada',
        metodo: req.method,
        url: req.originalUrl
    });
});
```

### 📊 Fase 6: Monitoramento e Logs

#### 6.1 Logging Estruturado

**Logs implementados:**
- ✅ Requisições HTTP (Morgan)
- ✅ Autenticação (sucesso/falha)
- ✅ Rate limiting (bloqueios)
- ✅ Roteamento (proxy)
- ✅ Erros e exceções

**Exemplo de logs:**
```
✅ [GATEWAY] Token válido: token123
🔄 [GATEWAY] Roteando para usuários: GET /
✅ [GATEWAY] Resposta do serviço usuários: 200
❌ [GATEWAY] Rate limit excedido para IP: ::1
```

#### 6.2 Métricas Básicas

**Informações coletadas:**
- ✅ Número de requisições por endpoint
- ✅ Tempo de resposta dos microserviços
- ✅ Taxa de erro por serviço
- ✅ Uso de tokens de autenticação

### 🚀 Fase 7: Execução e Deploy

#### 7.1 Execução Local

**Opção 1 - Tudo junto:**
```bash
npm run start-all
```

**Opção 2 - Separado (4 terminais):**
```bash
# Terminal 1
npm run servico-usuarios

# Terminal 2
npm run servico-produtos

# Terminal 3
npm run servico-pedidos

# Terminal 4
npm run gateway
```

#### 7.2 Testes

**Teste automatizado:**
```bash
npm run cliente
```

**Teste manual:**
```bash
# Health check
curl http://localhost:8080/health

# Com autenticação
curl -H "Authorization: Bearer token123" \
     http://localhost:8080/api/usuarios
```

### 📈 Resultados Esperados

#### ✅ Funcionalidades Validadas:

1. **API Gateway funcionando** na porta 8080
2. **Autenticação centralizada** com Bearer tokens
3. **Rate limiting** de 10 req/min por IP
4. **Roteamento correto** para microserviços
5. **Comunicação entre serviços** (pedidos → usuários/produtos)
6. **Health checks** de todos os componentes
7. **Logging completo** de todas as operações
8. **Tratamento de erros** adequado

#### 📊 Métricas de Sucesso:

- ✅ **100% dos endpoints** funcionando
- ✅ **Autenticação** bloqueando acessos não autorizados
- ✅ **Rate limiting** ativo e funcional
- ✅ **Comunicação inter-serviços** validada
- ✅ **Logs estruturados** para debugging
- ✅ **Respostas consistentes** em JSON

### 🔮 Próximos Passos

#### Melhorias Recomendadas:

1. **Circuit Breaker** - Falha rápida em serviços indisponíveis
2. **Load Balancing** - Múltiplas instâncias dos microserviços
3. **Caching** - Redis para cache de respostas
4. **Database** - Substituir arrays por banco de dados
5. **Docker** - Containerização dos serviços
6. **Kubernetes** - Orquestração e scaling
7. **Monitoring** - Prometheus + Grafana
8. **Tracing** - Jaeger para distributed tracing 