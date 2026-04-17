# Sprint 6: Escala Controlada

## Objetivo

Expandir a cobertura do Cabaz sem degradar a qualidade do matching, da proximidade e dos dados publicados.

## Princípio base

A expansão deve acontecer por camadas controladas.

Não se deve aumentar ao mesmo tempo:

- número de insígnias
- número de localizações
- número de categorias
- complexidade do matching

## Ordem recomendada de expansão

### Fase 1

Expandir dentro da mesma insígnia e do mesmo concelho piloto.

Exemplo:

- Continente
- concelho de Silves
- 3 a 5 localizações

### Fase 2

Manter o mesmo concelho e acrescentar nova insígnia.

Exemplo:

- Continente
- Pingo Doce
- concelho de Silves

### Fase 3

Acrescentar mais categorias dentro das mesmas lojas já estabilizadas.

### Fase 4

Expandir para outras zonas do Algarve central fora do concelho de Silves.

### Fase 5

Expandir para novas regiões.

## Expansão recomendada por dimensão

## 1. Lojas / insígnias

### Ordem recomendada

1. `continente`
2. `pingo-doce`
3. `lidl`
4. `auchan`
5. `intermarche`

### Critério

- presença digital
- estabilidade da nomenclatura
- cobertura geográfica
- utilidade prática para o utilizador

## 2. Localizações

### Ordem recomendada dentro do concelho de Silves

1. Armação de Pêra
2. Pêra
3. Alcantarilha
4. Tunes
5. Silves

### Critério

- proximidade regional
- utilidade prática
- facilidade de validar manualmente

## 3. Categorias

### Ordem recomendada

1. reforçar laticínios e mercearia
2. expandir bebidas e limpeza
3. introduzir pequeno-almoço e snacks com mais profundidade
4. só depois entrar em categorias mais ambíguas

### Categorias a adiar

- frescos ao peso
- talho
- peixaria
- charcutaria ao corte
- refeições prontas

## 4. Matching

### Expansão recomendada

1. consolidar regras dos 10 produtos piloto
2. aumentar para os 24 produtos do Sprint 1
3. criar aliases adicionais
4. melhorar `confidenceScore`
5. só depois abrir espaço para equivalências mais difíceis

### O que não deve acontecer cedo demais

- equivalência automática entre marca própria e marca nacional
- matching permissivo
- comparação de produtos com gramagens muito variáveis

## Snapshots e histórico

### Quando introduzir

Depois de existir uma publicação estável de dados reais.

### Estrutura recomendada

```text
public/data/snapshots/
  YYYY-MM-DD/
    metadata.json
    offers.json
```

### Objetivo

- auditoria
- histórico de preços
- comparação temporal futura

## Métricas de qualidade recomendadas

Quando o projeto começar a escalar, convém medir:

- número total de ofertas publicadas
- número de ofertas matched
- número de ofertas em revisão manual
- número de ofertas rejeitadas
- cobertura por produto canónico
- cobertura por localização
- taxa de sucesso por insígnia

## Regra de expansão segura

Uma nova dimensão só deve avançar quando a anterior estiver estável.

### Exemplos

- não adicionar nova região antes de estabilizar o concelho de Silves e o resto do Algarve central
- não adicionar nova insígnia antes de estabilizar a primeira
- não abrir frescos antes de estabilizar embalados

## Critério mínimo para passar à fase seguinte

Antes de expandir, deve existir:

1. publicação estável de dados
2. frontend a consumir os dados sem alterações estruturais
3. matching sem falsos positivos óbvios
4. validação manual razoavelmente estável

## Estratégia de expansão recomendada

### Expansão 1

- mesma insígnia
- mais localizações dentro do concelho de Silves
- mesmos 10 produtos piloto

### Expansão 2

- mesma insígnia
- 24 produtos do catálogo inicial

### Expansão 3

- nova insígnia
- mesmo concelho
- 10 produtos piloto

### Expansão 4

- resto do Algarve central
- insígnia já estabilizada

### Expansão 5

- nova região
- insígnia já estabilizada

## Intervenção necessária do utilizador

Para fechar o Sprint 6, o utilizador deve validar:

1. se concorda com a ordem de expansão por insígnia
2. se concorda com a expansão geográfica dentro do concelho de Silves antes de abrir o resto do Algarve central
3. se concorda que os frescos ficam de fora até fase posterior
4. se concorda que o histórico só entra depois da primeira publicação real estável

## Decisões assumidas neste sprint

- expansão controlada
- uma variável de cada vez
- prioridade à estabilidade
- prioridade geográfica inicial ao concelho de Silves
- histórico apenas depois de estabilizar publicação real

## Critério para dar o Sprint 6 como fechado

O Sprint 6 fica fechado quando:

- a ordem de expansão estiver validada
- as prioridades de lojas e regiões estiverem aceites
- ficar claro o que entra e o que continua fora nas fases seguintes
