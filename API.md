## API Reference

Base URL: `http://localhost:3000/api`

---

### Auth

#### POST `/auth/register`

- Descrição: Cria um novo usuário.
- Headers: `Content-Type: application/json`
- Body (JSON):
  - `name` (string, obrigatório)
  - `email` (string, obrigatório)
  - `password` (string, obrigatório)
- Exemplo (curl):
  ```bash
  curl -X POST http://localhost:3000/api/auth/register \
  	-H "Content-Type: application/json" \
  	-d '{"name":"John","email":"john@example.com","password":"secret"}'
  ```
- Resposta 201:
  ```json
  { "message": "Usuário criado com sucesso" }
  ```
- Possíveis status: 201, 409 (email já existe), 500

#### POST `/auth/login`

- Descrição: Autentica usuário e retorna token JWT + cookies httpOnly.
- Headers: `Content-Type: application/json`
- Body (JSON):
  - `email` (string, obrigatório)
  - `password` (string, obrigatório)
- Exemplo (curl):
  ```bash
  curl -X POST http://localhost:3000/api/auth/login \
  	-H "Content-Type: application/json" \
  	-d '{"email":"usuario@exemplo.com","password":"senha123"}'
  ```
- Resposta de Sucesso (200):
  ```json
  {
    "message": "Login realizado com sucesso",
    "userId": 1,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
  Cookies enviados:
  - `token` (httpOnly, 1h)
  - `user` (dados básicos do usuário, não httpOnly)
- Resposta de Erro (401):
  ```json
  { "message": "Senha incorreta" }
  ```
- Resposta de Erro (404):
  ```json
  { "message": "Usuário não encontrado" }
  ```
- Possíveis status: 200, 401, 404, 500

---

### Tasks

Headers de autenticação (todas as rotas abaixo):

- `Authorization: Bearer <token>` ou cookie `token` httpOnly.

#### GET `/tasks`

- Descrição: Lista tarefas do usuário autenticado.
- Exemplo (curl):
  ```bash
  curl -X GET http://localhost:3000/api/tasks \
  	-H "Authorization: Bearer <token>"
  ```
- Resposta 200 (array):
  ```json
  [
    {
      "id": 1,
      "title": "Task",
      "description": "desc",
      "status": "pending",
      "user_id": 1,
      "created_at": "...",
      "updated_at": "..."
    }
  ]
  ```
- Possíveis status: 200, 401, 500

#### POST `/tasks`

- Descrição: Cria tarefa para o usuário autenticado.
- Headers: `Content-Type: application/json` + auth
- Body (JSON):
  - `title` (string, obrigatório)
  - `description` (string, opcional)
  - `status` ("pending" | "in_progress" | "completed")
- Exemplo (curl):
  ```bash
  curl -X POST http://localhost:3000/api/tasks \
  	-H "Content-Type: application/json" \
  	-H "Authorization: Bearer <token>" \
  	-d '{"title":"Nova task","description":"Detalhes","status":"pending"}'
  ```
- Resposta 201:
  ```json
  {
    "id": 2,
    "title": "Nova task",
    "description": "Detalhes",
    "status": "pending",
    "user_id": 1,
    "created_at": "...",
    "updated_at": "..."
  }
  ```
- Possíveis status: 201, 400 (título obrigatório), 401, 500

#### PUT `/tasks/:id`

- Descrição: Atualiza tarefa do usuário autenticado.
- Path param: `id` (number)
- Headers: `Content-Type: application/json` + auth
- Body (JSON):
  - `title` (string, obrigatório)
  - `description` (string, opcional)
  - `status` ("pending" | "in_progress" | "completed")
- Exemplo (curl):
  ```bash
  curl -X PUT http://localhost:3000/api/tasks/1 \
  	-H "Content-Type: application/json" \
  	-H "Authorization: Bearer <token>" \
  	-d '{"title":"Atualizada","description":"Desc","status":"completed"}'
  ```
- Resposta 200:
  ```json
  {
    "id": 1,
    "title": "Atualizada",
    "status": "completed",
    "user_id": 1,
    "description": "Desc",
    "created_at": "...",
    "updated_at": "..."
  }
  ```
- Possíveis status: 200, 400 (título obrigatório), 401, 404 (task não encontrada/pertence a outro usuário), 500

#### DELETE `/tasks/:id`

- Descrição: Deleta tarefa do usuário autenticado.
- Path param: `id` (number)
- Exemplo (curl):
  ```bash
  curl -X DELETE http://localhost:3000/api/tasks/1 \
  	-H "Authorization: Bearer <token>"
  ```
- Resposta 200:
  ```json
  { "message": "Tarefa deletada com sucesso" }
  ```
- Possíveis status: 200, 400 (id inválido), 401, 404 (task não encontrada/pertence a outro usuário), 500

---

### Notas

- Autenticação aceita tanto header `Authorization: Bearer <token>` quanto cookie httpOnly `token`.
- Erros retornam JSON com `{ "message": "..." }` e o status correspondente.
