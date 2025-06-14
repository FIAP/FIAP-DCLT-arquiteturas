const { FilaProcessamento } = require('../models/FilaProcessamento');

class FilaProcessor {
  constructor(io) {
    this.io = io;
    this.filas = new Map();
    this.inicializarFilas();
    this.intervalos = new Map();
    this.ativo = false;
  }

  inicializarFilas() {
    // Criar as filas conforme a arquitetura
    this.filas.set('UOL', new FilaProcessamento('UOL'));
    this.filas.set('YOUTUBE', new FilaProcessamento('YOUTUBE'));
    this.filas.set('CORTES', new FilaProcessamento('CORTES'));
    this.filas.set('REC', new FilaProcessamento('REC'));

    console.log('Filas de processamento inicializadas:', Array.from(this.filas.keys()));
  }

  iniciar() {
    if (this.ativo) return;
    
    this.ativo = true;
    console.log('Iniciando processador de filas...');

    // Configurar processamento automático para cada fila
    this.filas.forEach((fila, nome) => {
      const intervalo = setInterval(() => {
        this.processarFila(nome);
      }, 2000); // Processar a cada 2 segundos
      
      this.intervalos.set(nome, intervalo);
    });

    // Atualizar status do sistema a cada 5 segundos
    this.intervaloStatus = setInterval(() => {
      this.enviarStatusSistema();
    }, 5000);
  }

  parar() {
    if (!this.ativo) return;

    this.ativo = false;
    console.log('Parando processador de filas...');

    // Limpar todos os intervalos
    this.intervalos.forEach((intervalo) => {
      clearInterval(intervalo);
    });
    this.intervalos.clear();

    if (this.intervaloStatus) {
      clearInterval(this.intervaloStatus);
    }
  }

  adicionarParaProcessamento(gravacao, plataformas = ['UOL', 'YOUTUBE', 'REC']) {
    const resultados = [];

    plataformas.forEach(plataforma => {
      const fila = this.filas.get(plataforma);
      if (fila) {
        try {
          const item = fila.adicionarItem(gravacao);
          resultados.push({
            plataforma,
            itemId: item.id,
            sucesso: true
          });
          console.log(`Gravação ${gravacao.id} adicionada à fila ${plataforma}`);
        } catch (error) {
          resultados.push({
            plataforma,
            sucesso: false,
            erro: error.message
          });
          console.error(`Erro ao adicionar à fila ${plataforma}:`, error.message);
        }
      }
    });

    this.enviarStatusSistema();
    return resultados;
  }

  processarFila(nomeFila) {
    const fila = this.filas.get(nomeFila);
    if (!fila || !fila.ativa) return;

    const proximoItem = fila.obterProximoItem();
    if (!proximoItem) return;

    // Simular processamento
    this.simularProcessamento(proximoItem, nomeFila);
  }

  async simularProcessamento(item, nomeFila) {
    if (!item.iniciarProcessamento()) return;

    console.log(`Iniciando processamento do item ${item.id} na fila ${nomeFila}`);
    this.enviarAtualizacaoItem(item, nomeFila);

    // Simular progresso de processamento
    const tempoTotal = item.tempoEstimado * 1000; // Converter para ms
    const incrementos = 10;
    const tempoIncremento = tempoTotal / incrementos;

    for (let i = 1; i <= incrementos; i++) {
      await this.sleep(tempoIncremento);
      
      if (Math.random() < 0.05) { // 5% chance de erro
        item.falhar(`Erro simulado durante processamento na etapa ${i}`);
        console.log(`Processamento falhou para item ${item.id} na fila ${nomeFila}`);
        this.enviarAtualizacaoItem(item, nomeFila);
        return;
      }

      const progresso = (i / incrementos) * 100;
      item.atualizarProgresso(progresso);
      
      if (i % 3 === 0) { // Atualizar a cada 3 incrementos
        this.enviarAtualizacaoItem(item, nomeFila);
      }
    }

    item.concluir();
    console.log(`Processamento concluído para item ${item.id} na fila ${nomeFila}`);
    this.enviarAtualizacaoItem(item, nomeFila);

    // Se for a fila CORTES, adicionar automaticamente à fila REC
    if (nomeFila === 'CORTES') {
      setTimeout(() => {
        this.adicionarParaProcessamento(item.gravacao, ['REC']);
      }, 1000);
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  obterFila(nome) {
    return this.filas.get(nome);
  }

  obterTodasFilas() {
    const resumo = {};
    this.filas.forEach((fila, nome) => {
      resumo[nome] = fila.obterResumo();
    });
    return resumo;
  }

  obterStatus() {
    const estatisticas = {};
    this.filas.forEach((fila, nome) => {
      estatisticas[nome] = fila.obterEstatisticas();
    });

    return {
      ativo: this.ativo,
      filas: estatisticas,
      timestamp: new Date()
    };
  }

  enviarStatusSistema() {
    if (this.io) {
      const status = this.obterStatus();
      this.io.emit('sistema-status', status);
    }
  }

  enviarAtualizacaoItem(item, nomeFila) {
    if (this.io) {
      this.io.emit('item-atualizado', {
        fila: nomeFila,
        item: item.obterResumo(),
        timestamp: new Date()
      });
    }
  }

  pausarFila(nomeFila) {
    const fila = this.filas.get(nomeFila);
    if (fila) {
      fila.ativa = false;
      console.log(`Fila ${nomeFila} pausada`);
      this.enviarStatusSistema();
      return true;
    }
    return false;
  }

  reativarFila(nomeFila) {
    const fila = this.filas.get(nomeFila);
    if (fila) {
      fila.ativa = true;
      console.log(`Fila ${nomeFila} reativada`);
      this.enviarStatusSistema();
      return true;
    }
    return false;
  }

  limparFila(nomeFila) {
    const fila = this.filas.get(nomeFila);
    if (fila) {
      fila.itens = fila.itens.filter(item => 
        item.status === 'PROCESSANDO' || item.status === 'AGUARDANDO'
      );
      console.log(`Fila ${nomeFila} limpa`);
      this.enviarStatusSistema();
      return true;
    }
    return false;
  }
}

module.exports = FilaProcessor; 