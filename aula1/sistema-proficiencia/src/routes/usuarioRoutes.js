const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const router = express.Router();

// Registrar novo usuário
router.post('/register', async (req, res) => {
  const { userName, email, password, role } = req.body;
  if (!userName || !email || !password || !role) {
    return res.status(400).json({ message: 'Dados obrigatórios não informados.' });
  }
  const hash = await bcrypt.hash(password, 10);
  Usuario.create(userName, email, hash, role, (err, id) => {
    if (err) return res.status(500).json({ message: 'Erro ao registrar usuário', error: err });
    res.status(201).json({ id, userName, email, role });
  });
});

// Login
router.post('/login', (req, res) => {
  const { userName, password } = req.body;
  if (!userName || !password) {
    return res.status(400).json({ message: 'Usuário e senha obrigatórios.' });
  }
  Usuario.findByUserName(userName, async (err, user) => {
    if (err || !user) return res.status(401).json({ message: 'Usuário ou senha inválidos.' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Usuário ou senha inválidos.' });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'segredo', { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, userName: user.userName, email: user.email, role: user.role } });
  });
});

// Listar todos os usuários
router.get('/', (req, res) => {
  Usuario.getAll((err, users) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar usuários' });
    res.json(users);
  });
});

module.exports = router; 