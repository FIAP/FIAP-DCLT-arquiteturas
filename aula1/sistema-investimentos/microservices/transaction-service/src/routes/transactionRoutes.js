const express = require('express');
const router = express.Router();

// Mock de transações
const transactions = [
  {
    id: 1,
    user_id: 1,
    asset_id: 1,
    symbol: 'PETR4',
    type: 'buy',
    quantity: 100,
    price: 30.00,
    total_amount: 3000.00,
    fees: 3.00,
    status: 'completed',
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    user_id: 1,
    asset_id: 2,
    symbol: 'VALE3',
    type: 'buy',
    quantity: 50,
    price: 60.00,
    total_amount: 3000.00,
    fees: 3.00,
    status: 'completed',
    created_at: '2024-01-20T14:15:00Z'
  }
];

// Listar transações
router.get('/', (req, res) => {
  try {
    const { type, status, limit = 50 } = req.query;
    
    let filteredTransactions = [...transactions];
    
    if (type) {
      filteredTransactions = filteredTransactions.filter(t => t.type === type);
    }
    
    if (status) {
      filteredTransactions = filteredTransactions.filter(t => t.status === status);
    }
    
    const limitedTransactions = filteredTransactions.slice(0, parseInt(limit));
    
    res.json({
      transactions: limitedTransactions,
      total: filteredTransactions.length,
      showing: limitedTransactions.length
    });
  } catch (error) {
    console.error('Erro ao listar transações:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Estatísticas de transações
router.get('/statistics', (req, res) => {
  try {
    const stats = {
      total_transactions: transactions.length,
      total_volume: transactions.reduce((sum, t) => sum + t.total_amount, 0),
      total_fees: transactions.reduce((sum, t) => sum + t.fees, 0),
      by_type: {
        buy: transactions.filter(t => t.type === 'buy').length,
        sell: transactions.filter(t => t.type === 'sell').length
      },
      by_status: {
        completed: transactions.filter(t => t.status === 'completed').length,
        pending: transactions.filter(t => t.status === 'pending').length,
        cancelled: transactions.filter(t => t.status === 'cancelled').length
      }
    };
    
    res.json({ statistics: stats });
  } catch (error) {
    console.error('Erro ao calcular estatísticas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router; 