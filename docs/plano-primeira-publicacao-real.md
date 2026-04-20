# Plano da Primeira Publicação Real

## Objetivo

Definir o arranque operacional da primeira publicação de dados reais para o Cabaz, com âmbito pequeno, validável e compatível com a arquitetura já aprovada.

## Âmbito da fase inicial

Esta primeira publicação real deve respeitar os limites já definidos nos sprints anteriores:

- 1 insígnia: `continente`
- 1 área geográfica inicial: concelho de Silves
- 1 referência de utilizador: `Armação de Pêra`
- 1 loja real ativa por proximidade na fase MVP (`top 1`)
- 10 produtos piloto do Sprint 1
- matching conservador
- sem equivalência automática entre marca própria e marca nacional

## Resultado esperado

No fim desta fase deve existir uma primeira versão real e navegável dos ficheiros publicados em `public/data/`, já consumíveis pelo frontend.

Ficheiros mínimos esperados:

- `metadata.json`
- `stores.json`
- `store-locations.json`
- `catalog-products.json`
- `comparison-groups.json`
- `offers.json`

## Separação recomendada de trabalho

O frontend mantém-se neste repositório.

A recolha real deve acontecer fora deste repositório, num pipeline separado.

Estrutura lógica recomendada nesse pipeline:

```text
raw/
normalized/
published/
```

Onde:

- `raw/` guarda a recolha bruta
- `normalized/` guarda ofertas já limpas e harmonizadas
- `published/` gera os JSON finais para o frontend

## Sequência operacional recomendada

### Passo 1

Identificar a loja real piloto.

Objetivo:

- confirmar a loja Continente que servirá `Armação de Pêra` nesta fase
- garantir `locationId`, morada, código postal, localidade e coordenadas

Saída mínima:

- 1 entrada válida em `store-locations.json`

### Passo 2

Materializar o catálogo canónico dos 10 produtos piloto.

Objetivo:

- fechar os `productId`
- fechar os `comparisonGroup`
- preparar aliases, tokens obrigatórios e bloqueadores

Saída mínima:

- `catalog-products.json`
- `comparison-groups.json`

### Passo 3

Fazer a primeira recolha bruta.

Objetivo:

- obter dados reais dessa loja para os produtos piloto
- guardar sempre nome bruto, preço, URL, imagem, formato e timestamp

Saída mínima:

- ficheiros em `raw/`

### Passo 4

Normalizar a recolha.

Objetivo:

- harmonizar nomes, unidades, preços e marca
- remover ruído comercial evidente

Saída mínima:

- ofertas normalizadas em `normalized/`

### Passo 5

Aplicar matching conservador.

Objetivo:

- associar ofertas reais aos 10 produtos piloto
- marcar casos seguros e separar casos em revisão

Saída mínima:

- ofertas `matched`
- ofertas `possible_match`
- ofertas `unmatched`

### Passo 6

Fazer validação manual.

Objetivo:

- confirmar que não existem falsos positivos óbvios
- confirmar que preço, imagem, URL e formato fazem sentido

Critério mínimo:

- nenhum match evidentemente errado
- cobertura útil em parte significativa dos 10 produtos piloto

### Passo 7

Publicar os ficheiros finais.

Objetivo:

- gerar os JSON consumidos pela app
- copiar esses ficheiros para a estrutura publicada do frontend

Saída mínima:

- `public/data/metadata.json`
- `public/data/stores.json`
- `public/data/store-locations.json`
- `public/data/catalog-products.json`
- `public/data/comparison-groups.json`
- `public/data/offers.json`

### Passo 8

Validar o frontend com dados reais.

Objetivo:

- confirmar que a app lê corretamente os ficheiros
- confirmar que a pesquisa por localização e a apresentação de resultados continuam coerentes

## Critério de sucesso desta fase

Esta fase pode ser dada como bem-sucedida quando:

1. existir uma publicação real mínima
2. o frontend conseguir consumi-la sem alterações estruturais
3. os 10 produtos piloto tiverem cobertura útil suficiente para teste
4. o matching não apresentar erros óbvios
5. a proximidade estiver coerente com a loja real selecionada para `Armação de Pêra`

## Política para os mocks antigos

Os dados mock antigos foram removidos como fonte ativa do frontend.

Regra atual:

1. a app lê apenas os dados publicados em `public/data/`
2. o cabaz do utilizador continua guardado em `localStorage`
3. qualquer novo produto piloto deve entrar por `public/data/catalog-products.json` e `public/data/offers.json`

Ou seja: falhas de publicação real devem aparecer como ausência/erro de dados, não ser mascaradas por mocks.

## O que ainda não entra nesta fase

- várias insígnias em paralelo
- várias regiões em paralelo
- frescos ao peso
- histórico por snapshots
- comparação agressiva entre produtos não estritamente equivalentes

## Intervenção necessária do utilizador

Para arrancar a execução desta fase, o utilizador terá de intervir em três pontos:

1. validar manualmente a primeira publicação real quando existir
2. decidir quando passamos dos 10 produtos piloto para os 24 produtos iniciais
3. confirmar a janela de validacao manual assim que existirem ofertas reais publicadas

## Próximo passo recomendado

O próximo passo prático deve ser preencher a primeira publicação manual de ofertas:

1. usar o template `examples/published/offers.continente-bom-dia-armacao-de-pera.template.json`
2. validar manualmente os 10 produtos piloto
3. copiar o resultado final para `public/data/offers.json`

O material estrutural de publicação inicial já está preparado:

1. `catalog-products.json`
2. `comparison-groups.json`
3. `stores.json`
4. `store-locations.json`

Mesmo que ainda usem dados manuais ou semi-manuais, estes ficheiros já permitem começar a testar a integração real com o frontend.

## Loja piloto já confirmada

A primeira loja piloto confirmada para esta fase é:

- `Continente Bom Dia Armação de Pêra`
- `Avenida General Humberto Delgado`
- `8365-138 Armação de Pêra`
- concelho de `Silves`
- coordenadas: `37.1066761`, `-8.3624628`

Esta loja já pode ser usada como referência de publicação e como base para proximidade geográfica real na fase MVP.

## Nota operacional sobre a primeira publicação manual

A primeira publicação manual real pode não coincidir exatamente com os 10 produtos-piloto teóricos definidos no Sprint 1.

Se o primeiro conjunto real disponível da loja piloto trouxer produtos diferentes:

1. a publicação real deve refletir os produtos efetivamente disponíveis
2. o catálogo publicado pode ser expandido de forma controlada para acomodar esses produtos
3. essa expansão deve ficar documentada para não criar ambiguidade entre o piloto teórico e o piloto real

Nos produtos vendidos ao peso ou com preço de referência por kg, a publicação manual pode usar um formato normalizado de referência, desde que isso fique claro em `notes`.
