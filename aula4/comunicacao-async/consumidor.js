const amqp = require('amqplib');
const { RABBITMQ_URL, QUEUE_PEDIDOS, QUEUE_NOTIFICACOES } = require('./setup');

class ConsumidorMensagens {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.ativo = false;
  }

  async conectar() {
    try {
      console.log('🔌 Conectando ao RabbitMQ...');
      this.connection = await amqp.connect(RABBITMQ_URL);
      this.channel = await this.connection.createChannel();
      
      // Garantir que as filas existem
      await this.channel.assertQueue(QUEUE_PEDIDOS, { durable: true });
      await this.channel.assertQueue(QUEUE_NOTIFICACOES, { durable: true });
      
      // Configurar para processar uma mensagem por vez
      await this.channel.prefetch(1);
      
      console.log('✅ Consumidor conectado e pronto para processar mensagens');
      this.ativo = true;
      
    } catch (error) {
      console.error('❌ Erro ao conectar:', error.message);
      throw error;
    }
  }

  async processarPedido(mensagem) {
    try {
      const dados = JSON.parse(mensagem.content.toString());
      console.log(`📋 Processando pedido: ${dados.id}`);
      console.log(`   Cliente: ${dados.dados.cliente}`);
      console.log(`   Produto: ${dados.dados.produto}`);
      console.log(`   Quantidade: ${dados.dados.quantidade}`);
      console.log(`   Valor: R$ ${dados.dados.valor}`);
      
      // Simular processamento (validação, cálculo de estoque, etc.)
      await this.simularProcessamento(2000);
      
      // Simular possível erro (10% de chance)
      if (Math.random() < 0.1) {
        throw new Error('Produto fora de estoque');
      }
      
      console.log(`✅ Pedido ${dados.id} processado com sucesso!`);
      
      // Confirmar que a mensagem foi processada
      this.channel.ack(mensagem);
      
    } catch (error) {
      console.error(`❌ Erro ao processar pedido: ${error.message}`);
      
      // Rejeitar mensagem e colocar de volta na fila para reprocessamento
      this.channel.nack(mensagem, false, true);
    }
  }

  async processarNotificacao(mensagem) {
    try {
      const dados = JSON.parse(mensagem.content.toString());
      console.log(`📧 Processando notificação: ${dados.id}`);
      console.log(`   Destinatário: ${dados.dados.destinatario}`);
      console.log(`   Assunto: ${dados.dados.assunto}`);
      console.log(`   Prioridade: ${dados.dados.prioridade}`);
      
      // Simular envio de email
      await this.simularProcessamento(1000);
      
      console.log(`✅ Notificação ${dados.id} enviada com sucesso!`);
      
      // Confirmar que a mensagem foi processada
      this.channel.ack(mensagem);
      
    } catch (error) {
      console.error(`❌ Erro ao processar notificação: ${error.message}`);
      this.channel.nack(mensagem, false, true);
    }
  }

  async simularProcessamento(tempoMs) {
    // Simular tempo de processamento
    return new Promise(resolve => setTimeout(resolve, tempoMs));
  }

  async iniciarConsumo() {
    try {
      console.log('');
      console.log('👂 Iniciando consumo das filas...');
      console.log('================================');
      
      // Consumir mensagens da fila de pedidos
      await this.channel.consume(QUEUE_PEDIDOS, async (mensagem) => {
        if (mensagem) {
          await this.processarPedido(mensagem);
        }
      });
      
      // Consumir mensagens da fila de notificações
      await this.channel.consume(QUEUE_NOTIFICACOES, async (mensagem) => {
        if (mensagem) {
          await this.processarNotificacao(mensagem);
        }
      });
      
      console.log(`🎯 Aguardando mensagens em '${QUEUE_PEDIDOS}' e '${QUEUE_NOTIFICACOES}'...`);
      console.log('💡 Pressione Ctrl+C para parar o consumidor');
      console.log('');
      
    } catch (error) {
      console.error('❌ Erro durante consumo:', error.message);
    }
  }

  async parar() {
    try {
      this.ativo = false;
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      console.log('🛑 Consumidor parado');
    } catch (error) {
      console.error('❌ Erro ao parar:', error.message);
    }
  }
}

// Função principal
async function iniciarConsumidor() {
  console.log('🚀 EXEMPLO DE COMUNICAÇÃO ASSÍNCRONA - CONSUMIDOR');
  console.log('================================================');
  console.log('');

  const consumidor = new ConsumidorMensagens();

  try {
    await consumidor.conectar();
    await consumidor.iniciarConsumo();
    
    // Manter o processo rodando
    process.on('SIGINT', async () => {
      console.log('');
      console.log('🛑 Recebido sinal de interrupção...');
      await consumidor.parar();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  }
}

// Executar se o script for chamado diretamente
if (require.main === module) {
  iniciarConsumidor();
}

module.exports = ConsumidorMensagens; 