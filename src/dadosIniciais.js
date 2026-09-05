const { db, init } = require('./db');

const DEFAULT_DADOS_INICIAIS = [
  {
    title: 'Payment API instability',
    description: 'Payment API is returning 500 intermittently',
    severity: 'Critical',
    owner: 'Ana',
    status: 'Open',
  },
  {
    title: 'Reconciliation delay',
    description: 'Batch reconciliation taking longer than expected',
    severity: 'High',
    owner: 'Bruno',
    status: 'In Progress',
  },
  {
    title: 'Incorrect customer notification',
    description: 'Customers receiving wrong notification templates',
    severity: 'Medium',
    owner: 'Carla',
    status: 'Resolved',
  },
];

function dadosIniciais(options = {}) {
  const { closeDb = false, clearExisting = true, dados = DEFAULT_DADOS_INICIAIS } = options;
  init();
  const now = new Date().toISOString();
  const records = Array.isArray(dados) && dados.length ? dados : DEFAULT_DADOS_INICIAIS;

  db.serialize(() => {
    if (clearExisting) {
      // clear (idempotent for development)
      db.run('DELETE FROM status_history');
      db.run('DELETE FROM incidents');
      db.run("DELETE FROM sqlite_sequence WHERE name IN ('incidents', 'status_history')");
    }

    const insert = db.prepare('INSERT INTO incidents (title, description, severity, owner, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?)');
    records.forEach((incident) => {
      const { title, description, severity, owner, status } = incident;
      insert.run(title, description, severity, owner, status, now, now);
    });
    insert.finalize(() => {
      db.all('SELECT id, title, severity, owner, status FROM incidents ORDER BY id', (err, rows) => {
        if (err) {
          console.error('Erro ao listar dados iniciais:', err.message);
        } else {
          console.log(`Dados iniciais carregados (${rows.length} registros):`);
          rows.forEach((row) => {
            console.log(`- #${row.id} ${row.title} | ${row.severity} | ${row.owner} | ${row.status}`);
          });
        }

        if (closeDb) {
          db.close();
        }
      });
    });
  });
}

module.exports = dadosIniciais;
module.exports.DEFAULT_DADOS_INICIAIS = DEFAULT_DADOS_INICIAIS;

if (require.main === module) {
  dadosIniciais({ closeDb: true });
}