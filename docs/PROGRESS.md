# QUOTIDIANO — progresso House V3 corrigida

## Entrada e segurança

- localizada e extraída a cópia anexada;
- confirmado que não havia `.git`, lockfile nem dependências locais;
- inventariados source, tests, docs e assets;
- GitHub/branch/commit e Netlify consultados somente como referência;
- nenhuma operação remota executada.

## Implementação concluída

- nova planta compacta e registro único de objetos;
- colliders/pathfinding derivados do layout;
- correção completa das quatro direções do protagonista;
- renderer/state service/controller/sequence runner separados;
- ações por quarto, banheiro, cozinha, sala, entrada e lavanderia;
- inventário físico e surfaces;
- save V2 e migração;
- telefone, hints, intents, TTS e conteúdo doméstico data-driven;
- subset runtime ampliado sem incluir pack raw;
- modo debug e inspector de frames;
- testes e validações offline.

## Validação atual

`npm run validate:local` passa: TypeScript do núcleo, checagens offline de app/tests, topologia 43/43, 9/9 testes offline, 65/65 assets e boundary validator.

## Pendente por ambiente

- gerar `package-lock.json` legitimamente;
- instalar dependências com `npm ci`;
- executar Phaser/Vite, Vitest e Playwright reais;
- produzir screenshots de gameplay e build/preview;
- fazer inspeção visual final no browser.

## Escopo preservado

Rua, Café e cidade não foram implementados. A porta externa permanece preparada, mas bloqueia transição nesta fase.
