const express = require('express');
const cors = require('cors');
const { db, init } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

init();

const VALID_STATUSES = ['Open', 'In Progress', 'Resolved'];
const VALID_SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

// List incidents with optional filtering
app.get('/api/incidents', (req, res) => {
  const { status, severity } = req.query;
  let sql = 'SELECT * FROM incidents';
  const clauses = [];
  const params = [];
  if (status) {
    clauses.push('status = ?');
    params.push(status);
  }
  if (severity) {
    clauses.push('severity = ?');
    params.push(severity);
  }
  if (clauses.length) sql += ' WHERE ' + clauses.join(' AND ');
  sql += ' ORDER BY created_at DESC';

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create incident
app.post('/api/incidents', (req, res) => {
  const { title, description, severity, owner } = req.body;
  if (!title || !description || !severity || !owner) {
    return res.status(400).json({ error: 'title, description, severity and owner are required' });
  }
  if (!VALID_SEVERITIES.includes(severity)) {
    return res.status(400).json({ error: 'invalid severity' });
  }
  const now = new Date().toISOString();
  const status = 'Open';
  const sql = `INSERT INTO incidents (title, description, severity, owner, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?)`;
  db.run(sql, [title, description, severity, owner, status, now, now], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    const id = this.lastID;
    res.status(201).json({ id, title, description, severity, owner, status, created_at: now, updated_at: now });
  });
});

// Get incident details + history
app.get('/api/incidents/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM incidents WHERE id = ?', [id], (err, incident) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!incident) return res.status(404).json({ error: 'incident not found' });
    db.all('SELECT previous_status, new_status, changed_at FROM status_history WHERE incident_id = ? ORDER BY changed_at ASC', [id], (err2, history) => {
      if (err2) return res.status(500).json({ error: err2.message });
      incident.history = history;
      res.json(incident);
    });
  });
});

// Change status
app.patch('/api/incidents/:id/status', (req, res) => {
  const id = req.params.id;
  const { status: newStatus } = req.body;
  if (!VALID_STATUSES.includes(newStatus)) return res.status(400).json({ error: 'invalid status' });

  db.get('SELECT * FROM incidents WHERE id = ?', [id], (err, incident) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!incident) return res.status(404).json({ error: 'incident not found' });
    const prev = incident.status;

    // Business rule: Critical cannot go Open -> Resolved directly
    if (incident.severity === 'Critical' && prev === 'Open' && newStatus === 'Resolved') {
      return res.status(400).json({ error: 'Critical incidents must go through In Progress before Resolved' });
    }

    const now = new Date().toISOString();
    db.run('UPDATE incidents SET status = ?, updated_at = ? WHERE id = ?', [newStatus, now, id], function (uerr) {
      if (uerr) return res.status(500).json({ error: uerr.message });
      db.run('INSERT INTO status_history (incident_id, previous_status, new_status, changed_at) VALUES (?,?,?,?)', [id, prev, newStatus, now], function (herr) {
        if (herr) return res.status(500).json({ error: herr.message });
        res.json({ id: Number(id), previous_status: prev, new_status: newStatus, changed_at: now });
      });
    });
  });
});

// Dashboard counts
app.get('/api/dashboard', (req, res) => {
  const counts = {};
  db.serialize(() => {
    db.get('SELECT COUNT(*) AS open_count FROM incidents WHERE status = "Open"', (e1, r1) => {
      if (e1) return res.status(500).json({ error: e1.message });
      counts.open_count = r1.open_count;
      db.get("SELECT COUNT(*) AS critical_unresolved FROM incidents WHERE severity = 'Critical' AND status != 'Resolved'", (e2, r2) => {
        if (e2) return res.status(500).json({ error: e2.message });
        counts.critical_unresolved = r2.critical_unresolved;
        db.get("SELECT COUNT(*) AS resolved_count FROM incidents WHERE status = 'Resolved'", (e3, r3) => {
          if (e3) return res.status(500).json({ error: e3.message });
          counts.resolved_count = r3.resolved_count;
          res.json(counts);
        });
      });
    });
  });
});

module.exports = app;
