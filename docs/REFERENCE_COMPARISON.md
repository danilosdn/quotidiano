# Referências públicas e divergências

## Referências fornecidas

- GitHub: `https://github.com/danilosdn/quotidiano`;
- branch: `https://github.com/danilosdn/quotidiano/tree/feature/house-v2-limezu`;
- commit: `https://github.com/danilosdn/quotidiano/commit/0c01f8f`;
- Netlify: `https://quotidiano-game.netlify.app`.

## Papel das referências

Elas servem somente para compreender a versão anterior e o incidente informado. O alvo de implementação é `QUOTIDIANO_HOUSE_V3_CORRIGIDO_INPUT.zip`.

## Divergência do lockfile

A especificação informa que a branch pública possui `package-lock.json`, mas a cópia local recebida não o contém. Como a árvore anexada não possui `.git`, não é possível determinar nela quando ou por quem o arquivo foi removido.

Tentativas de consulta/recuperação automatizada e de geração via npm falharam no ambiente. Por isso:

- o arquivo público não foi copiado sem verificar compatibilidade;
- não foi produzido lockfile manual;
- `npm ci` permanece bloqueado;
- a divergência está registrada em `PACKAGE_LOCK_AUDIT.md`.

## Divergência funcional relevante

O incidente informado apontava `HomeScene.renderer`. A cópia local efetivamente continha esse campo e ele foi corrigido para `houseRenderer`. O restante da House V3 local, mais recente que a referência anterior em vários pontos, foi preservado.

## Operações remotas

Nesta correção não houve:

- commit;
- push;
- pull;
- merge/rebase/reset;
- checkout de branch remota;
- criação de branch/tag remota;
- pull request;
- deploy;
- mudança de variável de ambiente;
- alteração no GitHub;
- alteração no Netlify.

A árvore de entrega não contém `.git`.
