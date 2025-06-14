# 🏗️ Sistema Monolítico de Investimentos

> **Projeto Educacional FIAP** - Demonstração prática de Arquitetura Monolítica com Frontend e Backend integrados em Node.js

## 📋 Visão Geral

Este projeto demonstra um **sistema monolítico completo** de investimentos, onde frontend e backend são executados em um **único processo Node.js**, compartilhando modelos, configurações e lógica de negócio. É um exemplo educacional perfeito para entender as características e benefícios da arquitetura monolítica.

## 🏗️ Características da Arquitetura Monolítica

### ✅ **Frontend e Backend Integrados**
- **Mesmo processo Node.js** executa tanto a interface web quanto a API REST
- **Template engine EJS** para renderização server-side
- **Compartilhamento** de entidades, validações e lógica de negócio
- **Arquivos estáticos** servidos pelo próprio Express

### ✅ **Vantagens Demonstradas**
- **Desenvolvimento simplificado** - uma única base de código
- **Deploy único** - apenas um artefato para implantar
- **Compartilhamento de código** - modelos e utilitários reutilizados
- **Transações ACID** simplificadas - tudo no mesmo processo
- **Debugging facilitado** - stack trace completo em um só lugar

### ✅ **Stack Tecnológico Integrado**
- **Backend**: Node.js + Express.js + Sequelize + PostgreSQL
- **Frontend**: EJS Templates + Bootstrap 5 + Chart.js
- **Autenticação**: JWT integrado com cookies e sessions
- **Documentação**: Swagger UI integrado
- **Containerização**: Docker + Docker Compose

## 📁 Estrutura do Projeto Monolítico

```
sistema-investimentos/
├── src/
│   ├── app.js                 # 🚀 Aplicação principal (Frontend + Backend)
│   ├── config/
│   │   └── database.js        # Configuração do banco
│   ├── models/                # 📊 Modelos compartilhados (Frontend + Backend)
│   │   ├── index.js
│   │   ├── User.js
│   │   ├── Asset.js
│   │   ├── Portfolio.js
│   │   ├── Transaction.js
│   │   └── PortfolioAsset.js
│   ├── routes/
│   │   ├── pageRoutes.js      # 🌐 Rotas das páginas (Frontend)
│   │   ├── authRoutes.js      # 🔐 API de autenticação
│   │   ├── userRoutes.js      # 👤 API de usuários
│   │   ├── assetRoutes.js     # 💰 API de ativos
│   │   ├── portfolioRoutes.js # 📊 API de portfólio
│   │   └── transactionRoutes.js # 💸 API de transações
│   ├── middleware/
│   │   ├── auth.js            # Autenticação compartilhada
│   │   └── errorHandler.js    # Tratamento de erros
│   ├── views/                 # 🎨 Templates EJS (Frontend integrado)
│   │   ├── layout/
│   │   │   └── base.ejs       # Layout base compartilhado
│   │   ├── home.ejs           # Página inicial
│   │   ├── dashboard.ejs      # Dashboard do usuário
│   │   ├── assets.ejs         # Listagem de ativos
│   │   ├── portfolio.ejs      # Portfólio do usuário
│   │   ├── transactions.ejs   # Histórico de transações
│   │   └── error.ejs          # Página de erro
│   └── public/                # 📁 Arquivos estáticos integrados
│       ├── css/
│       ├── js/
│       └── images/
├── sql/
│   └── init.sql              # 🗄️ Dados iniciais
├── docs/                     # 📚 Documentação
├── docker-compose.yml        # 🐳 Orquestração completa
├── Dockerfile               # 📦 Container da aplicação monolítica
└── package.json             # 📋 Dependências integradas
```

## 🚀 Como Executar

### 📋 Pré-requisitos
- Node.js 18+ 
- Docker e Docker Compose
- Git

### 🐳 Execução com Docker (Recomendado)

```bash
# Clone o repositório
git clone <repository-url>
cd sistema-investimentos

# Execute o sistema monolítico completo
docker-compose up -d

# Acompanhe os logs
docker-compose logs -f app
```

### 💻 Execução Local

```bash
# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp config.example .env

# Execute o banco de dados
docker-compose up -d postgres

# Execute a aplicação monolítica
npm run dev
```

## 🌐 Acessos

Após executar o sistema, você terá acesso a:

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **🏠 Frontend** | http://localhost:3000 | Interface web integrada |
| **🔌 API REST** | http://localhost:3000/api/v1 | API REST no mesmo servidor |
| **📚 Documentação** | http://localhost:3000/api-docs | Swagger UI integrado |
| **🏥 Health Check** | http://localhost:3000/health | Status do sistema monolítico |
| **🗄️ Adminer** | http://localhost:8080 | Interface do banco de dados |

## 📊 Funcionalidades do Sistema

### 🌐 **Frontend Integrado (Server-Side Rendering)**
- **Página inicial** com estatísticas em tempo real
- **Dashboard** personalizado por usuário
- **Catálogo de ativos** com filtros e busca
- **Gestão de portfólio** com gráficos interativos
- **Histórico de transações** completo
- **Autenticação** integrada com sessões

### 🔌 **API REST Integrada**
- **25+ endpoints** RESTful documentados
- **Autenticação JWT** compartilhada
- **Validação robusta** de dados
- **Transações ACID** completas
- **Rate limiting** e segurança
- **Swagger** documentação automática

### 📊 **Funcionalidades de Negócio**
- **Cadastro e autenticação** de usuários
- **Catálogo de ativos** (ações, FIIs, criptos, renda fixa)
- **Compra e venda** de ativos com validações
- **Gestão de portfólio** com cálculos de performance
- **Análise de diversificação** e perfil de risco
- **Histórico completo** de transações

## 🏗️ Demonstração da Arquitetura Monolítica

### 🔄 **Compartilhamento de Código**
```javascript
// Modelos compartilhados entre frontend e backend
const { User, Asset, Portfolio } = require('../models');

// Frontend (EJS) usa os mesmos modelos
app.get('/dashboard', async (req, res) => {
  const portfolio = await Portfolio.findOne({
    where: { user_id: req.user.id },
    include: [Asset] // Mesmo modelo usado na API
  });
  res.render('dashboard', { portfolio });
});

// Backend (API) usa os mesmos modelos
app.get('/api/v1/portfolio', async (req, res) => {
  const portfolio = await Portfolio.findOne({
    where: { user_id: req.user.id },
    include: [Asset] // Exato mesmo código!
  });
  res.json({ data: portfolio });
});
```

### 🔐 **Autenticação Integrada**
```javascript
// Middleware compartilhado para páginas e API
const { authenticateToken } = require('../middleware/auth');

// Protege tanto páginas quanto endpoints da API
app.get('/dashboard', authenticateToken, renderDashboard);
app.get('/api/v1/portfolio', authenticateToken, getPortfolioAPI);
```

### 🗄️ **Transações ACID Simplificadas**
```javascript
// Transação no mesmo processo e banco
await sequelize.transaction(async (t) => {
  await User.decrement('balance', { by: amount }, { transaction: t });
  await Transaction.create(transactionData, { transaction: t });
  await PortfolioAsset.upsert(portfolioData, { transaction: t });
  // Tudo ou nada - garantia ACID completa
});
```

## 📈 Benefícios Educacionais

### ✅ **Para Estudantes**
- **Conceitos claros** de arquitetura monolítica
- **Código real** em produção
- **Boas práticas** de desenvolvimento
- **Segurança** e validação de dados
- **Testes** e documentação

### ✅ **Para Professores**
- **Exemplo completo** para aulas
- **Comparação** com microsserviços
- **Demonstração** de trade-offs arquiteturais
- **Projeto executável** imediatamente
- **Documentação didática** completa

## 🔧 Tecnologias e Conceitos Demonstrados

### **Backend**
- ✅ Node.js + Express.js
- ✅ ORM Sequelize + PostgreSQL
- ✅ Autenticação JWT
- ✅ Validação de dados
- ✅ Rate limiting
- ✅ Logging e monitoramento
- ✅ Swagger documentation

### **Frontend**
- ✅ Server-Side Rendering (SSR)
- ✅ EJS Template Engine
- ✅ Bootstrap 5 responsivo
- ✅ JavaScript vanilla
- ✅ Chart.js para gráficos
- ✅ Progressive Enhancement

### **DevOps**
- ✅ Docker containerização
- ✅ Docker Compose orquestração
- ✅ Variáveis de ambiente
- ✅ Health checks
- ✅ Logs estruturados

## 📚 Documentação Adicional

- 📖 [Arquitetura do Sistema](docs/arquitetura-sistema.md)
- 🔄 [Diagramas de Sequência](docs/diagramas-sequencia.md)
- 🔌 [Documentação da API](http://localhost:3000/api-docs) (após executar)

## 🤝 Contribuições

Este é um projeto educacional da FIAP. Contribuições são bem-vindas para melhorar o exemplo didático!

## 📄 Licença

MIT License - Livre para uso educacional e comercial.

---

**🎓 FIAP - Faculdade de Informática e Administração Paulista**  
*Arquitetura de Software - Demonstração de Sistema Monolítico* 