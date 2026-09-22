# Validação — V1.1

Este documento separa explicitamente o que **foi executado** do que está apenas preparado.

## Executado e aprovado nesta sessão

| Verificação | Resultado |
|---|---|
| `npm run art` / regeneração dos assets V1.1 | PASS |
| Atlas protagonista: frames exigidos presentes | PASS — 56 frames, nenhum frame usado ausente |
| Atlas NPC: 4 personagens × 4 direções | PASS — 16 frames |
| Parse sintático de todo `.ts` (src/tests/config) com TypeScript global | PASS |
| Compilação estrita das camadas puras usadas nos testes offline | PASS |
| Todos os anchors de Home/Street/Cafe são `isWalkable` | PASS |
| Todos os anchors possuem rota desde o spawn da cena | PASS |
| Rota abaixo → atrás do banco contorna o blocker | PASS |
| Prioridade Lotte > banco em hotspot concorrente | PASS |
| Stuck detector: 2 replans e depois cancel | PASS |
| Inventário/intent/save serialization no runner offline | PASS |
| Dependências diretas de `package.json` e entradas diretas de `package-lock.json` coincidem | PASS |
| `node_modules` removido antes da tentativa de instalação | PASS |

A rota offline verificada ao redor do banco foi:

```text
(1200,400) → (1296,400) → (1296,272) → (1168,272) → (1160,270)
```

Nenhum ponto amostrado desse trajeto entra no collider expandido.

## Comandos obrigatórios realmente tentados

### `npm ci`

**FALHOU (exit 1).** O ambiente não possui saída para `registry.npmjs.org`. O log final registrou `getaddrinfo EAI_AGAIN` ao buscar `playwright`. Como o registry não ficou acessível, não foi possível instalar a árvore npm nem regenerar/verificar completamente a resolução transitiva do lockfile.

### `npm run check`

**FALHOU (exit 2)** porque `node_modules` não existe após a falha de `npm ci`:

```text
TS2688: Cannot find type definition file for 'vite/client'.
TS2688: Cannot find type definition file for 'vitest/globals'.
```

O parse sintático completo e a compilação das camadas puras foram executados separadamente e passaram, mas isso **não substitui** o check com os tipos reais instalados.

### `npm test`

**FALHOU (exit 127)**: `vitest: not found`.

### `npm run test:e2e`

**FALHOU (exit 1)** antes de abrir o jogo: sem o pacote Node de Playwright, o shell encontrou uma CLI Python homônima, que respondeu `unknown command 'test'`.

### `npm run build`

**FALHOU (exit 127)**: `vite: not found`.

Os outputs completos estão em `docs/validation-logs/`.

## Testes V1.1 preparados em Vitest

- anchors obrigatórios existem;
- **todos** os anchors registrados nos dados são caminháveis e alcançáveis desde o spawn;
- A* contorna o banco sem atravessar collider;
- prioridade de interação favorece NPC sobre prop secundário;
- stuck detector replana e cancela;
- navegação base não corta blocker;
- intenção, inventário e save.

## Testes de navegador preparados em Playwright

`tests/e2e/vertical-slice.spec.ts` cobre explicitamente:

1. Casa → Rua → Casa → Rua repetido 5 vezes;
2. prompt/interaction `house` diante da porta;
3. Rua → Pieter;
4. Rua → Lotte e screenshot durante conversa;
5. Rua → Pip;
6. Rua → banco;
7. click-to-move de um lado para o outro do banco;
8. tentativa de destino no banco sem ficar em `PLAYER_AUTOWALK`;
9. Rua → Café;
10. pedido/coleta de bebida;
11. Café → Rua;
12. Rua → Casa.

## Screenshots exigidos

O teste E2E está configurado para gravar:

- `screenshots/home_v11.png`
- `screenshots/street_v11.png`
- `screenshots/cafe_v11.png`
- `screenshots/lotte_interaction.png`
- `screenshots/house_entry.png`

Eles **não foram gerados nesta sessão**, porque não foi possível instalar Vite/Phaser/Playwright e iniciar o jogo real. Nenhum preview está sendo renomeado ou apresentado como screenshot do runtime.

## Lockfile

As versões/dependências diretas do `package.json` não foram alteradas e coincidem com as entradas diretas existentes no `package-lock.json`. Como `npm ci` não conseguiu acessar o registry, esta sessão não pode afirmar uma validação completa da resolução transitiva do lockfile. O arquivo foi preservado em vez de ser recriado de forma especulativa.
