---
name: ai-log-checkpoint
description: Keep AI_LOG.md entries in a strict checkpoint template for this hackathon project.
triggers:
  - update AI_LOG.md
  - write AI log
  - checkpoint log
  - commit checkpoint
  - rework AI_LOG
---

# AI Log Checkpoint Skill

Use this skill whenever the user asks to update `AI_LOG.md` or asks for checkpoint/commit tracking.

## Rules
- Read the current `AI_LOG.md` before editing.
- Preserve the existing checkpoint order and numbering unless the user explicitly asks to reorganize it.
- Write each checkpoint using the same template fields:
  - Objetivo
  - Contexto
  - Instrução
  - Resultado
  - Validação
  - Decisão
- Keep the entry concise, factual, and audit-friendly.
- If the user asks for commit checkpoints, represent them as explicit checkpoint sections.
- If a checkpoint was only suggested and not executed, say that clearly.
- If the user prefers manual commits, keep the log aligned to that workflow.
- After editing `AI_LOG.md`, update the task list if one is being maintained.

## Preferred checkpoint structure
- `Checkpoint N — title`
- `Objetivo:` one sentence
- `Contexto:` one or two bullets
- `Instrução:` the prompt or instruction used
- `Resultado:` what changed
- `Validação:` how it was checked
- `Decisão:` next action

## Style
- Use plain Portuguese.
- Avoid long explanations.
- Avoid changing unrelated sections.
- Keep the log consistent with the rest of the repository documentation.
