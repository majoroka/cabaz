# Sprint 3: Localização e Lojas Reais

## Objetivo

Definir como a app e o pipeline devem tratar lojas físicas reais e proximidade geográfica, para que a pesquisa futura deixe de depender apenas da insígnia e passe a depender da localização do utilizador.

## Decisões assumidas neste sprint

- a proximidade deve ser calculada ao nível de `locationId`, não apenas de `storeId`
- o utilizador escolhe uma localização de referência através de código postal/localidade
- a app deve trabalhar com lojas físicas reais, e não apenas com marcas de supermercado
- a primeira fase de dados reais deve começar com uma única insígnia e uma única localização piloto

## Estrutura lógica

### Níveis de entidade

#### 1. Insígnia

Exemplos:

- Continente
- Pingo Doce
- Lidl

Representada em `stores.json`.

#### 2. Loja real / localização

Exemplos:

- Continente Albufeira Centro
- Continente Guia
- Pingo Doce Armação de Pêra

Representada em `store-locations.json`.

É esta entidade que deve ser usada para:

- proximidade
- cobertura geográfica
- associação de ofertas reais

## Recomendação para a primeira loja piloto

### Insígnia piloto recomendada

- `continente`

### Justificação

- presença digital previsível
- cobertura alargada
- nomenclatura normalmente estável
- boa adequação aos 10 produtos piloto definidos no Sprint 1

## Recomendação para a primeira zona piloto

### Zona piloto recomendada

- Algarve central

### Localidade de referência recomendada

- Armação de Pêra

### Justificação

- já existe contexto funcional do projeto em torno desta zona
- é uma localidade concreta e útil para testar proximidade
- permite uma expansão natural para Albufeira, Guia, Portimão e zonas próximas

## Recomendação para a primeira localização real

### Localização piloto recomendada

- `continente-armacao-de-pera` ou, se não existir uma loja com esse identificador exato no scraping disponível, a loja Continente mais próxima associada a Armação de Pêra

### Regra operacional

Se a loja física exata de Armação de Pêra não estiver disponível na origem de dados:

1. usar a loja Continente mais próxima com coordenadas válidas
2. manter o `postalCode` e a `locality` de referência do utilizador
3. registar no `metadata` que a cobertura está a usar a loja ativa mais próxima

## Estrutura mínima recomendada para `store-locations.json`

```json
[
  {
    "locationId": "continente-armacao-de-pera",
    "storeId": "continente",
    "name": "Continente Armação de Pêra",
    "address": "Morada da loja",
    "postalCode": "8365-000",
    "locality": "Armação de Pêra",
    "lat": 37.102,
    "lng": -8.356,
    "active": true
  }
]
```

## Regra de proximidade recomendada

### Entrada

- código postal ou localidade escolhida pelo utilizador
- coordenadas associadas a essa referência
- lista de `store-locations` ativas

### Passos

1. resolver o código postal/localidade para uma coordenada de referência
2. filtrar localizações ativas
3. calcular distância entre a referência e cada `store-location`
4. ordenar por distância ascendente
5. selecionar:
   - a loja mais próxima na fase MVP
   - ou as `N` lojas mais próximas numa fase posterior

### Regra da fase MVP

- usar apenas a loja mais próxima (`top 1`)

### Regra da fase seguinte

- usar as 3 lojas mais próximas por insígnia suportada, se existir cobertura suficiente

## Métrica recomendada

### Fase inicial

- distância geográfica simples por latitude/longitude

### Fase posterior

- distância geográfica combinada com cobertura real ou disponibilidade por zona, se existir esse dado

## Critérios de seleção de loja para o frontend

O frontend deve trabalhar assim:

1. utilizador escolhe `CP ou localidade`
2. a app resolve uma referência geográfica
3. a app identifica a loja real mais próxima
4. a comparação usa `locationId` como filtro principal

## Regra para ofertas

Cada oferta em `offers.json` deve apontar sempre para:

- `storeId`
- `locationId`
- `productId`

Sem `locationId`, a comparação por proximidade fica incompleta.

## Política de expansão

### Fase piloto

- 1 insígnia
- 1 localização real
- 10 produtos

### Fase seguinte

- 1 insígnia
- 3 a 5 localizações
- mesma zona geográfica

### Fase posterior

- várias insígnias
- cobertura por região
- proximidade entre múltiplas lojas reais

## Intervenção necessária do utilizador

Para fechar o Sprint 3, o utilizador deve validar:

1. se concorda com `Continente` como primeira insígnia piloto
2. se concorda com `Armação de Pêra` como primeira localidade piloto
3. se concorda que a fase MVP use apenas a loja mais próxima (`top 1`)
4. se prefere manter a primeira expansão dentro do Algarve central antes de alargar a outras zonas

## Validação do Sprint 3

Decisões já confirmadas:

- `Continente` como primeira insígnia piloto
- `Armação de Pêra` como primeira localidade piloto
- fase MVP com apenas a loja mais próxima (`top 1`)
- primeira expansão ainda dentro do Algarve central

## Critério para dar o Sprint 3 como fechado

O Sprint 3 fica fechado quando:

- a primeira insígnia piloto estiver validada
- a primeira localidade/zona piloto estiver validada
- a regra de proximidade estiver aceite
- estiver claro se a fase MVP usa `top 1` ou mais do que uma loja
