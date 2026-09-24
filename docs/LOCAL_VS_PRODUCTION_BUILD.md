# Build local versus produção esperada

Data: 2026-09-24.

## Local — confirmado

| Item | Valor |
| --- | --- |
| Node | `v22.16.0` |
| npm | `10.9.2` |
| comando de instalação exigido | `npm ci` |
| resultado de instalação | exit 1, lockfile ausente |
| comando de build | `npm run build` |
| expansão do script | `npm run check && vite build` |
| resultado final do build | exit 2, tipos `vite/client` ausentes |
| diretório de saída produzido | nenhum |
| preview | exit 127, `vite` não instalado |

## Produção esperada — o que é e não é confirmado

| Item | Estado |
| --- | --- |
| projeto Netlify informado | `quotidiano-game` |
| URL pública de referência | `https://quotidiano-game.netlify.app` |
| comando esperado de build | `npm run build`, conforme incidente informado e script local |
| Node remoto | **NÃO CONFIRMADO** |
| npm remoto | **NÃO CONFIRMADO** |
| comportamento de instalação | **NÃO CONFIRMADO** |
| diretório de publicação configurado | **NÃO CONFIRMADO** |
| variáveis de ambiente | **NÃO CONFIRMADO** |
| configuração remota | não foi lida nem alterada |

A árvore local não contém `netlify.toml`. Portanto, nenhuma versão Node, comando de instalação ou publish directory remoto foi inventado.

## Diferenças de paridade identificadas

1. A entrada local não trazia lockfile, impossibilitando reproduzir a mesma árvore de dependências de CI/deploy.
2. A versão de Node/npm não estava fixada no projeto recebido.
3. A compilação local sem dependências parou em `vite/client` antes de alcançar o erro reportado pelo Netlify.
4. O conflito `HomeScene.renderer` foi confirmado por inspeção e por reprodução TypeScript mínima, embora o build completo não pudesse chegar a ele localmente.
5. A configuração TypeScript local agora é `noEmit`, evitando poluição da árvore por configs compilados.

## Medidas aplicadas para reduzir divergência

- fixação de Node `22.16.0` e npm `10.9.2`;
- versões diretas exatas mantidas no `package.json`;
- correção de `renderer` para `houseRenderer`;
- auditor de membros herdados de `Phaser.Scene`;
- auditor de artefatos TypeScript;
- auditor de typecheck somente leitura;
- registros integrais de baseline e rodada final;
- nenhuma alteração em GitHub, Netlify ou configuração remota.

## Gate necessário para declarar paridade

Em ambiente com o lockfile correto e acesso às dependências:

```bash
rm -rf node_modules dist
npm ci
npm run check
npm run check:core
npm test
npm run test:e2e
npm run build
npm run preview
```

Depois, o artefato de produção deve ser aberto e testado no browser, verificando boot, Phaser, HomeScene, assets, movimento, quatro direções, interações, save/reload, console e network. Até isso ocorrer, paridade local/produção permanece **não demonstrada**.
