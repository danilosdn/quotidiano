# Assets e licenças

## Assets atuais

Os arquivos em `public/assets/` são assets runtime locais/originais da versão atual, produzidos pelos scripts em `art-source/`. Permanecem intactos e versionados para preservar o comportamento atual do jogo.

| Grupo | Origem | Uso atual |
| --- | --- | --- |
| `home/`, `street/`, `cafe/` | Geradores locais em `art-source/` | Cenários e props atuais |
| `characters/`, `npc/` | Geradores locais em `art-source/` | Protagonista, NPCs e Pip |
| `audio/` | Geradores locais em `art-source/` | Ambiente e efeitos sonoros |

## LimeZu — registro obrigatório

Nenhum pack LimeZu está presente nesta versão. Ao importar um, complete a tabela abaixo antes de selecionar arquivos.

| Autor | Pacote e versão | Licença/compra | Fonte/local da prova | Uso aprovado |
| --- | --- | --- | --- | --- |
| LimeZu | Pendente de recebimento | Pendente de confirmação pelo titular | `vendor-assets/limezu/raw/` local, não versionado | Nenhum |

## Política de terceiros

1. Packs LimeZu completos são fonte licenciada do usuário: nunca entram no Git, releases ou redistribuição.
2. ZIPs recebidos ficam privados em `incoming-assets/`; extrações imutáveis ficam em `vendor-assets/limezu/raw/`.
3. Registre versões, licença e atribuição antes de uso.
4. Copie/processse apenas os arquivos aprovados para `public/assets/runtime/` ou atlas de produção.
5. Não modifique arquivos raw; transformações devem ser reprodutíveis e registradas.
6. Uma seleção ainda pode ter restrições de redistribuição conforme a licença do pacote. Confirme-a antes de publicar builds ou repositórios públicos.
