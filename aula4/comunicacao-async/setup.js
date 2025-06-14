const amqp = require('amqplib');

// Configurações do RabbitMQ
const RABBITMQ_URL = 'amqp://localhost:5672';
const QUEUE_PEDIDOS = 'pedidos';
const QUEUE_NOTIFICACOES = 'notificacoes';

async function setupRabbitMQ() {
  let connection = null;
  let channel = null;

  try {
    console.log('🐰 Conectando ao RabbitMQ...');
    
    // Conectar ao RabbitMQ
    connection = await amqp.connect(RABBITMQ_URL);
    console.log('✅ Conectado ao RabbitMQ');
    
    // Criar canal
    channel = await connection.createChannel();
    console.log('✅ Canal criado');
    
    // Declarar filas (criar se não existirem)
    await channel.assertQueue(QUEUE_PEDIDOS, { 
      durable: true // Fila persistente (sobrevive a reinicializações)
    });
    console.log(`✅ Fila '${QUEUE_PEDIDOS}' criada/verificada`);
    
    await channel.assertQueue(QUEUE_NOTIFICACOES, { 
      durable: true 
    });
    console.log(`✅ Fila '${QUEUE_NOTIFICACOES}' criada/verificada`);
    
    console.log('');
    console.log('🎉 Setup concluído com sucesso!');
    console.log('📋 Filas configuradas:');
    console.log(`   - ${QUEUE_PEDIDOS} (para pedidos de produtos)`);
    console.log(`   - ${QUEUE_NOTIFICACOES} (para notificações)`);
    console.log('');
    console.log('🚀 Agora você pode executar:');
    console.log('   npm run produtor    # Para enviar mensagens');
    console.log('   npm run consumidor  # Para processar mensagens');
    
  } catch (error) {
    console.error('❌ Erro durante setup:', error.message);
    console.log('');
    console.log('⚠️  Certifique-se de que o RabbitMQ está rodando!');
    console.log('📋 Para instalar e iniciar o RabbitMQ:');
    console.log('');
    console.log('   # No macOS (com Homebrew):');
    console.log('   brew install rabbitmq');
    console.log('   brew services start rabbitmq');
    console.log('');
    console.log('   # No Ubuntu/Debian:');
    console.log('   sudo apt-get install rabbitmq-server');
    console.log('   sudo systemctl start rabbitmq-server');
    console.log('');
    console.log('   # Usando Docker:');
    console.log('   docker run -d --hostname rabbitmq --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management');
    
  } finally {
    // Fechar conexões
    if (channel) await channel.close();
    if (connection) await connection.close();
  }
}

// Executar setup se o script for chamado diretamente
if (require.main === module) {
  setupRabbitMQ();
}

module.exports = { setupRabbitMQ, RABBITMQ_URL, QUEUE_PEDIDOS, QUEUE_NOTIFICACOES }; 