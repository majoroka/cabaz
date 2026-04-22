# Exemplos de publicação real

Esta pasta contém ficheiros de apoio para a primeira publicação real de dados.

Objetivo:

- preparar ficheiros manuais ou semi-manuais antes de existir um pipeline automático completo
- facilitar a validação da estrutura publicada em `public/data/`

## Ficheiros incluídos

- `offers.continente-bom-dia-armacao-de-pera.template.json`

## Como usar

1. preencher o template com dados reais da loja piloto
2. validar manualmente nomes, preços, URLs, imagens, notas comerciais e datas
3. copiar o conteúdo final para `staging/published-data/offers.json`, juntamente com os restantes JSON exigidos pelo contrato
4. correr `npm run validate:staging`
5. copiar os ficheiros aprovados para `public/data/`
6. correr `npm run validate:data:report`
7. testar a app localmente

## Nota importante

O template não deve ser usado diretamente como `public/data/offers.json` sem ser preenchido, porque contém placeholders textuais propositados.

O contrato para dados gerados por scraper está em [../../docs/scraper-contract.md](../../docs/scraper-contract.md).
