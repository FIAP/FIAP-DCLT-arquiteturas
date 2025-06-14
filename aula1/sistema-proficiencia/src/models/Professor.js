const db = require('../database/db');

const Professor = {
  create: (nome, email, callback) => {
    const sql = 'INSERT INTO Professor (nome, email) VALUES (?, ?)';
    db.run(sql, [nome, email], function(err) {
      callback(err, this ? this.lastID : null);
    });
  },
  findById: (id, callback) => {
    db.get('SELECT * FROM Professor WHERE id = ?', [id], callback);
  },
  findByEmail: (email, callback) => {
    db.get('SELECT * FROM Professor WHERE email = ?', [email], callback);
  },
  getAll: (callback) => {
    db.all('SELECT * FROM Professor', [], callback);
  }
};

module.exports = Professor; 