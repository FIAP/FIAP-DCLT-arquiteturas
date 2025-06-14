const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const portfolioRoutes = require('./routes/portfolioRoutes');
const positionRoutes = require('./routes/positionRoutes');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: 'Muitas requisições, tente novamente em 15 minutos'
});
app.use(limiter);

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    service: 'portfolio-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rotas
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/positions', positionRoutes);

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    service: 'portfolio-service'
  });
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`💼 Portfolio Service rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

module.exports = app; 