const express = require('express');
const router = express.Router();

// Mock de dados de portfólio
const portfolios = [
  {
    id: 1,
    user_id: 1,
    total_invested: 50000.00,
    current_value: 52500.00,
    profit_loss: 2500.00,
    profit_loss_percentage: 5.00,
    total_dividends: 150.00
  }
];

// Obter portfólio do usuário
router.get('/', (req, res) => {
  try {
    // Mock: assumir usuário ID 1
    const userId = 1;
    const portfolio = portfolios.find(p => p.user_id === userId);
    
    if (!portfolio) {
      return res.status(404).json({
        error: 'Portfólio não encontrado'
      });
    }
    
    res.json({ portfolio });
  } catch (error) {
    console.error('Erro ao buscar portfólio:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Análise de diversificação
router.get('/diversification', (req, res) => {
  try {
    const diversification = {
      by_type: {
        'acao': { percentage: 70, value: 36750.00, count: 5 },
        'fii': { percentage: 20, value: 10500.00, count: 2 },
        'renda_fixa': { percentage: 10, value: 5250.00, count: 1 }
      },
      by_sector: {
        'Petróleo e Gás': { percentage: 25, value: 13125.00, count: 2 },
        'Mineração': { percentage: 20, value: 10500.00, count: 1 },
        'Bancos': { percentage: 15, value: 7875.00, count: 1 }
      },
      total_positions: 8
    };
    
    res.json({ diversification });
  } catch (error) {
    console.error('Erro ao calcular diversificação:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router; 