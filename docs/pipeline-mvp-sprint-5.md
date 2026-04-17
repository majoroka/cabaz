# Sprint 5: Pipeline MVP

## Objetivo

Montar a primeira versão funcional de dados reais com âmbito controlado, suficiente para validar o modelo de catálogo, localização, matching e publicação sem tentar ainda escalar.

## Âmbito do MVP

### Cobertura inicial

- 1 insígnia: `continente`
- 1 zona piloto: Algarve central
- 1 localidade de referência: `Armação de Pêra`
- 1 localização real piloto: `continente-armacao-de-pera` ou loja Continente mais próxima válida
- 10 produtos piloto

### Produtos piloto

1. `leite-meio-gordo-1l`
2. `arroz-agulha-1kg`
3. `massa-esparguete-500g`
4. `atum-em-azeite-pack-3`
5. `azeite-virgem-extra-750ml`
6. `polpa-tomate-500g`
7. `grao-de-bico-cozido-540g`
8. `bolachas-maria-200g`
9. `agua-mineral-1-5l`
10. `detergente-loica-750ml`

## O que o MVP deve validar

- se o catálogo canónico é suficiente
- se o modelo de `store-locations` serve para proximidade
- se o matching conservador funciona na prática
- se os ficheiros publicados são suficientes para o frontend
- se a experiência final faz sentido para o utilizador

## O que fica fora deste MVP

- múltiplas insígnias
- múltiplas regiões
- histórico completo
- automatização pesada
- cobertura alargada de categorias
- equivalência entre marca própria e marca nacional

## Estrutura lógica do pipeline MVP

Sequência mínima:

1. recolher dados de uma loja
2. normalizar os registos relevantes
3. tentar matching para os 10 produtos piloto
4. rejeitar ou marcar os casos ambíguos
5. gerar os ficheiros publicados
6. validar manualmente os resultados

## Artefactos mínimos a gerar

### Publicados

- `public/data/metadata.json`
- `public/data/stores.json`
- `public/data/store-locations.json`
- `public/data/catalog-products.json`
- `public/data/comparison-groups.json`
- `public/data/offers.json`

### Internos ao pipeline

Recomendados, mesmo que fora deste repositório:

- `raw/`
- `normalized/`
- `matched/`
- `unmatched/`
- `logs/`

## Resultado mínimo esperado

O MVP deve conseguir publicar:

- 1 loja válida
- 1 localização válida
- até 10 ofertas comparáveis
- com `productId`, `locationId`, `price`, `url`, `image`, `lastUpdated`

Não é obrigatório que os 10 produtos tenham match logo na primeira execução. O importante é validar o processo e perceber onde falha.

## Critério de sucesso do MVP

O Sprint 5 deve ser considerado bem-sucedido se:

1. pelo menos 5 dos 10 produtos piloto tiverem ofertas válidas publicadas
2. o frontend conseguir ler os ficheiros finais sem adaptações estruturais
3. não existirem falsos positivos óbvios no matching
4. a proximidade funcionar ao nível de uma loja real

## Critério de falha útil

Mesmo que o MVP não atinja todos os produtos, ele continua a ser útil se nos disser com clareza:

- que campos faltam no scraper
- que regras de matching precisam de ajuste
- que produtos são demasiado ambíguos para a fase inicial

## Estratégia de validação manual

Para cada um dos 10 produtos piloto, deve ser feita validação manual de:

- nome encontrado
- preço
- tamanho
- pack
- imagem
- URL
- loja associada

### Classificação recomendada

- `ok`
- `ok_com_reserva`
- `rever`
- `rejeitar`

## Política de publicação

### Se a recolha falhar parcialmente

- publicar apenas ofertas válidas
- não inventar produtos em falta
- registar falhas em `metadata.sources`

### Se a recolha falhar totalmente

- não substituir o último conjunto válido sem necessidade
- registar estado de falha

## Estrutura mínima recomendada de `metadata.sources`

```json
[
  {
    "storeId": "continente",
    "locationId": "continente-armacao-de-pera",
    "status": "ok",
    "lastUpdated": "2026-04-17T05:42:00Z",
    "matchedOffers": 7,
    "unmatchedOffers": 3
  }
]
```

## Estratégia de implementação recomendada

### Fase 1

- gerar dados reais manualmente ou semi-manualmente para validar estrutura

### Fase 2

- automatizar recolha para a insígnia piloto

### Fase 3

- estabilizar matching e publicação

## Intervenção necessária do utilizador

Para fechar o Sprint 5, o utilizador deve:

1. validar os resultados reais do MVP no frontend
2. dizer se os resultados publicados fazem sentido do ponto de vista prático
3. apontar produtos que estejam mal casados ou mal apresentados

## Decisões assumidas neste sprint

- começar pequeno
- validar processo antes de escalar
- aceitar cobertura parcial na primeira iteração
- priorizar qualidade de matching sobre volume de ofertas

## Critério para dar o Sprint 5 como fechado

O Sprint 5 fica fechado quando:

- existir uma primeira publicação real de dados
- o frontend consumir essa publicação sem redefinir o contrato
- houver validação manual dos resultados piloto
- estiver claro o que corrigir antes de escalar
