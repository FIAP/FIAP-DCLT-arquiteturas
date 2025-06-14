const { v4: uuidv4 } = require('uuid');

class Gravacao {
  constructor(titulo, tipo = 'HD_PRINCIPAL') {
    this.id = uuidv4();
    this.titulo = titulo;
    this.tipo = tipo; // HD_PRINCIPAL, EXTRA
    this.status = 'PARADA'; // PARADA, GRAVANDO, PAUSADA, FINALIZADA
    this.dataInicio = null;
    this.dataFim = null;
    this.duracao = 0;
    this.qualidade = this.obterQualidadePorTipo(tipo);
    this.arquivo = null;
    this.metadados = {};
    this.erro = null;
  }

  obterQualidadePorTipo(tipo) {
    const qualidades = {
      'HD_PRINCIPAL': '1080p',
      'EXTRA': '720p'
    };
    return qualidades[tipo] || '720p';
  }

  iniciar() {
    if (this.status === 'PARADA' || this.status === 'PAUSADA') {
      this.status = 'GRAVANDO';
      if (!this.dataInicio) {
        this.dataInicio = new Date();
      }
      return true;
    }
    return false;
  }

  pausar() {
    if (this.status === 'GRAVANDO') {
      this.status = 'PAUSADA';
      return true;
    }
    return false;
  }

  parar() {
    if (this.status === 'GRAVANDO' || this.status === 'PAUSADA') {
      this.status = 'FINALIZADA';
      this.dataFim = new Date();
      this.calcularDuracao();
      this.gerarNomeArquivo();
      return true;
    }
    return false;
  }

  calcularDuracao() {
    if (this.dataInicio && this.dataFim) {
      this.duracao = Math.floor((this.dataFim - this.dataInicio) / 1000);
    }
  }

  gerarNomeArquivo() {
    const timestamp = this.dataInicio.toISOString().replace(/:/g, '-').split('.')[0];
    this.arquivo = `${this.titulo}_${this.tipo}_${timestamp}.mp4`;
  }

  obterResumo() {
    return {
      id: this.id,
      titulo: this.titulo,
      tipo: this.tipo,
      status: this.status,
      dataInicio: this.dataInicio,
      dataFim: this.dataFim,
      duracao: this.duracao,
      qualidade: this.qualidade,
      arquivo: this.arquivo
    };
  }
}

module.exports = Gravacao; 