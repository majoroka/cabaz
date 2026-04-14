# Roadmap do Projeto Cabaz

## Estado atual

O projeto já tem uma base funcional de frontend estático pronta para desenvolvimento incremental e publicação em GitHub Pages.

## Funcionalidades implementadas

### Base técnica

- [x] scaffold com Vite
- [x] build de produção com `npm run build`
- [x] arranque local com `npm run dev`
- [x] configuração de `base path` para GitHub Pages
- [x] workflow GitHub Actions para deploy automático
- [x] favicon, título da página e metadados básicos

### Gestão de cabaz

- [x] adicionar item ao cabaz
- [x] editar item existente
- [x] remover item
- [x] campos `name`, `quantity`, `category`, `preferredBrand` e `notes`
- [x] persistência do cabaz em `localStorage`

### Comparação e filtros

- [x] filtro por supermercado
- [x] filtro por categoria
- [x] pesquisa textual
- [x] alternância entre todos os resultados e melhor resultado por item
- [x] destaque visual do melhor preço por item
- [x] cálculo do total estimado por supermercado
- [x] destaque do supermercado com total mais baixo

### Dados

- [x] dados mock realistas para cabaz, resultados e lojas
- [x] estrutura preparada para futura exportação por scraper local
- [x] botão para carregar dados de exemplo
- [x] botão para repor demo
- [x] importação manual de ficheiros JSON
- [x] validação mínima com mensagens de erro amigáveis

### Interface

- [x] dashboard com cartões resumo
- [x] área de gestão do cabaz
- [x] tabela principal de comparação
- [x] layout responsivo para desktop e mobile
- [x] estados vazios úteis

### Documentação

- [x] README em português europeu
- [x] documentação do formato de dados
- [x] exemplos de ficheiros importáveis
- [x] documento de arquitetura
- [x] roadmap funcional

## Próximas funcionalidades recomendadas

### Curto prazo

- [ ] suportar importação de um ficheiro único com `basket`, `results` e `stores`
- [ ] permitir exportar o estado atual para JSON
- [ ] adicionar ordenação na tabela por preço, loja e data de atualização
- [ ] mostrar indicadores de cobertura por item e por supermercado
- [ ] destacar confiança baixa de matching
- [ ] melhorar feedback visual durante importação de ficheiros

### Médio prazo

- [ ] guardar filtros e preferências de visualização em `localStorage`
- [ ] criar modo de comparação por cabaz completo vs. por item individual
- [ ] permitir duplicar itens do cabaz
- [ ] suportar agrupamento por categoria na tabela
- [ ] adicionar testes unitários aos utilitários
- [ ] adicionar linting e formatação automática

### Longo prazo

- [ ] criar adaptadores para múltiplos formatos de ficheiros gerados por scrapers
- [ ] suportar histórico de atualizações por produto
- [ ] permitir múltiplos cabazes guardados localmente
- [ ] criar métricas de qualidade de matching
- [ ] introduzir comparação temporal de preços

## Fora de âmbito neste repositório

- [ ] backend próprio
- [ ] scraping real de supermercados
- [ ] integrações com APIs privadas
- [ ] autenticação de utilizadores
- [ ] sincronização remota de dados

## Critérios para considerar a v1 completa

- [ ] importação e exportação de dados sem fricção
- [ ] testes mínimos para lógica crítica
- [ ] tabela com ordenação robusta
- [ ] documentação estabilizada do contrato JSON
- [ ] deploy público validado em GitHub Pages

## Notas de gestão

- Este roadmap deve ser atualizado sempre que uma funcionalidade muda de estado.
- O documento serve para distinguir claramente o que já está pronto do que ainda é intenção.
- Sempre que surgir uma nova necessidade, deve ficar registada aqui antes de se espalhar pelo README ou por issues soltas.

