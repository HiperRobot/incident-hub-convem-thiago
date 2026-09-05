# FINAL_REPORT.md

## 1. O que foi entregue?

- Criação de incidentes com campos obrigatórios (título, descrição, severidade, responsável)
- Listagem de incidentes com filtro por status e severidade
- Detalhe do incidente com todos os campos exigidos
- Alteração de status com salvamento automático ao selecionar
- Regra de negócio: incidente Critical não pode ir diretamente de Open para Resolved
- Histórico persistido de alterações de status por incidente
- Dashboard com contagem de incidentes por status e Critical não resolvidos, em formato de árvore visual
- Badge dinâmico mostrando há quanto tempo o banco foi atualizado
- Escala de cores por severidade (cinza → laranja → vermelho) e por status (azul/amarelo/verde)
- Dados iniciais com os 3 incidentes exigidos via `npm run dadosIniciais`
- Testes automatizados cobrindo a regra crítica (Critical Open → Resolved bloqueado; Open → In Progress → Resolved permitido)
- Persistência em SQLite local
- README com instruções completas de execução

## 2. O que não foi entregue?

- Visualização kanban com drag and drop (descartado por risco de tempo)
- Dockerfile para reprodução de ambiente
- Testes cobrindo fluxos além da regra Critical (criação, listagem, filtros)

## 3. O que foi deliberadamente decidido não fazer?

- **Autenticação e permissões**: fora de escopo conforme enunciado
- **Kanban com drag and drop**: avaliado como arriscado para o tempo disponível; a interface de lista com filtros e detalhe cobre o mesmo objetivo de forma mais confiável
- **Deploy público**: não solicitado; execução local é suficiente para avaliação
- **Testes de frontend**: a cobertura foi focada nas regras de negócio do backend, que são o ponto crítico da avaliação

## 4. Quais foram as três principais decisões técnicas?

1. **Node.js + Express + SQLite**: stack leve, sem necessidade de servidor de banco externo, fácil de executar localmente pelo avaliador com apenas `npm install && npm start`. Velocidade de iteração foi o critério principal.

2. **Frontend em HTML + JS puro sem framework**: elimina etapa de build, o avaliador abre direto no browser sem configuração adicional. A complexidade da UI não justificava React ou similar.

3. **Testes com Jest + supertest em banco isolado**: usar `data.test.sqlite` separado do `data.sqlite` de desenvolvimento garante que os testes não corrompem os dados e podem rodar em qualquer ordem sem efeitos colaterais.

## 5. Qual foi o maior erro produzido pela IA durante o desenvolvimento?

A função `setLoading` perdeu sua declaração durante uma edição incremental do `app.js`. O corpo da função ficou solto no arquivo sem o `function setLoading(el, text)`, causando erro de sintaxe que impedia o JavaScript inteiro de executar — derrubando silenciosamente todas as funcionalidades da página, incluindo as métricas do dashboard.

## 6. Como você identificou esse erro?

O usuário percebeu que as estatísticas de quantidade de incidentes sumiram da interface após uma edição. Ao inspecionar o arquivo `app.js`, a declaração da função estava ausente — apenas o corpo estava presente como código solto.

## 7. Como você corrigiu e validou a correção?

A declaração `function setLoading(el, text = 'Carregando...')` foi restaurada antes do corpo da função. A validação foi feita recarregando a página e confirmando que as métricas voltaram a aparecer corretamente.

## 8. Houve alguma regressão?

Sim. Durante a adição do badge dinâmico de "Banco atualizado", o template string da função `loadDetail` ficou malformado após uma edição incremental — código JavaScript foi inserido dentro de uma template string HTML. A regressão foi identificada ao abrir o detalhe de um incidente e a seção não renderizar. Corrigido reescrevendo a função inteira de uma vez.

## 9. Em qual parte houve mais retrabalho?

No badge de "Banco atualizado há X min". Foram necessárias várias iterações:
- Endpoint retornava 404 até o servidor ser reiniciado
- `timeAgo` retornava `NaN dia(s)` por causa de uma regex de normalização de data que corrompeu uma string ISO já válida
- O texto inicial ficava preso em "Carregando..." antes de qualquer resposta da API

Cada problema exigiu debug manual no console do browser para identificar a causa raiz.

## 10. Cite uma situação em que você rejeitou ou alterou uma abordagem sugerida pela IA.

A IA sugeriu manter o botão "Salvar status" no detalhe do incidente. O usuário decidiu substituir por salvamento automático ao mudar o select — eliminando um clique desnecessário. A abordagem foi testada e mantida por ser mais fluida, com o select colorido por status servindo como indicador visual substituto ao botão.

## 11. Qual parte da aplicação você considera menos confiável?

O badge de "Banco atualizado há X min". Ele depende de comparação entre o horário do cliente e o timestamp do servidor, o que pode gerar valores incorretos se houver diferença de fuso horário entre os ambientes. Além disso, o intervalo de atualização automática é de 60 segundos, então o valor pode estar defasado.

## 12. Se tivesse mais duas horas, quais seriam suas três prioridades?

1. Visualização kanban com drag and drop para mover incidentes entre status de forma mais intuitiva
2. Testes adicionais cobrindo criação, listagem e filtros
3. Dockerfile para garantir reprodução exata do ambiente pelo avaliador

## 13. Como você avalia sua estratégia inicial?

A estratégia foi acertada: priorizar backend funcional e regras de negócio antes de qualquer polimento visual, usar commits como checkpoints auditáveis e manter o AI_LOG atualizado a cada etapa. O que mudaria: reservar um bloco de tempo fixo para testes adicionais antes de partir para melhorias de UI, evitando chegar no final com cobertura de testes limitada.

## 14. Aproximadamente quantas interações relevantes com IA foram necessárias?

Aproximadamente 60 interações relevantes distribuídas entre os 3 checkpoints — sendo o checkpoint 3 (UI) o mais iterativo, especialmente na definição da escala de cores e no debug do badge dinâmico.

## 15. Quais ferramentas de IA foram utilizadas?

- **Claude**  — para ter ideias e tirar duvidas sobre a implementação, mas não tinha acesso direto aos arquivos do projeto

- **GitHub Copilot Chat** — utilizado no checkpoint 1 e 2 para scaffold inicial (mas expirou o limite de creditos gratuitos antes de terminar o checkpoint 3)

- **Amazon Q Developer** (via plugin no VS Code) — utilizado do checkpoint 2 em diante para geração de código, correções e edições de arquivo diretamente no workspace

- Houve necessidade de trocar de ferramenta; Amazon Q passou a ser a principal por ter acesso direto aos arquivos do projeto via ferramentas de leitura e escrita da mesma forma que o GitHubCopilot Chat, mas eu tinha mais creditos gratuitos disponíveis no Amazon Q Developer.
