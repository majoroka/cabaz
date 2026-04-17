# Sprint 1: Catálogo Canónico Inicial

## Objetivo

Definir o primeiro núcleo de produtos comparáveis para arrancar com dados reais de forma conservadora e controlada.

## Decisões assumidas nesta fase

- o catálogo inicial fica limitado a produtos embalados
- não entram frescos, produtos ao peso nem charcutaria ao corte
- a comparação inicial deve ser conservadora
- a marca é tratada como atributo do produto, não como identidade principal do grupo
- não existe equivalência automática entre marca própria e marca nacional na primeira fase
- packs e tamanhos diferentes não devem ser considerados equivalentes por defeito
- os 24 produtos definidos abaixo são suficientes para a fase inicial de testes
- depois da fase inicial, o catálogo deve ser alargado progressivamente para cobrir um espetro muito mais amplo de produtos

## Categorias iniciais

- `lacteos_ovos`
- `mercearia`
- `snacks_doces`
- `bebidas`
- `limpeza_casa`

## Lista inicial de produtos

### Laticínios e Ovos

| Product ID | Nome canónico | Grupo de comparação |
| --- | --- | --- |
| `leite-meio-gordo-1l` | Leite meio-gordo 1L | `leite-meio-gordo-1l` |
| `leite-magro-1l` | Leite magro 1L | `leite-magro-1l` |
| `leite-inteiro-1l` | Leite inteiro 1L | `leite-inteiro-1l` |
| `leite-sem-lactose-meio-gordo-1l` | Leite sem lactose meio-gordo 1L | `leite-sem-lactose-meio-gordo-1l` |
| `ovos-classe-m-6` | Ovos classe M pack 6 | `ovos-classe-m-6` |
| `iogurte-natural-4` | Iogurte natural pack 4 | `iogurte-natural-4` |

### Mercearia

| Product ID | Nome canónico | Grupo de comparação |
| --- | --- | --- |
| `arroz-agulha-1kg` | Arroz agulha 1kg | `arroz-agulha-1kg` |
| `massa-esparguete-500g` | Massa esparguete 500g | `massa-esparguete-500g` |
| `massa-macarrao-500g` | Massa macarrão 500g | `massa-macarrao-500g` |
| `atum-em-azeite-pack-3` | Atum em azeite pack 3 | `atum-em-azeite-pack-3` |
| `atum-ao-natural-pack-3` | Atum ao natural pack 3 | `atum-ao-natural-pack-3` |
| `azeite-virgem-extra-750ml` | Azeite virgem extra 750ml | `azeite-virgem-extra-750ml` |
| `polpa-tomate-500g` | Polpa de tomate 500g | `polpa-tomate-500g` |
| `grao-de-bico-cozido-540g` | Grão-de-bico cozido frasco 540g | `grao-de-bico-cozido-540g` |
| `feijao-frade-cozido-540g` | Feijão frade cozido frasco 540g | `feijao-frade-cozido-540g` |

### Pequeno-almoço e Snacks

| Product ID | Nome canónico | Grupo de comparação |
| --- | --- | --- |
| `cereais-milho-375g` | Cereais de milho 375g | `cereais-milho-375g` |
| `bolachas-maria-200g` | Bolachas Maria 200g | `bolachas-maria-200g` |
| `bolacha-agua-sal-200g` | Bolacha água e sal 200g | `bolacha-agua-sal-200g` |

### Bebidas

| Product ID | Nome canónico | Grupo de comparação |
| --- | --- | --- |
| `agua-mineral-1-5l` | Água mineral 1,5L | `agua-mineral-1-5l` |
| `sumo-laranja-1l` | Sumo de laranja 1L | `sumo-laranja-1l` |
| `refrigerante-cola-1-5l` | Refrigerante cola 1,5L | `refrigerante-cola-1-5l` |

### Limpeza da Casa

| Product ID | Nome canónico | Grupo de comparação |
| --- | --- | --- |
| `detergente-loica-750ml` | Detergente loiça 750ml | `detergente-loica-750ml` |
| `papel-higienico-pack-12` | Papel higiénico pack 12 | `papel-higienico-pack-12` |
| `rolo-cozinha-pack-2` | Rolo de cozinha pack 2 | `rolo-cozinha-pack-2` |

## Campos mínimos por produto canónico

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

## Regras base de comparação

### Regras gerais

- a unidade e o tamanho têm de ser equivalentes
- diferenças de variante devem bloquear o match
- diferenças de pack devem bloquear o match
- ausência de marca não deve bloquear produtos sem marca relevante
- presença de marca diferente deve reduzir muito a confiança, ou bloquear, consoante o grupo

### Exemplos de bloqueio

#### Leites

- `magro`
- `inteiro`
- `sem lactose`
- `proteina`
- `achocolatado`

#### Atum

- `azeite`
- `natural`
- `picante`
- `tomate`

#### Massas

- `esparguete`
- `macarrao`
- `penne`
- `fusilli`

## Exemplo de estrutura canónica

```json
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
  "aliases": [
    "leite meio gordo 1l",
    "leite meio-gordo 1l"
  ],
  "active": true
}
```

## Intervenção necessária do utilizador

Antes de fechar o Sprint 1, o utilizador deve validar:

1. se esta lista inicial de produtos faz sentido para o arranque
2. se quer manter o sprint limitado a 24 produtos
3. se quer manter a fase inicial sem equivalência automática entre marca própria e marca nacional
4. quais os produtos que considera prioritários para a primeira loja piloto

## Validação do Sprint 1

Decisões já confirmadas:

- manter os 24 produtos na fase inicial de testes
- manter a fase inicial sem equivalência automática entre marca própria e marca nacional
- aceitar a lista atual como base de arranque
- alargar o catálogo numa fase posterior, depois de validar o modelo com dados reais

## Produtos prioritários para a primeira loja piloto

Seleção recomendada para a primeira loja piloto:

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

### Critério desta escolha

- produtos embalados e estáveis
- nomes normalmente previsíveis nas lojas
- tamanhos fáceis de normalizar
- baixo risco de ambiguidade semântica
- cobertura de várias categorias sem aumentar demasiado a complexidade

## Critério para dar o Sprint 1 como fechado

O Sprint 1 fica fechado quando:

- a lista inicial estiver validada
- os grupos de comparação estiverem aceites
- as regras conservadoras estiverem aprovadas
- houver uma seleção clara dos primeiros produtos a testar com dados reais
