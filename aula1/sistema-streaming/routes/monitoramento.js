const express = require('express');
const router = express.Router();

// Dashboard principal com status geral do sistema
router.get('/dashboard', (req, res) => {
  const io = req.app.get('io');
  
  if (!io || !io.filaProcessor) {
    return res.status(500).json({
      sucesso: false,
      erro: 'Sistema de monitoramento não disponível'
    });
  }

  const statusFilas = io.filaProcessor.obterStatus();
  const todasFilas = io.filaProcessor.obterTodasFilas();

  // Calcular métricas gerais
  let totalItens = 0;
  let totalProcessando = 0;
  let totalConcluidos = 0;
  let totalErros = 0;
  let totalAguardando = 0;

  Object.values(todasFilas).forEach(fila => {
    const stats = fila.estatisticas;
    totalItens += stats.total;
    totalProcessando += stats.processando;
    totalConcluidos += stats.concluidos;
    totalErros += stats.erros;
    totalAguardando += stats.aguardando;
  });

  const metricas = {
    totalItens,
    totalProcessando,
    totalConcluidos,
    totalErros,
    totalAguardando,
    taxaSuccesso: totalItens > 0 ? ((totalConcluidos / (totalConcluidos + totalErros)) * 100).toFixed(2) : 0,
    filaComMaiorVolume: Object.keys(todasFilas).reduce((maior, atual) => {
      return todasFilas[atual].estatisticas.total > todasFilas[maior].estatisticas.total ? atual : maior;
    }, Object.keys(todasFilas)[0]),
    sistemaAtivo: statusFilas.ativo
  };

  res.json({
    sucesso: true,
    dashboard: {
      timestamp: new Date(),
      metricas,
      filas: todasFilas,
      statusSistema: statusFilas
    }
  });
});

// Histórico de atividades do sistema
router.get('/historico', (req, res) => {
  const { limite = 100, filtro } = req.query;
  const io = req.app.get('io');
  
  if (!io || !io.filaProcessor) {
    return res.status(500).json({
      sucesso: false,
      erro: 'Sistema de monitoramento não disponível'
    });
  }

  const todasFilas = io.filaProcessor.obterTodasFilas();
  let historico = [];

  // Coletar todos os itens de todas as filas
  Object.entries(todasFilas).forEach(([nomeFila, fila]) => {
    fila.itens.forEach(item => {
      const resumo = item.obterResumo();
      historico.push({
        ...resumo,
        fila: nomeFila,
        tipo: 'processamento'
      });
    });
  });

  // Ordenar por data de adição (mais recentes primeiro)
  historico.sort((a, b) => new Date(b.dataAdicao) - new Date(a.dataAdicao));

  // Aplicar filtros se especificado
  if (filtro) {
    const filtroLower = filtro.toLowerCase();
    historico = historico.filter(item => 
      item.status.toLowerCase().includes(filtroLower) ||
      item.fila.toLowerCase().includes(filtroLower) ||
      item.prioridade.toLowerCase().includes(filtroLower)
    );
  }

  // Limitar resultados
  historico = historico.slice(0, parseInt(limite));

  res.json({
    sucesso: true,
    historico: {
      total: historico.length,
      itens: historico,
      filtroAplicado: filtro || null,
      limite: parseInt(limite)
    }
  });
});

// Métricas de performance por fila
router.get('/performance', (req, res) => {
  const io = req.app.get('io');
  
  if (!io || !io.filaProcessor) {
    return res.status(500).json({
      sucesso: false,
      erro: 'Sistema de monitoramento não disponível'
    });
  }

  const todasFilas = io.filaProcessor.obterTodasFilas();
  const performance = {};

  Object.entries(todasFilas).forEach(([nomeFila, fila]) => {
    const itens = fila.itens.map(item => item.obterResumo());
    const concluidos = itens.filter(item => item.status === 'CONCLUIDO');
    const comErro = itens.filter(item => item.status === 'ERRO');

    // Calcular tempo médio de processamento
    const tempoMedio = concluidos.length > 0 
      ? concluidos.reduce((acc, item) => {
          if (item.dataInicio && item.dataConclusao) {
            return acc + (new Date(item.dataConclusao) - new Date(item.dataInicio));
          }
          return acc;
        }, 0) / concluidos.length
      : 0;

    // Calcular throughput (itens por hora)
    const agora = new Date();
    const umaHoraAtras = new Date(agora.getTime() - 60 * 60 * 1000);
    const itensConcluidos1h = concluidos.filter(item => 
      new Date(item.dataConclusao) >= umaHoraAtras
    ).length;

    performance[nomeFila] = {
      nome: nomeFila,
      totalItens: itens.length,
      concluidos: concluidos.length,
      erros: comErro.length,
      taxaSucesso: itens.length > 0 ? ((concluidos.length / (concluidos.length + comErro.length)) * 100).toFixed(2) : 0,
      tempoMedioProcessamento: Math.round(tempoMedio / 1000), // em segundos
      throughputPorHora: itensConcluidos1h,
      filaAtiva: fila.estatisticas.ativa,
      capacidadeMaxima: fila.estatisticas.capacidadeMaxima,
      utilizacao: fila.estatisticas.capacidadeMaxima > 0 
        ? ((itens.length / fila.estatisticas.capacidadeMaxima) * 100).toFixed(2) 
        : 0
    };
  });

  res.json({
    sucesso: true,
    performance: {
      timestamp: new Date(),
      filas: performance,
      resumoGeral: {
        filasAtivas: Object.values(performance).filter(p => p.filaAtiva).length,
        totalFilas: Object.keys(performance).length,
        mediaUtilizacao: Object.values(performance).reduce((acc, p) => acc + parseFloat(p.utilizacao), 0) / Object.keys(performance).length
      }
    }
  });
});

// Status de saúde do sistema
router.get('/saude', (req, res) => {
  const io = req.app.get('io');
  
  if (!io || !io.filaProcessor) {
    return res.status(503).json({
      sucesso: false,
      saude: 'CRITICO',
      erro: 'Sistema de processamento não disponível'
    });
  }

  const status = io.filaProcessor.obterStatus();
  const todasFilas = io.filaProcessor.obterTodasFilas();
  
  let problemas = [];
  let statusGeral = 'SAUDAVEL';

  // Verificar se o sistema está ativo
  if (!status.ativo) {
    problemas.push('Sistema de processamento está pausado');
    statusGeral = 'DEGRADADO';
  }

  // Verificar filas com muitos erros
  Object.entries(todasFilas).forEach(([nomeFila, fila]) => {
    const stats = fila.estatisticas;
    const taxaErro = stats.total > 0 ? (stats.erros / stats.total) * 100 : 0;
    
    if (taxaErro > 20) {
      problemas.push(`Fila ${nomeFila} tem alta taxa de erro (${taxaErro.toFixed(1)}%)`);
      statusGeral = 'DEGRADADO';
    }

    if (!stats.ativa) {
      problemas.push(`Fila ${nomeFila} está pausada`);
      if (statusGeral === 'SAUDAVEL') statusGeral = 'DEGRADADO';
    }

    // Verificar sobrecarga
    const utilizacao = (stats.total / stats.capacidadeMaxima) * 100;
    if (utilizacao > 90) {
      problemas.push(`Fila ${nomeFila} está sobrecarregada (${utilizacao.toFixed(1)}%)`);
      if (statusGeral === 'SAUDAVEL') statusGeral = 'DEGRADADO';
    }
  });

  if (problemas.length > 3) {
    statusGeral = 'CRITICO';
  }

  const resposta = {
    sucesso: true,
    saude: {
      status: statusGeral,
      timestamp: new Date(),
      sistemaAtivo: status.ativo,
      problemas: problemas,
      verificacoes: {
        sistemaProcessamento: status.ativo ? 'OK' : 'FALHA',
        filas: Object.keys(todasFilas).length > 0 ? 'OK' : 'FALHA',
        socketIO: io ? 'OK' : 'FALHA'
      }
    }
  };

  // Retornar código HTTP apropriado baseado na saúde
  const codigoHTTP = {
    'SAUDAVEL': 200,
    'DEGRADADO': 200,
    'CRITICO': 503
  }[statusGeral] || 500;

  res.status(codigoHTTP).json(resposta);
});

// Alertas do sistema
router.get('/alertas', (req, res) => {
  const io = req.app.get('io');
  
  if (!io || !io.filaProcessor) {
    return res.status(500).json({
      sucesso: false,
      erro: 'Sistema de monitoramento não disponível'
    });
  }

  const todasFilas = io.filaProcessor.obterTodasFilas();
  const alertas = [];
  const agora = new Date();

  Object.entries(todasFilas).forEach(([nomeFila, fila]) => {
    const stats = fila.estatisticas;
    
    // Alerta: Fila com muitos itens aguardando
    if (stats.aguardando > 10) {
      alertas.push({
        tipo: 'ATENCAO',
        fila: nomeFila,
        mensagem: `${stats.aguardando} itens aguardando processamento`,
        timestamp: agora,
        prioridade: 'MEDIA'
      });
    }

    // Alerta: Taxa de erro alta
    const taxaErro = stats.total > 0 ? (stats.erros / stats.total) * 100 : 0;
    if (taxaErro > 15) {
      alertas.push({
        tipo: 'ERRO',
        fila: nomeFila,
        mensagem: `Taxa de erro elevada: ${taxaErro.toFixed(1)}%`,
        timestamp: agora,
        prioridade: 'ALTA'
      });
    }

    // Alerta: Fila pausada
    if (!stats.ativa) {
      alertas.push({
        tipo: 'WARNING',
        fila: nomeFila,
        mensagem: 'Fila está pausada',
        timestamp: agora,
        prioridade: 'ALTA'
      });
    }

    // Alerta: Capacidade próxima do limite
    const utilizacao = (stats.total / stats.capacidadeMaxima) * 100;
    if (utilizacao > 85) {
      alertas.push({
        tipo: 'ATENCAO',
        fila: nomeFila,
        mensagem: `Capacidade da fila em ${utilizacao.toFixed(1)}%`,
        timestamp: agora,
        prioridade: utilizacao > 95 ? 'ALTA' : 'MEDIA'
      });
    }
  });

  // Ordenar por prioridade e timestamp
  const prioridades = { 'ALTA': 3, 'MEDIA': 2, 'BAIXA': 1 };
  alertas.sort((a, b) => {
    if (prioridades[a.prioridade] !== prioridades[b.prioridade]) {
      return prioridades[b.prioridade] - prioridades[a.prioridade];
    }
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  res.json({
    sucesso: true,
    alertas: {
      total: alertas.length,
      itens: alertas,
      resumo: {
        alta: alertas.filter(a => a.prioridade === 'ALTA').length,
        media: alertas.filter(a => a.prioridade === 'MEDIA').length,
        baixa: alertas.filter(a => a.prioridade === 'BAIXA').length
      }
    }
  });
});

module.exports = router; 