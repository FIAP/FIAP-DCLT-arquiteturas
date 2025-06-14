const express = require('express');
const Agendamento = require('../models/Agendamento');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

// Criar novo Agendamento
router.post('/', authenticateToken, (req, res) => {
  const { professorId, candidatoId, dataAgendamento, feedback, status } = req.body;
  if (!professorId || !candidatoId || !dataAgendamento) return res.status(400).json({ message: 'Dados obrigatórios não informados.' });
  Agendamento.create(professorId, candidatoId, dataAgendamento, feedback || '', status || 'PENDENTE', (err, id) => {
    if (err) return res.status(500).json({ message: 'Erro ao criar Agendamento', error: err });
    res.status(201).json({ id, professorId, candidatoId, dataAgendamento, feedback, status });
  });
});

// Listar todos os Agendamentos
router.get('/', authenticateToken, (req, res) => {
  Agendamento.getAll((err, agendamentos) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar Agendamentos' });
    res.json(agendamentos);
  });
});

// Listar por professorId
router.get('/professor/:professorId', authenticateToken, (req, res) => {
  const { professorId } = req.params;
  Agendamento.getByProfessorId(professorId, (err, agendamentos) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar Agendamentos por professor' });
    res.json(agendamentos);
  });
});

// Listar por candidatoId
router.get('/candidato/:candidatoId', authenticateToken, (req, res) => {
  const { candidatoId } = req.params;
  Agendamento.getByCandidatoId(candidatoId, (err, agendamentos) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar Agendamentos por candidato' });
    res.json(agendamentos);
  });
});

// Atualizar feedback e status
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { feedback, status } = req.body;
  Agendamento.updateFeedbackStatus(id, feedback, status, (err, changes) => {
    if (err) return res.status(500).json({ message: 'Erro ao atualizar Agendamento', error: err });
    res.json({ updated: changes });
  });
});

module.exports = router; 