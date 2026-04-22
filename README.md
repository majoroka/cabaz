# Cabaz

Cabaz é uma aplicação web estática para comparar preços de um cabaz de compras entre supermercados em Portugal. O projeto foi preparado para funcionar em GitHub Pages, sem backend, sem APIs privadas e com dados lidos a partir dos ficheiros JSON publicados em `public/data/`.

## Objetivos

- gerir um cabaz de compras no browser
- comparar preços por item a partir de dados publicados
- guardar produtos favoritos para acesso rápido
- gerar uma listagem imprimível a partir do cabaz
- evoluir para comparação por localização e lojas próximas
- preparar a integração futura com um pipeline externo de scraping/publicação

## Limitações atuais

- nesta fase, a app trabalha com dados reais piloto publicados manualmente: 2 lojas, 40 ofertas e 35 produtos canónicos
- o projeto não faz scraping real
- não existe importação manual pela interface
- a interface está em fase de evolução e nem todas as secções do menu lateral estão implementadas
- as secções `Categorias` e `Marcas` ficam fora do menu até existir ingestão automática de dados reais
- os cards de resumo dependem do cabaz atual e só calculam totais entre lojas com cobertura completa
- a futura comparação real dependerá de catálogo canónico, matching e dados publicados fora deste frontend

## Stack técnica

- Vite
- JavaScript vanilla
- frontend estático puro
- persistência local com `localStorage`

## Instalação

```bash
npm install
```

## Desenvolvimento local

```bash
npm run dev
```

O servidor de desenvolvimento do Vite ficará disponível no endereço indicado no terminal.

## Build de produção

```bash
npm run build
```

Para pré-visualizar a build:

```bash
npm run preview
```

## Validação dos dados publicados

Antes de publicar alterações em `public/data/`, correr:

```bash
npm run validate:data
```

Este comando valida referências entre lojas, localizações, produtos canónicos, grupos de comparação, ofertas, regras de equivalência e metadados publicados.

## Publicação no GitHub Pages

O repositório inclui o workflow `.github/workflows/deploy.yml`, que publica automaticamente a aplicação quando existe um `push` para a branch `main`.

Notas:

- o `base path` da app é calculado automaticamente a partir de `GITHUB_REPOSITORY`
- fora do GitHub Actions, a build assume por omissão o subpath `/cabaz/`
- se o nome do repositório mudar, convém ajustar a variável de ambiente ou o valor por defeito em `vite.config.js`

## Funcionalidades atualmente visíveis

- barra lateral com navegação por secções
- hero com pesquisa principal
- pesquisa por código postal, localidade e rua
- pesquisa principal com resultados filtráveis
- secção `Lojas` com logos e links externos
- secção `Favoritos` com pesquisa, filtros e adição rápida ao cabaz
- secção `Cabaz` com produtos adicionados, quantidades, remoção e subtotal estimado
- secção `Listagem` com lista prática do cabaz, fotos e impressão limpa
- secção `Comparação` piloto com total do cabaz por loja disponível
- ordenação da comparação por proximidade quando existe CP/localidade selecionado
- leitura dos JSON publicados em `public/data/`
- validação local dos JSON publicados com `npm run validate:data`

## Funcionalidades planeadas

- `Categorias`: explorar produtos por categoria quando existir ingestão automática de dados reais
- `Marcas`: explorar produtos por marca quando existir ingestão automática de dados reais
- `Comparação`: expandir regras de equivalência e alternativas à medida que existirem mais produtos e lojas reais

## Estado do produto

O projeto está a ser trabalhado por fases:

- primeiro, UX/UI e estrutura do frontend
- depois, definição do catálogo canónico e do modelo de dados real
- por fim, integração com um pipeline externo de recolha e publicação de JSON

## Estrutura de pastas

```text
.
├── .github/workflows/     # deploy automático para GitHub Pages
├── docs/                  # documentação do formato de dados
├── examples/              # templates auxiliares de publicação
├── public/                # favicon, assets públicos e dados publicados
│   └── data/              # JSON consumidos pela app
├── src/
│   ├── data/              # listas de apoio à UI, como categorias e marcas
│   ├── modules/           # montagem da app e rendering da interface
│   ├── styles/            # estilos globais
│   └── utils/             # cálculos, helpers, validação e formatação
├── index.html
├── package.json
└── vite.config.js
```

## Formato esperado dos JSON publicados

O frontend lê diretamente os ficheiros em `public/data/`:

- `metadata.json`
- `stores.json`
- `store-locations.json`
- `catalog-products.json`
- `comparison-groups.json`
- `equivalence-rules.json`
- `postal-codes-pilot.json`
- `offers.json`

O ficheiro `equivalence-rules.json` controla casos em que produtos semelhantes não devem ser comparados automaticamente: `equivalent` entra no total, `alternative` aparece como sugestão fora do total e `blocked` impede a correspondência.

Campos relevantes por oferta em `offers.json`:

- `offerId`
- `storeId`
- `locationId`
- `productId`
- `scrapedName`
- `brand`
- `categoryId`
- `price`
- `size`
- `sizeUnit`
- `unitPrice`
- `unit`
- `currency`
- `url`
- `image`
- `notes`
- `lastUpdated`
- `inStock`
- `confidenceScore`

Template auxiliar:

- [examples/README.md](./examples/README.md)

## Documentação complementar

- [ARQUITETURA.md](./ARQUITETURA.md)
- [ROADMAP.md](./ROADMAP.md)
- [docs/catalogo-canonico-sprint-1.md](./docs/catalogo-canonico-sprint-1.md)
- [docs/modelo-dados-publicados-sprint-2.md](./docs/modelo-dados-publicados-sprint-2.md)
- [docs/localizacao-lojas-reais-sprint-3.md](./docs/localizacao-lojas-reais-sprint-3.md)
- [docs/regras-matching-sprint-4.md](./docs/regras-matching-sprint-4.md)
- [docs/pipeline-mvp-sprint-5.md](./docs/pipeline-mvp-sprint-5.md)
- [docs/escala-controlada-sprint-6.md](./docs/escala-controlada-sprint-6.md)
- [docs/plano-primeira-publicacao-real.md](./docs/plano-primeira-publicacao-real.md)
- [docs/data-format.md](./docs/data-format.md)

## Integração futura com pipeline de dados

Este repositório contém apenas a camada de apresentação. No futuro, um pipeline externo de recolha, normalização, matching e publicação deverá gerar os ficheiros JSON documentados em `docs/data-format.md`, e a app limitar-se-á a lê-los e a apresentar os resultados.

Essa separação permite:

- manter o frontend compatível com GitHub Pages
- evitar dependência de serviços privados
- testar a UI com dados publicados controlados
- evoluir o scraping noutro repositório ou pipeline separado
