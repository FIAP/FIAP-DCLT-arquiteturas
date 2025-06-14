const { v4: uuidv4 } = require('uuid');

class ItemFila {
  constructor(gravacao, plataforma, prioridade = 'NORMAL') {
    this.id = uuidv4();
    this.gravacaoId = gravacao.id;
    this.gravacao = gravacao;
    this.plataforma = plataforma;
    this.prioridade = prioridade; // BAIXA, NORMAL, ALTA, URGENTE
    this.status = 'AGUARDANDO'; // AGUARDANDO, PROCESSANDO, CONCLUIDO, ERRO
    this.dataAdicao = new Date();
    this.dataInicio = null;
    this.dataConclusao = null;
    this.progresso = 0;
    this.erro = null;
    this.configuracao = this.obterConfiguracaoPlataforma(plataforma);
    this.tempoEstimado = this.calcularTempoEstimado();
  }

  obterConfiguracaoPlataforma(plataforma) {
    const configuracoes = {
      'UOL': {
        formatos: ['mp4', 'webm'],
        resolucoes: ['480p', '720p'],
        bitrate: '2000k',
        codec: 'h264'
      },
      'YOUTUBE': {
        formatos: ['mp4'],
        resolucoes: ['360p', '720p', '1080p', '4K'],
        bitrate: '4000k',
        codec: 'h264'
      },
      'CORTES': {
        formatos: ['mp4'],
        resolucoes: ['720p', '1080p'],
        bitrate: '3000k',
        codec: 'h264',
        operacoes: ['deteccao_cenas', 'cortes_automaticos', 'highlights']
      },
      'REC': {
        formatos: ['mp4', 'mov'],
        resolucoes: ['1080p', '4K'],
        bitrate: '8000k',
        codec: 'h264',
        operacoes: ['backup', 'arquivamento', 'qualidade']
      }
    };
    return configuracoes[plataforma] || configuracoes['REC'];
  }

  calcularTempoEstimado() {
    const multiplicadores = {
      'UOL': 0.5,
      'YOUTUBE': 0.8,
      'CORTES': 2.0,
      'REC': 0.3
    };
    const multiplicador = multiplicadores[this.plataforma] || 1.0;
    return Math.ceil(this.gravacao.duracao * multiplicador);
  }

  iniciarProcessamento() {
    if (this.status === 'AGUARDANDO') {
      this.status = 'PROCESSANDO';
      this.dataInicio = new Date();
      return true;
    }
    return false;
  }

  atualizarProgresso(progresso) {
    if (this.status === 'PROCESSANDO') {
      this.progresso = Math.min(100, Math.max(0, progresso));
    }
  }

  concluir() {
    if (this.status === 'PROCESSANDO') {
      this.status = 'CONCLUIDO';
      this.progresso = 100;
      this.dataConclusao = new Date();
      return true;
    }
    return false;
  }

  falhar(erro) {
    this.status = 'ERRO';
    this.erro = erro;
    this.dataConclusao = new Date();
  }

  obterResumo() {
    return {
      id: this.id,
      gravacaoId: this.gravacaoId,
      plataforma: this.plataforma,
      prioridade: this.prioridade,
      status: this.status,
      progresso: this.progresso,
      dataAdicao: this.dataAdicao,
      dataInicio: this.dataInicio,
      dataConclusao: this.dataConclusao,
      tempoEstimado: this.tempoEstimado,
      erro: this.erro
    };
  }
}

class FilaProcessamento {
  constructor(nome) {
    this.nome = nome;
    this.itens = [];
    this.processandoAtual = null;
    this.ativa = true;
    this.configuracao = {
      capacidadeMaxima: 100,
      processamentoSimultaneo: false
    };
  }

  adicionarItem(gravacao, prioridade = 'NORMAL') {
    if (this.itens.length >= this.configuracao.capacidadeMaxima) {
      throw new Error('Fila está cheia');
    }

    const item = new ItemFila(gravacao, this.nome, prioridade);
    this.itens.push(item);
    this.ordenarPorPrioridade();
    return item;
  }

  ordenarPorPrioridade() {
    const prioridades = { 'URGENTE': 4, 'ALTA': 3, 'NORMAL': 2, 'BAIXA': 1 };
    this.itens.sort((a, b) => {
      if (a.status !== b.status) {
        if (a.status === 'AGUARDANDO') return -1;
        if (b.status === 'AGUARDANDO') return 1;
      }
      return prioridades[b.prioridade] - prioridades[a.prioridade];
    });
  }

  obterProximoItem() {
    return this.itens.find(item => item.status === 'AGUARDANDO');
  }

  obterItemPorId(id) {
    return this.itens.find(item => item.id === id);
  }

  removerItem(id) {
    const index = this.itens.findIndex(item => item.id === id);
    if (index !== -1) {
      return this.itens.splice(index, 1)[0];
    }
    return null;
  }

  obterEstatisticas() {
    const total = this.itens.length;
    const aguardando = this.itens.filter(item => item.status === 'AGUARDANDO').length;
    const processando = this.itens.filter(item => item.status === 'PROCESSANDO').length;
    const concluidos = this.itens.filter(item => item.status === 'CONCLUIDO').length;
    const erros = this.itens.filter(item => item.status === 'ERRO').length;

    return {
      nome: this.nome,
      total,
      aguardando,
      processando,
      concluidos,
      erros,
      ativa: this.ativa,
      capacidadeMaxima: this.configuracao.capacidadeMaxima
    };
  }

  obterResumo() {
    return {
      nome: this.nome,
      estatisticas: this.obterEstatisticas(),
      itens: this.itens.map(item => item.obterResumo())
    };
  }
}

module.exports = { FilaProcessamento, ItemFila }; 