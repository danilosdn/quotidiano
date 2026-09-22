# Interações — V1.1

Cada interação possui hotspot, anchor, facing, prioridade, rótulo contextual e callback. O jogador caminha até o anchor antes da pose/ação; NPCs relevantes viram para ele durante a conversa.

## Casa

Anchors auditados: cama, sofá, mesa/cadeira, armário, geladeira, fogão, pia, chuveiro, chaves e porta. Também são validados os anchors adicionais de cafeteira, pia do banheiro, espelho e mochila.

A porta interna usa anchor caminhável em `(638, 842)` e, ao sair, posiciona o jogador na calçada diante da residência.

## Rua

- **Casa**: hotspot e anchor alinhados à porta externa nº 17. Ao ficar diante da porta, a ação relevante é `E — Entrar em casa`.
- **Pieter**: NPC de prioridade alta.
- **Lotte**: anchor `(1370, 382)`, deslocado para fora da geometria do banco; jogador para em frente e ela vira para ele.
- **Pip**: carinho com pose do protagonista e reação visual do cachorro.
- **Banco**: prioridade menor que NPC/porta; sentar/levantar.
- **Bicicletário** e **ponto de ônibus**: ações secundárias ancoradas.
- **Café**: porta/fachada com prioridade alta e anchor em frente à entrada.

## Café

Anchors auditados: Sanne, menu, vitrine, bebida, duas mesas, cliente, lixeira e saída.

Sanne/cliente viram para o jogador. Menu, vitrine, bebida e lixeira usam pose ancorada. Mesas têm estado sentado e saída explícita.

## Feedback

- prompt contextual próximo ao protagonista;
- tint discreto no alvo em foco quando aplicável;
- personagem caminha até o anchor e muda pose;
- NPC olha para o jogador em conversa;
- SFX continuam usados para ações como porta, sentar, pickup, café e pagamento.
