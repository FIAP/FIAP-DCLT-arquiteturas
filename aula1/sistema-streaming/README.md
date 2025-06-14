# Sistema de Gravação e Processamento de Mídia

Este projeto implementa um sistema distribuído para gravação, processamento e distribuição de conteúdo multimídia, simulando a arquitetura descrita para um sistema de streaming profissional.

## Arquitetura do Sistema

O sistema é composto pelos seguintes componentes:

### 1. Front-end de Gravação (REC - front)
- Interface web responsável pelo controle de gravação
- Suporte a redundância e alta disponibilidade
- Controle em tempo real de gravações

### 2. Sistema de Gravação Central
- **Grava HD Principal**: Gravação em alta definição (1080p/4K)
- **Grava Extra**: Gravação de conteúdo secundário em múltiplas resoluções

### 3. Sistema de Filas de Processamento
- **Fila UOL**: Processamento específico para portal UOL
- **Fila YouTube**: Processamento para plataforma YouTube
- **Máquina de Cortes**: Editor automatizado com detecção de cenas
- **Filas REC**: Gerenciamento geral, backup e arquivamento

## Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Socket.IO** - Comunicação em tempo real
- **HTML5/CSS3/JavaScript** - Interface web moderna
- **UUID** - Geração de identificadores únicos

## Instalação e Execução

### Pré-requisitos
- Node.js 14+ instalado
- npm ou yarn

### Passos para instalação

1. **Clone o repositório:**
```bash
git clone <url-do-repositorio>
cd sistema-streaming
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Execute o sistema:**
```bash
# Modo de desenvolvimento (com auto-reload)
npm run dev

# Modo de produção
npm start
```

4. **Acesse a interface:**
Abra seu navegador e acesse: `http://localhost:3000`

## Funcionalidades

### Controle de Gravação
- ✅ Criar nova gravação (HD Principal ou Extra)
- ✅ Iniciar/pausar/parar gravações
- ✅ Monitoramento em tempo real
- ✅ Controle de qualidade automático

### Sistema de Filas
- ✅ Processamento automático em múltiplas filas
- ✅ Priorização de tarefas
- ✅ Monitoramento de progresso
- ✅ Tratamento de erros
- ✅ Balanceamento de carga

### Monitoramento
- ✅ Dashboard em tempo real
- ✅ Métricas de performance
- ✅ Alertas automáticos
- ✅ Logs do sistema
- ✅ Status de saúde

## API Endpoints

### Gravação
- `GET /api/gravacao` - Listar gravações
- `POST /api/gravacao` - Criar gravação
- `POST /api/gravacao/:id/iniciar` - Iniciar gravação
- `POST /api/gravacao/:id/pausar` - Pausar gravação
- `POST /api/gravacao/:id/parar` - Parar gravação
- `POST /api/gravacao/:id/processar` - Enviar para processamento

### Filas
- `GET /api/filas` - Status de todas as filas
- `GET /api/filas/:nome` - Detalhes de uma fila
- `POST /api/filas/:nome/pausar` - Pausar fila
- `POST /api/filas/:nome/reativar` - Reativar fila
- `POST /api/filas/:nome/limpar` - Limpar fila

### Monitoramento
- `GET /api/monitoramento/dashboard` - Dashboard principal
- `GET /api/monitoramento/saude` - Status de saúde
- `GET /api/monitoramento/performance` - Métricas de performance
- `GET /api/monitoramento/alertas` - Alertas do sistema

## Estrutura do Projeto

```
sistema-streaming/
├── models/                 # Modelos de dados
│   ├── Gravacao.js        # Modelo de gravação
│   └── FilaProcessamento.js # Modelo das filas
├── routes/                 # Rotas da API
│   ├── gravacao.js        # Endpoints de gravação
│   ├── filas.js           # Endpoints das filas
│   └── monitoramento.js   # Endpoints de monitoramento
├── services/              # Serviços de negócio
│   └── FilaProcessor.js   # Processador de filas
├── public/                # Interface web
│   └── index.html         # Dashboard principal
├── server.js              # Servidor principal
├── package.json           # Dependências
└── README.md              # Este arquivo
```

## Fluxo de Dados

```
┌─────────────────┐    ┌─────────────────┐
│   REC - front   │◄──►│   REC - front   │
│   (Principal)   │    │  (Redundante)   │
└─────────┬───────┘    └─────────────────┘
          │
          ▼
┌─────────────────────────────────┐
│          Sistema Grava          │
│  ┌─────────────┐ ┌─────────────┐│
│  │ HD Principal│ │    Extra    ││
│  │ (Broadcast) │ │ (Adicional) ││
│  └─────────────┘ └─────────────┘│
└─────────┬───────────────────────┘
          │
          ▼
┌─────────────────────────────────┐
│       Filas de Processo         │
│                                 │
│ ┌───────────┐ ┌───────────────┐ │
│ │ Fila UOL  │ │ Máq. Cortes   │ │
│ └───────────┘ └───────────────┘ │
│                                 │
│ ┌───────────┐ ┌───────────────┐ │
│ │Fila YouTube│ │  Filas REC   │ │
│ └───────────┘ └───────────────┘ │
└─────────────────────────────────┘
```

## Recursos do Sistema

### Simulação Realista
- Tempos de processamento baseados na complexidade
- Simulação de erros aleatórios (5% de chance)
- Diferentes configurações por plataforma

### Monitoramento Avançado
- Atualizações em tempo real via WebSocket
- Métricas de performance detalhadas
- Sistema de alertas automatizado

### Interface Moderna
- Design responsivo
- Atualizações em tempo real
- Interface intuitiva

## Exemplos de Uso

### 1. Criar e Executar uma Gravação
```javascript
// Via interface web ou API
POST /api/gravacao
{
  "titulo": "Programa Especial",
  "tipo": "HD_PRINCIPAL"
}

// Iniciar gravação
POST /api/gravacao/{id}/iniciar

// Parar e processar
POST /api/gravacao/{id}/parar
POST /api/gravacao/{id}/processar
{
  "plataformas": ["UOL", "YOUTUBE", "REC"]
}
```

### 2. Monitorar Filas
```javascript
// Verificar status de todas as filas
GET /api/filas

// Pausar fila específica
POST /api/filas/YOUTUBE/pausar
```

## Desenvolvimento

### Modo de Desenvolvimento
```bash
npm run dev
```

### Estrutura de Logs
O sistema mantém logs detalhados de todas as operações:
- Criação/controle de gravações
- Processamento em filas
- Erros e alertas
- Métricas de performance

### WebSocket Events
- `sistema-status` - Status geral do sistema
- `gravacao-iniciada` - Nova gravação iniciada
- `gravacao-finalizada` - Gravação concluída
- `item-atualizado` - Progresso de processamento

## Contribuição

Este projeto foi desenvolvido como demonstração da arquitetura de sistema de streaming. Para contribuições:

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## Licença

MIT License - veja o arquivo LICENSE para detalhes.

## Suporte

Para dúvidas ou problemas:
- Abra uma issue no repositório
- Consulte a documentação da API
- Verifique os logs do sistema 