const express = require('express');
const router = express.Router();

// Mock de dados de mercado
const marketData = {
  'PETR4': {
    symbol: 'PETR4',
    current_price: 32.50,
    previous_price: 31.80,
    change: 0.70,
    change_percent: 2.20,
    volume: 15000000,
    high: 33.10,
    low: 31.50,
    last_update: new Date().toISOString()
  },
  'VALE3': {
    symbol: 'VALE3',
    current_price: 65.20,
    previous_price: 64.10,
    change: 1.10,
    change_percent: 1.72,
    volume: 8000000,
    high: 66.00,
    low: 63.80,
    last_update: new Date().toISOString()
  }
};

// Obter dados de mercado por símbolo
router.get('/:symbol', (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const data = marketData[symbol];
    
    if (!data) {
      return res.status(404).json({
        error: 'Dados de mercado não encontrados para este símbolo'
      });
    }
    
    res.json({ marketData: data });
  } catch (error) {
    console.error('Erro ao buscar dados de mercado:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Obter múltiplos símbolos
router.post('/batch', (req, res) => {
  try {
    const { symbols } = req.body;
    
    if (!symbols || !Array.isArray(symbols)) {
      return res.status(400).json({
        error: 'Lista de símbolos é obrigatória'
      });
    }
    
    const results = {};
    symbols.forEach(symbol => {
      const upperSymbol = symbol.toUpperCase();
      if (marketData[upperSymbol]) {
        results[upperSymbol] = marketData[upperSymbol];
      }
    });
    
    res.json({ marketData: results });
  } catch (error) {
    console.error('Erro ao buscar dados em lote:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router; 