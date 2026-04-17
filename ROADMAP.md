# Roadmap do Projeto Cabaz

## Estado atual

O projeto está numa fase de definição de produto e UX/UI, com frontend estático funcional e preparado para evolução incremental. A estratégia de dados reais já foi alinhada: este repositório mantém a interface e a leitura de JSON publicados; a recolha real deve acontecer num pipeline separado.

## O que está efetivamente pronto

### Base técnica

- [x] scaffold com Vite
- [x] arranque local com `npm run dev`
- [x] build com `npm run build`
- [x] deploy para GitHub Pages
- [x] branding base e favicon
- [x] documentação inicial do projeto

### Interface atual

- [x] barra lateral com secções principais
- [x] hero com pesquisa principal
- [x] campo de localização com pesquisa por CP, localidade e rua
- [x] cards de resumo em estado neutro
- [x] pesquisa principal com resultados na área principal
- [x] secção `Lojas` com logos e links externos
- [x] estados vazios para secções ainda não implementadas

### Dados e suporte técnico

- [x] dados mock locais
- [x] importação manual de JSON
- [x] validação mínima de estruturas importadas
- [x] pesquisa por base local de códigos postais
- [x] estrutura documental preparada para evolução do pipeline

## O que já não deve ser considerado funcionalidade ativa

Estas partes existiram em fases anteriores, mas não devem ser tomadas como produto ativo da interface atual:

- comparação final por cabaz completo
- gestão visível do cabaz na área principal
- cálculo real dos cards de resumo
- totais finais por supermercado na UI principal

Se voltarem, devem regressar por desenho novo e não por reaproveitamento implícito.

## Estratégia de evolução

O projeto deve avançar em sprints curtos, com validação funcional no fim de cada fase.

## Sprint 1: Catálogo canónico inicial

### Objetivo

Definir o núcleo mínimo para arrancar com dados reais comparáveis.

### Entregáveis

- [x] proposta inicial de lista de produtos canónicos
- [x] proposta inicial de grupos de comparação
- [x] política inicial de packs e tamanhos
- [x] decisão inicial de matching conservador
- [x] validação final do catálogo inicial
- [x] validação final da política de marca própria vs. marca nacional
- [x] seleção inicial de produtos para a primeira loja piloto

### Estado atual do sprint

Existe já uma proposta de Sprint 1 documentada em:

- [docs/catalogo-canonico-sprint-1.md](./docs/catalogo-canonico-sprint-1.md)

Âmbito atual assumido:

- 24 produtos iniciais
- produtos embalados
- sem frescos nesta fase
- sem equivalência automática entre marca própria e marca nacional
- grupos de comparação estritos
- primeira seleção piloto já definida

### Intervenção necessária do utilizador

- nenhuma pendência estrutural no Sprint 1
- a próxima intervenção do utilizador deve acontecer no Sprint 2 ou na escolha da primeira loja piloto

## Sprint 2: Modelo de dados publicado

### Objetivo

Fechar o contrato dos JSON que o frontend vai consumir.

### Entregáveis

- [ ] `metadata.json`
- [ ] `stores.json`
- [ ] `store-locations.json`
- [ ] `catalog-products.json`
- [ ] `comparison-groups.json`
- [ ] `offers.json`

### Intervenção necessária do utilizador

- validar o modelo final antes de existir scraper real

## Sprint 3: Localização e lojas reais

### Objetivo

Preparar a lógica de proximidade com base em lojas físicas e código postal.

### Entregáveis

- [ ] definição das lojas piloto
- [ ] definição das localizações piloto
- [ ] regra de escolha das lojas mais próximas

### Intervenção necessária do utilizador

- escolher as primeiras localidades/zonas de teste

## Sprint 4: Regras de matching

### Objetivo

Definir como uma oferta scraped é associada a um produto canónico.

### Entregáveis

- [ ] aliases
- [ ] tokens obrigatórios
- [ ] tokens bloqueadores
- [ ] modelo de `confidenceScore`
- [ ] política de revisão manual para casos cinzentos

### Intervenção necessária do utilizador

- validar casos ambíguos
- decidir se o matching deve ser mais conservador ou mais permissivo

## Sprint 5: Pipeline MVP

### Objetivo

Montar a primeira versão funcional de dados reais, com âmbito controlado.

### Entregáveis

- [ ] 1 supermercado
- [ ] 1 localização
- [ ] 10 a 20 produtos
- [ ] geração de JSON publicados
- [ ] validação manual dos resultados

### Intervenção necessária do utilizador

- testar resultados reais e validar utilidade prática

## Sprint 6: Escala controlada

### Objetivo

Expandir a cobertura sem perder qualidade.

### Entregáveis

- [ ] novas lojas
- [ ] novas categorias
- [ ] histórico por snapshots
- [ ] melhoria do matching

### Intervenção necessária do utilizador

- priorizar lojas e categorias seguintes

## Fora de âmbito neste repositório

- [ ] backend próprio
- [ ] scraping real dentro do frontend
- [ ] chamadas diretas do browser aos supermercados
- [ ] APIs privadas
- [ ] autenticação
- [ ] sincronização remota de utilizadores

## Próximos passos imediatos

1. Fechar a validação do documento do Sprint 1.
2. Selecionar os primeiros produtos da loja piloto.
3. Fechar o contrato final dos JSON publicados.
4. Preparar o Sprint 2 com o modelo de dados publicado.

## Regra de gestão do roadmap

Sempre que uma secção da UI seja removida, redesenhada ou colocada em pausa, o roadmap deve ser corrigido de imediato para evitar documentação enganadora.
