const axios = require('axios');

// Configuração base da API
const API_BASE_URL = 'http://localhost:5003';

// Cliente para demonstrar comunicação síncrona
class ClienteAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Método para verificar status da API
  async verificarStatus() {
    try {
      console.log('🔄 Verificando status da API...');
      const response = await axios.get(`${this.baseURL}/status`);
      console.log('✅ API está funcionando:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error.message);
      throw error;
    }
  }

  // Método para listar todos os usuários
  async listarUsuarios() {
    try {
      console.log('🔄 Buscando lista de usuários...');
      const response = await axios.get(`${this.baseURL}/usuarios`);
      console.log('✅ Usuários encontrados:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao listar usuários:', error.message);
      throw error;
    }
  }

  // Método para buscar usuário por ID
  async buscarUsuario(id) {
    try {
      console.log(`🔄 Buscando usuário com ID ${id}...`);
      const response = await axios.get(`${this.baseURL}/usuarios/${id}`);
      console.log('✅ Usuário encontrado:', response.data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('⚠️ Usuário não encontrado');
      } else {
        console.error('❌ Erro ao buscar usuário:', error.message);
      }
      throw error;
    }
  }

  // Método para criar novo usuário
  async criarUsuario(nome, email) {
    try {
      console.log(`🔄 Criando usuário: ${nome} (${email})`);
      const response = await axios.post(`${this.baseURL}/usuarios`, {
        nome,
        email
      });
      console.log('✅ Usuário criado:', response.data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('⚠️ Dados inválidos:', error.response.data.mensagem);
      } else {
        console.error('❌ Erro ao criar usuário:', error.message);
      }
      throw error;
    }
  }
}

// Função principal para demonstrar a comunicação síncrona
async function exemploComumicacaoSincrona() {
  console.log('🚀 EXEMPLO DE COMUNICAÇÃO SÍNCRONA');
  console.log('=====================================');
  console.log('');

  const cliente = new ClienteAPI();

  try {
    // 1. Verificar se a API está funcionando
    console.log('1️⃣ VERIFICANDO STATUS DA API');
    console.log('------------------------------');
    await cliente.verificarStatus();
    console.log('');

    // 2. Listar usuários existentes
    console.log('2️⃣ LISTANDO USUÁRIOS EXISTENTES');
    console.log('-------------------------------');
    await cliente.listarUsuarios();
    console.log('');

    // 3. Buscar um usuário específico
    console.log('3️⃣ BUSCANDO USUÁRIO ESPECÍFICO');
    console.log('------------------------------');
    await cliente.buscarUsuario(1);
    console.log('');

    // 4. Tentar buscar usuário inexistente
    console.log('4️⃣ TESTANDO USUÁRIO INEXISTENTE');
    console.log('-------------------------------');
    try {
      await cliente.buscarUsuario(999);
    } catch (error) {
      // Esperado - usuário não existe
    }
    console.log('');

    // 5. Criar novo usuário
    console.log('5️⃣ CRIANDO NOVO USUÁRIO');
    console.log('----------------------');
    await cliente.criarUsuario('Ana Oliveira', 'ana@email.com');
    console.log('');

    // 6. Listar usuários novamente para ver o novo
    console.log('6️⃣ LISTANDO USUÁRIOS ATUALIZADA');
    console.log('-------------------------------');
    await cliente.listarUsuarios();
    console.log('');

    console.log('✅ EXEMPLO CONCLUÍDO COM SUCESSO!');
    console.log('');
    console.log('💡 CARACTERÍSTICAS DA COMUNICAÇÃO SÍNCRONA:');
    console.log('   - Cliente faz requisição e ESPERA pela resposta');
    console.log('   - Servidor processa e retorna imediatamente');
    console.log('   - Comunicação via HTTP Request/Response');
    console.log('   - Padrão simples e direto');

  } catch (error) {
    console.error('❌ Erro durante execução:', error.message);
    console.log('');
    console.log('⚠️ Certifique-se de que o servidor está rodando!');
    console.log('   Execute: npm run servidor');
  }
}

// Verificar se o script está sendo executado diretamente
if (require.main === module) {
  exemploComumicacaoSincrona();
}

module.exports = ClienteAPI; 