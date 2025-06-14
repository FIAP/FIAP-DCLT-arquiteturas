const express = require('express');
const Professor = require('../models/Professor');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// Criar novo Professor
router.post('/', authenticateToken, authorizeRoles('ADM'), (req, res) => {
  const { nome, email } = req.body;
  if (!nome || !email) return res.status(400).json({ message: 'Nome e email obrigatórios.' });
  Professor.create(nome, email, (err, id) => {
    if (err) return res.status(500).json({ message: 'Erro ao criar Professor', error: err });
    res.status(201).json({ id, nome, email });
  });
});

// Listar todos os Professores
router.get('/', authenticateToken, (req, res) => {
  Professor.getAll((err, professores) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar Professores' });
    res.json(professores);
  });
});

module.exports = router; 