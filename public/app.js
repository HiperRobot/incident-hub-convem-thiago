async function fetchJSON(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const err = await res.json().catch(()=>({error:'unknown'}));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

async function loadDashboard(){
  const d = await fetchJSON('/api/dashboard');
  document.getElementById('dashboard').innerText = `Open: ${d.open_count} | Critical unresolved: ${d.critical_unresolved} | Resolved: ${d.resolved_count}`;
}

async function loadList(){
  const status = document.getElementById('filterStatus').value;
  const severity = document.getElementById('filterSeverity').value;
  const q = new URLSearchParams();
  if(status) q.set('status', status);
  if(severity) q.set('severity', severity);
  const items = await fetchJSON('/api/incidents?'+q.toString());
  const list = document.getElementById('list');
  list.innerHTML = '';
  items.forEach(i=>{
    const el = document.createElement('div'); el.className='inc';
    el.innerHTML = `<strong>${i.title}</strong> — ${i.severity} — ${i.owner} — ${i.status} <button data-id="${i.id}">Details</button>`;
    el.querySelector('button').addEventListener('click', ()=>loadDetail(i.id));
    list.appendChild(el);
  });
}

async function loadDetail(id){
  const d = await fetchJSON('/api/incidents/'+id);
  const container = document.getElementById('detail');
  container.innerHTML = `<h3>${d.title}</h3><p>${d.description}</p><p>Severity: ${d.severity} | Owner: ${d.owner} | Status: ${d.status}</p><p>Created: ${d.created_at} | Updated: ${d.updated_at}</p>`;
  const select = document.createElement('select'); ['Open','In Progress','Resolved'].forEach(s=>{const o=document.createElement('option');o.value=s;o.textContent=s; if(s===d.status) o.selected=true; select.appendChild(o)});
  const btn = document.createElement('button'); btn.textContent='Change Status';
  btn.addEventListener('click', async ()=>{
    try{
      const newStatus = select.value;
      await fetchJSON('/api/incidents/'+id+'/status', {method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status:newStatus})});
      alert('Status changed');
      await loadDetail(id); loadList(); loadDashboard();
    }catch(e){alert('Error: '+e.message)}
  });
  container.appendChild(select); container.appendChild(btn);
  // history
  if(d.history && d.history.length){
    const h = document.createElement('div'); h.innerHTML='<h4>History</h4>';
    d.history.forEach(it=>{ const p=document.createElement('div'); p.textContent=`${it.changed_at} — ${it.previous_status} → ${it.new_status}`; h.appendChild(p)});
    container.appendChild(h);
  }
}

document.getElementById('createForm').addEventListener('submit', async (ev)=>{
  ev.preventDefault();
  const f = ev.target;
  const data = { title: f.title.value, description: f.description.value, severity: f.severity.value, owner: f.owner.value };
  try{
    await fetchJSON('/api/incidents', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)});
    f.reset();
    await loadList(); loadDashboard();
  }catch(e){ alert('Error: '+e.message) }
});

document.getElementById('refresh').addEventListener('click', ()=>{ loadList(); loadDashboard(); });

loadList(); loadDashboard();
