const db = require('../database/db');

const ADM = {
  create: (nome, email, callback) => {
    const sql = 'INSERT INTO ADM (nome, email) VALUES (?, ?)';
    db.run(sql, [nome, email], function(err) {
      callback(err, this ? this.lastID : null);
    });
  },
  findById: (id, callback) => {
    db.get('SELECT * FROM ADM WHERE id = ?', [id], callback);
  },
  findByEmail: (email, callback) => {
    db.get('SELECT * FROM ADM WHERE email = ?', [email], callback);
  },
  getAll: (callback) => {
    db.all('SELECT * FROM ADM', [], callback);
  }
};

module.exports = ADM; 