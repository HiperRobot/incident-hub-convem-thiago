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

test('adding a comment to an incident works', async () => {
  const list = await request(app).get('/api/incidents');
  const incident = list.body[0];
  const res = await request(app)
    .post(`/api/incidents/${incident.id}/comments`)
    .send({ author: 'Ana', content: 'Provider contacted.' });
  expect(res.status).toBe(201);
  expect(res.body.author).toBe('Ana');
  expect(res.body.content).toBe('Provider contacted.');
});

test('empty comment is rejected', async () => {
  const list = await request(app).get('/api/incidents');
  const incident = list.body[0];
  const res = await request(app)
    .post(`/api/incidents/${incident.id}/comments`)
    .send({ author: 'Ana', content: '   ' });
  expect(res.status).toBe(400);
  expect(res.body.error).toMatch(/required/);
});

test('comment appears in incident timeline', async () => {
  const list = await request(app).get('/api/incidents');
  const incident = list.body[0];
  await request(app)
    .post(`/api/incidents/${incident.id}/comments`)
    .send({ author: 'Bruno', content: 'Escalated to team.' });
  const detail = await request(app).get(`/api/incidents/${incident.id}`);
  expect(detail.body.comments.length).toBeGreaterThan(0);
  expect(detail.body.comments.some(c => c.author === 'Bruno')).toBe(true);
});

, async () => {
  // Find a critical open incident
  const list = await request(app).get('/api/incidents');
  const critical = list.body.find(i=>i.severity==='Critical' && i.status==='Open');
  expect(critical).toBeDefined();
  const res = await request(app).patch(`/api/incidents/${critical.id}/status`).send({ status: 'Resolved' });
  expect(res.status).toBe(400);
  expect(res.body.error).toMatch(/must go through In Progress/);
});

test('Critical Open -> In Progress -> Resolved works', async () => {
  const list = await request(app).get('/api/incidents');
  const critical = list.body.find(i=>i.severity==='Critical' && i.status==='Open');
  const r1 = await request(app).patch(`/api/incidents/${critical.id}/status`).send({ status: 'In Progress' });
  expect(r1.status).toBe(200);
  const r2 = await request(app).patch(`/api/incidents/${critical.id}/status`).send({ status: 'Resolved' });
  expect(r2.status).toBe(200);
});
