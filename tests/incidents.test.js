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

test('Critical Open -> Resolved is rejected', async () => {
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
