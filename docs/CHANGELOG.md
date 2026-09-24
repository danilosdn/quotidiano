# Changelog — House V3 corrigida

## 2026-09-24 — hotfix de build e auditoria de produção

### Compilação

- renomeado o campo privado `HomeScene.renderer` para `HomeScene.houseRenderer`;
- atualizadas todas as referências do serviço específico da Casa;
- documentada a causa `TS2415`: colisão de visibilidade com membro público herdado de `Phaser.Scene`;
- adicionado `audit-scene-member-collisions.mjs`, protegendo 19 nomes herdados;
- adicionados testes estáticos de regressão para conflito e lifecycle.

### Lifecycle

- input de teclado e ponteiro usa callbacks nomeados;
- shutdown da cena remove os listeners registrados;
- handlers da UI são resetados;
- painéis/prompt são fechados;
- ponte global de debug é removida de forma segura;
- estado transitório é reinicializado;
- `HouseRenderer.shutdown()` destrói recursos de debug;
- removido risco de resposta telefônica com listener duplicado.

### Build reproduzível

- fixados Node `22.16.0` e npm `10.9.2` em `.nvmrc`, `.node-version`, `packageManager` e `engines`;
- mantidas versões exatas de Phaser/Vite/TypeScript/Vitest/Playwright;
- adicionado auditor de artefatos TypeScript;
- adicionado checker de typecheck somente leitura;
- `.gitignore` ampliado para configs emitidos e `*.tsbuildinfo`;
- adicionados relatórios de reprodução, lockfile, ambiente e paridade local/produção.

### Resultado real

- `npm run validate:local`: PASS;
- `npm run validate:artifacts`: PASS;
- `npm run build`: exit 2 porque as dependências não puderam ser instaladas;
- `package-lock.json` continua ausente e não foi fabricado.

## 2026-09-24 — implementação House V3 preservada

### Arquitetura e visual

- planta compacta e registro único de objetos;
- layout, renderer, colliders, controller, state service e validação separados;
- ações extraídas para seis módulos de cômodo;
- executor reutilizável de sequências;
- 54 objetos, 43 hotspots e 108 ações;
- 65 assets runtime, sem pack raw.

### Player, interação e idioma

- walk/idle corrigidos nas quatro direções;
- inventário físico e surfaces;
- save V2 e migração;
- 12 microcenários, 30 intenções, 95 variações e 60 diálogos;
- matcher, hints 0–4, input textual e TTS opcional integrados.

### Segurança remota

Nenhum commit, push, pull, merge, rebase, reset, pull request, deploy ou alteração remota foi realizado.
