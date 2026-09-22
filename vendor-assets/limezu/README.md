# LimeZu

- `raw/`: extração imutável dos packs licenciados do usuário. É ignorada pelo Git e nunca deve ser redistribuída.
- `selected/`: registro local de candidatos aprovados antes de processamento. Não copie packs inteiros para esta pasta.

Ao receber um ZIP, extraia-o preservando a estrutura em `raw/`, atualize `docs/LIMEZU_INVENTORY.md` e documente a licença em `docs/ASSETS.md`.
