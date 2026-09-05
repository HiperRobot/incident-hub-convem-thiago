# AI Log

Ferramentas: GitHub Copilot Chat (gratuito), Claude (gratuito)

Interações relevantes
### 1) Checkpoint 1 — `START.md` (commit inicial)
- Objetivo: registrar formalmente o início do hackathon com o `START.md` contendo nome, data e ferramentas.
- Contexto: criação inicial do repositório e material mínimo exigido pelo hackathon.
- Instrução: gerar `START.md` com metadados do participante e instruções mínimas.
- Resultado: `START.md` criado e commit/push realizado pelo usuário.
- Validação: confirmação do usuário de que o push foi bem-sucedido.
- Decisão: seguir para geração do `PLAN.md`+ `AI_LOG.md` e scaffold do projeto; usar commits como checkpoints auditáveis.

### 2) Checkpoint 2 — `PLAN.md` + `AI_LOG.md` + scaffold
- Objetivo: registrar criação da primeira versão do PLAN.md e do AI_LOG.md (artefato auditável do hackathon).
- Contexto: scaffold inicial já gerado pela IA; usuário solicitou que checkpoints do `AI_LOG.md` fossem feitos por commit (um commit para o `START.md` isolado, e outro para `PLAN.md` + `AI_LOG.md` + arquivos iniciais gerados pela IA).
- Instrução: sugerir mensagem de commit e comandos para o usuário executar localmente; atualizar AI_LOG.md com a decisão tomada.
- Resultado: `AI_LOG.md` reescrito para refletir os checkpoints.

- Recomendação de mensagem de commit e comandos abaixo:
	```bash
	git add .
	git commit -m "Checkpoint 2: PLAN.md + AI_LOG.md + scaffold (v1)"
	git push
	```
- Validação: o usuário prefere commitar manualmente; o log documenta a instrução e o estado atual para auditoria.
- Decisão: manter o fluxo de commits manuais (pelo usuário) como checkpoints e continuar com a próxima etapa: rodar `npm install`, `npm run dadosIniciais`, `npm start` e `npm test` localmente; caso ocorram erros, o usuário colará os logs aqui para a IA iterar com patches.

### 3) Checkpoint 3 — Refatoração de UI e melhorias de UX
- Objetivo: melhorar a interface sem alterar a API nem a estrutura já definida — layout mais forte, interface mais intuitiva, interação mais fluida.
- Contexto: `index.html` e `app.js` existentes; backend e testes já validados nos checkpoints anteriores.
- Instrução: refatorar UI com cards, métricas, badges coloridos, tree view para dashboard, select de status com cores contextuais, botão "Ver todos" para resetar filtros, e highlight de card selecionado; manter compatibilidade com endpoints existentes.
- Resultado: interface completamente reformulada com novo layout em grid, dashboard em árvore, escala de cores por severidade (cinza → laranja → vermelho) e por status (azul/amarelo/verde), badge dinâmico de "Banco atualizado há X min" via endpoint `/api/last-updated`, select de status com cor contextual e salvamento automático ao mudar, botão "Ver todos" para resetar filtros, e highlight de card selecionado.
- Problemas encontrados e corrigidos:
  - Função `setLoading` perdeu a declaração durante uma edição e quebrou o JS inteiro — identificado pelo usuário ao notar que as métricas sumiram; corrigido restaurando a declaração.
  - Badge "Banco atualizado" ficava em "Carregando..." porque o endpoint retornava 404 — servidor precisava ser reiniciado para carregar o novo endpoint.
  - `timeAgo` retornava `NaN dia(s)` — regex de normalização de data corrompeu string ISO que já era válida; corrigido removendo a normalização desnecessária.
  - Template string do `loadDetail` ficou malformado após edição incremental — corrigido reescrevendo a função inteira de uma vez.
  - Cores de severidade Medium e Low se confundiam com In Progress — resolvido iterativamente com o usuário até chegar na escala cinza → laranja-claro → laranja → vermelho.
- Validação: usuário testou cada mudança no browser e confirmou visualmente; fetch manual no console confirmou o formato do payload de `/api/last-updated`.
- Decisão: commitar checkpoint 3 com todas as melhorias de UI consolidadas antes de partir para documentação final (`FINAL_REPORT.md`).

```bash
git add .
git commit -m "Checkpoint 3: UI refactor — dashboard tree, severity scale, dynamic badge, auto-save status"
git push
```