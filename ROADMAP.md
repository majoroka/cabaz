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
- [x] secção `Cabaz` com listagem, quantidades, remoção e subtotal estimado
- [x] secção `Comparação` piloto com separadores por loja e total do cabaz
- [x] estados vazios para secções ainda não implementadas

### Dados e suporte técnico

- [x] primeira publicação manual real com 20 produtos piloto
- [x] leitura exclusiva dos JSON publicados em `public/data/`
- [x] remoção do fallback automático para mocks
- [x] pesquisa por base local de códigos postais
- [x] estrutura documental preparada para evolução do pipeline

## O que já não deve ser considerado funcionalidade ativa

Estas partes existiram em fases anteriores, mas não devem ser tomadas como produto ativo da interface atual:

- comparação final por cabaz completo
- comparação multi-loja real a partir do cabaz
- cálculo completo dos cards de resumo por supermercado
- totais finais por supermercado na UI principal
- dados mock como fonte ativa da app
- importação manual de JSON pela interface

Se voltarem, devem regressar por desenho novo e não por reaproveitamento implícito.

## Secções previstas

Secções atuais ou planeadas para a navegação principal:

- `Painel`: pesquisa e resultados de produtos
- `Lojas`: grelha de lojas suportadas
- `Categorias`: navegação por categoria de produto
- `Marcas`: navegação por marca
- `Favoritos`: produtos guardados pelo utilizador para acesso rápido
- `Cabaz`: produtos selecionados para comparação/compra
- `Listagem`: lista simples, imprimível, gerada a partir do cabaz
- `Comparação`: comparação de preços e totais por loja

`Favoritos` e `Listagem` ainda não estão implementadas na UI. Devem entrar depois de estabilizar o fluxo do `Cabaz`, porque dependem diretamente dos produtos guardados pelo utilizador.

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
- [x] primeira publicação real de dados
- [x] expansão manual para 20 produtos piloto
- [x] remoção do fallback automático para mocks
- [ ] validação manual final de resultados reais

### Intervenção necessária do utilizador

- validar visualmente a publicação real no frontend sempre que forem adicionados novos produtos

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

## Sprint 7: Cabaz real e fluxo de comparação

### Objetivo

Transformar a ação de adicionar produtos num cabaz utilizável e persistente, preparando a futura comparação entre lojas.

### Entregáveis

- [x] secção `Cabaz` ligada ao menu lateral
- [x] listagem dos produtos adicionados a partir dos resultados
- [x] edição rápida de quantidades
- [x] remoção de itens do cabaz
- [x] cálculo de subtotal por item
- [x] total estimado simples com base nos preços atualmente disponíveis
- [x] secção `Comparação` piloto a partir dos itens do cabaz
- [x] separadores ordenados por total, preparados para várias lojas
- [ ] comparação multi-loja real quando existirem ofertas de mais do que uma loja
- [ ] tratamento de produtos sem preço disponível em lojas alternativas

### Intervenção necessária do utilizador

- testar o fluxo `pesquisar -> adicionar -> abrir Cabaz -> editar quantidade/remover`
- validar se a leitura dos subtotais é clara antes de avançarmos para comparação multi-loja

## Sprint 8: Favoritos e listagem imprimível

### Objetivo

Criar uma camada de utilização recorrente: guardar produtos favoritos e gerar uma listagem simples para consulta ou impressão.

### Entregáveis

- [ ] secção `Favoritos` ligada ao menu lateral
- [ ] ação para adicionar/remover produto dos favoritos a partir dos resultados
- [ ] persistência de favoritos em `localStorage`
- [ ] listagem de favoritos com pesquisa/filtro simples
- [ ] secção `Listagem` ligada ao menu lateral
- [ ] geração de listagem a partir do cabaz atual
- [ ] opção de impressão com layout limpo e sem elementos de navegação
- [ ] estado vazio útil quando não existirem itens para listar

### Critérios de UX

- `Favoritos` não deve substituir o cabaz; deve servir para produtos recorrentes.
- `Listagem` deve ser mais simples do que `Cabaz`, sem comparação visual pesada.
- A impressão deve mostrar nome, quantidade, categoria, loja/preço quando existir e espaço para marcação manual.

### Intervenção necessária do utilizador

- validar se a listagem deve ser gerada apenas pelo cabaz ou também permitir favoritos selecionados
- validar campos necessários na versão impressa

## Fase operacional seguinte: Primeira publicação real

### Objetivo

Passar da definição conceptual para a primeira publicação real de dados com âmbito mínimo.

### Entregáveis

- [x] plano operacional inicial da primeira publicação real
- [x] definição da loja Continente piloto no concelho de Silves
- [x] materialização inicial dos ficheiros publicados mínimos
- [x] template manual inicial para `offers.json`
- [x] primeira publicação real de dados
- [x] expansão manual para 20 produtos piloto
- [x] remoção do fallback automático para mocks após publicação real estável
- [ ] validação manual final com dados reais no frontend

### Intervenção necessária do utilizador

- validar a publicação real no frontend depois de cada expansão relevante

## Fora de âmbito neste repositório

- [ ] backend próprio
- [ ] scraping real dentro do frontend
- [ ] chamadas diretas do browser aos supermercados
- [ ] APIs privadas
- [ ] autenticação
- [ ] sincronização remota de utilizadores

## Próximos passos imediatos

1. Validar o Sprint 7 no frontend com os 20 produtos reais piloto.
2. Afinar a leitura da secção `Cabaz`, se necessário.
3. Desenhar a secção `Favoritos`.
4. Desenhar a secção `Listagem` com impressão.
5. Expandir a comparação quando existirem dados multi-loja reais.
6. Preparar a expansão controlada de produtos quando a base piloto estiver validada.

## Regra de gestão do roadmap

Sempre que uma secção da UI seja removida, redesenhada ou colocada em pausa, o roadmap deve ser corrigido de imediato para evitar documentação enganadora.
