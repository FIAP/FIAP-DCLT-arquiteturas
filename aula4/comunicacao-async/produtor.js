const amqp = require('amqplib');
const { RABBITMQ_URL, QUEUE_PEDIDOS, QUEUE_NOTIFICACOES } = require('./setup');

class ProdutorMensagens {
  constructor() {
    this.connection = null;
    this.channel = null;
  }

  async conectar() {
    try {
      console.log('🔌 Conectando ao RabbitMQ...');
      this.connection = await amqp.connect(RABBITMQ_URL);
      this.channel = await this.connection.createChannel();
      
      // Garantir que as filas existem
      await this.channel.assertQueue(QUEUE_PEDIDOS, { durable: true });
      await this.channel.assertQueue(QUEUE_NOTIFICACOES, { durable: true });
      
      console.log('✅ Produtor conectado e pronto para enviar mensagens');
      
    } catch (error) {
      console.error('❌ Erro ao conectar:', error.message);
      throw error;
    }
  }

  async enviarPedido(pedido) {
    try {
      const mensagem = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        tipo: 'NOVO_PEDIDO',
        dados: pedido
      };

      // Enviar mensagem para a fila de pedidos
      await this.channel.sendToQueue(
        QUEUE_PEDIDOS,
        Buffer.from(JSON.stringify(mensagem)),
        { persistent: true } // Mensagem persistente
      );

      console.log(`📤 Pedido enviado para fila: ${JSON.stringify(mensagem)}`);
      return mensagem;
      
    } catch (error) {
      console.error('❌ Erro ao enviar pedido:', error.message);
      throw error;
    }
  }

  async enviarNotificacao(notificacao) {
    try {
      const mensagem = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        tipo: 'NOTIFICACAO',
        dados: notificacao
      };

      // Enviar mensagem para a fila de notificações
      await this.channel.sendToQueue(
        QUEUE_NOTIFICACOES,
        Buffer.from(JSON.stringify(mensagem)),
        { persistent: true }
      );

      console.log(`📧 Notificação enviada para fila: ${JSON.stringify(mensagem)}`);
      return mensagem;
      
    } catch (error) {
      console.error('❌ Erro ao enviar notificação:', error.message);
      throw error;
    }
  }

  async desconectar() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      console.log('🔌 Desconectado do RabbitMQ');
    } catch (error) {
      console.error('❌ Erro ao desconectar:', error.message);
    }
  }
}

// Função para demonstrar o envio de mensagens
async function exemploProducao() {
  console.log('🚀 EXEMPLO DE COMUNICAÇÃO ASSÍNCRONA - PRODUTOR');
  console.log('===============================================');
  console.log('');

  const produtor = new ProdutorMensagens();

  try {
    // Conectar
    await produtor.conectar();
    console.log('');

    // Simular envio de pedidos
    console.log('📋 ENVIANDO PEDIDOS PARA A FILA...');
    console.log('----------------------------------');
    
    const pedidos = [
      { cliente: 'João Silva', produto: 'Notebook', quantidade: 1, valor: 2500.00 },
      { cliente: 'Maria Santos', produto: 'Mouse', quantidade: 2, valor: 100.00 },
      { cliente: 'Pedro Costa', produto: 'Teclado', quantidade: 1, valor: 150.00 }
    ];

    for (const pedido of pedidos) {
      await produtor.enviarPedido(pedido);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Aguardar 1 segundo
    }

    console.log('');
    console.log('📧 ENVIANDO NOTIFICAÇÕES PARA A FILA...');
    console.log('--------------------------------------');

    const notificacoes = [
      { destinatario: 'admin@empresa.com', assunto: 'Novos pedidos recebidos', prioridade: 'alta' },
      { destinatario: 'vendas@empresa.com', assunto: 'Relatório de vendas', prioridade: 'normal' }
    ];

    for (const notificacao of notificacoes) {
      await produtor.enviarNotificacao(notificacao);
      await new Promise(resolve => setTimeout(resolve, 500)); // Aguardar 0.5 segundo
    }

    console.log('');
    console.log('✅ TODAS AS MENSAGENS FORAM ENVIADAS!');
    console.log('');
    console.log('💡 CARACTERÍSTICAS DA COMUNICAÇÃO ASSÍNCRONA:');
    console.log('   - Produtor envia mensagens e NÃO espera resposta');
    console.log('   - Mensagens ficam na fila até serem processadas');
    console.log('   - Consumidor processa mensagens independentemente');
    console.log('   - Sistema continua funcionando mesmo se consumidor estiver offline');
    console.log('');
    console.log('🎯 Execute "npm run consumidor" para processar as mensagens!');

  } catch (error) {
    console.error('❌ Erro durante produção:', error.message);
  } finally {
    await produtor.desconectar();
  }
}

// Executar exemplo se o script for chamado diretamente
if (require.main === module) {
  exemploProducao();
}

module.exports = ProdutorMensagens; 