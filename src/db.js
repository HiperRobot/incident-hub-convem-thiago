const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_FILE = process.env.DB_FILE || path.join(__dirname, '..', 'data.sqlite');

const db = new sqlite3.Database(DB_FILE);

function init() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS incidents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        severity TEXT NOT NULL,
        owner TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS status_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        incident_id INTEGER NOT NULL,
        previous_status TEXT NOT NULL,
        new_status TEXT NOT NULL,
        changed_at TEXT NOT NULL,
        FOREIGN KEY(incident_id) REFERENCES incidents(id)
      )
    `);
  });
}

module.exports = { db, init };
