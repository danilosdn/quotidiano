# Screenshots reais V1.1

O teste `tests/e2e/vertical-slice.spec.ts` está preparado para gerar diretamente do jogo em execução:

- `home_v11.png`
- `street_v11.png`
- `cafe_v11.png`
- `lotte_interaction.png`
- `house_entry.png`

Nesta sessão, `npm ci` não conseguiu acessar `registry.npmjs.org`, logo Vite/Phaser/Playwright não puderam ser instalados e o navegador de teste não pôde iniciar o jogo. Por isso **os cinco PNGs não estão presentes**.

Nenhuma concept art ou preview está sendo usada como substituta. Em um ambiente com registry disponível:

```bash
npm ci
npm run check
npm test
npm run test:e2e
npm run build
```

O `test:e2e` grava os arquivos acima nesta pasta.
