# House V3 — baseline

## Baseline local

A baseline é `QUOTIDIANO_HOUSE_V3_CONTINUED.zip`, não a branch pública. Ela possuía seis áreas retangulares, 24 objetos runtime, `HomeScene` com posicionamento direto e testes preparados, mas não tinha `package-lock.json` nem `node_modules`.

## Tentativa de execução anterior à correção

O ambiente oferecia Node 22.16.0, npm 10.9.2, TypeScript global e Chromium. Contudo, a resolução DNS de `registry.npmjs.org`, GitHub raw e Netlify falhou. Sem Phaser/Vite locais, não foi possível iniciar honestamente a baseline com `npm run dev`.

Por isso:

- nenhum screenshot em `screenshots/before/` é apresentado como captura real;
- não se declarou `npm ci`, build, Vitest ou Playwright como aprovados;
- não se reutilizou imagem promocional LimeZu como evidência;
- a análise “before” combina inspeção do código anexado e consulta visual da versão pública de referência.

## Problemas confirmados na baseline

- planta como grade `QUARTO | BANHEIRO | COZINHA / SALA | ENTRADA | LAVANDERIA`;
- grandes vazios e pouca relação funcional entre móveis;
- rótulos permanentes de debug;
- chave-emoji no chão;
- sofá/TV e cozinha sem composição residencial madura;
- posições visuais e pontos de interação mantidos separadamente;
- `HomeScene` concentrando composição e lógica doméstica;
- lateralidade de animação incompatível com a spritesheet;
- diálogo, hints e conteúdo doméstico ainda rasos;
- save sem migração completa e restauração segura.

## Baseline pública consultada

- repositório: `https://github.com/danilosdn/quotidiano`
- branch: `https://github.com/danilosdn/quotidiano/tree/feature/house-v2-limezu`
- commit: `https://github.com/danilosdn/quotidiano/commit/0c01f8f`
- site: `https://quotidiano-game.netlify.app`

Essas referências foram usadas somente para entender a versão anterior. Nenhuma operação de escrita remota foi realizada.
