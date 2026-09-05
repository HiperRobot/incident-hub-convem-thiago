# Incident Hub — Hackathon Convem

Incident Hub — web app simples para registrar e acompanhar incidentes operacionais (Hackathon Convem).

Quick start

```bash
npm install
npm run dadosIniciais
npm start
```

Lista os dados atuais no banco de dados:

```bash
npm run listarDados
```

Run tests

```bash
npm test
```

Notes
- Dados iniciais criam `data.sqlite` na raiz do projeto.
- `npm run listarDados` mostra todos os incidentes e o histórico de status atualmente salvos no banco de dados.
- API: `GET /api/incidents`, `POST /api/incidents`, `GET /api/incidents/:id`, `PATCH /api/incidents/:id/status`.