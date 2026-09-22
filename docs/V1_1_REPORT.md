# Relatório de correção — QUOTIDIANO V1.1

## Escopo preservado

A V1 foi modificada incrementalmente. Não houve recriação do projeto e nenhum mapa foi acrescentado: somente Casa, Rua e Café permanecem.

## Correções funcionais

### Retorno à casa

- fachada da casa do jogador centralizada em `x=300`;
- porta visual alinhada ao hotspot da interação `house`;
- anchor externo `house = (300,284)`;
- spawn da Rua `=(300,335)`, na calçada diante da casa;
- blocker da linha de fachadas termina em `y=246`, deixando a faixa de aproximação caminhável;
- retorno Street → Home usa o anchor interno da porta `(638,842)`;
- interação da porta tem prioridade 125 na Rua e prioridade 100 na Casa.

O E2E preparado repete Casa → Rua → Casa → Rua 5 vezes e verifica o prompt `Entrar em casa`.

### Lotte / banco / Pip

- Lotte: NPC `(1450,332)`, anchor `(1370,382)`;
- banco: blocker separado da área de Lotte e anchor `(1160,392)`;
- Pip: anchor `(1495,410)`;
- prioridades: Lotte 110, Pip 85, banco 30.

Assim, Lotte permanece a interação relevante quando os raios se aproximam, sem enviar o jogador contra o banco.

### Autowalk

`AutoWalkStuckDetector`:

- limiar padrão: 680 ms;
- deslocamento mínimo: 0,9 px;
- até 2 replans;
- depois cancela e retorna `PLAYER_FREE`;
- falha de rota também cancela;
- feedback: `Não consigo chegar até lá.`.

### Anchors

Fonte única: `src/game/scenes/data/SceneNavigationData.ts`.

Validação offline executada:

- HomeScene: 14/14 anchors caminháveis e alcançáveis;
- StreetScene: 8/8;
- CafeScene: 9/9.

Em `DEV`, registrar uma interação sem anchor, com anchor bloqueado ou sem rota desde o spawn lança erro imediatamente.

## Direção visual V1.1

### Rua

Foram mantidas camadas/props independentes. O passe V1.1 inclui pavimentação mais rica, ciclovia, fachadas de tijolo variadas, jardins, floreiras, cercas, postes, bicicletário, banco, parada de ônibus, vegetação e iluminação.

### Casa externa

Residência nº 17, porta verde própria, jardim, caixa de correio, luz e soleira.

### Café externo

Nome original **De Kleine Boon**, letreiro `KOFFIE · CAFÉ`, toldo, vitrine, quadro de calçada, mesa externa, plantas e luz quente.

### Personagens

Novo atlas do protagonista e novo atlas de Pieter/Lotte/Sanne/cliente. O protagonista mantém cabelo preto espetado, jaqueta amarela, camiseta verde, calça escura e tênis claros. Os quatro NPCs possuem silhuetas/paletas próprias.

Os design boards/spritesheet externos citados no pedido não ficaram disponíveis nesta sessão; por isso este passe não é apresentado como reprodução dessas referências ausentes.

## Testes realmente executados

Passaram:

- `npm run art`;
- parse sintático de todos os TypeScript com o compilador global;
- compilação estrita das camadas puras;
- runner offline de anchors/rotas;
- rota ao redor do banco com amostragem contra blockers;
- prioridade Lotte > banco;
- stuck detector;
- inventário, intent matcher e save serialization;
- validação de frames dos atlases;
- consistência das dependências diretas entre package e lock.

Não passaram por limitação de ambiente:

- `npm ci` (exit 1): registry inacessível (`EAI_AGAIN`);
- `npm run check` (exit 2): tipos Vite/Vitest ausentes porque o install falhou;
- `npm test` (exit 127): Vitest não instalado;
- `npm run test:e2e` (exit 1): pacote Node Playwright não instalado;
- `npm run build` (exit 127): Vite não instalado.

## Screenshots

Os cinco nomes solicitados estão codificados no teste Playwright, mas **não foram gerados** porque o jogo não pôde ser iniciado sem a instalação npm. Nenhum preview foi usado no lugar deles.
