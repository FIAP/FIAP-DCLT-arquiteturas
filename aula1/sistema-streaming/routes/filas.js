const express = require('express');
const router = express.Router();

// Listar todas as filas e seus status
router.get('/', (req, res) => {
  const io = req.app.get('io');
  if (!io || !io.filaProcessor) {
    return res.status(500).json({
      sucesso: false,
      erro: 'Processador de filas não disponível'
    });
  }

  const filas = io.filaProcessor.obterTodasFilas();
  const status = io.filaProcessor.obterStatus();

  res.json({
    sucesso: true,
    filas,
    statusSistema: status
  });
});

// Obter detalhes de uma fila específica
router.get('/:nome', (req, res) => {
  const nomeFila = req.params.nome.toUpperCase();
  const io = req.app.get('io');
  
  if (!io || !io.filaProcessor) {
    return res.status(500).json({
      sucesso: false,
      erro: 'Processador de filas não disponível'
    });
  }

  const fila = io.filaProcessor.obterFila(nomeFila);
  if (!fila) {
    return res.status(404).json({
      sucesso: false,
      erro: 'Fila não encontrada'
    });
  }

  res.json({
    sucesso: true,
    fila: fila.obterResumo()
  });
});

// Pausar uma fila específica
router.post('/:nome/pausar', (req, res) => {
  const nomeFila = req.params.nome.toUpperCase();
  const io = req.app.get('io');
  
  if (!io || !io.filaProcessor) {
    return res.status(500).json({
      sucesso: false,
      erro: 'Processador de filas não disponível'
    });
  }

  if (io.filaProcessor.pausarFila(nomeFila)) {
    res.json({
      sucesso: true,
      mensagem: `Fila ${nomeFila} pausada com sucesso`
    });
  } else {
    res.status(404).json({
      sucesso: false,
      erro: 'Fila não encontrada'
    });
  }
});

// Reativar uma fila específica
router.post('/:nome/reativar', (req, res) => {
  const nomeFila = req.params.nome.toUpperCase();
  const io = req.app.get('io');
  
  if (!io || !io.filaProcessor) {
    return res.status(500).json({
      sucesso: false,
      erro: 'Processador de filas não disponível'
    });
  }

  if (io.filaProcessor.reativarFila(nomeFila)) {
    res.json({
      sucesso: true,
      mensagem: `Fila ${nomeFila} reativada com sucesso`
    });
  } else {
    res.status(404).json({
      sucesso: false,
      erro: 'Fila não encontrada'
    });
  }
});

// Limpar itens concluídos/com erro de uma fila
router.post('/:nome/limpar', (req, res) => {
  const nomeFila = req.params.nome.toUpperCase();
  const io = req.app.get('io');
  
  if (!io || !io.filaProcessor) {
    return res.status(500).json({
      sucesso: false,
      erro: 'Processador de filas não disponível'
    });
  }

  if (io.filaProcessor.limparFila(nomeFila)) {
    res.json({
      sucesso: true,
      mensagem: `Fila ${nomeFila} limpa com sucesso`
    });
  } else {
    res.status(404).json({
      sucesso: false,
      erro: 'Fila não encontrada'
    });
  }
});

// Obter estatísticas detalhadas de uma fila
router.get('/:nome/estatisticas', (req, res) => {
  const nomeFila = req.params.nome.toUpperCase();
  const io = req.app.get('io');
  
  if (!io || !io.filaProcessor) {
    return res.status(500).json({
      sucesso: false,
      erro: 'Processador de filas não disponível'
    });
  }

  const fila = io.filaProcessor.obterFila(nomeFila);
  if (!fila) {
    return res.status(404).json({
      sucesso: false,
      erro: 'Fila não encontrada'
    });
  }

  const estatisticas = fila.obterEstatisticas();
  const itens = fila.itens.map(item => item.obterResumo());

  // Calcular estatísticas adicionais
  const tempoMedioProcessamento = itens
    .filter(item => item.status === 'CONCLUIDO' && item.dataInicio && item.dataConclusao)
    .reduce((acc, item) => {
      const tempo = new Date(item.dataConclusao) - new Date(item.dataInicio);
      return acc + tempo;
    }, 0) / Math.max(1, estatisticas.concluidos);

  const taxaSucesso = statisticas.total > 0 
    ? (estatisticas.concluidos / (estatisticas.concluidos + estatisticas.erros)) * 100 
    : 0;

  res.json({
    sucesso: true,
    fila: nomeFila,
    estatisticas: {
      ...estatisticas,
      tempoMedioProcessamento: Math.round(tempoMedioProcessamento / 1000), // em segundos
      taxaSucesso: Math.round(taxaSucesso * 100) / 100 // 2 casas decimais
    },
    itens
  });
});

// Obter itens de uma fila com filtros
router.get('/:nome/itens', (req, res) => {
  const nomeFila = req.params.nome.toUpperCase();
  const { status, prioridade, limite = 50 } = req.query;
  const io = req.app.get('io');
  
  if (!io || !io.filaProcessor) {
    return res.status(500).json({
      sucesso: false,
      erro: 'Processador de filas não disponível'
    });
  }

  const fila = io.filaProcessor.obterFila(nomeFila);
  if (!fila) {
    return res.status(404).json({
      sucesso: false,
      erro: 'Fila não encontrada'
    });
  }

  let itens = fila.itens.map(item => item.obterResumo());

  // Aplicar filtros
  if (status) {
    itens = itens.filter(item => item.status === status.toUpperCase());
  }
  
  if (prioridade) {
    itens = itens.filter(item => item.prioridade === prioridade.toUpperCase());
  }

  // Limitar resultados
  itens = itens.slice(0, parseInt(limite));

  res.json({
    sucesso: true,
    fila: nomeFila,
    total: itens.length,
    itens
  });
});

// Remover item específico de uma fila
router.delete('/:nome/itens/:itemId', (req, res) => {
  const nomeFila = req.params.nome.toUpperCase();
  const itemId = req.params.itemId;
  const io = req.app.get('io');
  
  if (!io || !io.filaProcessor) {
    return res.status(500).json({
      sucesso: false,
      erro: 'Processador de filas não disponível'
    });
  }

  const fila = io.filaProcessor.obterFila(nomeFila);
  if (!fila) {
    return res.status(404).json({
      sucesso: false,
      erro: 'Fila não encontrada'
    });
  }

  const item = fila.obterItemPorId(itemId);
  if (!item) {
    return res.status(404).json({
      sucesso: false,
      erro: 'Item não encontrado na fila'
    });
  }

  if (item.status === 'PROCESSANDO') {
    return res.status(409).json({
      sucesso: false,
      erro: 'Não é possível remover um item em processamento'
    });
  }

  const itemRemovido = fila.removerItem(itemId);
  if (itemRemovido) {
    // Emitir evento via Socket.IO
    io.emit('item-removido', {
      fila: nomeFila,
      itemId: itemId
    });

    res.json({
      sucesso: true,
      mensagem: 'Item removido com sucesso',
      item: itemRemovido.obterResumo()
    });
  } else {
    res.status(500).json({
      sucesso: false,
      erro: 'Erro ao remover item da fila'
    });
  }
});

// Pausar/reativar o sistema completo de processamento
router.post('/sistema/pausar', (req, res) => {
  const io = req.app.get('io');
  
  if (!io || !io.filaProcessor) {
    return res.status(500).json({
      sucesso: false,
      erro: 'Processador de filas não disponível'
    });
  }

  io.filaProcessor.parar();
  
  res.json({
    sucesso: true,
    mensagem: 'Sistema de processamento pausado'
  });
});

router.post('/sistema/reativar', (req, res) => {
  const io = req.app.get('io');
  
  if (!io || !io.filaProcessor) {
    return res.status(500).json({
      sucesso: false,
      erro: 'Processador de filas não disponível'
    });
  }

  io.filaProcessor.iniciar();
  
  res.json({
    sucesso: true,
    mensagem: 'Sistema de processamento reativado'
  });
});

module.exports = router; 