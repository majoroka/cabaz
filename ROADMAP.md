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

- [ ] lista inicial de produtos canónicos
- [ ] grupos de comparação
- [ ] regras de marca própria vs. marca nacional
- [ ] política de packs e tamanhos
- [ ] campos obrigatórios de catálogo

### Proposta atual

Arrancar com um catálogo curto e conservador, focado em produtos embalados:

- laticínios e ovos
- mercearia
- pequeno-almoço e snacks
- bebidas
- limpeza essencial

### Intervenção necessária do utilizador

- validar a lista inicial de produtos
- decidir o nível de rigor da comparação
- decidir se a fase inicial inclui equivalência entre marca própria e marca nacional

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

1. Fechar o Sprint 1 com a lista inicial de produtos canónicos.
2. Traduzir essa lista para grupos de comparação.
3. Registar as regras mínimas de matching por produto.
4. Só depois fechar o contrato final dos JSON.

## Regra de gestão do roadmap

Sempre que uma secção da UI seja removida, redesenhada ou colocada em pausa, o roadmap deve ser corrigido de imediato para evitar documentação enganadora.
