const db = require('./db');

// Tabela Usuario
const usuarioTable = `CREATE TABLE IF NOT EXISTS Usuario (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userName TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL
);`;

// Tabela ADM
const admTable = `CREATE TABLE IF NOT EXISTS ADM (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);`;

// Tabela Professor
const professorTable = `CREATE TABLE IF NOT EXISTS Professor (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);`;

// Tabela Empresa
const empresaTable = `CREATE TABLE IF NOT EXISTS Empresa (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);`;

// Tabela Candidato
const candidatoTable = `CREATE TABLE IF NOT EXISTS Candidato (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  empresaId INTEGER,
  FOREIGN KEY (empresaId) REFERENCES Empresa(id)
);`;

// Tabela Agendamentos
const agendamentoTable = `CREATE TABLE IF NOT EXISTS Agendamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  professorId INTEGER,
  candidatoId INTEGER,
  dataAgendamento TEXT NOT NULL,
  feedback TEXT,
  status TEXT,
  FOREIGN KEY (professorId) REFERENCES Professor(id),
  FOREIGN KEY (candidatoId) REFERENCES Candidato(id)
);`;

function init() {
  db.serialize(() => {
    db.run(usuarioTable);
    db.run(admTable);
    db.run(professorTable);
    db.run(empresaTable);
    db.run(candidatoTable);
    db.run(agendamentoTable);
  });
}

module.exports = init; 