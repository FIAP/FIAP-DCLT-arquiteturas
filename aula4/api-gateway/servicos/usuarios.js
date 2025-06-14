const express = require('express');
const app = express();
const PORT = 6001;

app.use(express.json());

// Base de dados simulada
let usuarios = [
  { id: 1, nome: 'João Silva', email: 'joao@email.com', ativo: true },
  { id: 2, nome: 'Maria Santos', email: 'maria@email.com', ativo: true },
  { id: 3, nome: 'Pedro Costa', email: 'pedro@email.com', ativo: false }
];

// Health check
app.get('/health', (req, res) => {
  res.json({
    servico: 'usuarios',
    status: 'online',
    porta: PORT,
    timestamp: new Date().toISOString(),
    versao: '1.0.0'
  });
});

// Listar usuários
app.get('/', (req, res) => {
  console.log('👥 [USUARIOS] Listando usuários');
  
  setTimeout(() => {
    res.json({
      sucesso: true,
      dados: usuarios,
      total: usuarios.length,
      servico: 'usuarios'
    });
  }, 200);
});

// Buscar usuário por ID
app.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`👤 [USUARIOS] Buscando usuário ${id}`);
  
  const usuario = usuarios.find(u => u.id === id);
  
  setTimeout(() => {
    if (usuario) {
      res.json({
        sucesso: true,
        dados: usuario,
        servico: 'usuarios'
      });
    } else {
      res.status(404).json({
        sucesso: false,
        mensagem: 'Usuário não encontrado',
        servico: 'usuarios'
      });
    }
  }, 150);
});

// Criar usuário
app.post('/', (req, res) => {
  console.log('➕ [USUARIOS] Criando usuário:', req.body);
  
  const { nome, email } = req.body;
  
  if (!nome || !email) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Nome e email são obrigatórios',
      servico: 'usuarios'
    });
  }
  
  const novoUsuario = {
    id: usuarios.length + 1,
    nome,
    email,
    ativo: true
  };
  
  usuarios.push(novoUsuario);
  
  setTimeout(() => {
    res.status(201).json({
      sucesso: true,
      mensagem: 'Usuário criado com sucesso',
      dados: novoUsuario,
      servico: 'usuarios'
    });
  }, 300);
});

// Atualizar usuário
app.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { nome, email, ativo } = req.body;
  
  console.log(`✏️ [USUARIOS] Atualizando usuário ${id}:`, req.body);
  
  const index = usuarios.findIndex(u => u.id === id);
  
  if (index === -1) {
    return res.status(404).json({
      sucesso: false,
      mensagem: 'Usuário não encontrado',
      servico: 'usuarios'
    });
  }
  
  usuarios[index] = { 
    ...usuarios[index], 
    ...(nome && { nome }),
    ...(email && { email }),
    ...(ativo !== undefined && { ativo })
  };
  
  setTimeout(() => {
    res.json({
      sucesso: true,
      mensagem: 'Usuário atualizado com sucesso',
      dados: usuarios[index],
      servico: 'usuarios'
    });
  }, 250);
});

// Deletar usuário
app.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`🗑️ [USUARIOS] Deletando usuário ${id}`);
  
  const index = usuarios.findIndex(u => u.id === id);
  
  if (index === -1) {
    return res.status(404).json({
      sucesso: false,
      mensagem: 'Usuário não encontrado',
      servico: 'usuarios'
    });
  }
  
  const usuarioRemovido = usuarios.splice(index, 1)[0];
  
  setTimeout(() => {
    res.json({
      sucesso: true,
      mensagem: 'Usuário deletado com sucesso',
      dados: usuarioRemovido,
      servico: 'usuarios'
    });
  }, 200);
});

app.listen(PORT, () => {
  console.log(`👥 [USUARIOS] Microserviço rodando na porta ${PORT}`);
  console.log(`🔗 [USUARIOS] Endpoints disponíveis:`);
  console.log(`   GET    /health`);
  console.log(`   GET    /`);
  console.log(`   GET    /:id`);
  console.log(`   POST   /`);
  console.log(`   PUT    /:id`);
  console.log(`   DELETE /:id`);
  console.log('');
});

module.exports = app; 