const { validationResult } = require('express-validator');

// Mock de dados de usuários (em produção seria um banco de dados)
const users = [
  {
    id: 1,
    name: 'João Silva',
    email: 'joao@exemplo.com',
    password: '$2a$12$hashedpassword', // senha: 123456
    cpf: '12345678901',
    risk_profile: 'moderado',
    balance: 10000.00,
    is_active: true
  }
];

const authController = {
  // Registrar novo usuário
  register: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const { name, email, password, cpf, phone, risk_profile } = req.body;

      // Verificar se usuário já existe
      const existingUser = users.find(u => u.email === email || u.cpf === cpf);
      if (existingUser) {
        return res.status(409).json({
          error: 'Usuário já existe com este email ou CPF'
        });
      }

      // Criar novo usuário (mock)
      const newUser = {
        id: users.length + 1,
        name,
        email,
        password: '$2a$12$hashedpassword', // Em produção, hash da senha
        cpf,
        phone,
        risk_profile: risk_profile || 'moderado',
        balance: 0.00,
        is_active: true,
        created_at: new Date().toISOString()
      };

      users.push(newUser);

      // Remover senha da resposta
      const { password: _, ...userResponse } = newUser;

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        user: userResponse
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  },

  // Login
  login: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const { email, password } = req.body;

      // Buscar usuário
      const user = users.find(u => u.email === email && u.is_active);
      if (!user) {
        return res.status(401).json({
          error: 'Credenciais inválidas'
        });
      }

      // Em produção, verificar senha com bcrypt
      // const isValidPassword = await bcrypt.compare(password, user.password);

      // Mock token JWT
      const token = `mock-jwt-token-${user.id}-${Date.now()}`;

      res.json({
        message: 'Login realizado com sucesso',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          risk_profile: user.risk_profile
        }
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  },

  // Logout
  logout: async (req, res) => {
    try {
      // Em produção, invalidar token no Redis/banco
      res.json({
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      console.error('Erro no logout:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  },

  // Renovar token
  refreshToken: async (req, res) => {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        return res.status(400).json({
          error: 'Refresh token é obrigatório'
        });
      }

      // Mock de novo token
      const newToken = `mock-jwt-token-refreshed-${Date.now()}`;

      res.json({
        message: 'Token renovado com sucesso',
        token: newToken
      });
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  },

  // Alterar senha
  changePassword: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const { current_password, new_password } = req.body;
      const userId = req.user?.id; // Vem do middleware de auth

      if (!userId) {
        return res.status(401).json({
          error: 'Usuário não autenticado'
        });
      }

      // Buscar usuário
      const user = users.find(u => u.id === userId);
      if (!user) {
        return res.status(404).json({
          error: 'Usuário não encontrado'
        });
      }

      // Em produção, verificar senha atual e hash da nova senha
      user.password = '$2a$12$newhashedpassword';

      res.json({
        message: 'Senha alterada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  },

  // Validar token
  validateToken: async (req, res) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          error: 'Token inválido'
        });
      }

      const user = users.find(u => u.id === userId);
      if (!user) {
        return res.status(404).json({
          error: 'Usuário não encontrado'
        });
      }

      res.json({
        valid: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          risk_profile: user.risk_profile
        }
      });
    } catch (error) {
      console.error('Erro ao validar token:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }
};

module.exports = authController; 