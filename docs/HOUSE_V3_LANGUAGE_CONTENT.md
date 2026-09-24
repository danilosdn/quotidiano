# House V3 — conteúdo linguístico

## Resumo quantitativo

| Conteúdo | Quantidade |
| --- | ---: |
| microcenários | 12 |
| intenções locais | 30 |
| variações reconhecidas | 95 |
| nós de diálogo | 60 |
| foco | A1/A2 |

Os dados ficam fora da Scene:

- `src/data/dialogues/homeContent.ts` — nós de diálogo;
- `src/data/language/homeIntents.ts` — intenções, variações e confirmações;
- `src/data/scenarios/homeScenarios.ts` — objetivos, vocabulário e persistência;
- `src/data/phone/homePhone.ts` — mensagens, agenda e contatos.

## Microcenários

| # | ID | Situação |
| --- | --- | --- |
| 1 | `morning-alarm` | Alarme da manhã |
| 2 | `curtain-weather` | Cortina e clima |
| 3 | `choose-outfit` | Escolher roupa |
| 4 | `morning-hygiene` | Higiene matinal |
| 5 | `make-breakfast` | Preparar café da manhã |
| 6 | `phone-message` | Mensagem no telefone |
| 7 | `find-keys` | Procurar chaves |
| 8 | `read-mail` | Ler correspondência |
| 9 | `do-laundry` | Lavar roupa |
| 10 | `evening-routine` | Rotina noturna |
| 11 | `visitor-at-door` | Campainha/visita |
| 12 | `missing-food` | Falta de alimento |

Cada cenário possui gatilho, pré-condição, objetivo, vocabulário, diálogos/intents, alternativas, efeito e marca de conclusão. A conclusão é persistida em `completedScenarios` e atualiza o pequeno objetivo da HUD.

## Intenções

O `IntentMatcher` normaliza caixa, acentos, pontuação e espaços e compara somente contra as intenções permitidas pelo nó. Isso evita aceitar uma frase válida em contexto errado. Exemplos suportados incluem `Ja`, `Ja, graag`, `Ik ben klaar`, `Prima`, `Oké`, pedidos de repetição, correções, confirmação de roupa, clima, chaves, correspondência e tarefas domésticas.

## Ajuda progressiva

| Nível | Apresentação |
| ---: | --- |
| 0 | holandês somente |
| 1 | repetição do texto/áudio |
| 2 | palavra-chave |
| 3 | início de frase |
| 4 | tradução em português |

A preferência é persistida no save. O botão de ajuda aumenta gradualmente o nível; não mostra automaticamente “errado”. Uma entrada não reconhecida recebe um pedido neutro para tentar novamente ou pedir ajuda.

## TTS

A UI usa `speechSynthesis` com `lang = nl-NL`, controles normal e lento. Se a API ou voz não estiver disponível, o texto continua funcional e o jogo não bloqueia. A preferência de TTS também é persistida.

## Telefone

`Berichten`, `Agenda` e `Contacten` usam dados separados. Ler a mensagem de Lotte altera o mundo e abre resposta por intenção. O fechamento do telefone restaura corretamente o estado anterior do player.

## Validação

A suíte offline verifica o mínimo de 12 cenários, 30 intenções, 80 variações e 60 diálogos; o estado atual possui 12/30/95/60. Os testes Vitest e Playwright adicionais estão preparados, mas dependem da instalação npm real.
