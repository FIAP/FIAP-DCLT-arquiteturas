const express = require('express');
const router = express.Router();

// Ordem de compra
router.post('/buy', (req, res) => {
  try {
    const { asset_id, symbol, quantity, price } = req.body;
    
    if (!asset_id || !quantity || !price) {
      return res.status(400).json({
        error: 'asset_id, quantity e price são obrigatórios'
      });
    }
    
    const total_amount = quantity * price;
    const fees = total_amount * 0.001; // 0.1% de taxa
    
    const order = {
      id: Date.now(),
      user_id: 1, // Mock
      asset_id,
      symbol,
      type: 'buy',
      quantity,
      price,
      total_amount,
      fees,
      status: 'completed',
      created_at: new Date().toISOString()
    };
    
    res.status(201).json({
      message: 'Ordem de compra executada com sucesso',
      order
    });
  } catch (error) {
    console.error('Erro na ordem de compra:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Ordem de venda
router.post('/sell', (req, res) => {
  try {
    const { asset_id, symbol, quantity, price } = req.body;
    
    if (!asset_id || !quantity || !price) {
      return res.status(400).json({
        error: 'asset_id, quantity e price são obrigatórios'
      });
    }
    
    const total_amount = quantity * price;
    const fees = total_amount * 0.001; // 0.1% de taxa
    
    const order = {
      id: Date.now(),
      user_id: 1, // Mock
      asset_id,
      symbol,
      type: 'sell',
      quantity,
      price,
      total_amount,
      fees,
      status: 'completed',
      created_at: new Date().toISOString()
    };
    
    res.status(201).json({
      message: 'Ordem de venda executada com sucesso',
      order
    });
  } catch (error) {
    console.error('Erro na ordem de venda:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router; 