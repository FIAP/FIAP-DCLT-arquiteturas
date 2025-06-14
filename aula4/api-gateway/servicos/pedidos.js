const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 6003;

app.use(express.json());

// Base de dados simulada
let pedidos = [
  { 
    id: 1, 
    usuario_id: 1, 
    produto_id: 1, 
    quantidade: 1, 
    status: 'confirmado', 
    data: '2023-12-20T10:30:00Z',
    valor_total: 2500.00
  },
  { 
    id: 2, 
    usuario_id: 2, 
    produto_id: 2, 
    quantidade: 2, 
    status: 'processando', 
    data: '2023-12-21T14:15:00Z',
    valor_total: 179.80
  }
];

// URLs dos outros microserviços (normalmente viria de configuração)
const SERVICO_USUARIOS = 'http://localhost:6001';
const SERVICO_PRODUTOS = 'http://localhost:6002';

// Health check
app.get('/health', (req, res) => {
  res.json({
    servico: 'pedidos',
    status: 'online',
    porta: PORT,
    timestamp: new Date().toISOString(),
    versao: '1.0.0'
  });
});

// Listar pedidos
app.get('/', (req, res) => {
  console.log('🛒 [PEDIDOS] Listando pedidos');
  
  const { status, usuario_id } = req.query;
  let pedidosFiltrados = pedidos;
  
  if (status) {
    pedidosFiltrados = pedidosFiltrados.filter(p => p.status === status);
  }
  
  if (usuario_id) {
    pedidosFiltrados = pedidosFiltrados.filter(p => p.usuario_id === parseInt(usuario_id));
  }
  
  setTimeout(() => {
    res.json({
      sucesso: true,
      dados: pedidosFiltrados,
      total: pedidosFiltrados.length,
      filtros: { status, usuario_id },
      servico: 'pedidos'
    });
  }, 220);
});

// Buscar pedido por ID
app.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`🛒 [PEDIDOS] Buscando pedido ${id}`);
  
  const pedido = pedidos.find(p => p.id === id);
  
  setTimeout(() => {
    if (pedido) {
      res.json({
        sucesso: true,
        dados: pedido,
        servico: 'pedidos'
      });
    } else {
      res.status(404).json({
        sucesso: false,
        mensagem: 'Pedido não encontrado',
        servico: 'pedidos'
      });
    }
  }, 160);
});

// Criar pedido (com validação em outros serviços)
app.post('/', async (req, res) => {
  console.log('➕ [PEDIDOS] Criando pedido:', req.body);
  
  const { usuario_id, produto_id, quantidade } = req.body;
  
  if (!usuario_id || !produto_id || !quantidade) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'usuario_id, produto_id e quantidade são obrigatórios',
      servico: 'pedidos'
    });
  }
  
  try {
    // Validar se usuário existe
    console.log(`🔍 [PEDIDOS] Validando usuário ${usuario_id}...`);
    const usuarioResponse = await axios.get(`${SERVICO_USUARIOS}/${usuario_id}`, {
      timeout: 3000
    });
    
    if (!usuarioResponse.data.sucesso) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Usuário não encontrado',
        servico: 'pedidos'
      });
    }
    
    // Validar se produto existe e tem estoque
    console.log(`🔍 [PEDIDOS] Validando produto ${produto_id}...`);
    const produtoResponse = await axios.get(`${SERVICO_PRODUTOS}/${produto_id}`, {
      timeout: 3000
    });
    
    if (!produtoResponse.data.sucesso) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Produto não encontrado',
        servico: 'pedidos'
      });
    }
    
    const produto = produtoResponse.data.dados;
    
    if (produto.estoque < quantidade) {
      return res.status(400).json({
        sucesso: false,
        mensagem: `Estoque insuficiente. Disponível: ${produto.estoque}`,
        servico: 'pedidos'
      });
    }
    
    // Criar o pedido
    const novoPedido = {
      id: pedidos.length + 1,
      usuario_id: parseInt(usuario_id),
      produto_id: parseInt(produto_id),
      quantidade: parseInt(quantidade),
      status: 'pendente',
      data: new Date().toISOString(),
      valor_total: produto.preco * quantidade,
      usuario_nome: usuarioResponse.data.dados.nome,
      produto_nome: produto.nome
    };
    
    pedidos.push(novoPedido);
    
    // Simular processamento
    setTimeout(() => {
      res.status(201).json({
        sucesso: true,
        mensagem: 'Pedido criado com sucesso',
        dados: novoPedido,
        servico: 'pedidos'
      });
    }, 400);
    
  } catch (error) {
    console.error('❌ [PEDIDOS] Erro ao validar dados:', error.message);
    res.status(503).json({
      sucesso: false,
      mensagem: 'Erro ao validar dados do pedido',
      erro: error.message,
      servico: 'pedidos'
    });
  }
});

// Atualizar status do pedido
app.put('/:id/status', (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  
  console.log(`📝 [PEDIDOS] Atualizando status do pedido ${id} para: ${status}`);
  
  const statusValidos = ['pendente', 'confirmado', 'processando', 'enviado', 'entregue', 'cancelado'];
  
  if (!status || !statusValidos.includes(status)) {
    return res.status(400).json({
      sucesso: false,
      mensagem: `Status deve ser um dos: ${statusValidos.join(', ')}`,
      servico: 'pedidos'
    });
  }
  
  const index = pedidos.findIndex(p => p.id === id);
  
  if (index === -1) {
    return res.status(404).json({
      sucesso: false,
      mensagem: 'Pedido não encontrado',
      servico: 'pedidos'
    });
  }
  
  pedidos[index].status = status;
  
  setTimeout(() => {
    res.json({
      sucesso: true,
      mensagem: 'Status do pedido atualizado com sucesso',
      dados: pedidos[index],
      servico: 'pedidos'
    });
  }, 200);
});

// Cancelar pedido
app.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`❌ [PEDIDOS] Cancelando pedido ${id}`);
  
  const index = pedidos.findIndex(p => p.id === id);
  
  if (index === -1) {
    return res.status(404).json({
      sucesso: false,
      mensagem: 'Pedido não encontrado',
      servico: 'pedidos'
    });
  }
  
  // Só permite cancelar pedidos pendentes ou confirmados
  if (!['pendente', 'confirmado'].includes(pedidos[index].status)) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Pedido não pode ser cancelado neste status',
      servico: 'pedidos'
    });
  }
  
  pedidos[index].status = 'cancelado';
  
  setTimeout(() => {
    res.json({
      sucesso: true,
      mensagem: 'Pedido cancelado com sucesso',
      dados: pedidos[index],
      servico: 'pedidos'
    });
  }, 180);
});

// Relatório de pedidos
app.get('/relatorio/resumo', (req, res) => {
  console.log('📊 [PEDIDOS] Gerando relatório resumo');
  
  const resumo = {
    total_pedidos: pedidos.length,
    valor_total: pedidos.reduce((acc, p) => acc + p.valor_total, 0),
    por_status: {},
    ultimo_pedido: pedidos.length > 0 ? pedidos[pedidos.length - 1].data : null
  };
  
  // Contar por status
  pedidos.forEach(pedido => {
    resumo.por_status[pedido.status] = (resumo.por_status[pedido.status] || 0) + 1;
  });
  
  setTimeout(() => {
    res.json({
      sucesso: true,
      dados: resumo,
      timestamp: new Date().toISOString(),
      servico: 'pedidos'
    });
  }, 300);
});

app.listen(PORT, () => {
  console.log(`🛒 [PEDIDOS] Microserviço rodando na porta ${PORT}`);
  console.log(`🔗 [PEDIDOS] Endpoints disponíveis:`);
  console.log(`   GET    /health`);
  console.log(`   GET    /`);
  console.log(`   GET    /:id`);
  console.log(`   POST   /`);
  console.log(`   PUT    /:id/status`);
  console.log(`   DELETE /:id`);
  console.log(`   GET    /relatorio/resumo`);
  console.log('');
});

module.exports = app; 