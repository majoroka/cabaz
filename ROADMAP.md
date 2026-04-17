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

- [x] proposta inicial de `metadata.json`
- [x] proposta inicial de `stores.json`
- [x] proposta inicial de `store-locations.json`
- [x] proposta inicial de `catalog-products.json`
- [x] proposta inicial de `comparison-groups.json`
- [x] proposta inicial de `offers.json`
- [x] validação final do contrato de ficheiros
- [x] validação final dos campos mínimos e opcionais

### Intervenção necessária do utilizador

- nenhuma pendência estrutural no Sprint 2
- a próxima intervenção do utilizador deve acontecer no Sprint 3

## Sprint 3: Localização e lojas reais

### Objetivo

Preparar a lógica de proximidade com base em lojas físicas e código postal.

### Entregáveis

- [x] proposta inicial de loja piloto
- [x] proposta inicial de localidade/zona piloto
- [x] proposta inicial de regra de proximidade
- [x] validação final da insígnia piloto
- [x] validação final da zona/localidade piloto
- [x] validação final da regra `top 1` vs. múltiplas lojas

### Intervenção necessária do utilizador

- nenhuma pendência estrutural no Sprint 3
- a próxima intervenção do utilizador deve acontecer no Sprint 4

## Sprint 4: Regras de matching

### Objetivo

Definir como uma oferta scraped é associada a um produto canónico.

### Entregáveis

- [x] proposta inicial de aliases e normalização
- [x] proposta inicial de tokens obrigatórios
- [x] proposta inicial de tokens bloqueadores
- [x] proposta inicial de `confidenceScore`
- [x] proposta inicial de política de revisão manual
- [x] validação final das regras gerais
- [x] validação final das regras dos 10 produtos piloto

### Intervenção necessária do utilizador

- nenhuma pendência estrutural no Sprint 4
- a próxima intervenção do utilizador deve acontecer no Sprint 5

## Sprint 5: Pipeline MVP

### Objetivo

Montar a primeira versão funcional de dados reais, com âmbito controlado.

### Entregáveis

- [x] proposta inicial de âmbito do MVP
- [x] proposta inicial de artefactos publicados
- [x] proposta inicial de critério de sucesso
- [x] proposta inicial de validação manual
- [ ] primeira publicação real de dados
- [ ] validação manual de resultados reais

### Intervenção necessária do utilizador

- validar a proposta documentada do Sprint 5
- testar resultados reais quando existir a primeira publicação

## Sprint 6: Escala controlada

### Objetivo

Expandir a cobertura sem perder qualidade.

### Entregáveis

- [x] proposta inicial de ordem de expansão
- [x] proposta inicial de novas lojas
- [x] proposta inicial de novas categorias
- [x] proposta inicial de histórico por snapshots
- [x] proposta inicial de evolução do matching
- [x] validação inicial do concelho de Silves como primeira área de expansão
- [ ] validação final da ordem de expansão
- [ ] validação final das prioridades de lojas e regiões

### Intervenção necessária do utilizador

- validar a proposta documentada do Sprint 6
- confirmar a ordem de expansão recomendada a partir do concelho de Silves

## Fase operacional seguinte: Primeira publicação real

### Objetivo

Passar da definição conceptual para a primeira publicação real de dados com âmbito mínimo.

### Entregáveis

- [x] plano operacional inicial da primeira publicação real
- [ ] definição da loja Continente piloto no concelho de Silves
- [x] materialização inicial dos ficheiros publicados mínimos
- [ ] primeira publicação real de dados
- [ ] validação manual com dados reais no frontend

### Intervenção necessária do utilizador

- confirmar a loja piloto concreta
- validar a primeira publicação real quando existir

## Fora de âmbito neste repositório

- [ ] backend próprio
- [ ] scraping real dentro do frontend
- [ ] chamadas diretas do browser aos supermercados
- [ ] APIs privadas
- [ ] autenticação
- [ ] sincronização remota de utilizadores

## Próximos passos imediatos

1. Fechar a validação do documento do Sprint 5.
2. Fechar a validação do documento do Sprint 6 com o concelho de Silves como primeira área de escala.
3. Confirmar a loja piloto concreta para arrancar a primeira publicação real.
4. Preparar os ficheiros publicados mínimos para integração com dados reais.

## Regra de gestão do roadmap

Sempre que uma secção da UI seja removida, redesenhada ou colocada em pausa, o roadmap deve ser corrigido de imediato para evitar documentação enganadora.
