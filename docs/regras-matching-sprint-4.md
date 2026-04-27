# Sprint 4: Regras de Matching

## Objetivo

Definir como uma oferta scraped deve ser associada a um produto canónico, minimizando falsos positivos e permitindo revisão manual dos casos cinzentos.

## Princípio base

O matching do Cabaz deve ser conservador.

É preferível não casar um produto do que casar um produto errado.

## Estrutura do resultado de matching

Cada tentativa de matching deve produzir pelo menos:

- `productId`
- `matchStatus`
- `confidenceScore`
- `matchedBy`
- `reasons`

### `matchStatus`

Valores recomendados:

- `matched`
- `possible_match`
- `unmatched`

## Níveis de confiança

### Match automático seguro

- `0.95` a `1.00`

Critério:

- nome fortemente compatível
- tamanho e unidade compatíveis
- sem tokens bloqueadores
- sem conflitos de variante

### Match automático aceitável

- `0.80` a `0.94`

Critério:

- forte compatibilidade textual
- pequena incerteza em marca ou forma comercial
- sem conflitos relevantes

### Revisão manual recomendada

- `0.60` a `0.79`

Critério:

- semelhança plausível, mas com dúvida real

### Sem match automático

- abaixo de `0.60`

Critério:

- informação insuficiente
- conflito forte
- possível falso positivo

## Sinais positivos

### Sinais fortes

- nome normalizado compatível
- alias conhecido
- tamanho igual
- unidade igual
- pack igual
- tokens obrigatórios presentes

### Sinais médios

- marca compatível
- categoria compatível
- forma comercial semelhante

## Sinais negativos

### Bloqueadores fortes

- variante contraditória
- tamanho incompatível
- unidade incompatível
- pack incompatível
- token bloqueador presente

### Redutores de confiança

- marca diferente em produto fortemente marcado
- nome parcialmente compatível mas pouco específico
- ausência de tamanho em oferta scraped

## Regras gerais de matching

1. normalizar texto antes de comparar
2. comparar sempre nome, unidade, tamanho e pack
3. bloquear logo que exista conflito forte
4. só usar revisão manual nos casos intermédios
5. nunca considerar equivalência automática entre marca própria e marca nacional nesta fase

## Normalização mínima necessária

- lowercase
- remoção de acentos
- remoção de pontuação
- normalização de espaços
- normalização de unidades
- normalização de variações comuns de escrita

## Política de marca

### Fase atual

- a marca não é obrigatória em todos os produtos
- se existir marca diferente num produto fortemente marcado, a confiança deve descer muito
- não existe equivalência automática entre marcas nacionais e marcas próprias

## Política de tamanho e pack

### Regra

- tamanho e pack têm de coincidir

### Exemplos

- `1L` não deve casar com `500mL`
- `pack 3` não deve casar com `pack 4`
- `750mL` não deve casar com `500mL`

## Matriz objetiva de comparação

Esta matriz aplica-se à lógica de comparação no frontend e à validação manual de equivalências.

Ordem de decisão recomendada:

1. tentar `exato`
2. se falhar, tentar `equivalente`
3. se falhar, mostrar `alternativa`
4. se nada servir, marcar `em_falta`

### Regras transversais

#### `exato`

- automático
- entra no total
- mesma categoria
- mesmo tipo de produto
- mesma marca, quando a marca é relevante
- mesmo tamanho ou diferença residual
- mesma unidade

#### `equivalente`

- exige validação manual nesta fase
- só entra no total depois de aprovado
- mesma categoria
- mesmo tipo de produto
- pode ter marca diferente
- pode ter pequena diferença de tamanho, mas controlada

#### `alternativa`

- automático
- não entra no total automaticamente
- produto relacionado, mas com diferença relevante de marca, formato, variante ou tamanho
- pode entrar no total se o utilizador a aceitar manualmente para essa loja

#### `em_falta`

- automático
- não entra no total
- usado quando não existe produto exato nem equivalente plausível

### Regras de bloqueio

Nunca considerar `exato` ou `equivalente` quando existir pelo menos um destes conflitos:

- categoria incompatível
- unidade incompatível
- variante contraditória
- diferença de tamanho grande
- pack incompatível
- forma comercial diferente com impacto real no uso do produto

## Matriz por tipo de produto

### Leite

#### `exato`

- mesma marca
- mesmo tipo: `meio-gordo`, `magro`, `gordo`, `sem lactose`
- mesmo volume

#### `equivalente`

- marcas diferentes
- mesmo tipo de leite
- mesmo volume

#### `alternativa`

- volume diferente
- tipo diferente

#### `em_falta`

- não existe leite comparável

### Arroz

#### `exato`

- mesma marca
- mesmo tipo: `agulha`, `carolino`, `basmati`
- mesmo peso

#### `equivalente`

- marcas diferentes
- mesmo tipo de arroz
- peso igual ou diferença até `10%`

#### `alternativa`

- tipo de arroz diferente
- peso muito diferente

#### `em_falta`

- não existe arroz do mesmo tipo

### Atum

#### `exato`

- mesma marca
- mesmo meio: `azeite`, `óleo`, `água`
- mesmo peso drenado ou muito próximo

#### `equivalente`

- marcas diferentes
- mesmo meio
- peso semelhante até `10%`

#### `alternativa`

- meio diferente
- lata individual vs. pack

#### `em_falta`

- não existe atum comparável

### Ovos

#### `exato`

- mesma marca
- mesma tipologia: `ar livre`, `solo`, `biológicos`
- mesma classe, quando existir
- mesmo número de ovos

#### `equivalente`

- marcas diferentes
- mesma tipologia
- mesmo número de ovos

#### `alternativa`

- `6` vs. `12`
- `ar livre` vs. `solo`
- classe muito diferente

#### `em_falta`

- não existem ovos da mesma tipologia

### Frango

#### `exato`

- mesmo corte: `peito`, `asas`, `bife`
- mesma apresentação: `embalado`, `vácuo`, `temperado`
- peso semelhante até `5%`

#### `equivalente`

- marcas diferentes
- mesmo corte
- mesma apresentação base
- peso até `10%`

#### `alternativa`

- corte diferente
- natural vs. marinado/temperado

#### `em_falta`

- não existe o mesmo corte

### Bolachas

#### `exato`

- mesma marca
- mesmo tipo: `Maria`, `digestive`, `tostada`
- mesmo peso total

#### `equivalente`

- marcas diferentes
- mesmo tipo
- mesmo peso ou diferença até `10%`

#### `alternativa`

- sabor ou variante diferente
- pack com peso total muito diferente

#### `em_falta`

- não existe bolacha do mesmo tipo

### Iogurtes

#### `exato`

- mesma marca
- mesmo sabor
- mesmo formato: `líquido` vs. `sólido`
- mesmo pack/peso

#### `equivalente`

- marcas diferentes
- mesmo sabor
- mesmo formato
- pack semelhante

#### `alternativa`

- `líquido` vs. `sólido`
- sabor diferente

#### `em_falta`

- não existe iogurte comparável

### Manteiga

#### `exato`

- mesma marca
- mesma variante: `com sal`, `sem sal`
- mesmo peso

#### `equivalente`

- marcas diferentes
- mesma variante
- mesmo peso

#### `alternativa`

- `com sal` vs. `sem sal`
- margarina vs. manteiga

#### `em_falta`

- não existe produto comparável

## Política inicial para a UI de comparação

- `exato`: entra automaticamente no total
- `equivalente`: só entra no total quando for aprovado manualmente
- `alternativa`: pode ser mostrada e entra no total apenas quando for aceite manualmente
- `em_falta`: não entra no total e deve reduzir a confiança global da loja

## Produtos piloto: regras recomendadas

## 1. `leite-meio-gordo-1l`

### Tokens obrigatórios

- `leite`
- `meio`
- `gordo`

### Tokens bloqueadores

- `magro`
- `inteiro`
- `sem lactose`
- `proteina`
- `achocolatado`

### Regras

- tamanho tem de ser `1L`
- unidade tem de ser `L`

## 2. `arroz-agulha-1kg`

### Tokens obrigatórios

- `arroz`
- `agulha`

### Tokens bloqueadores

- `basmati`
- `carolino`
- `integral`
- `vaporizado`

### Regras

- tamanho tem de ser `1kg`

## 3. `massa-esparguete-500g`

### Tokens obrigatórios

- `massa`
- `esparguete`

### Tokens bloqueadores

- `macarrao`
- `penne`
- `fusilli`
- `tagliatelle`

### Regras

- tamanho tem de ser `500g`

## 4. `atum-em-azeite-pack-3`

### Tokens obrigatórios

- `atum`
- `azeite`

### Tokens bloqueadores

- `natural`
- `picante`
- `tomate`

### Regras

- pack tem de ser `3`

## 5. `azeite-virgem-extra-750ml`

### Tokens obrigatórios

- `azeite`
- `virgem`
- `extra`

### Tokens bloqueadores

- `oleo`
- `suave`
- `classico`

### Regras

- tamanho tem de ser `750ml`

## 6. `polpa-tomate-500g`

### Tokens obrigatórios

- `polpa`
- `tomate`

### Tokens bloqueadores

- `molho`
- `ketchup`
- `concentrado`

### Regras

- tamanho tem de ser `500g`

## 7. `grao-de-bico-cozido-540g`

### Tokens obrigatórios

- `grao`
- `bico`
- `cozido`

### Tokens bloqueadores

- `feijao`
- `lentilhas`

### Regras

- tamanho de referência `540g`

## 8. `bolachas-maria-200g`

### Tokens obrigatórios

- `bolacha`
- `maria`

### Tokens bloqueadores

- `agua`
- `sal`
- `digestive`
- `chocolate`

### Regras

- tamanho de referência `200g`

## 9. `agua-mineral-1-5l`

### Tokens obrigatórios

- `agua`
- `mineral`

### Tokens bloqueadores

- `gaseificada`
- `com gas`
- `aromatizada`

### Regras

- tamanho tem de ser `1,5L`

## 10. `detergente-loica-750ml`

### Tokens obrigatórios

- `detergente`
- `loica`

### Tokens bloqueadores

- `roupa`
- `multiusos`
- `lava tudo`
- `maquina`

### Regras

- tamanho tem de ser `750ml`

## Política de revisão manual

Um caso deve cair em revisão manual quando:

- nome e tamanho batem, mas a variante não é totalmente clara
- falta a marca num produto onde a marca pode influenciar a decisão
- o texto comercial é pouco informativo
- há várias ofertas muito semelhantes para o mesmo `productId`

## Registo recomendado de auditoria

Cada decisão de matching deve poder ser explicada com:

- `matchedBy`
- `reasons`
- `blockedBy`

Exemplo:

```json
{
  "productId": "leite-meio-gordo-1l",
  "matchStatus": "matched",
  "confidenceScore": 0.97,
  "matchedBy": ["required_tokens", "size", "unit"],
  "reasons": ["tokens obrigatórios presentes", "tamanho compatível"],
  "blockedBy": []
}
```

## Decisões assumidas neste sprint

- matching conservador
- `confidenceScore` por intervalos
- bloqueadores explícitos por produto
- revisão manual para a zona intermédia
- nada de equivalência automática entre marca própria e marca nacional
- a fase inicial deve ser testada com uma base pequena antes de qualquer expansão

## Intervenção necessária do utilizador

Para fechar o Sprint 4, o utilizador deve validar:

1. se concorda com um matching conservador
2. se concorda com revisão manual entre `0.60` e `0.79`
3. se concorda com a regra de bloqueio por variante, tamanho e pack
4. se concorda com estas regras iniciais para os 10 produtos piloto

## Validação do Sprint 4

Decisões já confirmadas:

- matching conservador
- revisão manual entre `0.60` e `0.79`
- bloqueio por variante, tamanho e pack
- aceitação das regras iniciais para os 10 produtos piloto
- fase inicial testada com base pequena antes de expansão

## Critério para dar o Sprint 4 como fechado

O Sprint 4 fica fechado quando:

- a política de confiança estiver validada
- as regras gerais estiverem aceites
- os 10 produtos piloto tiverem regras mínimas aceites
- a zona de revisão manual estiver definida
