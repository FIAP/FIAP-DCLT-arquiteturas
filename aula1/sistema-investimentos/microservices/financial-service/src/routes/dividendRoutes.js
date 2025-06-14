const express = require('express');
const router = express.Router();

// Mock de dividendos
const dividends = [
  {
    id: 1,
    user_id: 1,
    asset_id: 1,
    symbol: 'PETR4',
    amount: 75.00,
    payment_date: '2024-01-15',
    record_date: '2024-01-10',
    type: 'dividend',
    status: 'paid'
  },
  {
    id: 2,
    user_id: 1,
    asset_id: 2,
    symbol: 'VALE3',
    amount: 75.00,
    payment_date: '2024-02-15',
    record_date: '2024-02-10',
    type: 'dividend',
    status: 'paid'
  }
];

// Listar dividendos
router.get('/', (req, res) => {
  try {
    const { year, status, limit = 50 } = req.query;
    
    let filteredDividends = [...dividends];
    
    if (year) {
      filteredDividends = filteredDividends.filter(d => 
        d.payment_date.startsWith(year)
      );
    }
    
    if (status) {
      filteredDividends = filteredDividends.filter(d => d.status === status);
    }
    
    const limitedDividends = filteredDividends.slice(0, parseInt(limit));
    
    res.json({
      dividends: limitedDividends,
      total: filteredDividends.length,
      showing: limitedDividends.length
    });
  } catch (error) {
    console.error('Erro ao listar dividendos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Resumo de dividendos
router.get('/summary', (req, res) => {
  try {
    const summary = {
      total_received: dividends.reduce((sum, d) => sum + d.amount, 0),
      total_count: dividends.length,
      by_year: {
        '2024': dividends.filter(d => d.payment_date.startsWith('2024')).reduce((sum, d) => sum + d.amount, 0)
      },
      by_asset: dividends.reduce((acc, d) => {
        if (!acc[d.symbol]) {
          acc[d.symbol] = { count: 0, total: 0 };
        }
        acc[d.symbol].count++;
        acc[d.symbol].total += d.amount;
        return acc;
      }, {})
    };
    
    res.json({ summary });
  } catch (error) {
    console.error('Erro ao calcular resumo de dividendos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router; 