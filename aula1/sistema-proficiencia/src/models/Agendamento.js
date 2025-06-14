const db = require('../database/db');

const Agendamento = {
  create: (professorId, candidatoId, dataAgendamento, feedback, status, callback) => {
    const sql = 'INSERT INTO Agendamentos (professorId, candidatoId, dataAgendamento, feedback, status) VALUES (?, ?, ?, ?, ?)';
    db.run(sql, [professorId, candidatoId, dataAgendamento, feedback, status], function(err) {
      callback(err, this ? this.lastID : null);
    });
  },
  findById: (id, callback) => {
    db.get('SELECT * FROM Agendamentos WHERE id = ?', [id], callback);
  },
  getAll: (callback) => {
    db.all('SELECT * FROM Agendamentos', [], callback);
  },
  getByProfessorId: (professorId, callback) => {
    db.all('SELECT * FROM Agendamentos WHERE professorId = ?', [professorId], callback);
  },
  getByCandidatoId: (candidatoId, callback) => {
    db.all('SELECT * FROM Agendamentos WHERE candidatoId = ?', [candidatoId], callback);
  },
  updateFeedbackStatus: (id, feedback, status, callback) => {
    const sql = 'UPDATE Agendamentos SET feedback = ?, status = ? WHERE id = ?';
    db.run(sql, [feedback, status, id], function(err) {
      callback(err, this ? this.changes : null);
    });
  }
};

module.exports = Agendamento; 