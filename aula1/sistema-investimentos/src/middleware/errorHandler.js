const { ValidationError, DatabaseError, UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize');

// Middleware centralizado de tratamento de erros
const errorHandler = (error, req, res, next) => {
  console.error('Erro capturado:', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    user: req.user ? req.user.id : 'não autenticado'
  });

  // Erro de validação do Sequelize
  if (error instanceof ValidationError) {
    const messages = error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: messages,
      details: error.errors.map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }))
    });
  }

  // Erro de constraint única (email/CPF duplicado)
  if (error instanceof UniqueConstraintError) {
    const field = error.errors[0]?.path || 'campo';
    const value = error.errors[0]?.value || '';
    
    let message = 'Dados duplicados';
    if (field === 'email') {
      message = 'Este email já está em uso';
    } else if (field === 'cpf') {
      message = 'Este CPF já está cadastrado';
    } else if (field === 'symbol') {
      message = 'Este símbolo já está cadastrado';
    }

    return res.status(400).json({
      success: false,
      message,
      field,
      value
    });
  }

  // Erro de chave estrangeira
  if (error instanceof ForeignKeyConstraintError) {
    return res.status(400).json({
      success: false,
      message: 'Referência inválida. Verifique os dados informados.',
      constraint: error.constraint
    });
  }

  // Erro geral de banco de dados
  if (error instanceof DatabaseError) {
    console.error('Erro de banco de dados:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Erro no banco de dados',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }

  // Erro de JSON malformado
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      message: 'JSON inválido no corpo da requisição'
    });
  }

  // Erro customizado da aplicação
  if (error.name === 'AppError') {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message,
      code: error.code || 'APP_ERROR'
    });
  }

  // Erro de negócio customizado
  if (error.name === 'BusinessError') {
    return res.status(400).json({
      success: false,
      message: error.message,
      code: error.code || 'BUSINESS_ERROR'
    });
  }

  // Erros de autenticação JWT (já tratados no middleware de auth)
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado'
    });
  }

  // Erro 404 - Recurso não encontrado
  if (error.status === 404 || error.statusCode === 404) {
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(404).json({
        success: false,
        message: 'Recurso não encontrado',
        path: req.originalUrl
      });
    } else {
      return res.status(404).render('error', {
        title: 'Página não encontrada',
        message: 'A página solicitada não foi encontrada.',
        error: { status: 404 }
      });
    }
  }

  // Erro 403 - Acesso negado
  if (error.status === 403 || error.statusCode === 403) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado'
    });
  }

  // Erro de limite de rate limiting
  if (error.status === 429) {
    return res.status(429).json({
      success: false,
      message: 'Muitas requisições. Tente novamente mais tarde.',
      retryAfter: error.retryAfter || 900
    });
  }

  // Erro padrão não capturado
  const statusCode = error.statusCode || error.status || 500;
  const message = error.message || 'Erro interno do servidor';

  // Para APIs
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        details: error
      })
    });
  }

  // Para páginas web
  return res.status(statusCode).render('error', {
    title: 'Erro no servidor',
    message,
    error: process.env.NODE_ENV === 'development' ? error : { status: statusCode }
  });
};

// Função para criar erros customizados da aplicação
class AppError extends Error {
  constructor(message, statusCode = 400, code = 'APP_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Função para criar erros de negócio
class BusinessError extends Error {
  constructor(message, code = 'BUSINESS_ERROR') {
    super(message);
    this.name = 'BusinessError';
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware para 404 (deve ser usado antes do errorHandler)
const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Rota ${req.originalUrl} não encontrada`, 404, 'NOT_FOUND');
  next(error);
};

// Wrapper para funções async (evita try-catch repetitivo)
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  BusinessError
}; 