const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const fs = require('fs');

// Configurar variáveis de ambiente
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Investimentos API',
      version: '1.0.0',
      description: 'API completa para gerenciamento de investimentos e portfólios',
      contact: {
        name: 'FIAP - Arquitetura de Software',
        email: 'suporte@fiap.com.br'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor de Desenvolvimento'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/models/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middlewares de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"]
    }
  }
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por janela
  message: {
    error: 'Muitas requisições. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api', limiter);

// Middlewares gerais
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Configuração do EJS (Template Engine)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Servir a raiz do projeto como estática para expor format.js ao frontend
app.use('/js', express.static(path.resolve(__dirname, '..')));

// Inicializar banco de dados
const db = require('./models');

// Middleware para disponibilizar o db em todas as rotas
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Sistema de Investimentos - API Docs'
}));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    database: 'Connected'
  });
});

// Rotas das páginas (Frontend)
const pageRoutes = require('./routes/pageRoutes');
app.use('/', pageRoutes);

// Rotas da API (Backend)
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const assetRoutes = require('./routes/assetRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/assets', assetRoutes);
app.use('/api/v1/portfolio', portfolioRoutes);
app.use('/api/v1/transactions', transactionRoutes);

// ROTA DE SIMULAÇÃO PESADA PARA DEMONSTRAÇÃO DE PERFORMANCE
/**
 * @swagger
 * /api/v1/simulacao-pesada:
 *   get:
 *     summary: Simulação pesada de investimentos (carga de CPU)
 *     description: Executa um cálculo intensivo para simular gargalo de performance no monolito.
 *     tags:
 *       - Demo
 *     responses:
 *       200:
 *         description: Resultado da simulação pesada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultado:
 *                   type: number
 *                 tempo_ms:
 *                   type: number
 */
app.get('/api/v1/simulacao-pesada', async (req, res) => {
  const inicio = Date.now();
  // Simulação de cálculo pesado: juros compostos em lote
  let resultado = 0;
  for (let i = 0; i < 1_000_000; i++) {
    // Simula 1 milhão de cálculos de investimento
    const principal = 1000 + (i % 1000);
    const taxa = 0.07 + ((i % 10) * 0.001);
    const anos = 20 + (i % 5);
    resultado += principal * Math.pow(1 + taxa, anos);
  }
  const tempo_ms = Date.now() - inicio;
  res.json({ resultado, tempo_ms });
});

// Middleware de tratamento de erros
const { errorHandler } = require('./middleware/errorHandler');
app.use(errorHandler);

// Middleware para 404
app.use('*', (req, res) => {
  if (req.originalUrl.startsWith('/api/')) {
    res.status(404).json({
      success: false,
      message: 'Endpoint não encontrado',
      path: req.originalUrl
    });
  } else {
    res.status(404).render('error', {
      title: 'Página não encontrada',
      message: 'A página solicitada não foi encontrada.',
      error: { status: 404 }
    });
  }
});

// Inicializar servidor
async function startServer() {
  try {
    // Sincronizar banco de dados
    console.log('🔄 Conectando ao banco de dados...');
    await db.sequelize.authenticate();
    console.log('✅ Conexão com banco estabelecida!');
    
    // Sincronizar modelos (em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync({ alter: true });
      console.log('✅ Modelos sincronizados!');
    }
    
    // Iniciar servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`
🚀 Sistema de Investimentos Monolítico iniciado!
📍 Ambiente: ${process.env.NODE_ENV || 'development'}
🌐 Frontend: http://localhost:${PORT}
🔌 API: http://localhost:${PORT}/api/v1
📚 Documentação: http://localhost:${PORT}/api-docs
🏥 Health Check: http://localhost:${PORT}/health
      `);
    });
    
  } catch (error) {
    console.error('❌ Erro ao inicializar aplicação:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 Encerrando aplicação...');
  await db.sequelize.close();
  console.log('✅ Aplicação encerrada graciosamente');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 Encerrando aplicação...');
  await db.sequelize.close();
  console.log('✅ Aplicação encerrada graciosamente');
  process.exit(0);
});

// Tratar erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Inicializar aplicação
if (require.main === module) {
  startServer();
}

module.exports = app; 