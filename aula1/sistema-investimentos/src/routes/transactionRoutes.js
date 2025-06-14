const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { Transaction, Asset, Portfolio, PortfolioAsset, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler, AppError, BusinessError } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @swagger
 * /api/v1/transactions:
 *   get:
 *     summary: Listar transações do usuário
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [buy, sell, dividend]
 *         description: Filtrar por tipo de transação
 *       - in: query
 *         name: asset_id
 *         schema:
 *           type: integer
 *         description: Filtrar por ativo
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, cancelled]
 *         description: Filtrar por status
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
 *     responses:
 *       200:
 *         description: Lista de transações
 */
router.get('/', [
  query('type')
    .optional()
    .isIn(['buy', 'sell', 'dividend'])
    .withMessage('Tipo deve ser: buy, sell ou dividend'),
  query('asset_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do ativo deve ser um número válido'),
  query('status')
    .optional()
    .isIn(['pending', 'completed', 'cancelled'])
    .withMessage('Status deve ser: pending, completed ou cancelled'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser entre 1 e 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset deve ser maior ou igual a 0')
], authenticateToken, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Parâmetros inválidos',
      errors: errors.array()
    });
  }

  const {
    type,
    asset_id,
    status,
    limit = 20,
    offset = 0
  } = req.query;

  // Construir filtros
  const where = { user_id: req.user.id };
  
  if (type) where.type = type;
  if (asset_id) where.asset_id = asset_id;
  if (status) where.status = status;

  // Buscar transações
  const { count, rows: transactions } = await Transaction.findAndCountAll({
    where,
    include: [{
      model: Asset,
      as: 'asset',
      attributes: ['id', 'symbol', 'name', 'type']
    }],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['created_at', 'DESC']]
  });

  // Formatar dados das transações
  const formattedTransactions = transactions.map(transaction => 
    transaction.getFormattedData()
  );

  res.json({
    success: true,
    data: {
      transactions: formattedTransactions,
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(count / parseInt(limit))
      }
    }
  });
}));

/**
 * @swagger
 * /api/v1/transactions/{id}:
 *   get:
 *     summary: Obter transação por ID
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da transação
 *     responses:
 *       200:
 *         description: Dados da transação
 *       404:
 *         description: Transação não encontrada
 */
router.get('/:id', [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número inteiro válido')
], authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const transaction = await Transaction.findOne({
    where: { 
      id, 
      user_id: req.user.id 
    },
    include: [{
      model: Asset,
      as: 'asset',
      attributes: ['id', 'symbol', 'name', 'type', 'current_price']
    }]
  });

  if (!transaction) {
    throw new AppError('Transação não encontrada', 404);
  }

  res.json({
    success: true,
    data: {
      transaction: transaction.getFormattedData()
    }
  });
}));

/**
 * @swagger
 * /api/v1/transactions/buy:
 *   post:
 *     summary: Executar compra de ativo
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - asset_id
 *               - quantity
 *               - price
 *             properties:
 *               asset_id:
 *                 type: integer
 *                 description: ID do ativo
 *               quantity:
 *                 type: number
 *                 minimum: 0.00000001
 *                 description: Quantidade a comprar
 *               price:
 *                 type: number
 *                 minimum: 0.00000001
 *                 description: Preço por unidade
 *               notes:
 *                 type: string
 *                 description: Observações da transação
 *     responses:
 *       201:
 *         description: Compra executada com sucesso
 *       400:
 *         description: Dados inválidos ou saldo insuficiente
 */
router.post('/buy', [
  body('asset_id')
    .isInt({ min: 1 })
    .withMessage('ID do ativo deve ser um número válido'),
  body('quantity')
    .isFloat({ min: 0.00000001 })
    .withMessage('Quantidade deve ser maior que zero'),
  body('price')
    .isFloat({ min: 0.00000001 })
    .withMessage('Preço deve ser maior que zero'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Observações não podem exceder 500 caracteres')
], authenticateToken, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array()
    });
  }

  const { asset_id, quantity, price, notes } = req.body;
  const totalAmount = parseFloat(quantity) * parseFloat(price);
  const fees = totalAmount * 0.001; // Taxa de 0.1%
  const totalCost = totalAmount + fees;

  // Usar transação para garantir consistência
  const dbTransaction = await req.db.sequelize.transaction();

  try {
    // Verificar se o ativo existe e está ativo
    const asset = await Asset.findOne({
      where: { id: asset_id, is_active: true },
      transaction: dbTransaction
    });

    if (!asset) {
      throw new AppError('Ativo não encontrado ou inativo', 404);
    }

    // Verificar saldo do usuário
    const user = await User.findByPk(req.user.id, { transaction: dbTransaction });
    if (parseFloat(user.balance) < totalCost) {
      throw new BusinessError('Saldo insuficiente para realizar a compra');
    }

    // Buscar ou criar portfólio
    let portfolio = await Portfolio.findByUserId(req.user.id);
    if (!portfolio) {
      portfolio = await Portfolio.createForUser(req.user.id, dbTransaction);
    }

    // Criar transação
    const transaction = await Transaction.createBuyTransaction({
      user_id: req.user.id,
      asset_id,
      quantity,
      price,
      total_amount: totalAmount,
      notes
    }, dbTransaction);

    // Atualizar ou criar posição no portfólio
    const { position } = await PortfolioAsset.findOrCreatePosition(
      portfolio.id, 
      asset_id, 
      dbTransaction
    );

    await position.addTransaction(dbTransaction, {
      type: 'buy',
      quantity,
      price
    });

    // Debitar saldo do usuário
    await user.update({
      balance: parseFloat(user.balance) - totalCost
    }, { transaction: dbTransaction });

    // Atualizar valores do portfólio
    await portfolio.updateValues(dbTransaction);

    // Confirmar transação
    await dbTransaction.commit();

    res.status(201).json({
      success: true,
      message: 'Compra executada com sucesso',
      data: {
        transaction: transaction.getFormattedData(),
        remaining_balance: parseFloat(user.balance) - totalCost
      }
    });
  } catch (error) {
    await dbTransaction.rollback();
    throw error;
  }
}));

/**
 * @swagger
 * /api/v1/transactions/sell:
 *   post:
 *     summary: Executar venda de ativo
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - asset_id
 *               - quantity
 *               - price
 *             properties:
 *               asset_id:
 *                 type: integer
 *                 description: ID do ativo
 *               quantity:
 *                 type: number
 *                 minimum: 0.00000001
 *                 description: Quantidade a vender
 *               price:
 *                 type: number
 *                 minimum: 0.00000001
 *                 description: Preço por unidade
 *               notes:
 *                 type: string
 *                 description: Observações da transação
 *     responses:
 *       201:
 *         description: Venda executada com sucesso
 *       400:
 *         description: Dados inválidos ou quantidade insuficiente
 */
router.post('/sell', [
  body('asset_id')
    .isInt({ min: 1 })
    .withMessage('ID do ativo deve ser um número válido'),
  body('quantity')
    .isFloat({ min: 0.00000001 })
    .withMessage('Quantidade deve ser maior que zero'),
  body('price')
    .isFloat({ min: 0.00000001 })
    .withMessage('Preço deve ser maior que zero'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Observações não podem exceder 500 caracteres')
], authenticateToken, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array()
    });
  }

  const { asset_id, quantity, price, notes } = req.body;
  const totalAmount = parseFloat(quantity) * parseFloat(price);
  const fees = totalAmount * 0.001; // Taxa de 0.1%
  const netAmount = totalAmount - fees;

  // Usar transação para garantir consistência
  const dbTransaction = await req.db.sequelize.transaction();

  try {
    // Verificar se o ativo existe e está ativo
    const asset = await Asset.findOne({
      where: { id: asset_id, is_active: true },
      transaction: dbTransaction
    });

    if (!asset) {
      throw new AppError('Ativo não encontrado ou inativo', 404);
    }

    // Buscar portfólio do usuário
    const portfolio = await Portfolio.findByUserId(req.user.id);
    if (!portfolio) {
      throw new BusinessError('Portfólio não encontrado');
    }

    // Verificar posição no portfólio
    const position = await PortfolioAsset.findOne({
      where: {
        portfolio_id: portfolio.id,
        asset_id
      },
      transaction: dbTransaction
    });

    if (!position || parseFloat(position.quantity) < parseFloat(quantity)) {
      throw new BusinessError('Quantidade insuficiente do ativo para venda');
    }

    // Criar transação
    const transaction = await Transaction.createSellTransaction({
      user_id: req.user.id,
      asset_id,
      quantity,
      price,
      total_amount: totalAmount,
      notes
    }, dbTransaction);

    // Atualizar posição no portfólio
    await position.addTransaction(dbTransaction, {
      type: 'sell',
      quantity,
      price
    });

    // Creditar saldo do usuário
    const user = await User.findByPk(req.user.id, { transaction: dbTransaction });
    await user.update({
      balance: parseFloat(user.balance) + netAmount
    }, { transaction: dbTransaction });

    // Atualizar valores do portfólio
    await portfolio.updateValues(dbTransaction);

    // Confirmar transação
    await dbTransaction.commit();

    res.status(201).json({
      success: true,
      message: 'Venda executada com sucesso',
      data: {
        transaction: transaction.getFormattedData(),
        new_balance: parseFloat(user.balance) + netAmount
      }
    });
  } catch (error) {
    await dbTransaction.rollback();
    throw error;
  }
}));

/**
 * @swagger
 * /api/v1/transactions/stats:
 *   get:
 *     summary: Estatísticas de transações do usuário
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas das transações
 */
router.get('/stats', authenticateToken, asyncHandler(async (req, res) => {
  const stats = await Transaction.getUserStats(req.user.id);

  // Calcular totais gerais
  const totalTransactions = Object.values(stats).reduce((sum, stat) => sum + stat.count, 0);
  const totalVolume = Object.values(stats).reduce((sum, stat) => sum + stat.total_amount, 0);
  const totalFees = Object.values(stats).reduce((sum, stat) => sum + stat.total_fees, 0);

  res.json({
    success: true,
    data: {
      stats: {
        by_type: stats,
        totals: {
          transactions: totalTransactions,
          volume: totalVolume,
          fees: totalFees
        }
      }
    }
  });
}));

/**
 * @swagger
 * /api/v1/transactions/assets/{asset_id}:
 *   get:
 *     summary: Histórico de transações de um ativo específico
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: asset_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do ativo
 *     responses:
 *       200:
 *         description: Histórico de transações do ativo
 */
router.get('/assets/:asset_id', [
  param('asset_id')
    .isInt({ min: 1 })
    .withMessage('ID do ativo deve ser um número válido')
], authenticateToken, asyncHandler(async (req, res) => {
  const { asset_id } = req.params;

  // Verificar se o ativo existe
  const asset = await Asset.findByPk(asset_id);
  if (!asset) {
    throw new AppError('Ativo não encontrado', 404);
  }

  // Buscar transações do usuário para esse ativo
  const transactions = await Transaction.findByUserAndAsset(req.user.id, asset_id);

  // Formatar dados das transações
  const formattedTransactions = transactions.map(transaction => 
    transaction.getFormattedData()
  );

  res.json({
    success: true,
    data: {
      asset: {
        id: asset.id,
        symbol: asset.symbol,
        name: asset.name
      },
      transactions: formattedTransactions
    }
  });
}));

module.exports = router; 