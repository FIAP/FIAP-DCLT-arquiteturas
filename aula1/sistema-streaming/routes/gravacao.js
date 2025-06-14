const express = require('express');
const router = express.Router();
const Gravacao = require('../models/Gravacao');

// Armazenamento em memória das gravações
const gravacoes = new Map();
let gravacaoAtual = null;

// Listar todas as gravações
router.get('/', (req, res) => {
  const listaGravacoes = Array.from(gravacoes.values()).map(g => g.obterResumo());
  res.json({
    sucesso: true,
    gravacoes: listaGravacoes,
    gravacaoAtual: gravacaoAtual ? gravacaoAtual.obterResumo() : null
  });
});

// Obter gravação específica
router.get('/:id', (req, res) => {
  const gravacao = gravacoes.get(req.params.id);
  if (!gravacao) {
    return res.status(404).json({
      sucesso: false,
      erro: 'Gravação não encontrada'
    });
  }

  res.json({
    sucesso: true,
    gravacao: gravacao.obterResumo()
  });
});

// Criar nova gravação
router.post('/', (req, res) => {
  const { titulo, tipo } = req.body;

  if (!titulo) {
    return res.status(400).json({
      sucesso: false,
      erro: 'Título é obrigatório'
    });
  }

  if (gravacaoAtual && gravacaoAtual.status === 'GRAVANDO') {
    return res.status(409).json({
      sucesso: false,
      erro: 'Já existe uma gravação em andamento'
    });
  }

  const gravacao = new Gravacao(titulo, tipo);
  gravacoes.set(gravacao.id, gravacao);

  // Emitir evento via Socket.IO
  const io = req.app.get('io');
  if (io) {
    io.emit('gravacao-criada', gravacao.obterResumo());
  }

  res.status(201).json({
    sucesso: true,
    gravacao: gravacao.obterResumo()
  });
});

// Iniciar gravação
router.post('/:id/iniciar', (req, res) => {
  const gravacao = gravacoes.get(req.params.id);
  if (!gravacao) {
    return res.status(404).json({
      sucesso: false,
      erro: 'Gravação não encontrada'
    });
  }

  if (gravacaoAtual && gravacaoAtual.status === 'GRAVANDO' && gravacaoAtual.id !== gravacao.id) {
    return res.status(409).json({
      sucesso: false,
      erro: 'Já existe uma gravação em andamento'
    });
  }

  if (gravacao.iniciar()) {
    gravacaoAtual = gravacao;
    
    // Emitir evento via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('gravacao-iniciada', gravacao.obterResumo());
    }

    res.json({
      sucesso: true,
      gravacao: gravacao.obterResumo(),
      mensagem: 'Gravação iniciada com sucesso'
    });
  } else {
    res.status(400).json({
      sucesso: false,
      erro: 'Não é possível iniciar esta gravação no estado atual'
    });
  }
});

// Pausar gravação
router.post('/:id/pausar', (req, res) => {
  const gravacao = gravacoes.get(req.params.id);
  if (!gravacao) {
    return res.status(404).json({
      sucesso: false,
      erro: 'Gravação não encontrada'
    });
  }

  if (gravacao.pausar()) {
    // Emitir evento via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('gravacao-pausada', gravacao.obterResumo());
    }

    res.json({
      sucesso: true,
      gravacao: gravacao.obterResumo(),
      mensagem: 'Gravação pausada com sucesso'
    });
  } else {
    res.status(400).json({
      sucesso: false,
      erro: 'Não é possível pausar esta gravação no estado atual'
    });
  }
});

// Parar gravação
router.post('/:id/parar', (req, res) => {
  const gravacao = gravacoes.get(req.params.id);
  if (!gravacao) {
    return res.status(404).json({
      sucesso: false,
      erro: 'Gravação não encontrada'
    });
  }

  if (gravacao.parar()) {
    if (gravacaoAtual && gravacaoAtual.id === gravacao.id) {
      gravacaoAtual = null;
    }

    // Emitir evento via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('gravacao-finalizada', gravacao.obterResumo());
    }

    res.json({
      sucesso: true,
      gravacao: gravacao.obterResumo(),
      mensagem: 'Gravação finalizada com sucesso'
    });
  } else {
    res.status(400).json({
      sucesso: false,
      erro: 'Não é possível parar esta gravação no estado atual'
    });
  }
});

// Processar gravação nas filas
router.post('/:id/processar', (req, res) => {
  const gravacao = gravacoes.get(req.params.id);
  if (!gravacao) {
    return res.status(404).json({
      sucesso: false,
      erro: 'Gravação não encontrada'
    });
  }

  if (gravacao.status !== 'FINALIZADA') {
    return res.status(400).json({
      sucesso: false,
      erro: 'Apenas gravações finalizadas podem ser processadas'
    });
  }

  const { plataformas } = req.body;
  const plataformasValidas = ['UOL', 'YOUTUBE', 'CORTES', 'REC'];
  const plataformasParaProcessar = plataformas && Array.isArray(plataformas) 
    ? plataformas.filter(p => plataformasValidas.includes(p))
    : ['UOL', 'YOUTUBE', 'REC'];

  // Obter o processador de filas do app
  const io = req.app.get('io');
  if (io && io.filaProcessor) {
    const resultados = io.filaProcessor.adicionarParaProcessamento(gravacao, plataformasParaProcessar);
    
    res.json({
      sucesso: true,
      gravacao: gravacao.obterResumo(),
      resultados,
      mensagem: 'Gravação adicionada às filas de processamento'
    });
  } else {
    res.status(500).json({
      sucesso: false,
      erro: 'Processador de filas não disponível'
    });
  }
});

// Deletar gravação
router.delete('/:id', (req, res) => {
  const gravacao = gravacoes.get(req.params.id);
  if (!gravacao) {
    return res.status(404).json({
      sucesso: false,
      erro: 'Gravação não encontrada'
    });
  }

  if (gravacao.status === 'GRAVANDO') {
    return res.status(409).json({
      sucesso: false,
      erro: 'Não é possível deletar uma gravação em andamento'
    });
  }

  gravacoes.delete(req.params.id);
  
  if (gravacaoAtual && gravacaoAtual.id === req.params.id) {
    gravacaoAtual = null;
  }

  // Emitir evento via Socket.IO
  const io = req.app.get('io');
  if (io) {
    io.emit('gravacao-deletada', { id: req.params.id });
  }

  res.json({
    sucesso: true,
    mensagem: 'Gravação deletada com sucesso'
  });
});

// Obter status do sistema de gravação
router.get('/sistema/status', (req, res) => {
  const totalGravacoes = gravacoes.size;
  const gravacoesPorStatus = {};
  
  Array.from(gravacoes.values()).forEach(gravacao => {
    const status = gravacao.status;
    gravacoesPorStatus[status] = (gravacoesPorStatus[status] || 0) + 1;
  });

  res.json({
    sucesso: true,
    status: {
      totalGravacoes,
      gravacoesPorStatus,
      gravacaoAtual: gravacaoAtual ? gravacaoAtual.obterResumo() : null,
      sistemaAtivo: true
    }
  });
});

module.exports = router; 