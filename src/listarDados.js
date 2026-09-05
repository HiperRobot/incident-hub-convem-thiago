const { db, init } = require('./db');

function printRows(title, rows, formatRow) {
  console.log(`\n${title} (${rows.length} registros):`);
  if (!rows.length) {
    console.log('- nenhum registro encontrado');
    return;
  }

  rows.forEach((row) => {
    console.log(`- ${formatRow(row)}`);
  });
}

function listarDados() {
  init();

  db.serialize(() => {
    db.all(
      'SELECT id, title, severity, owner, status, created_at, updated_at FROM incidents ORDER BY id ASC',
      (incidentErr, incidents) => {
        if (incidentErr) {
          console.error('Erro ao listar incidents:', incidentErr.message);
          db.close();
          return;
        }

        printRows('Dados Atuais de Incidentes no Banco de Dados', incidents, (row) => {
          return `#${row.id} ${row.title} | ${row.severity} | ${row.owner} | ${row.status}`;
        });

        db.all(
          'SELECT id, incident_id, previous_status, new_status, changed_at FROM status_history ORDER BY id ASC',
          (historyErr, historyRows) => {
            if (historyErr) {
              console.error('Erro ao listar status_history:', historyErr.message);
            } else {
              printRows('Historico de status', historyRows, (row) => {
                return `#${row.id} incident=${row.incident_id} ${row.previous_status} -> ${row.new_status} @ ${row.changed_at}`;
              });
            }

            db.close();
          }
        );
      }
    );
  });
}

if (require.main === module) {
  listarDados();
}

module.exports = listarDados;