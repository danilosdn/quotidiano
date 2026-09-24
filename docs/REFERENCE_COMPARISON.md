# Referências públicas e divergências

## Referências consultadas

- GitHub: `https://github.com/danilosdn/quotidiano`
- branch: `https://github.com/danilosdn/quotidiano/tree/feature/house-v2-limezu`
- commit: `https://github.com/danilosdn/quotidiano/commit/0c01f8f`
- Netlify: `https://quotidiano-game.netlify.app`

## Papel dessas referências

Foram usadas somente para compreender a implementação anterior, a aparência “before”, a arquitetura e regressões conhecidas. O alvo da correção sempre foi o ZIP anexado.

## Divergência observada

O commit público de referência expunha `package-lock.json` e evidências/screenshot paths que não estavam presentes no ZIP local continuado. A cópia anexada também continha código/documentação mais recente em alguns pontos. Nada foi sobrescrito automaticamente: o local foi preservado como fonte principal, e a ausência do lockfile foi documentada.

A recuperação automática do lockfile público não foi possível porque, durante a execução, o acesso a GitHub raw/codeload e ao registro npm falhou por resolução DNS/controle de acesso. O arquivo não foi reconstruído manualmente.

## Operações remotas

Nesta correção não houve commit, push, pull, merge, rebase, reset, checkout remoto, criação de branch/tag remota, pull request, deploy, mudança de variável de ambiente nem alteração de configuração no GitHub ou Netlify. A árvore final não contém `.git`.
