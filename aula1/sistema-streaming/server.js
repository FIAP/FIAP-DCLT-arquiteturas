const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

// Importar módulos do sistema
const gravacaoRoutes = require('./routes/gravacao');
const filasRoutes = require('./routes/filas');
const monitoramentoRoutes = require('./routes/monitoramento');
const FilaProcessor = require('./services/FilaProcessor');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configurar Socket.IO para monitoramento em tempo real
app.set('io', io);

// Rotas da API
app.use('/api/gravacao', gravacaoRoutes);
app.use('/api/filas', filasRoutes);
app.use('/api/monitoramento', monitoramentoRoutes);

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicializar processador de filas
const filaProcessor = new FilaProcessor(io);
io.filaProcessor = filaProcessor;
filaProcessor.iniciar();

// Configurar eventos Socket.IO
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });

  // Enviar estado atual do sistema
  socket.emit('sistema-status', filaProcessor.obterStatus());
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Interface web: http://localhost:${PORT}`);
});

module.exports = { app, io }; 