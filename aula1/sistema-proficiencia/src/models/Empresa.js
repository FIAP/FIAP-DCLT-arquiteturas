const db = require('../database/db');

const Empresa = {
  create: (nome, email, callback) => {
    const sql = 'INSERT INTO Empresa (nome, email) VALUES (?, ?)';
    db.run(sql, [nome, email], function(err) {
      callback(err, this ? this.lastID : null);
    });
  },
  findById: (id, callback) => {
    db.get('SELECT * FROM Empresa WHERE id = ?', [id], callback);
  },
  findByEmail: (email, callback) => {
    db.get('SELECT * FROM Empresa WHERE email = ?', [email], callback);
  },
  getAll: (callback) => {
    db.all('SELECT * FROM Empresa', [], callback);
  }
};

module.exports = Empresa; 