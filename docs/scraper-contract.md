# Sprint 11: Contrato para Scraper

## Objetivo

Definir o contrato que um scraper externo deve cumprir antes de publicar dados para o frontend Cabaz.

Este repositório continua a não conter scraping real, backend ou chamadas diretas aos supermercados. O scraper deve viver noutro projeto ou noutro fluxo local e deve entregar apenas JSON finais, normalizados e validados.

## Fluxo esperado

```text
scraper externo
  -> recolha raw por loja
  -> normalização
  -> matching contra catálogo canónico
  -> geração de JSON publicados
  -> validação local neste repositório
  -> publicação em public/data/
  -> deploy estático da app
```

## Ficheiros que o scraper deve gerar ou atualizar

### Obrigatórios por publicação

- `public/data/metadata.json`
- `public/data/offers.json`

### Obrigatórios quando houver alteração estrutural

- `public/data/catalog-products.json`
- `public/data/comparison-groups.json`
- `public/data/equivalence-rules.json`
- `public/data/stores.json`
- `public/data/store-locations.json`

### Auxiliares

- `public/data/postal-codes-pilot.json`, quando for alargada a cobertura geográfica leve usada pela UI.

## Regra de publicação

O scraper não deve publicar diretamente dados que falhem validação.

Antes de considerar uma publicação válida:

```bash
npm run validate:data:report
```

O comando gera:

```text
reports/data-validation-report.json
```

Este relatório é local e está excluído do Git. Serve para auditoria antes do commit/publicação.

## Contrato de `metadata.json`

Campos obrigatórios:

- `schemaVersion`: string, atualmente `1.0.0`
- `generatedAt`: data ISO da geração
- `currency`: `EUR`
- `country`: `PT`
- `publicationStatus`: estado textual da publicação
- `storesPublished`: número de lojas em `stores.json`
- `storeLocationsPublished`: número de localizações em `store-locations.json`
- `offersPublished`: número de ofertas em `offers.json`
- `catalogProductsPublished`: número de produtos em `catalog-products.json`
- `comparisonGroupsPublished`: número de grupos em `comparison-groups.json`
- `equivalenceRulesPublished`: número de regras em `equivalence-rules.json`
- `postalCodesPilotPublished`: número de entradas em `postal-codes-pilot.json`
- `sources`: lista de fontes por loja

## Contrato de `offers.json`

Cada oferta representa uma disponibilidade concreta numa loja física.

Campos obrigatórios:

- `offerId`: identificador estável e único
- `storeId`: deve existir em `stores.json`
- `locationId`: deve existir em `store-locations.json` e pertencer ao mesmo `storeId`
- `productId`: deve existir em `catalog-products.json`
- `scrapedName`: nome recolhido na loja
- `brand`: marca recolhida ou normalizada
- `categoryId`: categoria normalizada
- `price`: número maior ou igual a zero
- `size`: número maior que zero
- `sizeUnit`: `g`, `kg`, `mL`, `L` ou `un`
- `unitPrice`: número maior ou igual a zero
- `unit`: `kg`, `L` ou `un`
- `currency`: deve coincidir com `metadata.currency`
- `url`: URL pública do produto
- `image`: URL pública da imagem
- `notes`: observações úteis para validação humana
- `inStock`: booleano
- `confidenceScore`: número entre `0` e `1`
- `lastUpdated`: data ISO da última recolha

Regras:

- `offerId` deve ser determinístico sempre que possível, por exemplo `{locationId}-{productId}`.
- `price` deve ser o preço final visível ao consumidor no momento da recolha.
- `unitPrice` deve ser calculado pelo scraper quando a loja não fornecer valor fiável.
- `notes` deve guardar contexto como packs, brindes, peso aproximado, promoções ou formato comercial.
- Uma oferta indisponível pode existir com `inStock: false`, mas deve manter dados suficientes para auditoria.

## Contrato de `catalog-products.json`

Cada produto canónico é uma entidade estável usada para pesquisa, cabaz e comparação.

Campos obrigatórios:

- `productId`: identificador estável e único
- `canonicalName`: nome normalizado
- `comparisonGroup`: deve existir em `comparison-groups.json`
- `categoryId`: categoria normalizada
- `brand`: marca normalizada
- `isPrivateLabel`: booleano
- `size`: número maior que zero
- `sizeUnit`: `g`, `kg`, `mL`, `L` ou `un`
- `packCount`: inteiro maior que zero
- `requiredTokens`: array
- `blockedTokens`: array
- `aliases`: array
- `active`: booleano

Regras:

- O produto canónico não deve ser criado automaticamente para qualquer produto scraped sem revisão.
- Produtos com tamanho, pack ou marca significativamente diferentes devem ter `productId` próprio.
- Diferenças de tamanho ou pack não devem gerar equivalência automática; devem ser tratadas como alternativa ou bloqueio.

## Contrato de `comparison-groups.json`

Cada grupo define um conjunto estrito de produtos comparáveis.

Campos obrigatórios:

- `comparisonGroupId`: identificador estável e único
- `label`: nome legível
- `categoryId`: categoria normalizada
- `rules`: objeto com regras de tamanho, unidade ou pack
- `active`: booleano

Regra conservadora:

- O mesmo `comparisonGroup` deve ser usado apenas quando a substituição for segura sem alterar a intenção do cabaz.

## Contrato de `equivalence-rules.json`

As regras controlam relações entre produtos canónicos que não devem ser inferidas cegamente.

Campos obrigatórios:

- `ruleId`: identificador único
- `sourceProductId`: produto de origem
- `targetProductId`: produto de destino
- `relation`: `equivalent`, `alternative` ou `blocked`
- `bidirectional`: booleano
- `confidenceScore`: número entre `0` e `1`
- `reason`: justificação curta
- `active`: booleano

Interpretação:

- `equivalent`: pode substituir e entra no total.
- `alternative`: aparece como sugestão, mas fica fora do total.
- `blocked`: impede qualquer correspondência.

Regra prática atual:

- Se houver diferença de tamanho, pack, marca própria vs. marca nacional, formato ou qualidade relevante, usar `alternative` ou `blocked`, não `equivalent`.

## Contrato de `store-locations.json`

Campos obrigatórios:

- `locationId`: identificador estável e único
- `storeId`: deve existir em `stores.json`
- `name`: nome da loja física
- `address`: morada
- `postalCode`: formato `0000-000`
- `locality`: localidade
- `municipality`: concelho
- `lat`: latitude numérica
- `lng`: longitude numérica
- `active`: booleano

Regras:

- Coordenadas devem apontar para a loja física, não para a localidade genérica.
- Uma insígnia pode ter várias localizações, mas a app escolherá a mais próxima quando existir localização do utilizador.

## Relatório de validação

O relatório local contém:

- `generatedAt`
- `status`: `passed` ou `failed`
- contagens por ficheiro
- lista de `warnings`
- lista de `errors`

Erros bloqueiam publicação. Avisos não bloqueiam, mas devem ser analisados antes do commit.

## Fora de âmbito

- scraping no browser
- credenciais de supermercados
- APIs privadas
- normalização raw dentro da app
- edição direta de equivalências pela interface
