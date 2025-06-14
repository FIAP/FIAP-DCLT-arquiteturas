const axios = require('axios');

// Configuração do API Gateway
const GATEWAY_URL = 'http://localhost:8080';
const TOKEN = 'token123'; // Token válido para autenticação

// Configurar headers padrão
const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json'
};

class ClienteAPIGateway {
  constructor() {
    this.baseURL = GATEWAY_URL;
    this.headers = headers;
  }

  async verificarGateway() {
    try {
      console.log('🔍 Verificando status do Gateway...');
      const response = await axios.get(`${this.baseURL}/health`);
      console.log('✅ Gateway online:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao conectar com Gateway:', error.message);
      throw error;
    }
  }

  async verificarServicos() {
    try {
      console.log('📊 Verificando status dos microserviços...');
      const response = await axios.get(`${this.baseURL}/servicos/status`, {
        headers: this.headers
      });
      console.log('📋 Status dos serviços:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao verificar serviços:', error.message);
      throw error;
    }
  }

  // Métodos para serviço de usuários
  async listarUsuarios() {
    try {
      console.log('👥 Listando usuários via Gateway...');
      const response = await axios.get(`${this.baseURL}/api/usuarios`, {
        headers: this.headers
      });
      console.log('✅ Usuários recebidos:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao listar usuários:', error.response?.data || error.message);
      throw error;
    }
  }

  async buscarUsuario(id) {
    try {
      console.log(`👤 Buscando usuário ${id} via Gateway...`);
      const response = await axios.get(`${this.baseURL}/api/usuarios/${id}`, {
        headers: this.headers
      });
      console.log('✅ Usuário encontrado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar usuário:', error.response?.data || error.message);
      throw error;
    }
  }

  async criarUsuario(nome, email) {
    try {
      console.log(`➕ Criando usuário via Gateway: ${nome} (${email})`);
      const response = await axios.post(`${this.baseURL}/api/usuarios`, {
        nome,
        email
      }, { headers: this.headers });
      console.log('✅ Usuário criado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error.response?.data || error.message);
      throw error;
    }
  }

  // Métodos para serviço de produtos
  async listarProdutos(categoria = null) {
    try {
      const params = categoria ? `?categoria=${categoria}` : '';
      console.log(`📦 Listando produtos via Gateway${categoria ? ' (categoria: ' + categoria + ')' : ''}...`);
      
      const response = await axios.get(`${this.baseURL}/api/produtos${params}`, {
        headers: this.headers
      });
      console.log('✅ Produtos recebidos:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao listar produtos:', error.response?.data || error.message);
      throw error;
    }
  }

  async buscarProduto(id) {
    try {
      console.log(`📦 Buscando produto ${id} via Gateway...`);
      const response = await axios.get(`${this.baseURL}/api/produtos/${id}`, {
        headers: this.headers
      });
      console.log('✅ Produto encontrado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar produto:', error.response?.data || error.message);
      throw error;
    }
  }

  async verificarDisponibilidade(produtoId) {
    try {
      console.log(`📊 Verificando disponibilidade do produto ${produtoId} via Gateway...`);
      const response = await axios.get(`${this.baseURL}/api/produtos/${produtoId}/disponibilidade`, {
        headers: this.headers
      });
      console.log('✅ Disponibilidade:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao verificar disponibilidade:', error.response?.data || error.message);
      throw error;
    }
  }

  // Métodos para serviço de pedidos
  async listarPedidos() {
    try {
      console.log('🛒 Listando pedidos via Gateway...');
      const response = await axios.get(`${this.baseURL}/api/pedidos`, {
        headers: this.headers
      });
      console.log('✅ Pedidos recebidos:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao listar pedidos:', error.response?.data || error.message);
      throw error;
    }
  }

  async criarPedido(usuarioId, produtoId, quantidade) {
    try {
      console.log(`🛒 Criando pedido via Gateway: usuário ${usuarioId}, produto ${produtoId}, qtd ${quantidade}`);
      const response = await axios.post(`${this.baseURL}/api/pedidos`, {
        usuario_id: usuarioId,
        produto_id: produtoId,
        quantidade
      }, { headers: this.headers });
      console.log('✅ Pedido criado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao criar pedido:', error.response?.data || error.message);
      throw error;
    }
  }

  async obterRelatorioPedidos() {
    try {
      console.log('📊 Obtendo relatório de pedidos via Gateway...');
      const response = await axios.get(`${this.baseURL}/api/pedidos/relatorio/resumo`, {
        headers: this.headers
      });
      console.log('✅ Relatório obtido:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao obter relatório:', error.response?.data || error.message);
      throw error;
    }
  }

  async testarSemToken() {
    try {
      console.log('🔒 Testando acesso sem token...');
      const response = await axios.get(`${this.baseURL}/api/usuarios`);
      console.log('⚠️ Não deveria chegar aqui!', response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Autenticação funcionando - acesso negado sem token');
      } else {
        console.error('❌ Erro inesperado:', error.response?.data || error.message);
      }
    }
  }
}

// Função principal que demonstra todo o fluxo
async function demonstrarAPIGateway() {
  console.log('🚪 DEMONSTRAÇÃO DO API GATEWAY');
  console.log('==============================');
  console.log('');

  const cliente = new ClienteAPIGateway();

  try {
    // 1. Verificar gateway
    console.log('1️⃣ VERIFICANDO GATEWAY');
    console.log('---------------------');
    await cliente.verificarGateway();
    console.log('');

    // 2. Verificar serviços
    console.log('2️⃣ VERIFICANDO MICROSERVIÇOS');
    console.log('----------------------------');
    await cliente.verificarServicos();
    console.log('');

    // 3. Testar autenticação
    console.log('3️⃣ TESTANDO AUTENTICAÇÃO');
    console.log('------------------------');
    await cliente.testarSemToken();
    console.log('');

    // 4. Trabalhar com usuários
    console.log('4️⃣ TRABALHANDO COM USUÁRIOS');
    console.log('---------------------------');
    await cliente.listarUsuarios();
    await cliente.buscarUsuario(1);
    await cliente.criarUsuario('Ana Gateway', 'ana.gateway@email.com');
    console.log('');

    // 5. Trabalhar com produtos
    console.log('5️⃣ TRABALHANDO COM PRODUTOS');
    console.log('---------------------------');
    await cliente.listarProdutos();
    await cliente.listarProdutos('Eletrônicos');
    await cliente.buscarProduto(1);
    await cliente.verificarDisponibilidade(1);
    console.log('');

    // 6. Trabalhar com pedidos
    console.log('6️⃣ TRABALHANDO COM PEDIDOS');
    console.log('--------------------------');
    await cliente.listarPedidos();
    await cliente.criarPedido(1, 2, 1); // Usuário 1, Produto 2, Quantidade 1
    await cliente.obterRelatorioPedidos();
    console.log('');

    console.log('✅ DEMONSTRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('');
    console.log('💡 FUNCIONALIDADES DEMONSTRADAS DO API GATEWAY:');
    console.log('   🔒 Autenticação centralizada');
    console.log('   🔄 Roteamento para microserviços');
    console.log('   📊 Monitoramento de saúde dos serviços');
    console.log('   ⚡ Rate limiting');
    console.log('   📝 Logging centralizado');
    console.log('   🛡️ Tratamento de erros');
    console.log('');
    console.log('🎯 O Gateway atua como ponto único de entrada para múltiplos serviços!');

  } catch (error) {
    console.error('❌ Erro durante demonstração:', error.message);
    console.log('');
    console.log('⚠️ Certifique-se de que todos os serviços estão rodando:');
    console.log('   npm run start-all');
  }
}

// Executar demonstração se o script for chamado diretamente
if (require.main === module) {
  demonstrarAPIGateway();
}

module.exports = ClienteAPIGateway; 