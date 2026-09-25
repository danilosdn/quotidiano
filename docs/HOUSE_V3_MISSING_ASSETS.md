# HOUSE_V3_MISSING_ASSETS

Após revisão do runtime local e reaproveitamento máximo dos assets existentes, não foi necessário introduzir novos sprites externos nesta etapa.

## Itens sem correspondência exata, mas resolvidos com substituição semelhante

| Objeto | Função | Dimensões aproximadas | Orientação | Solução atual | Motivo para não criar asset novo agora |
|---|---|---|---|---|---|
| Secadora | Completar o par da lavanderia | ~1x1 tile visual | FRONT | Reuso de `washing_machine.png` | Há equivalente visual suficiente para validar layout e circulação |
| Tanque / pia de serviço | Apoio da lavanderia | ~1x1.5 tile | WALL_MOUNTED / FRONT | Reuso de `bathroom_sink.png` | Cumpre leitura funcional sem quebrar o estilo do pack |
| Sapateira da entrada | Armazenar calçados junto à porta | ~1x1 tile | FRONT | Uso de `shoes.png` como indicativo | Sem sprite dedicado no runtime atual |
| Passadeiras longas do hall | Guiar circulação visual | ~1x2 a 1x3 tiles | TOP-DOWN_NEUTRAL | Omitido | Ausência de variante adequada com escala independente |

## Conclusão
Não há bloqueadores de implementação. Os itens acima foram tratados como **SIMILAR** ou **omitidos** para preservar consistência visual e evitar criação arbitrária de arte nova.
