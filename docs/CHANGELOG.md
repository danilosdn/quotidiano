# Changelog — House V3 corrigida

## 2026-09-24

### Arquitetura

- introduzida pasta `src/game/house/` com layout, registro, renderer, colliders, controller, state service, validação e itens portáteis;
- extraídas ações para seis módulos de cômodo;
- introduzido executor reutilizável de sequências;
- `HomeScene` reduzida à orquestração do ciclo da cena.

### Visual/layout

- substituída grade de caixas por apartamento compacto;
- removidos labels de produção e chave-emoji;
- reorganizados quarto, banheiro, cozinha, sala, entrada e lavanderia;
- adicionados assets/estados necessários e debug F3;
- criadas prévias técnicas de layout e contatos de frames.

### Player

- corrigidos walk/idle laterais;
- centralizado mapa de frames;
- adicionadas poses/ações para sentar, deitar, telefone, leitura, uso e alimentação;
- persistida direção e restauração segura.

### Interações e estado

- implementadas 108 ações em 43 hotspots;
- objetos portáteis sincronizam sprite e hotspot ao mudar de superfície;
- mochila de oito slots e item único segurado;
- save V2, migração V1, preferências, snapshots e estados por cômodo;
- corrigidos sono duplicado, fechamento do telefone e colisão entre painéis.

### Idioma

- 12 microcenários, 30 intenções, 95 variações e 60 diálogos;
- matcher, hints 0–4, input textual, botões fallback e TTS NL integrados;
- telefone conectado a mensagens/agenda/contatos data-driven.

### Testes e documentação

- adicionados validadores offline de app, testes, topologia, assets e arquitetura;
- ampliados testes Vitest/Playwright preparados;
- corrigida a configuração de `npm run check/build` para evitar emissão acidental e separar app/configs/tests;
- centralizada a tipagem da ponte `QUOTIDIANO_DEBUG`;
- adicionados inspector de frames e documentação completa;
- nenhum commit, push, merge, PR ou deploy foi realizado nesta correção.
