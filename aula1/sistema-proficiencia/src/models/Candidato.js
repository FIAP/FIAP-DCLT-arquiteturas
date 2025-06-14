const db = require('../database/db');

const Candidato = {
  create: (nome, email, empresaId, callback) => {
    const sql = 'INSERT INTO Candidato (nome, email, empresaId) VALUES (?, ?, ?)';
    db.run(sql, [nome, email, empresaId], function(err) {
      callback(err, this ? this.lastID : null);
    });
  },
  findById: (id, callback) => {
    db.get('SELECT * FROM Candidato WHERE id = ?', [id], callback);
  },
  findByEmail: (email, callback) => {
    db.get('SELECT * FROM Candidato WHERE email = ?', [email], callback);
  },
  getAll: (callback) => {
    db.all('SELECT * FROM Candidato', [], callback);
  },
  getByEmpresaId: (empresaId, callback) => {
    db.all('SELECT * FROM Candidato WHERE empresaId = ?', [empresaId], callback);
  }
};

module.exports = Candidato; 