const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const morgan = require('morgan');
const axios = require('axios');

const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined')); // Logging de requisições

// Configuração dos microserviços
const SERVICOS = {
  usuarios: 'http://localhost:6001',
  produtos: 'http://localhost:6002', 
  pedidos: 'http://localhost:6003'
};

// Middleware de autenticação simples
const autenticacao = (req, res, next) => {
  const token = req.headers.authorization;
  
  // Simular validação de token
  if (!token || !token.startsWith('Bearer ')) {
    console.log('❌ [GATEWAY] Requisição sem token de autorização');
    return res.status(401).json({
      erro: 'Token de autorização necessário',
      message: 'Inclua o header: Authorization: Bearer <token>'
    });
  }
  
  const tokenValue = token.replace('Bearer ', '');
  
  // Tokens válidos para o exemplo
  const tokensValidos = ['token123', 'admin456', 'user789'];
  
  if (!tokensValidos.includes(tokenValue)) {
    console.log('❌ [GATEWAY] Token inválido:', tokenValue);
    return res.status(403).json({
      erro: 'Token inválido'
    });
  }
  
  console.log('✅ [GATEWAY] Token válido:', tokenValue);
  req.usuario = { token: tokenValue }; // Simular dados do usuário
  next();
};

// Middleware de rate limiting simples
const rateLimiter = {};
const rateLimit = (req, res, next) => {
  const ip = req.ip;
  const agora = Date.now();
  const janela = 60000; // 1 minuto
  const limite = 10; // 10 requisições por minuto
  
  if (!rateLimiter[ip]) {
    rateLimiter[ip] = { count: 1, resetTime: agora + janela };
  } else {
    if (agora > rateLimiter[ip].resetTime) {
      rateLimiter[ip] = { count: 1, resetTime: agora + janela };
    } else {
      rateLimiter[ip].count++;
    }
  }
  
  if (rateLimiter[ip].count > limite) {
    console.log('⚠️ [GATEWAY] Rate limit excedido para IP:', ip);
    return res.status(429).json({
      erro: 'Muitas requisições',
      message: `Limite de ${limite} requisições por minuto excedido`
    });
  }
  
  next();
};

// Health check do gateway
app.get('/health', (req, res) => {
  res.json({
    status: 'Gateway funcionando',
    timestamp: new Date().toISOString(),
    servicos: SERVICOS
  });
});

// Endpoint para obter informações sobre os serviços
app.get('/servicos/status', async (req, res) => {
  console.log('📊 [GATEWAY] Verificando status dos serviços...');
  
  const status = {};
  
  for (const [nome, url] of Object.entries(SERVICOS)) {
    try {
      const response = await axios.get(`${url}/health`, { timeout: 2000 });
      status[nome] = { 
        url, 
        status: 'online', 
        dados: response.data 
      };
      console.log(`✅ [GATEWAY] Serviço ${nome} está online`);
    } catch (error) {
      status[nome] = { 
        url, 
        status: 'offline', 
        erro: error.message 
      };
      console.log(`❌ [GATEWAY] Serviço ${nome} está offline`);
    }
  }
  
  res.json({
    gateway: 'online',
    timestamp: new Date().toISOString(),
    servicos: status
  });
});

// Roteamento para serviço de usuários
app.use('/api/usuarios', rateLimit, autenticacao, createProxyMiddleware({
  target: SERVICOS.usuarios,
  changeOrigin: true,
  pathRewrite: {
    '^/api/usuarios': '' // Remove /api/usuarios do path
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 [GATEWAY] Roteando para usuários: ${req.method} ${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`✅ [GATEWAY] Resposta do serviço usuários: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.log(`❌ [GATEWAY] Erro ao comunicar com serviço usuários:`, err.message);
    res.status(503).json({
      erro: 'Serviço usuários indisponível',
      message: err.message
    });
  }
}));

// Roteamento para serviço de produtos
app.use('/api/produtos', rateLimit, autenticacao, createProxyMiddleware({
  target: SERVICOS.produtos,
  changeOrigin: true,
  pathRewrite: {
    '^/api/produtos': ''
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 [GATEWAY] Roteando para produtos: ${req.method} ${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`✅ [GATEWAY] Resposta do serviço produtos: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.log(`❌ [GATEWAY] Erro ao comunicar com serviço produtos:`, err.message);
    res.status(503).json({
      erro: 'Serviço produtos indisponível',
      message: err.message
    });
  }
}));

// Roteamento para serviço de pedidos
app.use('/api/pedidos', rateLimit, autenticacao, createProxyMiddleware({
  target: SERVICOS.pedidos,
  changeOrigin: true,
  pathRewrite: {
    '^/api/pedidos': ''
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 [GATEWAY] Roteando para pedidos: ${req.method} ${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`✅ [GATEWAY] Resposta do serviço pedidos: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.log(`❌ [GATEWAY] Erro ao comunicar com serviço pedidos:`, err.message);
    res.status(503).json({
      erro: 'Serviço pedidos indisponível',
      message: err.message
    });
  }
}));

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  console.log(`❌ [GATEWAY] Rota não encontrada: ${req.method} ${req.url}`);
  res.status(404).json({
    erro: 'Rota não encontrada',
    message: 'Verifique a documentação da API',
    rotas_disponiveis: [
      'GET /health',
      'GET /servicos/status',
      'GET /api/usuarios',
      'GET /api/produtos', 
      'GET /api/pedidos'
    ]
  });
});

// Iniciar o gateway
app.listen(PORT, () => {
  console.log('🚪 API GATEWAY INICIADO');
  console.log('======================');
  console.log(`🌐 Gateway rodando na porta ${PORT}`);
  console.log('🔗 Rotas disponíveis:');
  console.log('   GET  /health');
  console.log('   GET  /servicos/status');
  console.log('   *    /api/usuarios/*    -> ' + SERVICOS.usuarios);
  console.log('   *    /api/produtos/*    -> ' + SERVICOS.produtos);
  console.log('   *    /api/pedidos/*     -> ' + SERVICOS.pedidos);
  console.log('');
  console.log('🔒 Autenticação necessária (Authorization: Bearer <token>)');
  console.log('📋 Tokens válidos: token123, admin456, user789');
  console.log('⚡ Rate limit: 10 requisições por minuto por IP');
  console.log('');
});

module.exports = app; 