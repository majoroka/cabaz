# Repositório Externo do Scraper

## Decisão

O scraper deve viver fora deste repositório.

Repositórios recomendados:

- `cabaz`: frontend estático, GitHub Pages, UI, validação e dados publicados.
- `cabaz-data` ou `cabaz-scraper`: recolha, normalização, matching e geração dos JSON.

## Porquê separar

- Mantém a app estática e simples.
- Evita dependências pesadas como Playwright no frontend.
- Reduz risco de commits automáticos mexerem em código de UI.
- Permite agendar recolhas no repositório de dados sem afetar o deploy da app.
- Permite abrir PRs para `cabaz` apenas com alterações em `public/data/`.

## Fluxo recomendado

```text
cabaz-data
  -> GitHub Actions agendada
  -> scraper recolhe dados
  -> normaliza e gera JSON finais
  -> valida localmente contra o contrato
  -> abre PR para cabaz com alterações em public/data/

cabaz
  -> workflow Validate Data corre no PR
  -> npm run validate:data
  -> npm run build
  -> merge manual depois de validação visual quando necessário
  -> deploy GitHub Pages
```

## Estrutura sugerida para `cabaz-data`

```text
.
├── .github/workflows/
│   └── scrape.yml
├── data/
│   ├── raw/
│   ├── normalized/
│   └── published/
├── src/
│   ├── collectors/
│   ├── normalizers/
│   ├── matchers/
│   └── publish/
├── package.json
└── README.md
```

## Output final esperado

O scraper deve gerar ficheiros compatíveis com o contrato atual:

- `metadata.json`
- `stores.json`
- `store-locations.json`
- `catalog-products.json`
- `comparison-groups.json`
- `equivalence-rules.json`
- `postal-codes-pilot.json`, quando aplicável
- `offers.json`

Estes ficheiros devem ser copiados para `public/data/` no PR aberto contra o repositório `cabaz`.

## GitHub Actions no repositório do scraper

O workflow do scraper deve ter:

- `workflow_dispatch`, para execução manual
- `schedule`, para execução agendada
- permissões mínimas para ler o próprio repo
- token/segredo para abrir PR no repositório `cabaz`

Exemplo conceptual:

```yaml
name: Atualizar dados do Cabaz

on:
  workflow_dispatch:
  schedule:
    - cron: "0 6 * * *"

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout scraper
        uses: actions/checkout@v5

      - name: Setup Node.js
        uses: actions/setup-node@v5
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run scraper
        run: npm run scrape

      - name: Checkout Cabaz frontend
        uses: actions/checkout@v5
        with:
          repository: mariocabano/cabaz
          token: ${{ secrets.CABAZ_DATA_PR_TOKEN }}
          path: cabaz

      - name: Copy published data
        run: cp data/published/*.json cabaz/public/data/

      - name: Validate in Cabaz
        working-directory: cabaz
        run: |
          npm ci
          npm run validate:data
          npm run build

      - name: Open pull request
        working-directory: cabaz
        run: |
          git checkout -b data/update-$(date -u +%Y%m%d-%H%M%S)
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add public/data/*.json
          git diff --cached --quiet || git commit -m "Atualiza dados publicados"
          git push --set-upstream origin HEAD
          gh pr create --title "Atualiza dados publicados" --body "Atualização automática gerada pelo scraper." --base main --head "$(git branch --show-current)"
        env:
          GH_TOKEN: ${{ secrets.CABAZ_DATA_PR_TOKEN }}
```

Este exemplo é intencionalmente conceptual. Quando criarmos o repositório real do scraper, deve ser adaptado à estrutura efetiva e testado manualmente.

## Intervenção manual necessária

Quando avançarmos para o repositório real, o utilizador deve:

1. Criar no GitHub um novo repositório, por exemplo `cabaz-data` ou `cabaz-scraper`.
2. Decidir se esse repositório será público ou privado.
3. Ativar GitHub Actions nesse repositório.
4. Criar um token fine-grained ou GitHub App com acesso ao repositório `cabaz`.
5. Guardar esse token no repo do scraper como secret `CABAZ_DATA_PR_TOKEN`.
6. Confirmar que o token tem permissões para criar branches e pull requests no `cabaz`.
7. Correr o primeiro workflow apenas com `workflow_dispatch`, sem agenda.
8. Validar o primeiro PR manualmente antes de ativar `schedule`.

## Regras de segurança operacional

- O scraper não deve fazer commit direto para `main` do `cabaz`.
- O scraper deve abrir PRs pequenos e auditáveis.
- O workflow do `cabaz` deve bloquear PRs com dados inválidos.
- Se uma loja falhar, o scraper deve preservar os últimos dados válidos dessa loja ou marcar a fonte como falhada em `metadata.json`.
- O scraping deve começar com uma loja e poucos produtos antes de escalar.

## Primeiro alvo recomendado

Começar por uma loja já modelada na app:

- Continente Bom Dia Armação de Pêra
- Pingo Doce Armação de Pêra

Recomendação prática: começar pelo Continente, porque já temos dados piloto e IDs/URLs reais suficientes para comparar output automático contra a publicação manual atual.
