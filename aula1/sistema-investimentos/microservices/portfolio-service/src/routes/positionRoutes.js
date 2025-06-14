const express = require('express');
const router = express.Router();

// Mock de posições
const positions = [
  {
    id: 1,
    portfolio_id: 1,
    asset_id: 1,
    symbol: 'PETR4',
    quantity: 100,
    average_price: 30.00,
    current_price: 32.50,
    total_invested: 3000.00,
    current_value: 3250.00,
    profit_loss: 250.00,
    profit_loss_percentage: 8.33
  },
  {
    id: 2,
    portfolio_id: 1,
    asset_id: 2,
    symbol: 'VALE3',
    quantity: 50,
    average_price: 60.00,
    current_price: 65.20,
    total_invested: 3000.00,
    current_value: 3260.00,
    profit_loss: 260.00,
    profit_loss_percentage: 8.67
  }
];

// Listar posições
router.get('/', (req, res) => {
  try {
    res.json({ 
      positions,
      total: positions.length 
    });
  } catch (error) {
    console.error('Erro ao listar posições:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Obter posição específica
router.get('/:id', (req, res) => {
  try {
    const positionId = parseInt(req.params.id);
    const position = positions.find(p => p.id === positionId);
    
    if (!position) {
      return res.status(404).json({
        error: 'Posição não encontrada'
      });
    }
    
    res.json({ position });
  } catch (error) {
    console.error('Erro ao buscar posição:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router; 