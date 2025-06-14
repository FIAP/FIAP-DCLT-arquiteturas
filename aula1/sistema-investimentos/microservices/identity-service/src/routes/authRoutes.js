const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar novo usuário
 *     tags: [Authentication]
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
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               cpf:
 *                 type: string
 *               phone:
 *                 type: string
 *               risk_profile:
 *                 type: string
 *                 enum: [conservador, moderado, arrojado]
 */
router.post('/register', [
  body('name')
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome deve ter entre 3 e 100 caracteres'),
  body('email')
    .isEmail()
    .withMessage('Email deve ter um formato válido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('cpf')
    .isLength({ min: 11, max: 11 })
    .isNumeric()
    .withMessage('CPF deve ter exatamente 11 dígitos numéricos'),
  body('risk_profile')
    .optional()
    .isIn(['conservador', 'moderado', 'arrojado'])
    .withMessage('Perfil de risco deve ser: conservador, moderado ou arrojado')
], authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Fazer login
 *     tags: [Authentication]
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
 *               password:
 *                 type: string
 */
router.post('/login', [
  body('email')
    .isEmail()
    .withMessage('Email deve ter um formato válido'),
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória')
], authController.login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Fazer logout
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 */
router.post('/logout', authMiddleware, authController.logout);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Renovar token de acesso
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 */
router.post('/refresh', authController.refreshToken);

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Alterar senha
 *     tags: [Authentication]
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
 */
router.put('/change-password', [
  authMiddleware,
  body('current_password')
    .notEmpty()
    .withMessage('Senha atual é obrigatória'),
  body('new_password')
    .isLength({ min: 6 })
    .withMessage('Nova senha deve ter pelo menos 6 caracteres')
], authController.changePassword);

/**
 * @swagger
 * /api/auth/validate:
 *   get:
 *     summary: Validar token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 */
router.get('/validate', authMiddleware, authController.validateToken);

module.exports = router; 