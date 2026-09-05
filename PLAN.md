## Entendimento:

- Aplicação web para registrar e acompanhar incidentes operacionais de forma mais eficiente do que por mensagens.

## Escopo

### Obrigatório
- CRUD de incidentes (criar, listar, filtrar, ver detalhe).
- Campos mínimos: id, título, descrição, severidade (Low/Medium/High/Critical), responsável, status (Open/In Progress/Resolved), created_at, updated_at.
- Persistência local (SQLite arquivo) e dados iniciais com os 3 incidentes exigidos.
- Histórico persistido de alterações de status (previous, new, timestamp).
- Regra de negócio: incidente Critical não pode ir diretamente de Open → Resolved; bloqueio com feedback claro.
- Dashboard com contagens: abertos, Critical não resolvidos, resolvidos.
- Testes automatizados para regra(s) críticas.
- Documentação mínima: README.md, START.md, AI_LOG.md, FINAL_REPORT.md.

### Desejável
- Validações de formulário no frontend.
- Tests adicionais cobrindo fluxos usuais.
- Pequeno polimento da UI para usabilidade.
- Dockerfile para reprodução de ambiente (se houver tempo).

### Fora de escopo
- Autenticação/autorizações.
- Multi-tenant ou organizações.
- Deploy público (opcional).


## Decisões técnicas

### Stack:

- Backend em `Node.js + Express`.
- Frontend com `HTML + fetch` e JavaScript.
- Banco local com `SQLite` em arquivo (`data.sqlite`).
- Testes com `Jest + supertest`.

### Persistência:
Utiliza `SQLite` para armazenamento local dos dados dos incidentes e do histórico de alterações.

### Estrutura geral da solução:
 `src/` (server, api, db, dadosIniciais), `public/` (frontend), `tests/` (Jest + supertest), `package.json` (scripts: `dadosIniciais`, `start`, `test`).

### Estratégia de testes:
Usa `Jest` e `supertest` para testes de integração das rotas críticas, principalmente a regra `Critical`.

### Motivo das escolhas:
Velocidade de iteração, facilidade de execução local pelo avaliador e menos atrito de dependências.

## Decomposição

1. Criar scaffold do projeto (package.json, estrutura de pastas, DB init, dados iniciais).
2. Implementar API REST (list, create, get, patch status, dashboard).
3. Implementar persistência e tabela de histórico.
4. Implementar validações e a regra de negócio Critical.
5. Criar frontend simples (listar, filtrar, criar, detalhe, alterar status, dashboard).
6. Escrever testes Jest para regra crítica e fluxo principal.
7. Documentação: README, AI_LOG, FINAL_REPORT.
8. Testes finais, ajustes e preparação do vídeo de demonstração.

## Critérios de aceite

- `npm install` e `npm start` iniciam a aplicação localmente.
- `npm run dadosIniciais` cria `data.sqlite` com os 3 incidentes exigidos como dados iniciais.
- Interface permite criar, listar, filtrar, ver detalhe, mudar status e visualizar histórico. (adicionar questao da persistencia)
- Regra dos incidentes Critical funcionando e coberta por teste automatizado que passa (`npm test`)
- Dashboard mostra contagens corretas.
- README contém instruções claras para executar e testar a aplicação.


## Riscos

- A IA pode gerar código com pequenos erros de integração (ex.: paths, async).
- Falta de tempo para polir UI ou cobrir testes adicionais.
- Dependências do ambiente do avaliador (versões Node) podem causar discrepâncias.
- IA pode não compreender corretamente o que é solicitado, exigindo busca manual por erros, diversas iterações e refinamento de prompts até acertar de forma a aumentar o tempo necessário para entregar a solução.
- Os testes podem não ser suficientes para cobrir todos os fluxos e comportamentos do sistema.
- Alucinação da IA com erros ocultos.


## Estratégia de IA

- Utilizar IA (GitHub Copilot Chat / Claude / Amazon Q Developer) para gerar scaffolds, arquivos, codigos e correções pontuais.
- Fluxo iterativo: gerar → executar localmente → coletar logs/erros → pedir correções e aprimoramentos direcionados à IA.
- Registrar interações relevantes em `AI_LOG.md` com objetivo/contexto/instrução/resultado/validação/decisão.
- - Manter um histórico detalhado das interações com a IA para fins de auditoria e melhoria contínua em `AI_LOG.md`.
- Toda alteração de código é solicitada à IA em linguagem natural (regra do hackathon).
- Arquivos .md com alterações manuais para direcionar a IA no que ela deveria estar fazendo melhor.


## Prioridades:

1) checkpoint `START.md` com commit inicial (até 08:45)
2) `PLAN.md` + `AI_LOG.md` + scaffolding + dados iniciais
3) CRUD + persistência
4) regra Critical + testes
5) dashboard, docs, vídeo

- Deixar o fluxo principal funcionando: criar, listar, filtrar, ver detalhe e atualizar status dos incidentes.
- Garantir a regra mais importante do projeto: incidente Critical não pode ir direto de Open para Resolved.
- Manter histórico das mudanças no `AI_LOG.md` para rastreabilidade.
- Ter dados iniciais com os 3 incidentes pedidos e testes cobrindo o comportamento crítico.
- Entregar uma interface simples, clara e fácil de revisar.

