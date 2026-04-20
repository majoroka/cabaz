# Formato de dados do Cabaz

O frontend do Cabaz lê apenas JSON estáticos publicados em `public/data/`. Nesta fase, esses ficheiros são alimentados manualmente a partir do CSV piloto; no futuro, deverão ser gerados por um pipeline externo de scraping, normalização e validação.

A app não faz scraping, não usa backend e não mistura estes dados publicados com dados mock.

## Ficheiros publicados

```text
public/data/
  metadata.json
  stores.json
  store-locations.json
  catalog-products.json
  comparison-groups.json
  offers.json
  codigos_postais_portugal.txt
```

## `metadata.json`

Metadados da publicação atual.

Campos principais:

- `schemaVersion`: versão do contrato de dados
- `generatedAt`: data/hora de geração
- `currency`: moeda usada nos preços
- `country`: país dos dados
- `storesPublished`: número de lojas publicadas
- `offersPublished`: número de ofertas publicadas
- `catalogProductsPublished`: número de produtos canónicos publicados
- `sources`: informação de controlo sobre a origem dos dados

## `stores.json`

Lista de insígnias suportadas.

Campos principais:

- `storeId`: identificador estável da insígnia
- `name`: nome apresentado na interface
- `website`: site oficial
- `logo`: nome ou caminho do logotipo, quando aplicável
- `active`: indica se a loja deve ser considerada ativa

## `store-locations.json`

Lista de lojas físicas e cobertura geográfica.

Campos principais:

- `locationId`: identificador estável da loja física
- `storeId`: relação com a insígnia
- `name`: nome da loja física
- `address`: morada
- `postalCode`: código postal
- `locality`: localidade
- `lat`: latitude
- `lng`: longitude
- `active`: indica se a loja física está ativa

## `catalog-products.json`

Catálogo canónico usado para agrupar ofertas comparáveis.

Campos principais:

- `productId`: identificador estável do produto canónico
- `canonicalName`: nome normalizado do produto
- `comparisonGroup`: grupo de comparação
- `categoryId`: categoria normalizada
- `brand`: marca, quando relevante
- `isPrivateLabel`: indica marca própria
- `size`: quantidade base
- `sizeUnit`: unidade da embalagem (`g`, `kg`, `mL`, `L`, `un`)
- `packCount`: número de unidades no pack, quando aplicável
- `requiredTokens`: tokens obrigatórios para matching
- `blockedTokens`: tokens que devem bloquear o match
- `aliases`: nomes alternativos úteis para pesquisa e matching
- `active`: indica se o produto está ativo

## `comparison-groups.json`

Grupos de comparação para produtos equivalentes.

Campos principais:

- `comparisonGroupId`: identificador do grupo
- `label`: nome legível do grupo
- `categoryId`: categoria normalizada
- `rules`: notas ou regras de comparação

## `offers.json`

Ofertas concretas publicadas para apresentação na app.

Campos principais:

- `offerId`: identificador estável da oferta
- `storeId`: identificador da loja
- `locationId`: identificador da loja física
- `productId`: relação com o produto canónico
- `scrapedName`: nome do produto recolhido na loja
- `brand`: marca detetada
- `categoryId`: categoria normalizada
- `price`: preço atual
- `size`: quantidade base da embalagem
- `sizeUnit`: unidade da embalagem (`g`, `kg`, `mL`, `L`, `un`)
- `unitPrice`: preço unitário, quando disponível
- `unit`: unidade do preço unitário (`kg`, `L`, `un`)
- `currency`: moeda
- `url`: link público para o produto
- `image`: URL da imagem do produto
- `notes`: observações comerciais úteis
- `inStock`: disponibilidade
- `confidenceScore`: confiança do matching
- `lastUpdated`: data/hora da última atualização

Use `notes` quando houver contexto relevante que não caiba bem nos campos estruturados, por exemplo:

- packs com várias unidades
- peso aproximado
- venda ao kg
- campanhas do tipo `+ x un grátis`
- descrições comerciais úteis para validação manual

## Categorias normalizadas

| ID | Categoria |
| --- | --- |
| `sem_categoria` | Sem categoria |
| `mercearia` | Mercearia |
| `fruta_legumes` | Fruta e Legumes |
| `talho` | Talho |
| `peixaria` | Peixaria |
| `charcutaria_queijos` | Charcutaria e Queijos |
| `lacteos_ovos` | Laticínios e Ovos |
| `padaria_pastelaria` | Padaria e Pastelaria |
| `congelados` | Congelados |
| `bebidas` | Bebidas |
| `snacks_doces` | Snacks e Doces |
| `refeicoes_prontas` | Refeições Prontas |
| `bio_saudavel` | Bio e Saudável |
| `higiene_beleza` | Higiene e Beleza |
| `limpeza_casa` | Limpeza da Casa |
| `bebe` | Bebé |
| `animais` | Animais |
| `casa_cozinha` | Casa e Cozinha |

## Notas de compatibilidade futura

- O frontend só consome ficheiros publicados e validados.
- Um scraper local futuro deve gerar os ficheiros finais para `public/data/` ou para uma etapa equivalente de publicação.
- Falhas de scraping não devem ser mascaradas por dados mock no frontend.
