# Formato de dados do Cabaz

O frontend do Cabaz foi pensado para ler ficheiros JSON locais ou exportados por um processo externo de scraping. Nesta fase, a aplicação já aceita importação manual de:

- `basket`: lista de itens do cabaz
- `results`: resultados de comparação por supermercado
- `stores`: lista de supermercados disponíveis

Os ficheiros podem ser:

- um array JSON simples
- ou um objeto com uma propriedade principal (`items`, `results` ou `stores`)

## 1. Cabaz

Exemplo:

```json
[
  {
    "id": "leite-meio-gordo",
    "name": "Leite meio-gordo",
    "quantity": 6,
    "preferredStore": "continente",
    "category": "lacteos_ovos",
    "preferredBrand": "Mimosa",
    "notes": "Embalagens de 1 L"
  }
]
```

Campos:

- `id`: identificador estável do item
- `name`: nome do item no cabaz
- `quantity`: quantidade pretendida
- `preferredStore`: supermercado preferido ou filtro específico para esse item, opcional
- `category`: ID normalizado da categoria de navegação e filtro
- `preferredBrand`: preferência opcional
- `notes`: observações opcionais

### Categorias normalizadas

| ID | Categoria |
| --- | --- |
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

## 2. Lojas

Exemplo:

```json
[
  {
    "id": "continente",
    "name": "Continente",
    "website": "https://www.continente.pt",
    "themeColor": "#1b6ca8"
  }
]
```

Campos:

- `id`: identificador da loja
- `name`: nome apresentado na interface
- `website`: site público da loja
- `themeColor`: cor opcional para futuras extensões visuais

## 3. Resultados

Exemplo:

```json
[
  {
    "basketItemId": "leite-meio-gordo",
    "store": "continente",
    "matchedName": "Leite Meio Gordo Mimosa 1 L",
    "price": 0.95,
    "size": 1,
    "sizeUnit": "L",
    "unitPrice": 0.95,
    "unit": "L",
    "url": "https://www.continente.pt/produto/leite-meio-gordo-mimosa-1l",
    "lastUpdated": "2026-04-12T08:15:00Z",
    "inStock": true,
    "confidenceScore": 0.98
  }
]
```

Campos principais:

- `basketItemId`: relação com o item do cabaz
- `store`: identificador da loja
- `matchedName`: nome do produto encontrado
- `price`: preço do produto
- `size`: quantidade base da embalagem
- `sizeUnit`: unidade da embalagem (`g`, `kg`, `mL`, `L`, `un`)
- `unitPrice`: preço unitário, quando disponível
- `unit`: unidade do preço unitário (`kg`, `L`, `un`)
- `url`: link público para o produto
- `lastUpdated`: data ISO da última atualização
- `inStock`: disponibilidade
- `confidenceScore`: confiança do matching entre o item do cabaz e o produto encontrado

## Notas de compatibilidade futura

- O frontend não depende da origem dos dados, apenas do formato JSON.
- Um scraper local futuro pode gerar estes ficheiros para uma pasta partilhada, e a app limita-se a importá-los e apresentá-los.
- Se um ficheiro de resultados contiver lojas não definidas em `stores`, a app cria uma representação mínima dessas lojas para não ocultar os dados importados.
