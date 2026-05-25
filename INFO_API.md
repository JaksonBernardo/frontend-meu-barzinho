# Documentação da API - Meu Barzinho

Esta documentação detalha as rotas disponíveis na API para auxiliar no desenvolvimento do frontend.

## Autenticação

### Login
- **Rota:** `POST /api/v1/auth/login`
- **Corpo da Requisição:**
  - `email` (string, obrigatório)
  - `password` (string, obrigatório)
- **Resposta:** `LoginPublic` (nome, email, company_id, mensagem)
- **Nota:** Define um cookie `access_token` (HTTPOnly).

### Logout
- **Rota:** `POST /api/v1/auth/logout`
- **Resposta:** Mensagem de confirmação.
- **Nota:** Remove o cookie `access_token`.

### Verificar Sessão
- **Rota:** `GET /api/v1/auth/login/me`
- **Resposta:** `LoginPublic` do usuário logado.

---

## Categorias

### Criar Categoria
- **Rota:** `POST /api/v1/categories/`
- **Corpo da Requisição:**
  - `name` (string, obrigatório)
  - `company_id` (int, obrigatório)
- **Resposta:** `CategoryPublic`

### Listar Categorias
- **Rota:** `GET /api/v1/categories/`
- **Query Params:**
  - `limit` (int, default: 10, min: 1, max: 20)
  - `offset` (int, default: 0, min: 0)
  - `search` (string, opcional): Filtra por nome (case-insensitive).
- **Resposta:** `CategoryList` (items, total, limit, offset, search)

### Obter Categoria
- **Rota:** `GET /api/v1/categories/{category_id}`
- **Resposta:** `CategoryPublic`

### Atualizar Categoria
- **Rota:** `PATCH /api/v1/categories/{category_id}`
- **Corpo da Requisição:**
  - `name` (string, opcional)
- **Resposta:** `CategoryPublic`

### Excluir Categoria
- **Rota:** `DELETE /api/v1/categories/{category_id}`
- **Status:** 204 No Content

---

## Clientes

### Criar Cliente
- **Rota:** `POST /api/v1/clients/`
- **Corpo da Requisição:**
  - `name` (string, obrigatório)
  - `type_client` (enum: `PF`, `PJ`, opcional)
  - `document` (string, opcional): Sanitizado automaticamente (remove . - /).
  - `email` (email, opcional)
  - `address` (string, opcional)
  - `whatsapp` (string, opcional)
  - `company_id` (int, obrigatório)
- **Resposta:** `ClientPublic`

### Listar Clientes
- **Rota:** `GET /api/v1/clients/`
- **Query Params:**
  - `limit` (int, default: 10, min: 1, max: 20)
  - `offset` (int, default: 0, min: 0)
  - `search` (string, opcional)
- **Resposta:** `ClientList`

---

## Empresas (Registro)

### Registrar Empresa e Admin
- **Rota:** `POST /api/v1/companies/`
- **Corpo da Requisição:**
  - `name` (string, obrigatório)
  - `document` (string, opcional)
  - `type_doc` (enum: `PF`, `PJ`, obrigatório)
  - `address` (string, opcional)
  - `plan_id` (int, obrigatório)
  - `admin_user` (objeto, obrigatório):
    - `name` (string, opcional)
    - `email` (email, obrigatório)
    - `password` (string, obrigatório)
- **Resposta:** `CompanyPublic`

---

## Estoque

### Entrada de Mercadoria
- **Rota:** `POST /api/v1/stock/entries/`
- **Corpo da Requisição:**
  - `item_id` (int, obrigatório)
  - `price` (decimal, min: 0, obrigatório)
  - `qtd` (int, min: 1, obrigatório)
  - `date_entry` (date: YYYY-MM-DD, obrigatório)
  - `hour` (time: HH:MM:SS, obrigatório)
  - `company_id` (int, obrigatório)
- **Resposta:** `EntryPublic`

### Saída de Mercadoria
- **Rota:** `POST /api/v1/stock/exits/`
- **Corpo da Requisição:**
  - `item_id` (int, obrigatório)
  - `price` (decimal, min: 0, obrigatório)
  - `qtd` (int, min: 1, obrigatório)
  - `date_exit` (date: YYYY-MM-DD, obrigatório)
  - `hour` (time: HH:MM:SS, obrigatório)
  - `company_id` (int, obrigatório)
- **Resposta:** `ExitPublic`

### Relatório de Movimentação de Estoque
- **Rota:** `GET /api/v1/stock/report/`
- **Query Params:**
  - `start_date` (date: YYYY-MM-DD, opcional)
  - `end_date` (date: YYYY-MM-DD, opcional)
- **Resposta:** `StockReport` (items, total, limit, offset)

---

## Itens (Produtos)

### Criar Item
- **Rota:** `POST /api/v1/items/`
- **Corpo da Requisição:**
  - `name` (string, obrigatório)
  - `category_id` (int, obrigatório)
  - `price` (decimal, min: >0, obrigatório)
  - `stock` (int, min: 0, obrigatório)
  - `company_id` (int, obrigatório)
- **Resposta:** `ItemPublic`

### Listar Itens
- **Rota:** `GET /api/v1/items/`
- **Query Params:**
  - `limit` (int, default: 10, min: 1, max: 20)
  - `offset` (int, default: 0, min: 0)
  - `search` (string, opcional): Filtra por nome (case-insensitive).
- **Resposta:** `ItemList` (items, total, limit, offset, search)

---

## Pedidos (Orders)

### Criar Pedido
- **Rota:** `POST /api/v1/orders/`
- **Exemplo de JSON (Request):**
  ```json
  {
    "number": 101,
    "description": "Pedido de balcão",
    "status": "ABERTO",
    "type_discount": "FIXO",
    "discount": 5.00,
    "payment_form": "PIX",
    "company_id": 1
  }
  ```
  *Nota: `payment_form` é opcional e tem como valor padrão "DINHEIRO".*
- **Exemplo de JSON (Response - OrderPublic):**
  ```json
  {
    "id": 1,
    "number": 101,
    "description": "Pedido de balcão",
    "status": "ABERTO",
    "type_discount": "FIXO",
    "discount": "5.00",
    "payment_form": "PIX",
    "company_id": 1,
    "created_at": "2026-05-24T10:00:00Z",
    "updated_at": "2026-05-24T10:00:00Z",
    "order_items": []
  }
  ```

### Atualizar Status do Pedido
- **Rota:** `PATCH /api/v1/orders/{order_id}/status`
- **Exemplo de JSON (Request):**
  ```json
  {
    "status": "PAGO"
  }
  ```

### Adicionar Item ao Pedido
- **Rota:** `POST /api/v1/orders/{order_id}/items`
- **Exemplo de JSON (Request):**
  ```json
  {
    "item_id": 1,
    "qtd": 2,
    "price": 10.50
  }
  ```
- **Exemplo de JSON (Response - OrderItemPublic):**
  ```json
  {
    "id": 10,
    "order_id": 1,
    "item_id": 1,
    "item_name": "Cerveja Pilsen",
    "qtd": 2,
    "price": "10.50"
  }
  ```

### Remover Item do Pedido
- **Rota:** `DELETE /api/v1/orders/{order_id}/items/{order_item_id}`
- **Status:** 204 No Content
---

## Usuários

### Meus Dados
- **Rota:** `GET /api/v1/users/me`
- **Resposta:** `UserPublic`

### Criar Usuário (pela empresa)
- **Rota:** `POST /api/v1/users/`
- **Corpo da Requisição:**
  - `name` (string, opcional)
  - `email` (email, obrigatório)
  - `password` (string, obrigatório)
