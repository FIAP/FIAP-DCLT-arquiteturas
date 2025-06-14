const db = require('../database/db');

const Usuario = {
  create: (userName, email, password, role, callback) => {
    const sql = 'INSERT INTO Usuario (userName, email, password, role) VALUES (?, ?, ?, ?)';
    db.run(sql, [userName, email, password, role], function(err) {
      callback(err, this ? this.lastID : null);
    });
  },
  findById: (id, callback) => {
    db.get('SELECT * FROM Usuario WHERE id = ?', [id], callback);
  },
  findByUserName: (userName, callback) => {
    db.get('SELECT * FROM Usuario WHERE userName = ?', [userName], callback);
  },
  findByEmail: (email, callback) => {
    db.get('SELECT * FROM Usuario WHERE email = ?', [email], callback);
  },
  getAll: (callback) => {
    db.all('SELECT * FROM Usuario', [], callback);
  }
};

module.exports = Usuario; 