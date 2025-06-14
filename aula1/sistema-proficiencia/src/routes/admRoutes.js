const express = require('express');
const ADM = require('../models/ADM');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// Criar novo ADM
router.post('/', authenticateToken, authorizeRoles('ADM'), (req, res) => {
  const { nome, email } = req.body;
  if (!nome || !email) return res.status(400).json({ message: 'Nome e email obrigatórios.' });
  ADM.create(nome, email, (err, id) => {
    if (err) return res.status(500).json({ message: 'Erro ao criar ADM', error: err });
    res.status(201).json({ id, nome, email });
  });
});

// Listar todos os ADMs
router.get('/', authenticateToken, authorizeRoles('ADM'), (req, res) => {
  ADM.getAll((err, adms) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar ADMs' });
    res.json(adms);
  });
});

module.exports = router; 