const express = require('express');
const router = express.Router();

// Mock de dados de P&L
const pnlData = [
  {
    user_id: 1,
    portfolio_id: 1,
    realized_pnl: 500.00,
    unrealized_pnl: 2000.00,
    total_pnl: 2500.00,
    total_dividends: 150.00,
    total_fees: 25.00,
    net_result: 2625.00,
    last_calculation: new Date().toISOString()
  }
];

// Obter P&L do usuário
router.get('/', (req, res) => {
  try {
    // Mock: assumir usuário ID 1
    const userId = 1;
    const pnl = pnlData.find(p => p.user_id === userId);
    
    if (!pnl) {
      return res.status(404).json({
        error: 'Dados de P&L não encontrados'
      });
    }
    
    res.json({ pnl });
  } catch (error) {
    console.error('Erro ao buscar P&L:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Relatório detalhado de P&L
router.get('/report', (req, res) => {
  try {
    const report = {
      summary: {
        total_invested: 50000.00,
        current_value: 52500.00,
        total_return: 2500.00,
        return_percentage: 5.00
      },
      breakdown: {
        realized_gains: 500.00,
        unrealized_gains: 2000.00,
        dividends_received: 150.00,
        fees_paid: 25.00
      },
      performance: {
        best_performer: { symbol: 'VALE3', return: 8.67 },
        worst_performer: { symbol: 'PETR4', return: 8.33 },
        average_return: 8.50
      }
    };
    
    res.json({ report });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router; 