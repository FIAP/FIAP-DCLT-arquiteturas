const express = require('express');
const app = express();
const PORT = 5003;

// Middleware para parsing JSON
app.use(express.json());

// Simulando um banco de dados em memória
let usuarios = [
  { id: 1, nome: 'João Silva', email: 'joao@email.com' },
  { id: 2, nome: 'Maria Santos', email: 'maria@email.com' },
  { id: 3, nome: 'Pedro Costa', email: 'pedro@email.com' }
];

// Endpoint GET - Listar todos os usuários
app.get('/usuarios', (req, res) => {
  console.log('📥 Requisição recebida: GET /usuarios');
  
  // Simulando um pequeno processamento
  setTimeout(() => {
    console.log('📤 Enviando resposta com lista de usuários');
    res.json({
      sucesso: true,
      dados: usuarios,
      total: usuarios.length
    });
  }, 500); // 500ms de delay para simular processamento
});

// Endpoint GET - Buscar usuário por ID
app.get('/usuarios/:id', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`📥 Requisição recebida: GET /usuarios/${id}`);
  
  const usuario = usuarios.find(u => u.id === id);
  
  setTimeout(() => {
    if (usuario) {
      console.log(`📤 Enviando dados do usuário ${id}`);
      res.json({
        sucesso: true,
        dados: usuario
      });
    } else {
      console.log(`❌ Usuário ${id} não encontrado`);
      res.status(404).json({
        sucesso: false,
        mensagem: 'Usuário não encontrado'
      });
    }
  }, 300);
});

// Endpoint POST - Criar novo usuário
app.post('/usuarios', (req, res) => {
  console.log('📥 Requisição recebida: POST /usuarios');
  console.log('📋 Dados recebidos:', req.body);
  
  const { nome, email } = req.body;
  
  if (!nome || !email) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Nome e email são obrigatórios'
    });
  }
  
  const novoUsuario = {
    id: usuarios.length + 1,
    nome,
    email
  };
  
  usuarios.push(novoUsuario);
  
  setTimeout(() => {
    console.log('📤 Usuário criado com sucesso');
    res.status(201).json({
      sucesso: true,
      mensagem: 'Usuário criado com sucesso',
      dados: novoUsuario
    });
  }, 400);
});

// Endpoint de status da API
app.get('/status', (req, res) => {
  console.log('📥 Requisição recebida: GET /status');
  res.json({
    status: 'API funcionando',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Iniciando o servidor
app.listen(PORT, () => {
  console.log('🚀 Servidor rodando na porta', PORT);
  console.log('📡 API RESTful ativa e aguardando requisições...');
  console.log('🔗 Endpoints disponíveis:');
  console.log('   GET    /status');
  console.log('   GET    /usuarios');
  console.log('   GET    /usuarios/:id');
  console.log('   POST   /usuarios');
  console.log('');
});

module.exports = app; 