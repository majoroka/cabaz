# Arquitetura do Projeto Cabaz

## Objetivo

O Cabaz é uma aplicação web estática para comparação de preços de supermercados em Portugal. O frontend deve continuar compatível com GitHub Pages e a recolha de dados reais deve acontecer fora desta app.

## Princípios

- frontend estático puro
- sem backend neste repositório
- sem scraping no browser
- separação clara entre interface, dados publicados e pipeline de recolha
- dados consumidos a partir de JSON versionado e estável
- evolução incremental por sprints

## Arquitetura-alvo

O projeto deve evoluir para três camadas distintas:

### 1. Frontend estático

Este repositório.

Responsabilidades:

- apresentar pesquisa, filtros e comparação
- ler ficheiros JSON já preparados
- persistir preferências e estado local no browser
- não fazer scraping nem lógica pesada de matching

### 2. Pipeline de dados

Projeto separado, fora deste repositório.

Responsabilidades:

- recolha por loja
- normalização de dados
- deduplicação
- matching para catálogo canónico
- validação
- publicação dos JSON finais consumidos pela app

### 3. Artefactos publicados

Ficheiros JSON finais servidos pelo frontend estático.

Responsabilidades:

- representar o estado atual dos dados
- expor catálogo, lojas, localizações e ofertas
- manter histórico por snapshots

## Estrutura recomendada de dados publicados

```text
public/data/
  metadata.json
  stores.json
  store-locations.json
  catalog-products.json
  comparison-groups.json
  offers.json
  basket-templates.json
  snapshots/
    YYYY-MM-DD/
      metadata.json
      offers.json
```

## Modelo de dados alvo

### `metadata.json`

Metadados da publicação:

- `schemaVersion`
- `generatedAt`
- `currency`
- `country`
- `storesPublished`
- `offersPublished`
- `catalogProductsPublished`
- estado por fonte

### `stores.json`

Lista de insígnias:

- `storeId`
- `name`
- `website`
- `logo`
- `active`

### `store-locations.json`

Lojas físicas e cobertura geográfica:

- `locationId`
- `storeId`
- `name`
- `address`
- `postalCode`
- `locality`
- `lat`
- `lng`
- `active`

### `catalog-products.json`

Catálogo canónico:

- `productId`
- `canonicalName`
- `comparisonGroup`
- `categoryId`
- `brand`
- `isPrivateLabel`
- `size`
- `sizeUnit`
- `packCount`
- `requiredTokens`
- `blockedTokens`
- `aliases`
- `active`

### `comparison-groups.json`

Agrupadores de comparação entre variantes equivalentes:

- `comparisonGroupId`
- `label`
- `categoryId`
- `rules`

### `offers.json`

Ofertas concretas publicadas para consumo da app:

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
- `inStock`
- `confidenceScore`
- `lastUpdated`

## Pipeline de dados recomendada

Sequência lógica:

1. `collect`
2. `normalize`
3. `dedupe`
4. `match`
5. `enrich`
6. `validate`
7. `publish`
8. `snapshot`

### Regras importantes

- o frontend nunca lê dados raw
- a app só consome ficheiros publicados e validados
- falhas de uma loja não devem apagar os últimos dados válidos
- snapshots devem permitir histórico e auditoria

## Matching: linha orientadora

O matching deve ser conservador e baseado em:

- nome normalizado
- marca
- tamanho e unidade
- aliases
- tokens obrigatórios
- tokens bloqueadores
- `confidenceScore`

Estados esperados:

- `matched`
- `possible_match`
- `unmatched`

## Catálogo canónico inicial

A primeira fase de dados reais deve começar com um catálogo curto e controlado, focado em produtos embalados e de comparação simples.

Categorias prioritárias:

- laticínios e ovos
- mercearia
- pequeno-almoço e snacks
- bebidas
- limpeza essencial

Produtos fora da primeira fase:

- frescos ao peso
- charcutaria ao corte
- refeições prontas
- produtos com variantes muito ambíguas

## Arquitetura atual do frontend

## Stack

- Vite
- JavaScript vanilla com módulos ES
- CSS global
- `localStorage`

## Estrutura de pastas

```text
.
├── .github/workflows/   # deploy para GitHub Pages
├── docs/                # documentação funcional e de formatos
├── examples/            # exemplos de ficheiros JSON
├── public/              # assets públicos
├── src/
│   ├── data/            # dados mock de exemplo
│   ├── modules/         # app e rendering
│   ├── styles/          # CSS global
│   └── utils/           # helpers, formatação, validação
├── ARQUITETURA.md
├── ROADMAP.md
├── README.md
├── index.html
├── package.json
└── vite.config.js
```

## Módulos principais

### `src/modules/app.js`

Responsável por:

- criar e gerir o estado da app
- carregar dados mock e dados guardados
- tratar eventos da interface
- gerir pesquisa principal
- gerir navegação entre secções
- importar JSON

Estado relevante atual:

- `basket`
- `results`
- `stores`
- `currentSection`
- `catalogSearch`
- `editingItemId`
- `notice`
- `error`
- `sources`

### `src/modules/render.js`

Responsável por:

- render da barra lateral
- render do hero
- render dos cards de resumo
- render da pesquisa principal
- render da secção `Lojas`
- render de estados vazios e mensagens

### `src/utils/`

Responsável por:

- enriquecimento de resultados
- validação de JSON
- helpers e formatters
- pesquisa por código postal e localidade

## Interface atual

Áreas principais:

- barra lateral
- hero
- mensagens
- cards de resumo
- área principal

Secções atualmente previstas na navegação:

- `Painel`
- `Lojas`
- `Categorias`
- `Marcas`
- `Cabaz`
- `Comparação`

Neste momento, apenas `Painel` e `Lojas` têm superfície útil visível.

## Decisão estrutural

Este repositório deve continuar a ser o frontend e a documentação do projeto. O scraping real, a normalização e a publicação dos dados devem viver num projeto separado.
