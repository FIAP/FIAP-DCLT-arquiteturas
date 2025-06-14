const express = require('express');
const { body, validationResult } = require('express-validator');
const { User, Portfolio } = require('../models');
const { generateToken, authenticateToken } = require('../middleware/auth');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Registrar novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - cpf
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               cpf:
 *                 type: string
 *                 pattern: '^[0-9]{11}$'
 *               phone:
 *                 type: string
 *               risk_profile:
 *                 type: string
 *                 enum: [conservador, moderado, arrojado]
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome deve ter entre 3 e 100 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ter um formato válido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('cpf')
    .isLength({ min: 11, max: 11 })
    .isNumeric()
    .withMessage('CPF deve conter exatamente 11 dígitos'),
  body('phone')
    .optional()
    .isLength({ min: 10, max: 20 })
    .withMessage('Telefone deve ter entre 10 e 20 caracteres'),
  body('risk_profile')
    .optional()
    .isIn(['conservador', 'moderado', 'arrojado'])
    .withMessage('Perfil de risco deve ser: conservador, moderado ou arrojado')
], asyncHandler(async (req, res) => {
  // Verificar se há erros de validação
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array()
    });
  }

  const { name, email, password, cpf, phone, risk_profile } = req.body;

  // Usar transação para garantir consistência
  const transaction = await req.db.sequelize.transaction();

  try {
    // Verificar se email já existe
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      throw new AppError('Este email já está em uso', 400);
    }

    // Verificar se CPF já existe
    const existingCpf = await User.findByCpf(cpf);
    if (existingCpf) {
      throw new AppError('Este CPF já está cadastrado', 400);
    }

    // Criar usuário
    const user = await User.create({
      name,
      email,
      password,
      cpf,
      phone,
      risk_profile: risk_profile || 'moderado',
      balance: 10000.00 // Saldo inicial para demonstração
    }, { transaction });

    // Criar portfólio para o usuário
    await Portfolio.createForUser(user.id, transaction);

    // Confirmar transação
    await transaction.commit();

    // Gerar token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}));

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Fazer login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ter um formato válido'),
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array()
    });
  }

  const { email, password } = req.body;

  // Buscar usuário por email
  const user = await User.findOne({
    where: { email, is_active: true }
  });

  if (!user) {
    throw new AppError('Email ou senha incorretos', 401);
  }

  // Verificar senha
  const isPasswordValid = await user.validatePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Email ou senha incorretos', 401);
  }

  // Gerar token
  const token = generateToken(user);

  res.json({
    success: true,
    message: 'Login realizado com sucesso',
    data: {
      user: user.toJSON(),
      token
    }
  });
}));

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Obter dados do usuário logado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário
 *       401:
 *         description: Token inválido
 */
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
}));

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Fazer logout
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 */
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  // Para logout, simplesmente retornamos sucesso
  // O cliente deve remover o token localmente
  res.json({
    success: true,
    message: 'Logout realizado com sucesso'
  });
}));

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   put:
 *     summary: Alterar senha
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - current_password
 *               - new_password
 *             properties:
 *               current_password:
 *                 type: string
 *               new_password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *       400:
 *         description: Senha atual incorreta
 */
router.put('/change-password', authenticateToken, [
  body('current_password')
    .notEmpty()
    .withMessage('Senha atual é obrigatória'),
  body('new_password')
    .isLength({ min: 6 })
    .withMessage('Nova senha deve ter pelo menos 6 caracteres')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array()
    });
  }

  const { current_password, new_password } = req.body;

  // Buscar usuário com senha
  const user = await User.findByPk(req.user.id);
  
  // Verificar senha atual
  const isCurrentPasswordValid = await user.validatePassword(current_password);
  if (!isCurrentPasswordValid) {
    throw new AppError('Senha atual incorreta', 400);
  }

  // Atualizar senha
  await user.update({ password: new_password });

  res.json({
    success: true,
    message: 'Senha alterada com sucesso'
  });
}));

/**
 * @swagger
 * /api/v1/auth/update-profile:
 *   put:
 *     summary: Atualizar perfil do usuário
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               phone:
 *                 type: string
 *               risk_profile:
 *                 type: string
 *                 enum: [conservador, moderado, arrojado]
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 */
router.put('/update-profile', authenticateToken, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome deve ter entre 3 e 100 caracteres'),
  body('phone')
    .optional()
    .isLength({ min: 10, max: 20 })
    .withMessage('Telefone deve ter entre 10 e 20 caracteres'),
  body('risk_profile')
    .optional()
    .isIn(['conservador', 'moderado', 'arrojado'])
    .withMessage('Perfil de risco deve ser: conservador, moderado ou arrojado')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array()
    });
  }

  const { name, phone, risk_profile } = req.body;
  const updateData = {};

  // Adicionar apenas campos que foram enviados
  if (name) updateData.name = name;
  if (phone) updateData.phone = phone;
  if (risk_profile) updateData.risk_profile = risk_profile;

  // Atualizar usuário
  const user = await User.findByPk(req.user.id);
  await user.update(updateData);

  res.json({
    success: true,
    message: 'Perfil atualizado com sucesso',
    data: {
      user: user.toJSON()
    }
  });
}));

module.exports = router; 