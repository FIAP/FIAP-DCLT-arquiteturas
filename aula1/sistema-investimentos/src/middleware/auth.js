const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'seu_jwt_secret_super_secreto_aqui';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Middleware para verificar autenticação JWT
const authenticateToken = async (req, res, next) => {
  try {
    let token = null;

    // Buscar token no header Authorization
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Buscar token nos cookies (para páginas web)
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Buscar token no header x-access-token
    if (!token && req.headers['x-access-token']) {
      token = req.headers['x-access-token'];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido'
      });
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Buscar usuário no banco de dados
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Usuário inativo'
      });
    }

    // Adicionar usuário ao request
    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    console.error('Erro na autenticação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Middleware opcional de autenticação (não falha se não houver token)
const optionalAuth = async (req, res, next) => {
  try {
    let token = null;

    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token && req.headers['x-access-token']) {
      token = req.headers['x-access-token'];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findByPk(decoded.id, {
          attributes: { exclude: ['password'] }
        });

        if (user && user.is_active) {
          req.user = user;
          req.userId = user.id;
        }
      } catch (error) {
        // Ignorar erros de token em autenticação opcional
      }
    }

    next();
  } catch (error) {
    console.error('Erro na autenticação opcional:', error);
    next(); // Continue mesmo com erro
  }
};

// Middleware para verificar se é admin (futuro)
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticação necessária'
      });
    }

    // Por enquanto, assumir que qualquer usuário pode ser admin
    // No futuro, implementar sistema de roles
    if (req.user.email === 'admin@fiap.com.br') {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Privilégios de administrador necessários.'
      });
    }
  } catch (error) {
    console.error('Erro na verificação de admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Função para gerar token JWT
const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

// Função para verificar token sem middleware
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw error;
  }
};

// Middleware para páginas web (redireciona para login)
const requireAuthWeb = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.redirect('/login?redirect=' + encodeURIComponent(req.originalUrl));
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user || !user.is_active) {
      res.clearCookie('token');
      return res.redirect('/login?redirect=' + encodeURIComponent(req.originalUrl));
    }

    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    res.clearCookie('token');
    return res.redirect('/login?redirect=' + encodeURIComponent(req.originalUrl));
  }
};

// Middleware para páginas web opcionais
const optionalAuthWeb = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findByPk(decoded.id, {
          attributes: { exclude: ['password'] }
        });

        if (user && user.is_active) {
          req.user = user;
          req.userId = user.id;
        }
      } catch (error) {
        res.clearCookie('token');
      }
    }

    next();
  } catch (error) {
    console.error('Erro na autenticação web opcional:', error);
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  generateToken,
  verifyToken,
  requireAuthWeb,
  optionalAuthWeb,
  JWT_SECRET,
  JWT_EXPIRES_IN
}; 