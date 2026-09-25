# HOUSE_V3_BLUEPRINT_DEVIATIONS

Registro de diferenças relevantes entre o blueprint aprovado e a implementação local.

## Tolerância aplicada
Foram aceitos pequenos deslocamentos (até ~1 tile) para:
- encaixe de sprites com footprint diferente;
- manutenção de approach points/interactions;
- preservação de circulação mínima;
- compatibilização com colliders e zonas de porta.

## Desvios documentados

| Elemento | Posição no blueprint | Posição implementada | Motivo | Impacto |
|---|---|---|---|---|
| Cadeiras da mesa de jantar | 4 cadeiras ao redor da mesa | 2 cadeiras laterais | Runtime atual possui composição já preparada com duas cadeiras e interações concentradas na mesa | Visual levemente simplificado, sem impacto no fluxo principal |
| Secadora da lavanderia | Eletro dedicado ao lado da máquina | Reuso do sprite de washing machine como stand-in de secadora | Ausência de sprite específico no runtime atual | Visual equivalente, sem nova interação específica |
| Tanque da lavanderia | Tanque/pia pequeno no canto inferior direito | Reuso do sprite de bathroom sink | Melhor aproximação disponível no pack runtime atual | Mantém leitura funcional do espaço |
| Sapateira da entrada | Sapateira/rack vertical | Par de sapatos decorativo junto à parede | Não há sapateira dedicada no runtime | Mantém semântica da área de entrada, reduzindo fidelidade do móvel específico |
| Hall runners | Dois tapetes passadeira estreitos | Apenas o doormat frontal | Ausência de variação escalável apropriada no runtime | Circulação permaneceu livre; estética do hall fica mais simples |
| Lavanderia – rack de secagem | Estrutura maior tipo varal de chão | Reuso do towel rack | Melhor equivalência disponível | Sem impacto de jogabilidade |

## Observações gerais
- A organização macro dos cômodos foi preservada: quarto, banheiro e cozinha/jantar no topo; sala, hall/entrada e lavanderia na porção inferior.
- As portas e áreas de circulação centrais foram mantidas livres.
- Móveis principais foram orientados para o uso funcional mostrado no blueprint (sofá para a TV, cama encostada, pia com espelho, cozinha linear superior).
