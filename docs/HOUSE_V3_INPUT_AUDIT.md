# House V3 — auditoria da entrada anexada

Data da auditoria: 2026-09-24 UTC.

## Alvo efetivamente modificado

O trabalho foi realizado sobre a extração local de `QUOTIDIANO_HOUSE_V3_CONTINUED.zip`. O ZIP de entrada continha **81 arquivos** e aproximadamente **300 KB** de conteúdo descompactado do projeto. Não havia `.git`, `node_modules`, `dist` nem `package-lock.json`.

A árvore recebida continha:

- `package.json` com Phaser 4.2.1 exato, Vite, TypeScript, Vitest e Playwright;
- `src/` com `BootScene`, `HomeScene`, `Player`, A*, inventário, save, estado e diálogo;
- `public/assets/runtime/` com protagonista, pisos, paredes e 24 objetos iniciais;
- `tests/unit/` e `tests/e2e/`;
- `docs/`, scripts de auditoria e ferramenta de assets;
- licença selecionada de Modern Interiors.

## Estado do código recebido confirmado no código-fonte

A implementação anexada tinha uma Casa funcional em conceito, mas ainda concentrava a maior parte da composição e das ações em `HomeScene.ts`. A planta era uma grade de seis grandes retângulos, os móveis eram posicionados diretamente na cena, os rótulos de cômodos eram desenhados no mapa, e a chave era representada por emoji. `IntentMatcher` e `HintSystem` existiam, mas a integração de runtime era parcial.

Sistemas preservados e evoluídos:

- Phaser/BootScene/HomeScene;
- movimento manual e click-to-move por A*;
- stuck detection;
- `InteractionRegistry`;
- inventário de oito slots;
- estados de itens;
- `SaveManager`, `GameClock`, `WorldState` e `PlayerState`;
- provider de diálogo scripted;
- café da manhã, lavanderia e telefone;
- testes existentes.

## Diferença local produzida

Comparação por SHA-256 entre a extração inicial e esta árvore:

- arquivos iniciais: **81**;
- arquivos atuais: **196**;
- arquivos adicionados: **115**;
- arquivos alterados: **29**;
- arquivos removidos: **0**;
- arquivos preservados byte a byte: **52**.

A lista completa está em `docs/_validation/logs/local-divergence.json`.

## Dependências e scripts

| Tipo | Pacote/versão |
| --- | --- |
| runtime | `phaser` 4.2.1 |
| desenvolvimento | `vite` 6.1.0 |
| desenvolvimento | `typescript` 5.7.3 |
| testes | `vitest` 3.0.5 |
| E2E | `@playwright/test` 1.50.1 |
| tipos | `@types/node` 22.10.10 |

Scripts convencionais: `dev`, `build`, `preview`, `check`, `test`, `test:e2e`. Scripts locais adicionados: `validate:local`, `validate:house`, `test:offline`, `validate:assets`, `validate:boundaries`, `check:app-offline`, `check:tests-offline` e `sprite-inspector`.

## Assets anexados

O pack `moderninteriors-win.zip` foi usado somente como fonte licenciada para selecionar os objetos necessários. O ZIP final contém apenas o subset runtime. Modern Exteriors e a adaptação RPG Maker foram referências anteriores e não entram no runtime da Casa.

## Problemas de entrada relevantes

1. ausência de `package-lock.json`;
2. ausência de dependências instaladas;
3. ausência de screenshots reais da baseline;
4. layout e interação espalhados entre cena, dados e posições mágicas;
5. frames laterais do protagonista invertidos;
6. save antigo sem snapshot seguro completo;
7. conteúdo linguístico insuficiente e parcialmente hardcoded;
8. inventário físico sem posição espacial uniforme ao trocar superfícies.

## Limite da auditoria

Documentação herdada foi tratada como pista, não como prova. O estado acima foi confirmado pela estrutura, pelo código e pelos assets da cópia local. O GitHub e o Netlify foram consultados somente para comparação; nenhuma informação pública sobrescreveu silenciosamente arquivos mais novos anexados.
