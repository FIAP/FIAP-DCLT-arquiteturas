// Middleware de tratamento de erros
const errorHandler = (err, req, res, next) => {
  console.error('Erro capturado:', err);

  // Erro de validação
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Erro de validação',
      details: err.message
    });
  }

  // Erro de sintaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'JSON inválido'
    });
  }

  // Erro de token JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token inválido'
    });
  }

  // Erro de token expirado
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expirado'
    });
  }

  // Erro padrão
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    service: 'identity-service'
  });
};

module.exports = errorHandler; 