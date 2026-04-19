# Sprint 2: Modelo de Dados Publicado

## Objetivo

Fechar o contrato dos ficheiros JSON que o frontend do Cabaz deverá consumir quando existir pipeline de dados reais.

## Princípios

- o frontend lê apenas dados já publicados e validados
- o frontend não lê dados raw de scraping
- o modelo deve suportar localização, catálogo canónico, ofertas e histórico
- os ficheiros devem ser simples de servir num site estático
- os identificadores devem ser estáveis

## Estrutura recomendada

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

## Ficheiros obrigatórios na fase inicial

- `metadata.json`
- `stores.json`
- `store-locations.json`
- `catalog-products.json`
- `comparison-groups.json`
- `offers.json`

## Ficheiros opcionais na fase inicial

- `basket-templates.json`
- `snapshots/...`

## 1. `metadata.json`

### Finalidade

Dar contexto ao frontend sobre a publicação atual e o estado das fontes.

### Campos mínimos

- `schemaVersion`
- `generatedAt`
- `currency`
- `country`
- `storesPublished`
- `offersPublished`
- `catalogProductsPublished`
- `sources`

### Exemplo

```json
{
  "schemaVersion": "1.0.0",
  "generatedAt": "2026-04-17T06:00:00Z",
  "currency": "EUR",
  "country": "PT",
  "storesPublished": 1,
  "offersPublished": 10,
  "catalogProductsPublished": 24,
  "sources": [
    {
      "storeId": "continente",
      "status": "ok",
      "lastUpdated": "2026-04-17T05:42:00Z"
    }
  ]
}
```

## 2. `stores.json`

### Finalidade

Representar insígnias ou marcas de supermercado.

### Campos mínimos

- `storeId`
- `name`
- `website`
- `logo`
- `active`

### Exemplo

```json
[
  {
    "storeId": "continente",
    "name": "Continente",
    "website": "https://www.continente.pt",
    "logo": "./lojas/continente.png",
    "active": true
  }
]
```

## 3. `store-locations.json`

### Finalidade

Representar lojas físicas ou áreas operacionais concretas.

### Campos mínimos

- `locationId`
- `storeId`
- `name`
- `postalCode`
- `locality`
- `lat`
- `lng`
- `active`

### Campos recomendados

- `address`
- `coverageType`
- `notes`

### Exemplo

```json
[
  {
    "locationId": "continente-albufeira-centro",
    "storeId": "continente",
    "name": "Continente Albufeira Centro",
    "address": "Rua Exemplo 123",
    "postalCode": "8200-001",
    "locality": "Albufeira",
    "lat": 37.0891,
    "lng": -8.2479,
    "active": true
  }
]
```

## 4. `comparison-groups.json`

### Finalidade

Representar grupos de comparação estrita entre produtos equivalentes.

### Campos mínimos

- `comparisonGroupId`
- `label`
- `categoryId`
- `active`

### Campos recomendados

- `rules`
- `notes`

### Exemplo

```json
[
  {
    "comparisonGroupId": "leite-meio-gordo-1l",
    "label": "Leite meio-gordo 1L",
    "categoryId": "lacteos_ovos",
    "rules": {
      "sizeUnit": "L",
      "size": 1,
      "packCount": 1
    },
    "active": true
  }
]
```

## 5. `catalog-products.json`

### Finalidade

Representar produtos canónicos internos do projeto.

### Campos mínimos

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

### Exemplo

```json
[
  {
    "productId": "leite-meio-gordo-1l",
    "canonicalName": "Leite meio-gordo 1L",
    "comparisonGroup": "leite-meio-gordo-1l",
    "categoryId": "lacteos_ovos",
    "brand": null,
    "isPrivateLabel": false,
    "size": 1,
    "sizeUnit": "L",
    "packCount": 1,
    "requiredTokens": ["leite", "meio", "gordo"],
    "blockedTokens": ["magro", "inteiro", "sem lactose"],
    "aliases": ["leite meio gordo 1l", "leite meio-gordo 1l"],
    "active": true
  }
]
```

## 6. `offers.json`

### Finalidade

Representar ofertas concretas que a app deverá comparar e apresentar.

### Campos mínimos

- `offerId`
- `storeId`
- `locationId`
- `productId`
- `scrapedName`
- `price`
- `currency`
- `inStock`
- `lastUpdated`

### Campos recomendados

- `brand`
- `categoryId`
- `size`
- `sizeUnit`
- `unitPrice`
- `unit`
- `url`
- `image`
- `notes`
- `confidenceScore`

### Exemplo

```json
[
  {
    "offerId": "continente-albufeira-centro-leite-meio-gordo-1l-001",
    "storeId": "continente",
    "locationId": "continente-albufeira-centro",
    "productId": "leite-meio-gordo-1l",
    "scrapedName": "Leite Meio Gordo 1L",
    "brand": "Continente",
    "categoryId": "lacteos_ovos",
    "price": 0.89,
    "size": 1,
    "sizeUnit": "L",
    "unitPrice": 0.89,
    "unit": "L",
    "currency": "EUR",
    "url": "https://www.continente.pt/...",
    "image": "https://www.continente.pt/....jpg",
    "notes": "emb. 1 lt - 0,90 litro",
    "inStock": true,
    "confidenceScore": 0.96,
    "lastUpdated": "2026-04-17T05:42:00Z"
  }
]
```

## Relações entre ficheiros

- `offers.storeId` referencia `stores.storeId`
- `offers.locationId` referencia `store-locations.locationId`
- `offers.productId` referencia `catalog-products.productId`
- `catalog-products.comparisonGroup` referencia `comparison-groups.comparisonGroupId`
- `store-locations.storeId` referencia `stores.storeId`

## Regras de integridade

- nenhum `offer` deve existir sem `storeId`, `locationId` e `productId` válidos
- `locationId` deve pertencer à mesma insígnia indicada em `storeId`
- `comparisonGroup` deve existir para todos os produtos ativos
- `metadata` deve refletir os ficheiros realmente publicados
- `schemaVersion` deve mudar quando houver quebra de compatibilidade

## Política de publicação recomendada

### Fase inicial

Publicar apenas:

- estado atual
- uma loja
- uma localização
- 10 produtos piloto

### Fase seguinte

Adicionar:

- snapshots por data
- mais localizações
- mais lojas

## Decisões assumidas neste sprint

- o frontend alvo vai consumir ficheiros separados por responsabilidade
- `store-locations.json` entra logo na primeira versão do modelo
- `comparison-groups.json` existe como ficheiro próprio
- `offers.json` é o ponto único de leitura da comparação no frontend
- `offers.json` deve incluir `image` logo na primeira versão
- histórico é opcional no início, mas a estrutura já fica prevista

## Intervenção necessária do utilizador

Para fechar o Sprint 2, o utilizador deve validar:

1. se concorda com esta separação em ficheiros distintos
2. se quer manter `comparison-groups.json` separado de `catalog-products.json`
3. se quer manter `store-locations.json` já na primeira versão
4. se o modelo inicial deve publicar logo imagens e URLs, ou apenas URLs

## Validação do Sprint 2

Decisões já confirmadas:

- manter `comparison-groups.json` como ficheiro próprio
- manter `store-locations.json` logo na primeira versão
- publicar `image` e `url` em `offers.json` desde a fase inicial

## Justificação destas decisões

### `comparison-groups.json`

Deve manter-se separado porque:

- desacopla o catálogo canónico das regras de comparação
- permite ajustar grupos sem reescrever produtos
- facilita evolução futura para múltiplos produtos no mesmo grupo

### `store-locations.json`

Deve entrar já na primeira versão porque:

- a lógica de proximidade faz parte do produto
- evita refazer o contrato de dados mais tarde
- permite que a app evolua desde cedo para escolha de lojas reais e não apenas insígnias

### `image` em `offers.json`

Deve entrar já porque:

- é útil para UX futura
- evita mudanças posteriores no contrato dos dados
- o custo adicional do campo é aceitável na fase inicial

## Critério para dar o Sprint 2 como fechado

O Sprint 2 fica fechado quando:

- o contrato dos ficheiros estiver validado
- as relações entre entidades estiverem aceites
- os campos mínimos estiverem estabilizados
- houver acordo sobre o que é obrigatório e opcional na fase inicial
