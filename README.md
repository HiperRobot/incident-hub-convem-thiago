# Incident Hub — Hackathon Convem

Incident Hub — web app simples para registrar e acompanhar incidentes operacionais (Hackathon Convem).

## Pré-requisitos

- Node.js v18 ou superior
- npm v9 ou superior

## Instalação

```bash
npm install
```

## Execução

```bash
npm run dadosIniciais
npm start
```

Acesse em: http://localhost:3000

## Dados iniciais

Para popular o banco com os incidentes de exemplo:

```bash
npm run dadosIniciais
```

Para resetar os dados, delete o arquivo `data.sqlite` e rode o comando acima novamente:

```bash
del data.sqlite
npm run dadosIniciais
```

Para listar os dados atualmente salvos no banco:

```bash
npm run listarDados
```

## Testes

```bash
npm test
```

Os testes rodam em banco isolado (`data.test.sqlite`) e não afetam os dados de desenvolvimento.

## Arquitetura

```
src/
  app.js          — rotas Express (API REST)
  server.js       — entry point, inicia o servidor
  db.js           — conexão SQLite e criação das tabelas
  dadosIniciais.js — script para popular o banco com dados de exemplo
  listarDados.js  — script utilitário para inspecionar o banco
public/
  index.html      — interface web (HTML + CSS)
  app.js          — lógica do frontend (fetch, DOM)
tests/
  incidents.test.js — testes Jest + supertest das regras de negócio
data.sqlite       — banco de dados local (gerado em runtime)
```

**Stack:** Node.js + Express, SQLite (via sqlite3), HTML + JavaScript puro, Jest + supertest.

**API endpoints:**
- `GET /api/incidents` — lista incidentes (filtros: `?status=&severity=`)
- `POST /api/incidents` — cria incidente
- `GET /api/incidents/:id` — detalhe + histórico
- `PATCH /api/incidents/:id/status` — altera status
- `GET /api/dashboard` — contagens por status e severidade
- `GET /api/last-updated` — timestamp da última modificação

## Limitações conhecidas

- Sem autenticação — ambiente único compartilhado conforme escopo do desafio
- O badge "Banco atualizado há X min" depende de sincronismo entre o horário do cliente e do servidor; diferenças de fuso podem gerar valores incorretos
- IDs deletados não são reutilizados (comportamento padrão do SQLite com AUTOINCREMENT)
- Testes cobrem apenas a regra de negócio Critical; fluxos de criação e listagem não têm cobertura automatizada
