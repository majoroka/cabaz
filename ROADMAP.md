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
- [x] cards de resumo ligados ao cabaz e à comparação entre lojas
- [x] pesquisa principal com resultados na área principal
- [x] secção `Lojas` com logos e links externos
- [x] secção `Favoritos` com persistência local, pesquisa, filtros e adição rápida ao cabaz
- [x] secção `Cabaz` com listagem, quantidades, remoção e subtotal estimado
- [x] secção `Listagem` com fotos, resumo e impressão limpa
- [x] secção `Comparação` piloto com separadores por loja e total do cabaz
- [x] estados vazios para secções ainda não implementadas

### Dados e suporte técnico

- [x] primeira publicação manual real com 2 lojas, 40 ofertas e 35 produtos canónicos
- [x] leitura exclusiva dos JSON publicados em `public/data/`
- [x] remoção do fallback automático para mocks
- [x] pesquisa por base local de códigos postais
- [x] estrutura documental preparada para evolução do pipeline

## O que já não deve ser considerado funcionalidade ativa

Estas partes existiram em fases anteriores, mas não devem ser tomadas como produto ativo da interface atual:

- totais finais por supermercado na UI principal
- dados mock como fonte ativa da app
- importação manual de JSON pela interface
- `Categorias` e `Marcas` no menu antes de existir ingestão automática de dados reais

Se voltarem, devem regressar por desenho novo e não por reaproveitamento implícito.

## Secções previstas

Secções atuais ou planeadas para a navegação principal:

- `Painel`: pesquisa e resultados de produtos
- `Lojas`: grelha de lojas suportadas
- `Favoritos`: produtos guardados pelo utilizador para acesso rápido
- `Cabaz`: produtos selecionados para comparação/compra
- `Listagem`: lista simples, imprimível, gerada a partir do cabaz
- `Comparação`: comparação de preços e totais por loja

`Categorias` e `Marcas` ficam planeadas para uma fase posterior, depois de a app receber dados reais automáticos.

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
- [x] carregamento de `store-locations.json` no frontend
- [x] cálculo de distância estimada entre CP/localidade e lojas físicas piloto
- [x] ordenação dos separadores da comparação por proximidade quando há localização selecionada

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
- [x] matriz objetiva de comparação por tipo de produto

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
- [x] segunda loja piloto publicada manualmente com Pingo Doce
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
- [x] comparação multi-loja piloto com Continente e Pingo Doce
- [x] indicação visual de produtos exatos, equivalentes e em falta
- [x] tratamento de produtos sem preço disponível em lojas alternativas
- [x] lista de validação manual para equivalências detetadas no cabaz
- [x] definição documental das regras de `exato`, `equivalente`, `alternativa` e `em falta`
- [x] aplicação inicial da matriz objetiva de comparação à lógica automática do frontend
- [x] aceitação manual de alternativas com impacto controlado no total da loja
- [ ] normalização fina de equivalências entre formatos, marcas próprias e tamanhos diferentes

### Intervenção necessária do utilizador

- testar o fluxo `pesquisar -> adicionar -> abrir Cabaz -> editar quantidade/remover`
- validar se a leitura dos subtotais é clara antes de avançarmos para comparação multi-loja
- validar manualmente equivalências na secção `Comparação` e confirmar se os estados `Aprovar/Rever/Limpar` são claros

## Sprint 8: Favoritos e listagem imprimível

### Objetivo

Criar uma camada de utilização recorrente: guardar produtos favoritos e gerar uma listagem simples para consulta ou impressão.

### Entregáveis

- [x] secção `Favoritos` ligada ao menu lateral
- [x] ação para adicionar/remover produto dos favoritos a partir dos resultados
- [x] persistência de favoritos em `localStorage`
- [x] listagem inicial de favoritos
- [x] pesquisa e filtros dentro dos favoritos
- [x] ação para adicionar favoritos visíveis ao cabaz
- [x] secção `Listagem` ligada ao menu lateral
- [x] geração de listagem a partir do cabaz atual
- [x] fotos dos produtos na listagem
- [x] opção de impressão com layout limpo e sem elementos de navegação
- [x] estado vazio útil quando não existirem itens para listar

### Critérios de UX

- `Favoritos` não deve substituir o cabaz; deve servir para produtos recorrentes.
- `Listagem` deve ser mais simples do que `Cabaz`, sem comparação visual pesada.
- A impressão deve mostrar nome, quantidade, categoria, loja/preço quando existir e espaço para marcação manual.

### Intervenção necessária do utilizador

- validar visualmente a versão impressa em papel/PDF
- decidir se no futuro a listagem também deve aceitar favoritos selecionados, além do cabaz

## Sprint 9: Localização operacional

### Objetivo

Tornar a seleção de localização suficientemente fluida para suportar ordenação por proximidade sem depender da leitura completa da base nacional a cada interação.

### Entregáveis

- [x] pesquisa por código postal, localidade e rua
- [x] índice piloto local para códigos postais do prefixo `8365`
- [x] seleção visual por localidade com armazenamento do código postal associado
- [x] ordenação da comparação por proximidade quando existe localização selecionada
- [x] correção de fluidez da caixa de CP/localidade

### Intervenção necessária do utilizador

- validar pesquisas reais dentro do concelho de Silves antes de alargar a cobertura postal

## Sprint 10: Qualidade dos dados publicados

### Objetivo

Criar uma verificação local para impedir que novas publicações manuais ou futuras publicações automáticas quebrem referências entre ficheiros JSON.

### Entregáveis

- [x] script local `scripts/validate-published-data.mjs`
- [x] comando `npm run validate:data`
- [x] validação de contagens declaradas em `metadata.json`
- [x] validação de referências entre lojas, localizações, produtos, ofertas e equivalências
- [x] validação de existência local dos logos declarados em `stores.json`
- [x] documentação do processo no README e na arquitetura

### Intervenção necessária do utilizador

- correr `npm run validate:data` sempre que forem adicionados ou alterados produtos, lojas, localizações ou regras de equivalência

## Sprint 11: Preparação para scraper

### Objetivo

Preparar o contrato e a validação local para um scraper externo gerar dados sem introduzir scraping real neste repositório.

### Entregáveis

- [x] contrato operacional do scraper em `docs/scraper-contract.md`
- [x] definição dos ficheiros que o scraper deve gerar ou atualizar
- [x] regras conservadoras para equivalência, alternativa e bloqueio
- [x] reforço da validação de `offers.json`
- [x] reforço da validação de `catalog-products.json`
- [x] reforço da validação de `store-locations.json`
- [x] comando `npm run validate:data:report`
- [x] relatório local `reports/data-validation-report.json`, excluído do Git
- [x] pasta `staging/published-data/` para validar output externo antes da publicação
- [x] comando `npm run validate:staging`
- [x] decisão de arquitetura: scraper em repositório separado
- [x] documentação do repositório externo em `docs/external-scraper-repo.md`
- [x] workflow `Validate Data` para validar PRs que alterem `public/data/`
- [x] validação dos dados publicada também no workflow de deploy
- [x] template copiável para o futuro repositório `cabaz-data` em `examples/external-scraper-repo/`
- [x] guia operacional para criação do repositório `cabaz-data`

### Intervenção necessária do utilizador

- quando começarmos o scraper real, indicar a primeira loja/site a automatizar
- o output inicial do scraper deve ser testado primeiro em `staging/published-data/`, não diretamente em `public/data/`
- criar manualmente o repositório externo do scraper quando avançarmos para implementação real

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
- [x] publicação manual da segunda loja piloto com Pingo Doce
- [x] remoção do fallback automático para mocks após publicação real estável
- [x] localização física piloto do Pingo Doce em Armação de Pêra
- [x] regras controladas para distinguir equivalente, alternativa e produto em falta
- [x] ligação inicial da proximidade real por código postal/localidade na comparação
- [ ] validação manual final com dados reais no frontend

### Intervenção necessária do utilizador

- validar a publicação real no frontend depois de cada expansão relevante

## Sprint operacional: Equivalências controladas

### Objetivo

Evitar comparações erradas quando os produtos são semelhantes mas não equivalentes diretos.

### Entregáveis

- [x] ficheiro `equivalence-rules.json` para decisões explícitas entre produtos
- [x] suporte a relações `equivalent`, `alternative` e `blocked`
- [x] alternativas visíveis na comparação sem entrar no total do cabaz
- [x] validação manual de correspondências controladas na secção `Comparação`
- [x] regras iniciais para arroz basmati, arroz carolino, douradinhos, cápsulas de café, lombos de bacalhau e esparguete
- [ ] expandir regras à medida que entrarem novas lojas e produtos

### Critério de decisão

- `Exato`: mesmo `productId`
- `Equivalente`: mesmo `comparisonGroup` ou regra explícita `equivalent`; entra no total
- `Alternativa`: regra explícita `alternative`; aparece como sugestão, mas fica fora do total
- `Em falta`: sem produto exato, equivalente ou alternativa permitida

## Sprint 12: Automação diária assistida do `cabaz-data`

### Objetivo

Passar do fluxo manual atual para execução diária automática do `cabaz-data`, mantendo PR automático para `cabaz` e validação obrigatória antes de publicar.

### Entregáveis

- [x] estratégia de automação diária documentada em `docs/automacao-diaria-cabaz-data.md`
- [x] janela horária recomendada documentada com nota sobre UTC e horário de verão
- [x] atualização do template `examples/external-scraper-repo/.github/workflows/scrape.yml`
- [x] recomendação explícita de manter PR automático em vez de `push` direto
- [ ] ativar `schedule` no repositório real `cabaz-data`
- [ ] observar pelo menos 7 dias de estabilidade
- [ ] decidir se o fluxo fica em PR automático permanente ou se evolui para auto-merge

### Intervenção necessária do utilizador

- ativar a agenda diária no repositório real `cabaz-data`
- validar os primeiros PRs automáticos abertos por agenda
- confirmar se a janela escolhida é aceitável durante verão e inverno

## Fora de âmbito neste repositório

- [ ] backend próprio
- [ ] scraping real dentro do frontend
- [ ] chamadas diretas do browser aos supermercados
- [ ] APIs privadas
- [ ] autenticação
- [ ] sincronização remota de utilizadores

## Próximos passos imediatos

1. Validar a comparação Continente vs. Pingo Doce com cabazes pequenos.
2. Correr `npm run validate:data:report` antes de qualquer nova publicação em `public/data/`.
3. Rever visualmente as novas alternativas controladas e decidir se alguma deve passar a equivalente.
4. Validar a versão imprimível da secção `Listagem`.
5. Definir o primeiro alvo do scraper externo, mantendo o scraper fora deste repositório.

## Regra de gestão do roadmap

Sempre que uma secção da UI seja removida, redesenhada ou colocada em pausa, o roadmap deve ser corrigido de imediato para evitar documentação enganadora.
