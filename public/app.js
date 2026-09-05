async function fetchJSON(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'unknown' }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

const statusEl = document.getElementById('message');
const dashboardEl = document.getElementById('dashboard');
const listEl = document.getElementById('list');
const detailEl = document.getElementById('detail');
const listSummaryEl = document.getElementById('listSummary');
const listCountEl = document.getElementById('listCount');
const filterStatusEl = document.getElementById('filterStatus');
const filterSeverityEl = document.getElementById('filterSeverity');

let messageTimer = null;

function setMessage(text = '', type = '') {
  clearTimeout(messageTimer);
  if (!text) {
    statusEl.className = 'message';
    statusEl.textContent = '';
    return;
  }
  statusEl.className = `message ${type}`;
  statusEl.textContent = text;
  if (type === 'success' || type === 'info') {
    messageTimer = setTimeout(() => setMessage(), 4000);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function severityClass(severity) {
  if (severity === 'Critical') return 'sev-critical';
  if (severity === 'High') return 'sev-high';
  if (severity === 'Medium') return 'sev-medium';
  if (severity === 'Low') return 'sev-low';
  return '';
}

function statusClass(status) {
  if (status === 'Resolved') return 'ok';
  if (status === 'In Progress') return 'warn';
  if (status === 'Open') return 'open';
  return '';
}

function formatDateTime(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

const lastUpdatedBadgeEl = document.getElementById('lastUpdatedBadge');

function timeAgo(isoString) {
  if (!isoString) return 'Banco atualizado';
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (isNaN(diff) || diff < 0) return 'Banco atualizado há um tempinho';
  if (diff < 60) return `Banco atualizado há ${diff}s`;
  if (diff < 3600) return `Banco atualizado há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Banco atualizado há ${Math.floor(diff / 3600)}h`;
  return `Banco atualizado há ${Math.floor(diff / 86400)} dia(s)`;
}

async function loadLastUpdated() {
  try {
    const { last_updated } = await fetchJSON('/api/last-updated');
    lastUpdatedBadgeEl.textContent = timeAgo(last_updated);
  } catch {
    lastUpdatedBadgeEl.textContent = 'Banco atualizado';
  }
}

const detailMessageEl = document.getElementById('detailMessage');

let detailMessageTimer = null;

function setDetailMessage(text = '', type = '') {
  clearTimeout(detailMessageTimer);
  if (!text) {
    detailMessageEl.className = 'message';
    detailMessageEl.textContent = '';
    return;
  }
  detailMessageEl.className = `message ${type}`;
  detailMessageEl.textContent = text;
  if (type === 'success' || type === 'info') {
    detailMessageTimer = setTimeout(() => setDetailMessage(), 4000);
  }
}

function setLoading(el, text = 'Carregando...') {
  el.innerHTML = `<div class="detail-empty">${text}</div>`;
}

async function loadDashboard() {
  try {
    const d = await fetchJSON('/api/dashboard');
    const c = d.critical_by_status || {};
    const criticalTag = (status) => {
      if (!c[status]) return '';
      const label = 'Critical';
      return `<div class="tree-node critical" style="margin-top:8px"><span class="tv">${c[status]}</span> ${label}</div>`;
    };
    dashboardEl.innerHTML = `
      <div class="tree">
        <div class="tree-root"><span class="tv">${d.total}</span> incidentes no total</div>
        <div class="tree-children">
          <div class="tree-branch">
            <div class="tree-node open"><span class="tv">${d.open_count}</span> Open</div>
            ${criticalTag('Open')}
          </div>
          <div class="tree-branch">
            <div class="tree-node progress"><span class="tv">${d.in_progress_count}</span> In Progress</div>
            ${criticalTag('In Progress')}
          </div>
          <div class="tree-branch">
            <div class="tree-node resolved"><span class="tv">${d.resolved_count}</span> Resolved</div>
            ${criticalTag('Resolved')}
          </div>
        </div>
      </div>
    `;
  } catch (e) {
    dashboardEl.innerHTML = `<div class="metric"><span class="label" style="color:var(--danger)">Erro ao carregar métricas</span></div>`;
  }
}

async function loadList() {
  const status = filterStatusEl.value;
  const severity = filterSeverityEl.value;
  const q = new URLSearchParams();
  if (status) q.set('status', status);
  if (severity) q.set('severity', severity);

  listSummaryEl.textContent = 'Carregando...';
  listCountEl.textContent = '';
  setLoading(listEl, 'Buscando incidentes...');

  try {
    const items = await fetchJSON('/api/incidents?' + q.toString());

    const parts = [];
    if (status) parts.push(`status ${status}`);
    if (severity) parts.push(`severidade ${severity}`);
    listSummaryEl.textContent = parts.length ? `Filtro: ${parts.join(' | ')}` : 'Todos os incidentes';
    listCountEl.textContent = `${items.length} item(ns)`;

    listEl.innerHTML = '';

    if (!items.length) {
      listEl.innerHTML = '<div class="detail-empty">Nenhum incidente encontrado com esse filtro.</div>';
      return;
    }

    items.forEach((incident) => {
      const el = document.createElement('article');
      el.className = 'inc';
      el.innerHTML = `
        <div class="inc-head">
          <div>
            <p class="inc-title">${escapeHtml(incident.title)}${incident.comment_count > 0 ? ` <span style="font-size:.8rem;font-weight:400;color:#6b7280">${incident.comment_count} comment${incident.comment_count > 1 ? 's' : ''}</span>` : ''}</p>
            <div class="inc-meta">
              <span class="badge ${severityClass(incident.severity)}">${escapeHtml(incident.severity)}</span>
              <span class="badge ${statusClass(incident.status)}">${escapeHtml(incident.status)}</span>
              <span>${escapeHtml(incident.owner)}</span>

            </div>
          </div>
          <div class="stack">
            <button class="secondary" type="button">Detalhes</button>
          </div>
        </div>
      `;
      el.querySelector('button').addEventListener('click', () => {
        document.querySelectorAll('.inc').forEach(i => i.classList.remove('selected'));
        el.classList.add('selected');
        loadDetail(incident.id);
      });
      listEl.appendChild(el);
    });
  } catch (e) {
    listSummaryEl.textContent = 'Erro ao carregar';
    listEl.innerHTML = `<div class="detail-empty" style="border-color:#ffd0d0;color:var(--danger)">Erro: ${escapeHtml(e.message)}</div>`;
  }
}

async function refreshList() {
  await Promise.all([loadList(), loadDashboard(), loadLastUpdated()]);
}

async function loadDetail(id) {
  setLoading(detailEl, 'Carregando detalhes...');
  try {
    const incident = await fetchJSON('/api/incidents/' + id);
    const statusColors = {
      'Open': 'border-width:2px;font-weight:700;border-color:#93b4f5;background:#f0f5ff;color:#153fa9',
      'In Progress': 'border-width:2px;font-weight:700;border-color:#fcd38a;background:#fffbf0;color:#b45309',
      'Resolved': 'border-width:2px;font-weight:700;border-color:#86efcf;background:#f0fdf8;color:#0f766e',
    };
    const selStyle = statusColors[incident.status] || 'border-width:2px;font-weight:700';

    const events = [
      ...(incident.history || []).map(h => ({ type: 'status', time: h.changed_at, data: h })),
      ...(incident.comments || []).map(c => ({ type: 'comment', time: c.created_at, data: c }))
    ].sort((a, b) => a.time.localeCompare(b.time));

    const timelineHtml = events.length
      ? events.map(ev => ev.type === 'status'
          ? `<div class="history-item"><strong>Status changed: ${escapeHtml(ev.data.previous_status)} &rarr; ${escapeHtml(ev.data.new_status)}</strong><span>${formatDateTime(ev.time)}</span></div>`
          : `<div class="history-item" style="border-left-color:#93b4f5"><strong>${escapeHtml(ev.data.author)} commented:</strong> &ldquo;${escapeHtml(ev.data.content)}&rdquo;<span>${formatDateTime(ev.time)}</span></div>`
        ).join('')
      : '<div class="detail-empty">Nenhuma atividade ainda.</div>';

    detailEl.innerHTML = `
      <div class="detail-header">
        <div>
          <h3 class="detail-title">${escapeHtml(incident.title)}</h3>
          <div class="inc-meta" style="margin-top:10px">
            <span class="badge ${severityClass(incident.severity)}">${escapeHtml(incident.severity)}</span>
            <span class="badge ${statusClass(incident.status)}">${escapeHtml(incident.status)}</span>
            <span>${escapeHtml(incident.owner)}</span>
          </div>
        </div>
      </div>

      <div class="detail-grid">
        <div class="detail-box" style="grid-column:1/-1"><span class="k">Descri&ccedil;&atilde;o</span><span class="v">${escapeHtml(incident.description)}</span></div>
        <div class="detail-box"><span class="k">Criado em</span><span class="v">${formatDateTime(incident.created_at)}</span></div>
        <div class="detail-box"><span class="k">Atualizado em</span><span class="v">${formatDateTime(incident.updated_at)}</span></div>
      </div>

      <div class="stack">
        <label style="min-width:220px">Alterar status
          <select id="statusSelector" style="${selStyle}">
            ${['Open', 'In Progress', 'Resolved'].map((s) => `<option value="${s}" ${s === incident.status ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </label>
      </div>

      <div class="history">
        <h4 id="timelineToggle" style="margin:18px 0 8px;cursor:pointer;user-select:none">Timeline <span id="timelineChevron">${events.length > 3 ? '▶' : '▼'}</span> <span style="font-size:.8rem;font-weight:400;color:#6b7280">${events.length} evento(s)</span></h4>
        <div id="timelineBody" style="display:${events.length > 3 ? 'none' : 'block'}">${timelineHtml}</div>
      </div>

      <div style="margin-top:18px">
        <h4 style="margin:0 0 8px">Adicionar coment&aacute;rio</h4>
        <label style="font-size:.95rem;font-weight:600;display:block">Autor<input id="commentAuthor" placeholder="Seu nome" /></label>
        <label style="font-size:.95rem;font-weight:600;display:block;margin-top:8px">Coment&aacute;rio<textarea id="commentContent" style="min-height:70px" placeholder="Descreva a atualiza&ccedil;&atilde;o..."></textarea></label>
        <div class="button-row">
          <button id="submitComment" class="primary" type="button">Comentar</button>
        </div>
      </div>
    `;

    document.getElementById('timelineToggle').addEventListener('click', () => {
      const body = document.getElementById('timelineBody');
      const chevron = document.getElementById('timelineChevron');
      const open = body.style.display !== 'none';
      body.style.display = open ? 'none' : 'block';
      chevron.textContent = open ? '▶' : '▼';
    });

    document.getElementById('statusSelector').addEventListener('change', async (e) => {
      const sel = e.target;
      const newStatus = sel.value;
      sel.disabled = true;
      try {
        await fetchJSON('/api/incidents/' + id + '/status', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
        setDetailMessage('Status atualizado com sucesso.', 'success');
        await loadDetail(id);
        await refreshList();
      } catch (e) {
        setDetailMessage(`Erro ao alterar status: ${e.message}`, 'error');
        sel.disabled = false;
      }
    });

    document.getElementById('submitComment').addEventListener('click', async () => {
      const btn = document.getElementById('submitComment');
      const author = document.getElementById('commentAuthor').value.trim();
      const content = document.getElementById('commentContent').value.trim();
      if (!author || !content) {
        setDetailMessage('Autor e comentário são obrigatórios.', 'error');
        return;
      }
      btn.disabled = true;
      btn.textContent = 'Enviando...';
      try {
        await fetchJSON('/api/incidents/' + id + '/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ author, content }),
        });
        setDetailMessage('Comentário adicionado.', 'success');
        await Promise.all([loadDetail(id), refreshList()]);
      } catch (e) {
        setDetailMessage(`Erro ao comentar: ${e.message}`, 'error');
        btn.disabled = false;
        btn.textContent = 'Comentar';
      }
    });
  } catch (e) {
    detailEl.innerHTML = `<div class="detail-empty" style="border-color:#ffd0d0;color:var(--danger)">Erro ao carregar detalhes: ${escapeHtml(e.message)}</div>`;
  }
}

document.getElementById('createForm').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const f = ev.target;
  const btn = f.querySelector('button[type="submit"]');
  const data = {
    title: f.title.value,
    description: f.description.value,
    severity: f.severity.value,
    owner: f.owner.value,
  };
  btn.disabled = true;
  btn.textContent = 'Criando...';
  try {
    await fetchJSON('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    f.reset();
    setMessage('Incidente criado com sucesso.', 'success');
    await refreshList();
  } catch (e) {
    setMessage(`Erro ao criar incidente: ${e.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Criar incidente';
  }
});

document.getElementById('refresh').addEventListener('click', () => {
  filterStatusEl.value = '';
  filterSeverityEl.value = '';
  refreshList();
});
document.getElementById('filterStatus').addEventListener('change', refreshList);
document.getElementById('filterSeverity').addEventListener('change', refreshList);

loadList();
loadDashboard();
loadLastUpdated();

setInterval(loadLastUpdated, 60000);
