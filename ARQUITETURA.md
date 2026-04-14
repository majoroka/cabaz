# Arquitetura do Projeto Cabaz

## Objetivo

O Cabaz é uma aplicação web estática para comparar preços de um cabaz de compras entre supermercados em Portugal. O projeto foi desenhado para correr em GitHub Pages, sem backend e sem dependência de APIs privadas.

## Princípios de arquitetura

- frontend estático puro
- dados desacoplados da interface
- importação de JSON local como fonte principal
- compatibilidade com futura geração de dados por scraper local externo
- código modular e simples, sem framework desnecessária
- persistência local apenas para preferências e cabaz do utilizador

## Stack

- Vite
- JavaScript vanilla com módulos ES
- CSS global modularizado por responsabilidade
- `localStorage` para persistência do cabaz e fontes importadas

## Estrutura de pastas

```text
.
├── .github/workflows/   # workflow de deploy para GitHub Pages
├── docs/                # documentação funcional e de formatos
├── examples/            # exemplos de ficheiros JSON importáveis
├── public/              # assets públicos
├── src/
│   ├── data/            # dados mock de exemplo
│   ├── modules/         # montagem da app e rendering
│   ├── styles/          # estilos globais
│   └── utils/           # cálculos, helpers, validação, formatação
├── ARQUITETURA.md
├── ROADMAP.md
├── README.md
├── index.html
├── package.json
└── vite.config.js
```

## Camadas da aplicação

### 1. Bootstrap

Responsável por arrancar a aplicação e carregar os estilos.

- `src/main.js`

Função:

- importar CSS global
- montar a app no elemento `#app`

### 2. Orquestração de estado

Responsável por gerir o estado da app no browser.

- `src/modules/app.js`

Responsabilidades:

- criar o estado inicial
- ler e escrever em `localStorage`
- gerir filtros
- gerir criação, edição e remoção de itens do cabaz
- importar ficheiros JSON
- acionar validação
- recalcular a vista e re-renderizar

Modelo de estado atual:

- `basket`
- `results`
- `stores`
- `filters`
- `editingItemId`
- `notice`
- `error`
- `sources`

## 3. Rendering

Responsável por construir a interface HTML a partir do estado.

- `src/modules/render.js`

Responsabilidades:

- render do cabeçalho
- render do formulário do cabaz
- render da lista de itens
- render dos filtros
- render dos cartões resumo
- render dos totais por supermercado
- render da tabela de comparação
- render de mensagens de erro e estado vazio

## 4. Utilitários de domínio

Responsáveis por lógica reutilizável sem acoplamento à UI.

### `src/utils/calculations.js`

- cálculo de preço unitário
- enriquecimento dos resultados importados
- filtragem de itens
- escolha do melhor preço
- agregação de totais por supermercado
- cálculo de resumo do dashboard

### `src/utils/validation.js`

- validação da estrutura de `basket`
- validação da estrutura de `results`
- validação da estrutura de `stores`
- normalização mínima de dados importados

### `src/utils/formatters.js`

- formatação de moeda
- formatação de datas
- formatação de tamanhos e preço unitário

### `src/utils/helpers.js`

- `slugify`
- `escapeHtml`
- deduplicação e helpers genéricos

## 5. Dados

### Dados mock

Os ficheiros em `src/data/` representam a fonte de dados de demonstração.

- `basket.example.json`
- `results.example.json`
- `stores.json`

Estes ficheiros servem dois objetivos:

- alimentar a demo inicial da app
- funcionar como referência de formato para futuros exportadores

### Dados importados

A app aceita importação manual de:

- cabaz
- resultados
- lojas

Os dados importados substituem o estado atual correspondente e podem ser persistidos localmente.

## Fluxo de dados

### Inicialização

1. carregar dados guardados em `localStorage`, se existirem
2. caso não existam, usar os ficheiros mock em `src/data/`
3. enriquecer resultados para garantir campos derivados
4. renderizar a interface

### Atualização do cabaz

1. utilizador submete formulário
2. app valida e normaliza os campos
3. estado do cabaz é atualizado
4. `localStorage` é atualizado
5. interface é re-renderizada

### Importação de JSON

1. utilizador escolhe ficheiro
2. app lê o conteúdo localmente no browser
3. conteúdo é convertido para JSON
4. validador adequado verifica estrutura mínima
5. estado correspondente é substituído
6. interface é re-renderizada

### Cálculo da comparação

1. aplicar filtros ao cabaz
2. selecionar resultados relevantes por item e por loja
3. escolher correspondência principal por loja
4. identificar melhor preço disponível por item
5. agregar totais por supermercado
6. construir cartões resumo e tabela final

## Persistência

Persistência local atual:

- `cabaz:basket`
- `cabaz:results`
- `cabaz:stores`

Objetivo:

- manter o cabaz do utilizador entre sessões
- permitir que dados importados continuem disponíveis sem backend

Não existe persistência remota nesta fase.

## Compatibilidade com GitHub Pages

Decisões relevantes:

- sem backend
- sem rotas do lado do servidor
- assets gerados por build estática do Vite
- `base path` configurado em `vite.config.js` para suportar subpath de repositório
- deploy automático por GitHub Actions

## Integração futura com scraper local

O scraper não deve viver neste frontend.

Separação proposta:

- repositório ou script local independente gera ficheiros JSON
- frontend importa ou consome esses ficheiros estáticos
- contrato entre as duas partes é o formato documentado em `docs/data-format.md`

Vantagens:

- frontend continua publicável em GitHub Pages
- scraping pode evoluir com dependências próprias
- falhas no scraping não afetam a arquitetura da UI
- testes e manutenção ficam mais simples

## Decisões assumidas nesta versão

- JavaScript vanilla em vez de React, para reduzir peso e complexidade
- rendering por templates string, suficiente para a dimensão atual do projeto
- uma única árvore de estado central em memória
- validação leve no cliente, focada em estrutura e legibilidade de erro

## Pontos de evolução natural

- separar renderização por componentes menores
- adicionar testes unitários para utilitários
- suportar importação de um único ficheiro envelope com `basket`, `results` e `stores`
- acrescentar ordenação e paginação na tabela
- guardar preferências de filtros no browser
- introduzir camada de adaptadores para múltiplas versões de formato JSON

