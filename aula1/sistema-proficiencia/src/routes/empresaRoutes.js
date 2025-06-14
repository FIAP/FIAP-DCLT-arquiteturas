const express = require('express');
const Empresa = require('../models/Empresa');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// Criar nova Empresa
router.post('/', authenticateToken, authorizeRoles('ADM'), (req, res) => {
  const { nome, email } = req.body;
  if (!nome || !email) return res.status(400).json({ message: 'Nome e email obrigatórios.' });
  Empresa.create(nome, email, (err, id) => {
    if (err) return res.status(500).json({ message: 'Erro ao criar Empresa', error: err });
    res.status(201).json({ id, nome, email });
  });
});

// Listar todas as Empresas
router.get('/', authenticateToken, (req, res) => {
  Empresa.getAll((err, empresas) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar Empresas' });
    res.json(empresas);
  });
});

module.exports = router; 