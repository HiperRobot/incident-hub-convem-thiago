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