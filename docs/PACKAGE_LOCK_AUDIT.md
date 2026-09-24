# Auditoria de `package-lock.json`

Data: 2026-09-24.

## Resumo executivo

A entrada local recebida não continha `package-lock.json`. O arquivo não foi removido durante este hotfix e não foi substituído por uma construção manual. Duas tentativas legítimas de gerá-lo com npm falharam por erro de resolução DNS. Portanto, o requisito de incluir um lockfile sincronizado permanece **não atendido** e `npm ci` continua bloqueado.

## ANTES

- arquivo de entrada: `QUOTIDIANO_HOUSE_V3_CORRIGIDO_INPUT.zip`;
- SHA-256: `ee82ba37de764b88d276f6a91690195bf094b2b5d2cf5893c1329595d6949488`;
- `package-lock.json`: ausente;
- `npm-shrinkwrap.json`: ausente;
- `node_modules`: ausente;
- `.git`: ausente.

Também não foi encontrado lockfile nos outros snapshots locais do projeto disponíveis durante a auditoria. Sem histórico Git na cópia anexada, não é possível determinar localmente o commit exato em que o arquivo desapareceu.

A especificação informa que a branch pública de referência contém um lockfile. A recuperação automática dessa versão não foi possível no ambiente, e nenhuma versão pública foi copiada às cegas para a árvore local.

## DEPOIS

- `package.json`: preserva versões diretas exatas;
- `package-lock.json`: ainda ausente;
- `packageManager`: fixado em `npm@10.9.2`;
- `engines.node`: `22.16.x`;
- `engines.npm`: `10.9.x`;
- `.nvmrc` e `.node-version`: `22.16.0`.

## CAUSA

O que a evidência local permite afirmar:

1. o lockfile já não existia no ZIP antes de qualquer modificação;
2. `npm ci` falha por essa ausência;
3. a cópia não tem `.git`, então não há histórico local para atribuir a remoção;
4. não há evidência suficiente para afirmar quem removeu o arquivo ou por quê;
5. não foi possível verificar se o lockfile público corresponde ao `package.json` atual da cópia local.

A causa histórica exata permanece **não determinada**. A causa operacional atual é objetiva: o arquivo necessário não veio na entrada e o ambiente não pôde consultar um registro para regenerá-lo.

## CORREÇÃO TENTADA

### Registro npm público

```text
npm install --package-lock-only --ignore-scripts --no-audit --no-fund --fetch-retries=0 --fetch-timeout=10000
```

Resultado:

- exit code 1;
- `EAI_AGAIN registry.npmjs.org`;
- lockfile não criado.

Evidência: `docs/_validation/logs/production-build/05-package-lock-public-registry-attempt.txt`.

### Registro secundário disponível no ambiente

Foi repetida a geração contra um registro secundário configurado no ambiente, sem scripts e sem auditoria.

Resultado:

- exit code 1;
- erro DNS `EAI_AGAIN`;
- lockfile não criado.

Evidência redigida: `docs/_validation/logs/production-build/06-package-lock-secondary-registry-attempt.txt`.

## VALIDAÇÃO

| Verificação | Resultado |
| --- | --- |
| `package-lock.json` existe | **FAIL** |
| lock corresponde a `package.json` | não verificável |
| `npm ci` em árvore limpa | **FAIL**, exit 1 |
| dependências locais presentes | não |
| lockfile artificial/manual criado | não |
| `package.json` usa versões diretas exatas | sim |
| Node/npm fixados para futura regeneração | sim |

## Procedimento necessário em ambiente com acesso ao registro

O primeiro passo deve ser recuperar o lockfile conhecido da versão compatível ou gerá-lo com o Node/npm fixados nesta entrega. Depois:

```bash
npm install --package-lock-only
rm -rf node_modules dist
npm ci
npm run check
npm run check:core
npm test
npx playwright install chromium
npm run test:e2e
npm run build
npm run preview
```

Antes de aceitar o novo lockfile, deve-se confirmar que:

- as dependências diretas em `package-lock.json` correspondem exatamente a `package.json`;
- Phaser permanece em `4.2.1`;
- `npm ci` funciona sem alterar o lockfile;
- o build e os testes são executados novamente depois da geração;
- o lockfile é incluído no próximo ZIP.
