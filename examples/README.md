# Exemplos de importação

Esta pasta contém exemplos simples de ficheiros JSON prontos a importar manualmente pela interface.

Ficheiros incluídos:

- `basket.import.json`
- `stores.import.json`
- `results.import.json`
- `published/offers.continente-bom-dia-armacao-de-pera.template.json`

Para dados mock mais completos, consulte também:

- `src/data/basket.example.json`
- `src/data/stores.json`
- `src/data/results.example.json`

Num fluxo futuro, um scraper local poderá gerar ficheiros com este formato para serem lidos pelo frontend sem qualquer backend.

Para a fase de transição para dados reais, existe também uma subpasta `published/` com templates de publicação manual, incluindo o campo opcional `notes` para contexto comercial relevante.
