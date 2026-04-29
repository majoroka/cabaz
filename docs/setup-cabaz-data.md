# Setup do Repositório `cabaz-data`

## Objetivo

Criar um repositório separado para o scraper e publicação automática de dados, mantendo o repositório `cabaz` apenas como frontend estático e destino final dos JSON publicados.

Nome recomendado:

```text
cabaz-data
```

Alternativa:

```text
cabaz-scraper
```

## Decisão recomendada

Para começar:

- criar o repositório como privado
- usar `cabaz-data` como nome
- começar sem agendamento automático
- correr o workflow apenas manualmente com `workflow_dispatch`
- abrir PRs para `cabaz`, nunca commits diretos para `main`

## Passo 1: Criar o repositório no GitHub

No GitHub:

1. Clicar em `New repository`.
2. Repository name: `cabaz-data`.
3. Visibility: `Private`.
4. Não adicionar README, `.gitignore` ou licença pelo GitHub.
5. Criar o repositório.

Depois de criado, copiar o URL do repositório.

## Passo 2: Criar o repositório local

Na máquina local, fora do repositório `cabaz`:

```bash
cd /Users/mariocabano/Documents/GitHub
mkdir cabaz-data
cd cabaz-data
git init
```

Copiar o template preparado no `cabaz`:

```bash
cp -R /Users/mariocabano/Documents/GitHub/cabaz/examples/external-scraper-repo/. .
```

Instalar dependências:

```bash
npm install
```

Fazer primeiro commit:

```bash
git add .
git commit -m "Criar estrutura inicial do scraper"
```

Ligar ao remoto, substituindo o URL pelo do repositório criado:

```bash
git remote add origin <URL_DO_REPOSITORIO_CABAZ_DATA>
git branch -M main
git push -u origin main
```

## Passo 3: Configurar token para abrir PR no `cabaz`

No GitHub, criar um token fine-grained com acesso ao repositório `cabaz`.

Permissões mínimas recomendadas:

- Contents: Read and write
- Pull requests: Read and write
- Metadata: Read

Depois, no repositório `cabaz-data`:

1. Ir a `Settings`.
2. Ir a `Secrets and variables`.
3. Ir a `Actions`.
4. Criar novo secret:

```text
CABAZ_DATA_PR_TOKEN
```

5. Colar o token.

## Passo 4: Primeiro teste manual

O workflow ainda não deve estar agendado.

No repositório `cabaz-data`:

1. Ir ao separador `Actions`.
2. Abrir o workflow `Atualizar dados do Cabaz`.
3. Clicar em `Run workflow`.

Neste momento, o workflow deve falhar porque o scraper real ainda não está implementado. Isto é esperado e serve como proteção para evitar publicar dados vazios.

## Passo 4B: Ativação posterior da agenda diária

Só depois de o scraper estar estável e de o PR automático já estar validado manualmente, deve ser ativada a agenda.

Recomendação prática inicial:

```text
0 3 * * *
```

GitHub Actions usa UTC. Isto corresponde a:

- `04:00` em Portugal continental durante o horário de verão
- `03:00` em Portugal continental durante o horário de inverno

O plano por fases está em [automacao-diaria-cabaz-data.md](./automacao-diaria-cabaz-data.md).

## Passo 5: Implementação mínima posterior

Depois do repositório estar criado, o próximo sprint deve implementar apenas:

- 1 coletor
- 1 loja
- 2 a 5 produtos
- output em `data/published/`
- validação local do output
- PR automático para `cabaz`

Loja recomendada para começar:

```text
Continente Bom Dia Armação de Pêra
```

Produtos recomendados para o primeiro teste:

- Arroz basmati Caçarola 500g
- Leite UHT meio-gordo Continente 1L

## Critério de sucesso

O primeiro ciclo só fica validado quando:

- o workflow corre manualmente no `cabaz-data`
- o scraper gera JSON completos em `data/published/`
- o workflow abre PR para `cabaz`
- o PR no `cabaz` passa no workflow `Validate Data`
- a app continua a fazer build
- os produtos aparecem corretamente na pesquisa da app

## O que não fazer nesta fase

- não ativar `schedule`
- não adicionar várias lojas de uma vez
- não instalar Playwright antes de confirmar se fetch/parsing simples chega
- não fazer commit direto para `main` do `cabaz`
- não misturar dados raw com `public/data/`
