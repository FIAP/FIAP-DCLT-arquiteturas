# Exemplo de Comunicação Síncrona

Este projeto demonstra um padrão muito comum em APIs RESTful, onde as requisições são feitas via HTTP e a resposta é retornada imediatamente (comunicação síncrona).

## 📋 Estrutura do Projeto

```
comunicacao-sync/
├── package.json      # Dependências e scripts
├── servidor.js       # API RESTful (servidor)
├── cliente.js        # Cliente que consome a API
└── README.md         # Este arquivo
```

## 🚀 Como Executar

### 1. Instalar Dependências
```bash
cd comunicacao-sync
npm install
```

### 2. Executar o Servidor
Em um terminal, execute:
```bash
npm run servidor
```

O servidor irá iniciar na porta 5003 e você verá:
```
🚀 Servidor rodando na porta 5003
📡 API RESTful ativa e aguardando requisições...
🔗 Endpoints disponíveis:
   GET    /status
   GET    /usuarios
   GET    /usuarios/:id
   POST   /usuarios
```

### 3. Executar o Cliente
Em outro terminal, execute:
```bash
npm run cliente
```

Isso executará uma sequência de requisições que demonstram a comunicação síncrona.

## 🔍 O que o Exemplo Demonstra

### Servidor (`servidor.js`)
- **API RESTful** usando Express.js
- **Endpoints** para gerenciar usuários
- **Respostas síncronas** - cada requisição é processada e respondida imediatamente
- **Simulação de processamento** com delays para demonstrar o comportamento

### Cliente (`cliente.js`)
- **Cliente HTTP** usando Axios
- **Requisições síncronas** - espera cada resposta antes de continuar
- **Tratamento de erros** para demonstrar diferentes cenários
- **Demonstração completa** do ciclo request/response

## 📊 Fluxo de Comunicação Síncrona

```
Cliente                    Servidor
   |                          |
   |------ GET /status ------>|
   |                          | (processa)
   |<----- 200 OK ------------|
   |                          |
   |------ GET /usuarios ---->|
   |                          | (processa)
   |<----- 200 + dados -------|
   |                          |
   |------ POST /usuarios --->|
   |                          | (processa)
   |<----- 201 + novo --------|
```

## 🎯 Características da Comunicação Síncrona

- ✅ **Simplicidade**: Padrão direto e fácil de entender
- ✅ **Imediaticidade**: Resposta instantânea para cada requisição
- ✅ **Controle de fluxo**: Cliente controla quando fazer cada requisição
- ⚠️ **Bloqueante**: Cliente fica esperando a resposta
- ⚠️ **Dependência**: Se o servidor estiver lento, o cliente espera

## 🌐 Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/status` | Status da API |
| GET | `/usuarios` | Lista todos os usuários |
| GET | `/usuarios/:id` | Busca usuário por ID |
| POST | `/usuarios` | Cria novo usuário |

## 🔧 Exemplos de Uso Manual

### Usando curl:
```bash
# Status da API
curl http://localhost:5003/status

# Listar usuários
curl http://localhost:5003/usuarios

# Buscar usuário específico
curl http://localhost:5003/usuarios/1

# Criar novo usuário
curl -X POST http://localhost:5003/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teste","email":"teste@email.com"}'
```

### Usando Postman ou Insomnia:
- Importe a URL base: `http://localhost:5003`
- Teste os endpoints listados acima

## 💡 Conceitos Importantes

Este exemplo ilustra perfeitamente o padrão de **comunicação síncrona** onde:

1. **Cliente faz uma requisição** e fica aguardando
2. **Servidor processa** a requisição
3. **Servidor retorna** a resposta imediatamente
4. **Cliente recebe** e pode prosseguir

Este é o padrão mais comum em:
- APIs REST
- Serviços web tradicionais
- Aplicações cliente-servidor simples 