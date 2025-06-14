# Arquitetura do Sistema de Gravação e Processamento de Mídia

## Visão Geral

Este documento descreve a arquitetura de um sistema distribuído para gravação, processamento e distribuição de conteúdo multimídia, com foco em vídeos para diferentes plataformas.

## Componentes da Arquitetura

### 1. Front-end de Gravação (REC - front)

**Descrição**: Interface responsável pela captura e gravação de conteúdo audiovisual.

**Características**:
- Interface dupla para redundância e alta disponibilidade
- Captura de vídeo em tempo real
- Interface de usuário para controle de gravação
- Comunicação com o sistema de armazenamento

**Responsabilidades**:
- Iniciar/parar gravações
- Configurar parâmetros de qualidade
- Monitorar status da gravação
- Enviar comandos para o sistema de gravação

### 2. Sistema de Gravação Central

**Componentes**:

#### Grava - HD Principal
- **Função**: Gravação em alta definição para transmissão principal
- **Formato**: Qualidade televisiva (1080p/4K)
- **Uso**: Conteúdo principal para TV e streaming de alta qualidade

#### Grava - Extra
- **Função**: Gravação de conteúdo adicional/secundário
- **Formato**: Múltiplas resoluções conforme necessidade
- **Uso**: Material complementar, bastidores, ângulos alternativos

### 3. Sistema de Filas de Processamento

#### Fila UOL
- **Propósito**: Processamento específico para portal UOL
- **Características**:
  - Compressão otimizada para web
  - Formatos compatíveis com players web
  - Integração com CMS UOL

#### Fila YouTube
- **Propósito**: Processamento para plataforma YouTube
- **Características**:
  - Codificação conforme especificações YouTube
  - Múltiplas resoluções (360p, 720p, 1080p, 4K)
  - Metadados e thumbnails automáticos

#### Máquina de Cortes
- **Função**: Editor automatizado de vídeo
- **Capacidades**:
  - Detecção de cenas
  - Cortes automáticos baseados em regras
  - Geração de highlights
  - Sincronização de áudio/vídeo

#### Filas REC
- **Propósito**: Gerenciamento geral de tarefas de gravação
- **Funções**:
  - Controle de qualidade
  - Backup e arquivamento
  - Distribuição para outras filas
  - Monitoramento de status

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