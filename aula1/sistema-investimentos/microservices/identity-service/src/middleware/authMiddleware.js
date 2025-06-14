// Middleware de autenticação JWT (mock)
const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.header('x-auth-token') || 
                  req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        error: 'Token de acesso não fornecido'
      });
    }

    // Mock de verificação de token
    // Em produção, usar jwt.verify()
    if (token.startsWith('mock-jwt-token-')) {
      const userId = parseInt(token.split('-')[3]);
      
      if (userId) {
        req.user = { id: userId };
        return next();
      }
    }

    return res.status(401).json({
      error: 'Token inválido'
    });
  } catch (error) {
    console.error('Erro no middleware de auth:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

module.exports = authMiddleware; 