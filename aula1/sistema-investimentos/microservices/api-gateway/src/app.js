const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Investimentos - API Gateway',
      version: '1.0.0',
      description: 'API Gateway para microservices do sistema de investimentos',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor de desenvolvimento',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(swaggerOptions);

// Middleware de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001'],
  credentials: true
}));

// Rate limiting global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Muitas requisições, tente novamente em 15 minutos'
});
app.use(limiter);

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health check do gateway
app.get('/health', (req, res) => {
  res.status(200).json({
    service: 'api-gateway',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      'identity-service': process.env.IDENTITY_SERVICE_URL || 'http://localhost:3001',
      'asset-service': process.env.ASSET_SERVICE_URL || 'http://localhost:3002',
      'portfolio-service': process.env.PORTFOLIO_SERVICE_URL || 'http://localhost:3003',
      'transaction-service': process.env.TRANSACTION_SERVICE_URL || 'http://localhost:3004',
      'financial-service': process.env.FINANCIAL_SERVICE_URL || 'http://localhost:3005'
    }
  });
});

// Configuração dos proxies para cada microservice
const serviceProxies = {
  '/api/auth': {
    target: process.env.IDENTITY_SERVICE_URL || 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: {
      '^/api/auth': '/api/auth'
    }
  },
  '/api/users': {
    target: process.env.IDENTITY_SERVICE_URL || 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: {
      '^/api/users': '/api/users'
    }
  },
  '/api/assets': {
    target: process.env.ASSET_SERVICE_URL || 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: {
      '^/api/assets': '/api/assets'
    }
  },
  '/api/market-data': {
    target: process.env.ASSET_SERVICE_URL || 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: {
      '^/api/market-data': '/api/market-data'
    }
  },
  '/api/portfolios': {
    target: process.env.PORTFOLIO_SERVICE_URL || 'http://localhost:3003',
    changeOrigin: true,
    pathRewrite: {
      '^/api/portfolios': '/api/portfolios'
    }
  },
  '/api/positions': {
    target: process.env.PORTFOLIO_SERVICE_URL || 'http://localhost:3003',
    changeOrigin: true,
    pathRewrite: {
      '^/api/positions': '/api/positions'
    }
  },
  '/api/transactions': {
    target: process.env.TRANSACTION_SERVICE_URL || 'http://localhost:3004',
    changeOrigin: true,
    pathRewrite: {
      '^/api/transactions': '/api/transactions'
    }
  },
  '/api/orders': {
    target: process.env.TRANSACTION_SERVICE_URL || 'http://localhost:3004',
    changeOrigin: true,
    pathRewrite: {
      '^/api/orders': '/api/orders'
    }
  },
  '/api/balance': {
    target: process.env.FINANCIAL_SERVICE_URL || 'http://localhost:3005',
    changeOrigin: true,
    pathRewrite: {
      '^/api/balance': '/api/balance'
    }
  },
  '/api/pnl': {
    target: process.env.FINANCIAL_SERVICE_URL || 'http://localhost:3005',
    changeOrigin: true,
    pathRewrite: {
      '^/api/pnl': '/api/pnl'
    }
  },
  '/api/dividends': {
    target: process.env.FINANCIAL_SERVICE_URL || 'http://localhost:3005',
    changeOrigin: true,
    pathRewrite: {
      '^/api/dividends': '/api/dividends'
    }
  }
};

// Aplicar proxies
Object.keys(serviceProxies).forEach(path => {
  app.use(path, createProxyMiddleware(serviceProxies[path]));
});

// Rota para verificar status de todos os serviços
app.get('/services/status', async (req, res) => {
  const axios = require('axios');
  const services = {
    'identity-service': process.env.IDENTITY_SERVICE_URL || 'http://localhost:3001',
    'asset-service': process.env.ASSET_SERVICE_URL || 'http://localhost:3002',
    'portfolio-service': process.env.PORTFOLIO_SERVICE_URL || 'http://localhost:3003',
    'transaction-service': process.env.TRANSACTION_SERVICE_URL || 'http://localhost:3004',
    'financial-service': process.env.FINANCIAL_SERVICE_URL || 'http://localhost:3005'
  };

  const status = {};
  
  for (const [name, url] of Object.entries(services)) {
    try {
      const response = await axios.get(`${url}/health`, { timeout: 5000 });
      status[name] = {
        status: 'healthy',
        url: url,
        response: response.data
      };
    } catch (error) {
      status[name] = {
        status: 'unhealthy',
        url: url,
        error: error.message
      };
    }
  }

  res.json({
    gateway: 'healthy',
    timestamp: new Date().toISOString(),
    services: status
  });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    service: 'api-gateway',
    availableEndpoints: Object.keys(serviceProxies)
  });
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`🌐 API Gateway rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 Documentação: http://localhost:${PORT}/api-docs`);
  console.log(`🔍 Status dos serviços: http://localhost:${PORT}/services/status`);
});

module.exports = app; 