const express = require('express');
const router = express.Router();

// Aqui serão importadas as rotas de cada entidade
// Exemplo:
// router.use('/usuarios', require('./usuarioRoutes'));

router.use('/usuarios', require('./usuarioRoutes'));
router.use('/adms', require('./admRoutes'));
router.use('/professores', require('./professorRoutes'));
router.use('/empresas', require('./empresaRoutes'));
router.use('/candidatos', require('./candidatoRoutes'));
router.use('/agendamentos', require('./agendamentoRoutes'));

module.exports = router; 