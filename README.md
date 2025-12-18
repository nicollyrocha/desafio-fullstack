## Descrição do projeto

Aplicação fullstack de gerenciamento de tarefas com autenticação JWT. Usuários podem registrar, logar e criar/editar/excluir tarefas com status. API em Next.js (App Router) usando Prisma + MySQL; frontend com Tailwind e componentes reutilizáveis; testes end-to-end e de API com Cypress.

## Tecnologias utilizadas

- Next.js (App Router) + React + TypeScript
- TailwindCSS
- Prisma ORM
- MySQL (docker-compose incluso)
- JSON Web Token (JWT) para autenticação (cookie httpOnly + header Bearer)
- Cypress para testes (UI e API)
- Docker/Docker Compose

## Pré-requisitos

- Next 16
- React 19
- Typescript
- Tailwind
- MySQL 8
- JWT

## Configuração do banco de dados

1. Suba o MySQL via Docker:

```bash
docker-compose up -d
```

2. Crie/aplique o schema (via Prisma):

```bash
yarn
yarn prisma migrate deploy
```

3. Opcional: o SQL bruto está em `database/schema.sql`.

## Variáveis de ambiente (.env)

Crie um arquivo `.env` na raiz com pelo menos (existe um .env.example, coloquei cada credencial separada também para garantir):

```
DATABASE_URL
JWT_SECRET
```

Adapte usuário/senha/host se não usar o compose padrão.

## Instalação

```bash
yarn
```

## Rodar o projeto localmente

1. Certifique-se do MySQL rodando e .env configurado.
2. Execute as migrações: `yarn prisma migrate deploy` (ou `db push` em dev).
3. Suba o app:

```bash
yarn dev
```

Acesse http://localhost:3000.

Observação: você pode rodar apenas o banco no Docker (`docker-compose up -d`) e o Next.js localmente com `yarn dev`, desde que o `.env` aponte para o host/porta corretos (ex.: `localhost:3306`).

## Rodar os testes

- Abrir Cypress UI: `yarn cypress open`
- Rodar em modo headless (UI + API):

```bash
yarn cypress run --spec "cypress/e2e/tests/**/*"
```

## Estrutura de pastas (principal)

- `src/app` — páginas e rotas API (App Router)
- `src/app/api/auth` — rotas de login/register
- `src/app/api/tasks` — CRUD de tarefas
- `src/app/dashboard` — UI de dashboard, tabela e formulários
- `src/lib` — db Prisma, middleware JWT e modelos
- `prisma/` — schema Prisma e migrations
- `cypress/` — testes UI/API
- `database/schema.sql` — criação manual do banco

## Decisões técnicas importantes

- App Router do Next.js para unificar frontend e API.
- Prisma com MySQL pela simplicidade de modelagem e migrações.
- Autenticação via JWT guardado em cookie httpOnly e suporte a header Bearer (getUserId trata ambos).
- Tailwind para componentes reutilizáveis e facilidade ao criá-los.
- Cypress para cobrir fluxos UI e endpoints REST, garantindo integrações ponta a ponta.

## Melhorias futuras

- Adicionar testes de integração para middleware e serviços.
- Observabilidade (logs estruturados e tracing) nas rotas API.
- Estados de carregamento/erro mais granulares na UI de tarefas.
