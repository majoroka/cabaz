# Cabaz

Cabaz é uma aplicação web estática para comparar preços de um cabaz de compras entre supermercados em Portugal. O projeto foi preparado para funcionar em GitHub Pages, sem backend, sem APIs privadas e com dados lidos a partir de ficheiros JSON locais ou exportados por ferramentas externas.

## Objetivos

- gerir um cabaz de compras no browser
- comparar preços por item entre várias superfícies comerciais
- calcular totais estimados por supermercado
- destacar o melhor preço por item e o supermercado com melhor total
- aceitar importação manual de JSON para futura integração com scraping local

## Limitações atuais

- os dados incluídos são mock, embora com estrutura realista
- o projeto não faz scraping real
- a importação é manual e separada por tipo de ficheiro
- a comparação depende da qualidade do `basketItemId` e do matching já produzido fora desta app

## Stack técnica

- Vite
- JavaScript vanilla
- frontend estático puro
- persistência local com `localStorage`

## Instalação

```bash
npm install
```

## Desenvolvimento local

```bash
npm run dev
```

O servidor de desenvolvimento do Vite ficará disponível no endereço indicado no terminal.

## Build de produção

```bash
npm run build
```

Para pré-visualizar a build:

```bash
npm run preview
```

## Publicação no GitHub Pages

O repositório inclui o workflow `.github/workflows/deploy.yml`, que publica automaticamente a aplicação quando existe um `push` para a branch `main`.

Notas:

- o `base path` da app é calculado automaticamente a partir de `GITHUB_REPOSITORY`
- fora do GitHub Actions, a build assume por omissão o subpath `/cabaz/`
- se o nome do repositório mudar, convém ajustar a variável de ambiente ou o valor por defeito em `vite.config.js`

## Funcionalidades já implementadas

- adicionar, editar e remover itens do cabaz
- persistência do cabaz em `localStorage`
- filtros por supermercado e categoria
- pesquisa textual por item do cabaz
- modo para ver todos os resultados ou apenas o melhor por item
- comparação com preço, formato, preço unitário, link, disponibilidade e data de atualização
- totais por supermercado
- destaque do melhor preço por item
- importação manual de JSON para cabaz, resultados e lojas
- validação mínima com mensagens de erro amigáveis
- botões para carregar dados de exemplo e repor a demo completa

## Estrutura de pastas

```text
.
├── .github/workflows/     # deploy automático para GitHub Pages
├── docs/                  # documentação do formato de dados
├── examples/              # exemplos simples de importação JSON
├── public/                # favicon e assets públicos
├── src/
│   ├── data/              # dados mock de exemplo
│   ├── modules/           # montagem da app e rendering da interface
│   ├── styles/            # estilos globais
│   └── utils/             # cálculos, helpers, validação e formatação
├── index.html
├── package.json
└── vite.config.js
```

## Formato esperado dos JSON

O frontend aceita:

- arrays JSON simples
- ou objetos com as propriedades `items`, `results` e `stores`

Campos relevantes por resultado:

- `basketItemId`
- `store`
- `matchedName`
- `price`
- `size`
- `sizeUnit`
- `unitPrice`
- `unit`
- `url`
- `lastUpdated`
- `inStock`
- `confidenceScore`

Exemplos de importação:

- [examples/README.md](./examples/README.md)

## Documentação complementar

- [ARQUITETURA.md](./ARQUITETURA.md)
- [ROADMAP.md](./ROADMAP.md)
- [docs/data-format.md](./docs/data-format.md)

## Integração futura com scraping local

Este repositório contém apenas a camada de apresentação. No futuro, um script local de scraping poderá gerar ficheiros JSON com o formato documentado em `docs/data-format.md`, e a app limitar-se-á a importar esses ficheiros e a apresentar os resultados.

Essa separação permite:

- manter o frontend compatível com GitHub Pages
- evitar dependência de serviços privados
- testar a UI com dados mock ou exportados
- evoluir o scraping noutro repositório ou script local
