# Automação Diária do `cabaz-data`

## Objetivo

Preparar a passagem do fluxo atual, manual e assistido, para uma execução diária estável do repositório `cabaz-data`, mantendo o repositório `cabaz` como destino final dos JSON publicados.

O objetivo nesta fase não é publicar sem controlo. O objetivo é:

- correr o scraper automaticamente todos os dias
- validar o output antes de qualquer publicação
- abrir PR automático para `cabaz`
- manter supervisão humana durante uma janela inicial de estabilidade

## Princípios

- sem `push` direto para `main` do `cabaz`
- publicação por PR pequeno e auditável
- validação obrigatória antes de abrir PR
- preservação dos últimos dados válidos quando uma loja falhar
- escalada gradual da automação

## Janela horária recomendada

GitHub Actions usa `cron` em UTC.

Se a intenção for correr por volta das `04:00` em Portugal continental:

- no verão, `04:00` locais correspondem a `03:00` UTC
- no inverno, `04:00` locais correspondem a `04:00` UTC

Recomendação prática para já:

```text
0 3 * * *
```

Isto executa:

- `04:00` locais durante o horário de verão
- `03:00` locais durante o horário de inverno

Se mais tarde for necessário manter `04:00` locais de forma rigorosa durante todo o ano, isso deve ser tratado como uma afinação operacional separada.

## Sprint 12A: Agenda diária assistida

### Objetivo

Ativar a execução diária do `cabaz-data`, mantendo PR automático para `cabaz`.

### Entregáveis

- workflow com `workflow_dispatch` e `schedule`
- execução diária com `cron` definido
- `concurrency` para evitar corridas duplicadas
- validação local do output do scraper antes de copiar para `cabaz`
- validação no `cabaz` com `npm run validate:data` e `npm run build`
- abertura automática de PR para `cabaz`

### Critério de sucesso

- o workflow corre automaticamente sem intervenção manual
- se não houver alterações reais, não abre PR
- se houver alterações válidas, abre PR pequeno apenas com `public/data/*.json`
- o PR passa no workflow `Validate Data` do `cabaz`

### Intervenção necessária do utilizador

- ativar o `schedule` no repositório real `cabaz-data`
- confirmar o primeiro PR gerado por agenda
- fazer merge apenas depois de validar os dados no frontend

## Sprint 12B: Janela de estabilidade

### Objetivo

Observar o comportamento da automação diária antes de reduzir supervisão.

### Entregáveis

- período mínimo de observação de 7 dias
- registo de falhas por loja
- verificação de duplicação de PRs
- verificação de casos sem alterações
- confirmação de que os totais e correspondências continuam coerentes no frontend

### Critério de sucesso

- pelo menos 7 execuções consecutivas sem regressões críticas
- nenhum PR com dados vazios ou estruturalmente inválidos
- nenhuma abertura repetida de PR concorrente para a mesma execução

### Intervenção necessária do utilizador

- validar no `cabaz` os PRs abertos automaticamente
- sinalizar lojas com HTML instável ou preços incoerentes

## Sprint 12C: Automação reforçada

### Objetivo

Decidir se o fluxo deve continuar com PR manual ou evoluir para um modo ainda mais automático.

### Opções

1. Manter PR automático como modo permanente
2. Ativar auto-merge apenas quando todas as validações passarem
3. Evoluir mais tarde para publicação direta, apenas se a estabilidade for muito alta

### Recomendação

Manter durante bastante tempo a opção `PR automático`.

É o melhor compromisso entre:

- automação diária
- rastreabilidade
- capacidade de travar uma publicação errada

## Salvaguardas recomendadas no workflow

- `concurrency` por workflow para evitar overlap
- `timeout-minutes` por job
- falha explícita se `npm run scrape` ou `npm run validate:output` falharem
- validação do frontend antes de abrir PR
- saída limpa sem PR quando não existirem alterações

## Ordem recomendada de ativação

1. manter o estado atual manual validado
2. atualizar o template e a documentação
3. ativar `schedule` no `cabaz-data`
4. observar durante 7 dias
5. decidir se o PR automático fica definitivo ou se se avança para auto-merge

## Resultado esperado

No fim desta fase, o projeto deve ficar assim:

```text
cabaz-data
  -> corre automaticamente todos os dias
  -> valida dados
  -> abre PR para cabaz

cabaz
  -> valida PR
  -> publica para GitHub Pages após merge
```
