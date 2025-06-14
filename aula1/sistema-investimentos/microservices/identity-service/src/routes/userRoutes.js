const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Mock de dados de usuários
const users = [
  {
    id: 1,
    name: 'João Silva',
    email: 'joao@exemplo.com',
    cpf: '12345678901',
    risk_profile: 'moderado',
    balance: 10000.00,
    is_active: true
  }
];

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Obter perfil do usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/profile', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const user = users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        risk_profile: user.risk_profile,
        balance: user.balance,
        is_active: user.is_active
      }
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Atualizar perfil do usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.put('/profile', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, risk_profile } = req.body;

    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    // Atualizar dados
    if (name) users[userIndex].name = name;
    if (phone) users[userIndex].phone = phone;
    if (risk_profile) users[userIndex].risk_profile = risk_profile;

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: {
        id: users[userIndex].id,
        name: users[userIndex].name,
        email: users[userIndex].email,
        risk_profile: users[userIndex].risk_profile
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router; 