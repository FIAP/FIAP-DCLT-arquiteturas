const express = require('express');
const { query, param } = require('express-validator');
const { Asset } = require('../models');
const { optionalAuth } = require('../middleware/auth');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @swagger
 * /api/v1/assets:
 *   get:
 *     summary: Listar ativos
 *     tags: [Assets]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [acao, fii, cripto, renda_fixa]
 *         description: Filtrar por tipo de ativo
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *         description: Filtrar por setor
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por símbolo ou nome
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Limite de resultados
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Offset para paginação
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [symbol, name, current_price, market_cap, volume]
 *           default: symbol
 *         description: Campo para ordenação
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *         description: Direção da ordenação
 *     responses:
 *       200:
 *         description: Lista de ativos
 */
router.get('/', [
  query('type')
    .optional()
    .isIn(['acao', 'fii', 'cripto', 'renda_fixa'])
    .withMessage('Tipo deve ser: acao, fii, cripto ou renda_fixa'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser entre 1 e 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset deve ser maior ou igual a 0'),
  query('sort')
    .optional()
    .isIn(['symbol', 'name', 'current_price', 'market_cap', 'volume'])
    .withMessage('Campo de ordenação inválido'),
  query('order')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Direção deve ser ASC ou DESC')
], optionalAuth, asyncHandler(async (req, res) => {
  const {
    type,
    sector,
    search,
    limit = 20,
    offset = 0,
    sort = 'symbol',
    order = 'ASC'
  } = req.query;

  // Construir filtros
  const where = { is_active: true };
  
  if (type) {
    where.type = type;
  }

  if (sector) {
    where.sector = sector;
  }

  if (search) {
    const { Op } = req.db.sequelize.Sequelize;
    where[Op.or] = [
      { symbol: { [Op.iLike]: `%${search}%` } },
      { name: { [Op.iLike]: `%${search}%` } }
    ];
  }

  // Buscar ativos
  const { count, rows: assets } = await Asset.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [[sort, order.toUpperCase()]],
    attributes: [
      'id', 'symbol', 'name', 'type', 'sector', 'current_price',
      'previous_price', 'market_cap', 'volume', 'description',
      'risk_level', 'created_at', 'updated_at'
    ]
  });

  // Calcular variações para cada ativo
  const assetsWithVariation = assets.map(asset => {
    const variation = asset.calculateVariation();
    return {
      ...asset.toJSON(),
      variation
    };
  });

  res.json({
    success: true,
    data: {
      assets: assetsWithVariation,
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(count / parseInt(limit))
      }
    }
  });
}));

// ROTA DE SIMULAÇÃO DE FALHAS (para demo)
router.get('/simulacao-erro-tratado', (req, res, next) => {
  next(new Error('Erro proposital tratado na rota de ativos!'));
});

router.get('/simulacao-erro-nao-tratado', (req, res) => {
  throw new Error('Erro não tratado! Isso pode derrubar o servidor se não for capturado.');
});

router.get('/simulacao-crash', (req, res) => {
  process.exit(1);
});

/**
 * @swagger
 * /api/v1/assets/{id}:
 *   get:
 *     summary: Obter ativo por ID
 *     tags: [Assets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do ativo
 *     responses:
 *       200:
 *         description: Dados do ativo
 *       404:
 *         description: Ativo não encontrado
 */
router.get('/:id', [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número inteiro válido')
], optionalAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const asset = await Asset.findOne({
    where: { id, is_active: true }
  });

  if (!asset) {
    throw new AppError('Ativo não encontrado', 404);
  }

  const variation = asset.calculateVariation();

  res.json({
    success: true,
    data: {
      asset: {
        ...asset.toJSON(),
        variation
      }
    }
  });
}));

/**
 * @swagger
 * /api/v1/assets/symbol/{symbol}:
 *   get:
 *     summary: Obter ativo por símbolo
 *     tags: [Assets]
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Símbolo do ativo
 *     responses:
 *       200:
 *         description: Dados do ativo
 *       404:
 *         description: Ativo não encontrado
 */
router.get('/symbol/:symbol', [
  param('symbol')
    .isLength({ min: 2, max: 20 })
    .withMessage('Símbolo deve ter entre 2 e 20 caracteres')
], optionalAuth, asyncHandler(async (req, res) => {
  const { symbol } = req.params;

  const asset = await Asset.findBySymbol(symbol);

  if (!asset) {
    throw new AppError('Ativo não encontrado', 404);
  }

  const variation = asset.calculateVariation();

  res.json({
    success: true,
    data: {
      asset: {
        ...asset.toJSON(),
        variation
      }
    }
  });
}));

/**
 * @swagger
 * /api/v1/assets/types:
 *   get:
 *     summary: Listar tipos de ativos disponíveis
 *     tags: [Assets]
 *     responses:
 *       200:
 *         description: Lista de tipos
 */
router.get('/types', optionalAuth, asyncHandler(async (req, res) => {
  const types = [
    { value: 'acao', label: 'Ações', description: 'Ações de empresas listadas na bolsa' },
    { value: 'fii', label: 'FIIs', description: 'Fundos de Investimento Imobiliário' },
    { value: 'cripto', label: 'Criptomoedas', description: 'Criptomoedas e tokens digitais' },
    { value: 'renda_fixa', label: 'Renda Fixa', description: 'Títulos de renda fixa' }
  ];

  res.json({
    success: true,
    data: { types }
  });
}));

/**
 * @swagger
 * /api/v1/assets/sectors:
 *   get:
 *     summary: Listar setores disponíveis
 *     tags: [Assets]
 *     responses:
 *       200:
 *         description: Lista de setores
 */
router.get('/sectors', optionalAuth, asyncHandler(async (req, res) => {
  const sectors = await Asset.findAll({
    where: { 
      is_active: true,
      sector: { [req.db.sequelize.Sequelize.Op.not]: null }
    },
    attributes: ['sector'],
    group: ['sector'],
    order: [['sector', 'ASC']]
  });

  const sectorList = sectors.map(s => s.sector).filter(Boolean);

  res.json({
    success: true,
    data: { sectors: sectorList }
  });
}));

/**
 * @swagger
 * /api/v1/assets/market/gainers:
 *   get:
 *     summary: Maiores altas do dia
 *     tags: [Assets]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Limite de resultados
 *     responses:
 *       200:
 *         description: Lista dos maiores ganhos
 */
router.get('/market/gainers', [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limite deve ser entre 1 e 50')
], optionalAuth, asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const gainers = await Asset.getTopGainers(parseInt(limit));

  const gainersWithVariation = gainers.map(asset => {
    const variation = asset.calculateVariation();
    return {
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      type: asset.type,
      current_price: parseFloat(asset.current_price),
      previous_price: parseFloat(asset.previous_price),
      variation
    };
  });

  res.json({
    success: true,
    data: { gainers: gainersWithVariation }
  });
}));

/**
 * @swagger
 * /api/v1/assets/market/losers:
 *   get:
 *     summary: Maiores baixas do dia
 *     tags: [Assets]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Limite de resultados
 *     responses:
 *       200:
 *         description: Lista das maiores quedas
 */
router.get('/market/losers', [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limite deve ser entre 1 e 50')
], optionalAuth, asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const losers = await Asset.getTopLosers(parseInt(limit));

  const losersWithVariation = losers.map(asset => {
    const variation = asset.calculateVariation();
    return {
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      type: asset.type,
      current_price: parseFloat(asset.current_price),
      previous_price: parseFloat(asset.previous_price),
      variation
    };
  });

  res.json({
    success: true,
    data: { losers: losersWithVariation }
  });
}));

/**
 * @swagger
 * /api/v1/assets/market/summary:
 *   get:
 *     summary: Resumo do mercado
 *     tags: [Assets]
 *     responses:
 *       200:
 *         description: Resumo estatístico do mercado
 */
router.get('/market/summary', optionalAuth, asyncHandler(async (req, res) => {
  const summary = await Asset.findAll({
    where: { 
      is_active: true,
      previous_price: { [req.db.sequelize.Sequelize.Op.gt]: 0 }
    },
    attributes: [
      'type',
      [req.db.sequelize.fn('COUNT', req.db.sequelize.col('id')), 'count'],
      [req.db.sequelize.fn('AVG', 
        req.db.sequelize.literal('((current_price - previous_price) / previous_price) * 100')
      ), 'avg_variation'],
      [req.db.sequelize.fn('SUM', 
        req.db.sequelize.literal('CASE WHEN current_price > previous_price THEN 1 ELSE 0 END')
      ), 'gainers_count'],
      [req.db.sequelize.fn('SUM', 
        req.db.sequelize.literal('CASE WHEN current_price < previous_price THEN 1 ELSE 0 END')
      ), 'losers_count']
    ],
    group: ['type'],
    raw: true
  });

  const marketSummary = summary.reduce((acc, item) => {
    acc[item.type] = {
      total_assets: parseInt(item.count),
      average_variation: parseFloat(item.avg_variation || 0).toFixed(2),
      gainers: parseInt(item.gainers_count || 0),
      losers: parseInt(item.losers_count || 0),
      stable: parseInt(item.count) - parseInt(item.gainers_count || 0) - parseInt(item.losers_count || 0)
    };
    return acc;
  }, {});

  res.json({
    success: true,
    data: { market_summary: marketSummary }
  });
}));

module.exports = router; 