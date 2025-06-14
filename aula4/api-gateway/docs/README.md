# 📚 Documentação do Projeto API Gateway

## 🎯 Visão Geral

Este projeto demonstra a implementação de um **API Gateway** com arquitetura de **microserviços**, mostrando os padrões de comunicação síncrona e assíncrona em sistemas distribuídos.

## 🏗️ Arquitetura do Sistema

### Componentes Principais:

1. **🚪 API Gateway (Porta 8080)**
   - Ponto único de entrada
   - Autenticação centralizada
   - Rate limiting
   - Roteamento de requisições

2. **👥 Microserviço de Usuários (Porta 6001)**
   - Gerenciamento de usuários
   - CRUD completo
   - Validação de dados

3. **📦 Microserviço de Produtos (Porta 6002)**
   - Catálogo de produtos
   - Controle de estoque
   - Filtros por categoria

4. **🛒 Microserviço de Pedidos (Porta 6003)**
   - Processamento de pedidos
   - Validação com outros serviços
   - Relatórios

## 🔄 Fluxos de Comunicação

### 1. Comunicação Cliente → Gateway → Microserviço

```
Cliente → API Gateway → Microserviço → Resposta
```

### 2. Comunicação Entre Microserviços

```
Pedidos → Usuários (validar usuário)
Pedidos → Produtos (validar produto/estoque)
```

## 📋 Passo a Passo da Implementação

### Fase 1: Estrutura Base
1. ✅ Criação da estrutura de pastas
2. ✅ Configuração do package.json
3. ✅ Instalação das dependências

### Fase 2: Microserviços
1. ✅ Implementação do serviço de Usuários
2. ✅ Implementação do serviço de Produtos
3. ✅ Implementação do serviço de Pedidos
4. ✅ Comunicação entre serviços

### Fase 3: API Gateway
1. ✅ Configuração do proxy HTTP
2. ✅ Sistema de autenticação
3. ✅ Rate limiting
4. ✅ Roteamento de requisições
5. ✅ Health checks

### Fase 4: Testes e Validação
1. ✅ Cliente de teste automatizado
2. ✅ Testes manuais com curl
3. ✅ Validação de fluxos completos

## 🔧 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **http-proxy-middleware** - Proxy para roteamento
- **Axios** - Cliente HTTP
- **Morgan** - Logging de requisições
- **CORS** - Controle de acesso
- **Concurrently** - Execução paralela de processos

## 📊 Métricas e Monitoramento

### Health Checks Implementados:
- ✅ Status do Gateway
- ✅ Status dos Microserviços
- ✅ Conectividade entre serviços

### Logs Disponíveis:
- ✅ Requisições HTTP (Morgan)
- ✅ Autenticação e autorização
- ✅ Rate limiting
- ✅ Roteamento de requisições
- ✅ Erros e exceções

## 📚 Documentação Completa

### 📖 Guias Disponíveis:

1. **[📊 Diagramas de Sequência](./diagrama-sequencia.md)**
   - Fluxos detalhados de requisições
   - Comunicação entre componentes
   - Cenários de erro e sucesso

2. **[🏗️ Arquitetura do Sistema](./arquitetura.md)**
   - Visão geral da arquitetura
   - Componentes e responsabilidades
   - Padrões implementados

3. **[🛠️ Guia de Implementação](./guia-implementacao.md)**
   - Passo a passo completo
   - Código e configurações
   - Boas práticas

## 🚀 Como Executar

Consulte o [README principal](../README.md) para instruções detalhadas de execução.

## 📈 Próximos Passos

### Melhorias Possíveis:
- [ ] Circuit Breaker
- [ ] Load Balancing
- [ ] Cache distribuído
- [ ] Métricas avançadas
- [ ] Tracing distribuído
- [ ] Versionamento de APIs 