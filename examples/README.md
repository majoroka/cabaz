# Exemplos de publicação

Esta pasta contém exemplos de apoio à publicação manual de dados reais. A interface já não usa importação manual nem dados mock no runtime.

Ficheiros incluídos:

- `published/offers.continente-bom-dia-armacao-de-pera.template.json`

Num fluxo futuro, um scraper local poderá gerar ficheiros publicados para `public/data/`. A app limita-se a ler esses JSON estáticos sem backend.

A subpasta `published/` mantém templates auxiliares, incluindo o campo opcional `notes` para contexto comercial relevante.

Antes de copiar dados gerados por scraper para publicação, colocar os JSON em `staging/published-data/` e correr:

```bash
npm run validate:staging
```

Depois de copiar os dados aprovados para `public/data/`, correr:

```bash
npm run validate:data:report
```

O contrato esperado está em [../docs/scraper-contract.md](../docs/scraper-contract.md).
