const express = require('express');
const router = express.Router();

// Mock de dados de ativos
const assets = [
  {
    id: 1,
    symbol: 'PETR4',
    name: 'Petrobras PN',
    type: 'acao',
    sector: 'Petróleo e Gás',
    current_price: 32.50,
    previous_price: 31.80,
    market_cap: 423000000000,
    volume: 15000000,
    risk_level: 'alto',
    is_active: true
  },
  {
    id: 2,
    symbol: 'VALE3',
    name: 'Vale ON',
    type: 'acao',
    sector: 'Mineração',
    current_price: 65.20,
    previous_price: 64.10,
    market_cap: 312000000000,
    volume: 8000000,
    risk_level: 'medio',
    is_active: true
  }
];

// Listar ativos
router.get('/', (req, res) => {
  try {
    const { type, sector, limit = 50 } = req.query;
    
    let filteredAssets = assets.filter(asset => asset.is_active);
    
    if (type) {
      filteredAssets = filteredAssets.filter(asset => asset.type === type);
    }
    
    if (sector) {
      filteredAssets = filteredAssets.filter(asset => asset.sector === sector);
    }
    
    const limitedAssets = filteredAssets.slice(0, parseInt(limit));
    
    res.json({
      assets: limitedAssets,
      total: filteredAssets.length,
      showing: limitedAssets.length
    });
  } catch (error) {
    console.error('Erro ao listar ativos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Obter ativo por ID
router.get('/:id', (req, res) => {
  try {
    const assetId = parseInt(req.params.id);
    const asset = assets.find(a => a.id === assetId && a.is_active);
    
    if (!asset) {
      return res.status(404).json({
        error: 'Ativo não encontrado'
      });
    }
    
    res.json({ asset });
  } catch (error) {
    console.error('Erro ao buscar ativo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Top gainers
router.get('/market/top-gainers', (req, res) => {
  try {
    const gainers = assets
      .filter(asset => asset.is_active && asset.previous_price > 0)
      .map(asset => ({
        ...asset,
        change_percent: ((asset.current_price - asset.previous_price) / asset.previous_price) * 100
      }))
      .sort((a, b) => b.change_percent - a.change_percent)
      .slice(0, 10);
    
    res.json({ gainers });
  } catch (error) {
    console.error('Erro ao buscar maiores altas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router; 