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
- persistir cabaz e favoritos em `localStorage`
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

### `equivalence-rules.json`

Regras controladas entre produtos canónicos que não devem ser agrupados automaticamente:

- `sourceProductId`
- `targetProductId`
- `relation`: `equivalent`, `alternative` ou `blocked`
- `bidirectional`
- `confidenceScore`
- `reason`

Interpretação atual:

- `equivalent`: substitui o produto em falta e entra no total
- `alternative`: é mostrado como sugestão, mas fica fora do total
- `blocked`: impede correspondência entre os produtos

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
- `notes`
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
│   ├── data/            # listas de apoio à UI, como categorias e marcas
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
- carregar dados publicados em `public/data/`
- guardar estado local do utilizador, como cabaz e futuramente favoritos
- tratar eventos da interface
- gerir pesquisa principal
- gerir navegação entre secções

Estado relevante atual:

- `basket`
- `catalogProducts`
- `results`
- `stores`
- `currentSection`
- `catalogSearch`
- `favorites`
- `notice`
- `error`

### `src/modules/render.js`

Responsável por:

- render da barra lateral
- render do hero
- render dos cards de resumo
- render da pesquisa principal
- render da secção `Lojas`
- render da secção `Cabaz`
- render da secção `Comparação`
- render da secção `Favoritos`
- render da secção `Listagem`
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

Os cards de resumo são derivados do estado real da app:

- itens e quantidades no cabaz
- favoritos guardados, quando o cabaz ainda está vazio
- loja com menor total entre lojas com cobertura completa
- diferença entre a loja completa mais barata e a mais cara

Secções atualmente ativas na navegação:

- `Painel`
- `Lojas`
- `Favoritos`
- `Cabaz`
- `Listagem`
- `Comparação`

Secções planeadas fora da navegação ativa:

- `Categorias`
- `Marcas`

Neste momento, `Painel`, `Lojas`, `Favoritos`, `Cabaz`, `Listagem` e `Comparação` têm superfície útil visível. `Categorias` e `Marcas` ficam fora da navegação ativa até existir ingestão automática de dados reais.

## Comparação atual

A secção `Comparação` calcula o cabaz por loja a partir dos produtos adicionados pelo utilizador.

Comportamento atual:

- gera um separador por loja com ofertas publicadas
- ordena os separadores por total do cabaz, do mais barato para o mais caro
- mostra os produtos do cabaz dentro do separador da loja selecionada
- calcula preço, quantidade e subtotal por item
- assinala produtos exatos, equivalentes, alternativas ou em falta
- apresenta contadores e etiquetas visuais para `Exato`, `Equivalente`, `Alternativa` e `Em falta`
- apresenta uma lista de validação manual das correspondências controladas detetadas
- guarda localmente a decisão por equivalência (`Aprovada` ou `A rever`) em `localStorage`

Nesta fase piloto existem duas insígnias publicadas: Continente Bom Dia Armação de Pêra e Pingo Doce Armação de Pêra. As ofertas continuam a ser importadas manualmente, mas ambas já apontam para lojas físicas piloto no concelho de Silves.

## Favoritos e Listagem

### Favoritos

Objetivo:

- permitir guardar produtos recorrentes sem os adicionar imediatamente ao cabaz
- acelerar pesquisas futuras
- funcionar apenas no browser, com persistência em `localStorage`

Estado previsto:

- identificador do produto
- data de adição
- quantidade preferida opcional
- notas do utilizador opcionais

Estado atual:

- secção ligada ao menu lateral
- botão de coração nos resultados da pesquisa
- persistência local por produto
- listagem inicial dos favoritos com possibilidade de adicionar ao cabaz
- pesquisa e filtros locais por texto, loja, categoria e marca
- ação para adicionar os favoritos visíveis ao cabaz, evitando duplicados já existentes

### Listagem

Objetivo:

- gerar uma lista simples a partir do cabaz atual
- disponibilizar uma versão imprimível sem navegação, hero ou cartões de resumo
- servir como lista de compras prática, não como tabela de comparação

Campos atuais da listagem:

- imagem do produto
- nome do produto
- quantidade
- categoria
- loja/preço quando existir
- subtotal quando existir preço
- espaço visual para marcação manual na versão impressa

Estado atual:

- secção ligada ao menu lateral
- dados derivados diretamente do cabaz atual
- botão de impressão usando `window.print()`
- CSS específico para impressão
- sem estado próprio para evitar divergência entre cabaz e listagem

## Fonte de dados ativa

A fonte ativa da app é apenas `public/data/`.

Ficheiros consumidos diretamente:

- `metadata.json`
- `stores.json`
- `catalog-products.json`
- `offers.json`
- `codigos_postais_portugal.txt`

Os antigos dados mock e a importação manual foram removidos do runtime para evitar mistura com os dados reais piloto publicados manualmente a partir dos CSV fornecidos pelo utilizador.

Estado atual dos dados publicados:

- 2 lojas
- 2 localizações operacionais, uma delas ainda provisória para Pingo Doce
- 40 ofertas
- 35 produtos canónicos
- normalização inicial de `Iglo` e `Capitão Iglo` como a mesma marca

## Decisão estrutural

Este repositório deve continuar a ser o frontend e a documentação do projeto. O scraping real, a normalização e a publicação dos dados devem viver num projeto separado.
