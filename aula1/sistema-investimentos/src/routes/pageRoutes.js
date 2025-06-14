const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const router = express.Router();

// Página inicial - Frontend
router.get('/', optionalAuth, (req, res) => {
  res.render('pages/home', {
    title: 'Início',
    user: req.user
  });
});

// Dashboard (requer autenticação)
router.get('/dashboard', optionalAuth, (req, res) => {
  res.render('pages/dashboard', {
    title: 'Dashboard',
    user: req.user
  });
});

// Página de ativos
router.get('/assets', optionalAuth, (req, res) => {
  res.render('pages/assets', {
    title: 'Ativos',
    user: req.user
  });
});

// Página de portfólio
router.get('/portfolio', optionalAuth, (req, res) => {
  res.render('pages/portfolio', {
    title: 'Portfólio',
    user: req.user
  });
});

// Página de transações
router.get('/transactions', optionalAuth, (req, res) => {
  res.render('pages/transactions', {
    title: 'Transações',
    user: req.user
  });
});

// Página de login
router.get('/login', (req, res) => {
  res.render('pages/login', {
    title: 'Login'
  });
});

// Página de cadastro
router.get('/register', (req, res) => {
  res.render('pages/register', {
    title: 'Cadastro'
  });
});

// Página de perfil
router.get('/profile', optionalAuth, (req, res) => {
  res.render('pages/profile', {
    title: 'Perfil',
    user: req.user
  });
});

module.exports = router; 