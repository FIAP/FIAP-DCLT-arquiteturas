const express = require('express');
const { Portfolio } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @swagger
 * /api/v1/portfolio:
 *   get:
 *     summary: Obter portfólio do usuário
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do portfólio
 */
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findByUserId(req.user.id);
  
  res.json({
    success: true,
    data: {
      portfolio: portfolio ? portfolio.getFormattedData() : null
    }
  });
}));

module.exports = router; 