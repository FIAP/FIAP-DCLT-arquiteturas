const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const routes = require('./routes');
const path = require('path');
const axios = require('axios');
const session = require('express-session');
const Usuario = require('./models/Usuario');
const Professor = require('./models/Professor');
const Empresa = require('./models/Empresa');
const Candidato = require('./models/Candidato');
const Agendamento = require('./models/Agendamento');

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

app.get('/teste', (req, res) => {
  res.send('Express mínimo funcionando!');
});

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'segredo_sessao',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  console.log(`[LOG] ${req.method} ${req.url}`);
  res.on('finish', () => {
    console.log(`[LOG] Resposta enviada para ${req.method} ${req.url} - Status: ${res.statusCode}`);
  });
  next();
});

// Rotas (a serem adicionadas)
// Exemplo: app.use('/api/usuarios', require('./routes/usuarioRoutes'));
app.use('/api', routes);

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

function requireRole(role) {
  return function(req, res, next) {
    console.log(`[DEBUG] Verificando role: esperado=${role}, atual=${req.session.user?.role}, user=${JSON.stringify(req.session.user)}`);
    if (!req.session.user || req.session.user.role !== role) {
      console.log(`[DEBUG] Acesso negado para ${req.url} - Role esperado: ${role}, Role atual: ${req.session.user?.role}`);
      return res.status(403).send(`Acesso negado. Role necessário: ${role}, seu role: ${req.session.user?.role || 'não logado'}`);
    }
    next();
  };
}

app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('index', { title: 'Início' });
});

app.get('/dashboard', requireLogin, (req, res) => {
  res.render('dashboard', { title: 'Dashboard', user: req.session.user });
});

app.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

app.get('/register', (req, res) => {
  res.render('register', { title: 'Cadastro' });
});

app.post('/login', async (req, res) => {
  try {
    const response = await axios.post(`${req.protocol}://${req.get('host')}/api/usuarios/login`, req.body);
    req.session.user = response.data.user;
    req.session.token = response.data.token;
    res.redirect('/');
  } catch (err) {
    res.render('login', { title: 'Login', error: 'Usuário ou senha inválidos.' });
  }
});

app.post('/register', async (req, res) => {
  try {
    await axios.post(`${req.protocol}://${req.get('host')}/api/usuarios/register`, req.body);
    res.redirect('/login');
  } catch (err) {
    res.render('register', { title: 'Cadastro', error: 'Erro ao cadastrar. Tente novamente.' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.get('/usuarios', requireLogin, requireRole('ADM'), (req, res) => {
  Usuario.getAll((err, usuarios) => {
    if (err) return res.status(500).send('Erro ao buscar usuários');
    res.render('usuarios', { title: 'Usuários', usuarios });
  });
});

app.get('/professores', requireLogin, requireRole('ADM'), (req, res) => {
  Professor.getAll((err, professores) => {
    if (err) return res.status(500).send('Erro ao buscar professores');
    res.render('professores', { title: 'Professores', professores });
  });
});

app.get('/empresas', requireLogin, requireRole('ADM'), (req, res) => {
  Empresa.getAll((err, empresas) => {
    if (err) return res.status(500).send('Erro ao buscar empresas');
    res.render('empresas', { title: 'Empresas', empresas });
  });
});

app.get('/candidatos', requireLogin, requireRole('ADM'), (req, res) => {
  Candidato.getAll((err, candidatos) => {
    if (err) return res.status(500).send('Erro ao buscar candidatos');
    res.render('candidatos', { title: 'Candidatos', candidatos });
  });
});

// ROTAS ESPECÍFICAS PRIMEIRO (com subrotas)
// Dashboard/listagem para Professor: seus agendamentos
app.get('/agendamentos/professor', requireLogin, requireRole('PROFESSOR'), (req, res) => {
  Agendamento.getByProfessorId(req.session.user.id, (err, agendamentos) => {
    if (err) return res.status(500).send('Erro ao buscar agendamentos');
    res.render('agendamentos_professor', { title: 'Meus Agendamentos', agendamentos });
  });
});

// Dashboard/listagem para Candidato: seus agendamentos
app.get('/agendamentos/candidato', requireLogin, requireRole('CANDIDATO'), (req, res) => {
  Agendamento.getByCandidatoId(req.session.user.id, (err, agendamentos) => {
    if (err) return res.status(500).send('Erro ao buscar agendamentos');
    res.render('agendamentos_candidato', { title: 'Meus Agendamentos', agendamentos });
  });
});

// Dashboard/listagem para Empresa: agendamentos dos seus candidatos
app.get('/agendamentos/empresa', requireLogin, requireRole('EMPRESA'), (req, res) => {
  // Primeiro buscar os candidatos da empresa
  Candidato.getByEmpresaId(req.session.user.id, (err, candidatos) => {
    if (err) return res.status(500).send('Erro ao buscar candidatos');
    
    if (candidatos.length === 0) {
      return res.render('agendamentos_empresa', { title: 'Agendamentos dos Meus Candidatos', agendamentos: [] });
    }
    
    // Buscar agendamentos de todos os candidatos da empresa
    const candidatoIds = candidatos.map(c => c.id);
    Agendamento.getAll((err, todosAgendamentos) => {
      if (err) return res.status(500).send('Erro ao buscar agendamentos');
      
      // Filtrar apenas agendamentos dos candidatos da empresa
      const agendamentos = todosAgendamentos.filter(ag => candidatoIds.includes(ag.candidatoId));
      res.render('agendamentos_empresa', { title: 'Agendamentos dos Meus Candidatos', agendamentos });
    });
  });
});

// Dashboard/listagem para Empresa: seus candidatos
app.get('/candidatos/empresa', requireLogin, requireRole('EMPRESA'), (req, res) => {
  Candidato.getByEmpresaId(req.session.user.id, (err, candidatos) => {
    if (err) return res.status(500).send('Erro ao buscar candidatos');
    res.render('candidatos_empresa', { title: 'Meus Candidatos', candidatos });
  });
});

// ROTAS GERAIS POR ÚLTIMO
app.get('/agendamentos', requireLogin, requireRole('ADM'), (req, res) => {
  Agendamento.getAll((err, agendamentos) => {
    if (err) return res.status(500).send('Erro ao buscar agendamentos');
    res.render('agendamentos', { title: 'Agendamentos', agendamentos });
  });
});

// Rota de debug para verificar usuário logado
app.get('/debug/user', requireLogin, (req, res) => {
  res.json({
    user: req.session.user,
    session: req.session
  });
});

// Log de erro global
app.use((err, req, res, next) => {
  console.error('[ERRO GLOBAL]', err);
  res.status(500).send('Erro interno do servidor.');
});


module.exports = app; 