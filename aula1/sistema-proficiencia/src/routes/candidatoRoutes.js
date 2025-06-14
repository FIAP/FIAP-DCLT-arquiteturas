const express = require('express');
const Candidato = require('../models/Candidato');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

// Criar novo Candidato
router.post('/', authenticateToken, (req, res) => {
  const { nome, email, empresaId } = req.body;
  if (!nome || !email) return res.status(400).json({ message: 'Nome e email obrigatórios.' });
  Candidato.create(nome, email, empresaId, (err, id) => {
    if (err) return res.status(500).json({ message: 'Erro ao criar Candidato', error: err });
    res.status(201).json({ id, nome, email, empresaId });
  });
});

// Listar todos os Candidatos
router.get('/', authenticateToken, (req, res) => {
  Candidato.getAll((err, candidatos) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar Candidatos' });
    res.json(candidatos);
  });
});

// Listar candidatos por empresaId
router.get('/empresa/:empresaId', authenticateToken, (req, res) => {
  const { empresaId } = req.params;
  Candidato.getByEmpresaId(empresaId, (err, candidatos) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar Candidatos por empresa' });
    res.json(candidatos);
  });
});

module.exports = router; 