# Cabaz Data / Scraper

Template para o futuro repositório externo de recolha e publicação de dados do Cabaz.

Este template não faz scraping real. Serve como ponto de partida para criar um repositório separado, por exemplo `cabaz-data` ou `cabaz-scraper`.

## Responsabilidade deste repositório

- recolher dados das lojas
- normalizar nomes, preços, formatos e imagens
- fazer matching contra o catálogo canónico
- gerar JSON finais em `data/published/`
- abrir pull request para o repositório `cabaz` com alterações em `public/data/`

## Fora de âmbito

- frontend
- GitHub Pages
- UI
- edição manual do cabaz
- scraping dentro do browser

## Estrutura

```text
.
├── .github/workflows/scrape.yml
├── data/
│   ├── normalized/
│   ├── published/
│   └── raw/
├── src/
│   ├── collectors/
│   ├── config/
│   ├── matchers/
│   ├── normalizers/
│   ├── publish/
│   └── scrape.js
├── package.json
└── README.md
```

## Arranque local

```bash
npm install
npm run scrape
```

Enquanto o scraper real não for implementado, `npm run scrape` falha de propósito para impedir publicações acidentais.

## Validação de output

Depois de implementado o scraper, os ficheiros finais devem ficar em:

```text
data/published/
```

Ficheiros esperados:

- `metadata.json`
- `stores.json`
- `store-locations.json`
- `catalog-products.json`
- `comparison-groups.json`
- `equivalence-rules.json`
- `postal-codes-pilot.json`
- `offers.json`

O workflow copia estes ficheiros para `cabaz/public/data/`, corre `npm run validate:data` e `npm run build` no repositório `cabaz`, e só depois abre PR.

## Intervenção manual necessária

1. Criar no GitHub o repositório `cabaz-data` ou `cabaz-scraper`.
2. Copiar o conteúdo deste template para o novo repositório.
3. Correr `npm install`.
4. Configurar o secret `CABAZ_DATA_PR_TOKEN`.
5. Implementar primeiro apenas um coletor pequeno, idealmente Continente.
6. Correr o workflow manualmente com `workflow_dispatch`.
7. Validar o PR criado no `cabaz`.
8. Só depois ativar ou manter o agendamento.

## Secret necessário

`CABAZ_DATA_PR_TOKEN`

O token deve permitir:

- checkout do repositório `cabaz`
- criar branch
- fazer push da branch
- abrir pull request

Recomendação: usar token fine-grained com permissões mínimas para o repositório `cabaz`.
