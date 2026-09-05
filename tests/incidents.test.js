const request = require('supertest');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data.test.sqlite');
let app;

beforeAll(() => {
  process.env.DB_FILE = DB_PATH;
  if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
  const dadosIniciais = require('../src/dadosIniciais');
  dadosIniciais();
  app = require('../src/app');
});

// --- Incidents CRUD ---

test('GET /api/incidents returns array', async () => {
  const res = await request(app).get('/api/incidents');
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBeGreaterThan(0);
});

test('GET /api/incidents filters by status', async () => {
  const res = await request(app).get('/api/incidents?status=Open');
  expect(res.status).toBe(200);
  res.body.forEach(i => expect(i.status).toBe('Open'));
});

test('GET /api/incidents filters by severity', async () => {
  const res = await request(app).get('/api/incidents?severity=Critical');
  expect(res.status).toBe(200);
  res.body.forEach(i => expect(i.severity).toBe('Critical'));
});

test('POST /api/incidents creates incident', async () => {
  const res = await request(app).post('/api/incidents').send({
    title: 'Test incident',
    description: 'Test description',
    severity: 'Low',
    owner: 'Tester',
  });
  expect(res.status).toBe(201);
  expect(res.body.id).toBeDefined();
  expect(res.body.status).toBe('Open');
});

test('POST /api/incidents rejects missing fields', async () => {
  const res = await request(app).post('/api/incidents').send({ title: 'No owner' });
  expect(res.status).toBe(400);
});

test('POST /api/incidents rejects invalid severity', async () => {
  const res = await request(app).post('/api/incidents').send({
    title: 'Bad severity',
    description: 'desc',
    severity: 'Extreme',
    owner: 'X',
  });
  expect(res.status).toBe(400);
});

test('GET /api/incidents/:id returns incident with history and comments', async () => {
  const list = await request(app).get('/api/incidents');
  const res = await request(app).get(`/api/incidents/${list.body[0].id}`);
  expect(res.status).toBe(200);
  expect(res.body.history).toBeDefined();
  expect(res.body.comments).toBeDefined();
});

test('GET /api/incidents/:id returns 404 for unknown id', async () => {
  const res = await request(app).get('/api/incidents/999999');
  expect(res.status).toBe(404);
});

// --- Status ---

test('PATCH status updates successfully', async () => {
  const list = await request(app).get('/api/incidents?status=Open');
  const open = list.body.find(i => i.severity !== 'Critical');
  const res = await request(app).patch(`/api/incidents/${open.id}/status`).send({ status: 'In Progress' });
  expect(res.status).toBe(200);
  expect(res.body.new_status).toBe('In Progress');
});

test('PATCH status rejects invalid status', async () => {
  const list = await request(app).get('/api/incidents');
  const res = await request(app).patch(`/api/incidents/${list.body[0].id}/status`).send({ status: 'Broken' });
  expect(res.status).toBe(400);
});

test('Critical Open -> Resolved is blocked', async () => {
  const list = await request(app).get('/api/incidents');
  const critical = list.body.find(i => i.severity === 'Critical' && i.status === 'Open');
  expect(critical).toBeDefined();
  const res = await request(app).patch(`/api/incidents/${critical.id}/status`).send({ status: 'Resolved' });
  expect(res.status).toBe(400);
  expect(res.body.error).toMatch(/must go through In Progress/);
});

test('Critical Open -> In Progress -> Resolved works', async () => {
  const list = await request(app).get('/api/incidents');
  const critical = list.body.find(i => i.severity === 'Critical' && i.status === 'Open');
  const r1 = await request(app).patch(`/api/incidents/${critical.id}/status`).send({ status: 'In Progress' });
  expect(r1.status).toBe(200);
  const r2 = await request(app).patch(`/api/incidents/${critical.id}/status`).send({ status: 'Resolved' });
  expect(r2.status).toBe(200);
});

// --- Comments ---

test('adding a comment works', async () => {
  const list = await request(app).get('/api/incidents');
  const res = await request(app)
    .post(`/api/incidents/${list.body[0].id}/comments`)
    .send({ author: 'Ana', content: 'Provider contacted.' });
  expect(res.status).toBe(201);
  expect(res.body.author).toBe('Ana');
  expect(res.body.content).toBe('Provider contacted.');
});

test('empty comment content is rejected', async () => {
  const list = await request(app).get('/api/incidents');
  const res = await request(app)
    .post(`/api/incidents/${list.body[0].id}/comments`)
    .send({ author: 'Ana', content: '   ' });
  expect(res.status).toBe(400);
  expect(res.body.error).toMatch(/required/);
});

test('missing author is rejected', async () => {
  const list = await request(app).get('/api/incidents');
  const res = await request(app)
    .post(`/api/incidents/${list.body[0].id}/comments`)
    .send({ content: 'No author here' });
  expect(res.status).toBe(400);
});

test('comment appears in incident detail', async () => {
  const list = await request(app).get('/api/incidents');
  const id = list.body[0].id;
  await request(app).post(`/api/incidents/${id}/comments`).send({ author: 'Bruno', content: 'Escalated.' });
  const detail = await request(app).get(`/api/incidents/${id}`);
  expect(detail.body.comments.some(c => c.author === 'Bruno')).toBe(true);
});

test('comment on unknown incident returns 404', async () => {
  const res = await request(app)
    .post('/api/incidents/999999/comments')
    .send({ author: 'X', content: 'Ghost comment' });
  expect(res.status).toBe(404);
});

// --- Dashboard & last-updated ---

test('GET /api/dashboard returns counts', async () => {
  const res = await request(app).get('/api/dashboard');
  expect(res.status).toBe(200);
  expect(res.body.total).toBeGreaterThan(0);
  expect(res.body.open_count).toBeDefined();
  expect(res.body.in_progress_count).toBeDefined();
  expect(res.body.resolved_count).toBeDefined();
});

test('GET /api/last-updated returns a date', async () => {
  const res = await request(app).get('/api/last-updated');
  expect(res.status).toBe(200);
  expect(res.body.last_updated).toBeTruthy();
});
