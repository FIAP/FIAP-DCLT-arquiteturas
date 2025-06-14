const express = require('express');
const router = express.Router();

// Mock de saldos
const balances = [
  {
    user_id: 1,
    available_balance: 45000.00,
    reserved_balance: 5000.00,
    total_balance: 50000.00,
    last_update: new Date().toISOString()
  }
];

// Obter saldo do usuário
router.get('/', (req, res) => {
  try {
    // Mock: assumir usuário ID 1
    const userId = 1;
    const balance = balances.find(b => b.user_id === userId);
    
    if (!balance) {
      return res.status(404).json({
        error: 'Saldo não encontrado'
      });
    }
    
    res.json({ balance });
  } catch (error) {
    console.error('Erro ao buscar saldo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Depósito
router.post('/deposit', (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Valor do depósito deve ser maior que zero'
      });
    }
    
    // Mock: assumir usuário ID 1
    const userId = 1;
    const balanceIndex = balances.findIndex(b => b.user_id === userId);
    
    if (balanceIndex === -1) {
      return res.status(404).json({
        error: 'Saldo não encontrado'
      });
    }
    
    balances[balanceIndex].available_balance += amount;
    balances[balanceIndex].total_balance += amount;
    balances[balanceIndex].last_update = new Date().toISOString();
    
    res.json({
      message: 'Depósito realizado com sucesso',
      balance: balances[balanceIndex]
    });
  } catch (error) {
    console.error('Erro no depósito:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router; 