const express = require('express');
const app = express();
const PORT = 6002;

app.use(express.json());

// Base de dados simulada
let produtos = [
  { id: 1, nome: 'Notebook Dell', categoria: 'Eletrônicos', preco: 2500.00, estoque: 10 },
  { id: 2, nome: 'Mouse Logitech', categoria: 'Acessórios', preco: 89.90, estoque: 50 },
  { id: 3, nome: 'Teclado Mecânico', categoria: 'Acessórios', preco: 299.99, estoque: 25 },
  { id: 4, nome: 'Monitor 24"', categoria: 'Eletrônicos', preco: 899.00, estoque: 8 }
];

// Health check
app.get('/health', (req, res) => {
  res.json({
    servico: 'produtos',
    status: 'online',
    porta: PORT,
    timestamp: new Date().toISOString(),
    versao: '1.0.0'
  });
});

// Listar produtos
app.get('/', (req, res) => {
  console.log('📦 [PRODUTOS] Listando produtos');
  
  const { categoria, disponivel } = req.query;
  let produtosFiltrados = produtos;
  
  if (categoria) {
    produtosFiltrados = produtosFiltrados.filter(p => 
      p.categoria.toLowerCase().includes(categoria.toLowerCase())
    );
  }
  
  if (disponivel === 'true') {
    produtosFiltrados = produtosFiltrados.filter(p => p.estoque > 0);
  }
  
  setTimeout(() => {
    res.json({
      sucesso: true,
      dados: produtosFiltrados,
      total: produtosFiltrados.length,
      filtros: { categoria, disponivel },
      servico: 'produtos'
    });
  }, 180);
});

// Buscar produto por ID
app.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`📦 [PRODUTOS] Buscando produto ${id}`);
  
  const produto = produtos.find(p => p.id === id);
  
  setTimeout(() => {
    if (produto) {
      res.json({
        sucesso: true,
        dados: produto,
        servico: 'produtos'
      });
    } else {
      res.status(404).json({
        sucesso: false,
        mensagem: 'Produto não encontrado',
        servico: 'produtos'
      });
    }
  }, 120);
});

// Criar produto
app.post('/', (req, res) => {
  console.log('➕ [PRODUTOS] Criando produto:', req.body);
  
  const { nome, categoria, preco, estoque } = req.body;
  
  if (!nome || !categoria || !preco) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Nome, categoria e preço são obrigatórios',
      servico: 'produtos'
    });
  }
  
  const novoProduto = {
    id: produtos.length + 1,
    nome,
    categoria,
    preco: parseFloat(preco),
    estoque: parseInt(estoque) || 0
  };
  
  produtos.push(novoProduto);
  
  setTimeout(() => {
    res.status(201).json({
      sucesso: true,
      mensagem: 'Produto criado com sucesso',
      dados: novoProduto,
      servico: 'produtos'
    });
  }, 250);
});

// Atualizar produto
app.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { nome, categoria, preco, estoque } = req.body;
  
  console.log(`✏️ [PRODUTOS] Atualizando produto ${id}:`, req.body);
  
  const index = produtos.findIndex(p => p.id === id);
  
  if (index === -1) {
    return res.status(404).json({
      sucesso: false,
      mensagem: 'Produto não encontrado',
      servico: 'produtos'
    });
  }
  
  produtos[index] = {
    ...produtos[index],
    ...(nome && { nome }),
    ...(categoria && { categoria }),
    ...(preco && { preco: parseFloat(preco) }),
    ...(estoque !== undefined && { estoque: parseInt(estoque) })
  };
  
  setTimeout(() => {
    res.json({
      sucesso: true,
      mensagem: 'Produto atualizado com sucesso',
      dados: produtos[index],
      servico: 'produtos'
    });
  }, 200);
});

// Deletar produto
app.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`🗑️ [PRODUTOS] Deletando produto ${id}`);
  
  const index = produtos.findIndex(p => p.id === id);
  
  if (index === -1) {
    return res.status(404).json({
      sucesso: false,
      mensagem: 'Produto não encontrado',
      servico: 'produtos'
    });
  }
  
  const produtoRemovido = produtos.splice(index, 1)[0];
  
  setTimeout(() => {
    res.json({
      sucesso: true,
      mensagem: 'Produto deletado com sucesso',
      dados: produtoRemovido,
      servico: 'produtos'
    });
  }, 150);
});

// Endpoint especial: verificar disponibilidade
app.get('/:id/disponibilidade', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`📊 [PRODUTOS] Verificando disponibilidade do produto ${id}`);
  
  const produto = produtos.find(p => p.id === id);
  
  setTimeout(() => {
    if (!produto) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Produto não encontrado',
        servico: 'produtos'
      });
    }
    
    res.json({
      sucesso: true,
      dados: {
        produto_id: produto.id,
        nome: produto.nome,
        estoque: produto.estoque,
        disponivel: produto.estoque > 0,
        status: produto.estoque > 10 ? 'Em estoque' : 
               produto.estoque > 0 ? 'Últimas unidades' : 'Fora de estoque'
      },
      servico: 'produtos'
    });
  }, 100);
});

app.listen(PORT, () => {
  console.log(`📦 [PRODUTOS] Microserviço rodando na porta ${PORT}`);
  console.log(`🔗 [PRODUTOS] Endpoints disponíveis:`);
  console.log(`   GET    /health`);
  console.log(`   GET    /`);
  console.log(`   GET    /:id`);
  console.log(`   GET    /:id/disponibilidade`);
  console.log(`   POST   /`);
  console.log(`   PUT    /:id`);
  console.log(`   DELETE /:id`);
  console.log('');
});

module.exports = app; 