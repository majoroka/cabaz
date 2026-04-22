# Staging de Dados Publicados

Esta pasta serve para testar output gerado por um scraper externo antes de substituir os ficheiros em `public/data/`.

## Como usar

1. Copiar os JSON gerados pelo scraper para `staging/published-data/`.
2. Garantir que a pasta contém o mesmo contrato de ficheiros esperado em `public/data/`.
3. Correr:

```bash
npm run validate:staging
```

4. Se a validação passar, copiar manualmente os ficheiros aprovados para `public/data/`.
5. Correr novamente:

```bash
npm run validate:data:report
```

## Notas

- Os JSON em `staging/published-data/` não são versionados.
- Esta pasta não é lida pela app.
- O scraper real deve continuar fora deste repositório.
