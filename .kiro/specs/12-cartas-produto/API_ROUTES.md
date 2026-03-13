# API Routes - 12 Cartas

Documentação completa das rotas de API para o produto "12 Cartas".

## Base URL

```
http://localhost:3000/api
```

## Autenticação

Atualmente, as rotas não requerem autenticação. A segurança é baseada em:
- UUIDs únicos e não-guessáveis
- Validação de ownership via session
- Rate limiting (futuro)

---

## Card Collections

### POST /api/card-collections/create

Cria um novo conjunto de 12 cartas com templates pré-preenchidos.

**Request Body:**
```json
{
  "recipientName": "Maria Silva",
  "senderName": "João Santos",
  "contactEmail": "joao@example.com"
}
```

**Validation:**
- `recipientName`: string, 1-100 caracteres, obrigatório
- `senderName`: string, 1-100 caracteres, obrigatório
- `contactEmail`: email válido, opcional

**Response (201):**
```json
{
  "collection": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "recipientName": "Maria Silva",
    "senderName": "João Santos",
    "slug": null,
    "qrCodeUrl": null,
    "status": "pending",
    "stripeSessionId": null,
    "contactEmail": "joao@example.com",
    "createdAt": "2025-01-05T10:00:00.000Z",
    "updatedAt": "2025-01-05T10:00:00.000Z"
  },
  "cards": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "collectionId": "550e8400-e29b-41d4-a716-446655440000",
      "order": 1,
      "title": "Abra quando... estiver tendo um dia difícil",
      "messageText": "Sei que hoje não está sendo fácil...",
      "imageUrl": null,
      "youtubeUrl": null,
      "status": "unopened",
      "openedAt": null,
      "createdAt": "2025-01-05T10:00:00.000Z",
      "updatedAt": "2025-01-05T10:00:00.000Z"
    }
    // ... 11 more cards
  ]
}
```

**Error Responses:**
- `400`: Dados inválidos
- `500`: Erro interno do servidor

---

### GET /api/card-collections/[id]

Busca um conjunto de cartas por ID.

**URL Parameters:**
- `id`: UUID do conjunto

**Response (200):**
```json
{
  "collection": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "recipientName": "Maria Silva",
    "senderName": "João Santos",
    "slug": "amor-eterno-abc123",
    "qrCodeUrl": "https://r2.example.com/qrcodes/abc123.png",
    "status": "paid",
    "stripeSessionId": "cs_test_123",
    "contactEmail": "joao@example.com",
    "createdAt": "2025-01-05T10:00:00.000Z",
    "updatedAt": "2025-01-05T10:00:00.000Z"
  },
  "cards": [
    // Array com as 12 cartas
  ]
}
```

**Error Responses:**
- `400`: ID inválido
- `404`: Conjunto não encontrado
- `500`: Erro interno do servidor

---

### GET /api/card-collections/slug/[slug]

Busca um conjunto de cartas por slug (usado na visualização pública).

**URL Parameters:**
- `slug`: Slug único do conjunto

**Response (200):**
```json
{
  "collection": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "recipientName": "Maria Silva",
    "senderName": "João Santos",
    "slug": "amor-eterno-abc123",
    "qrCodeUrl": "https://r2.example.com/qrcodes/abc123.png",
    "status": "paid",
    "createdAt": "2025-01-05T10:00:00.000Z",
    "updatedAt": "2025-01-05T10:00:00.000Z"
  },
  "cards": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "collectionId": "550e8400-e29b-41d4-a716-446655440000",
      "order": 1,
      "title": "Abra quando... estiver tendo um dia difícil",
      "messageText": "Sei que hoje não está sendo fácil...",
      "imageUrl": "https://r2.example.com/images/photo1.jpg",
      "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "status": "unopened",
      "openedAt": null
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440002",
      "collectionId": "550e8400-e29b-41d4-a716-446655440000",
      "order": 2,
      "title": "Abra quando... estiver se sentindo inseguro(a)",
      "messageText": "[CONTEÚDO OCULTO]",
      "imageUrl": null,
      "youtubeUrl": null,
      "status": "opened",
      "openedAt": "2025-01-05T12:00:00.000Z"
    }
    // ... 10 more cards
  ]
}
```

**Nota:** Cartas com status "opened" retornam conteúdo oculto para preservar a experiência única.

**Error Responses:**
- `404`: Conjunto não encontrado
- `500`: Erro interno do servidor

---

## Cards

### GET /api/cards/[id]

Busca uma carta específica por ID.

**URL Parameters:**
- `id`: UUID da carta

**Response (200):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "collectionId": "550e8400-e29b-41d4-a716-446655440000",
  "order": 1,
  "title": "Abra quando... estiver tendo um dia difícil",
  "messageText": "Sei que hoje não está sendo fácil...",
  "imageUrl": "https://r2.example.com/images/photo1.jpg",
  "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "status": "unopened",
  "openedAt": null,
  "createdAt": "2025-01-05T10:00:00.000Z",
  "updatedAt": "2025-01-05T10:00:00.000Z"
}
```

**Error Responses:**
- `400`: ID inválido
- `404`: Carta não encontrada
- `500`: Erro interno do servidor

---

### PATCH /api/cards/[id]

Atualiza o conteúdo de uma carta. Apenas cartas com status "unopened" podem ser editadas.

**URL Parameters:**
- `id`: UUID da carta

**Request Body:**
```json
{
  "title": "Abra quando... precisar de um abraço",
  "messageText": "Mensagem personalizada aqui...",
  "imageUrl": "https://r2.example.com/images/new-photo.jpg",
  "youtubeUrl": "https://www.youtube.com/watch?v=newVideoId"
}
```

**Validation:**
- `title`: string, 1-200 caracteres, opcional
- `messageText`: string, 1-500 caracteres, opcional
- `imageUrl`: URL válida ou null, opcional
- `youtubeUrl`: URL do YouTube válida ou null, opcional

**Response (200):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "collectionId": "550e8400-e29b-41d4-a716-446655440000",
  "order": 1,
  "title": "Abra quando... precisar de um abraço",
  "messageText": "Mensagem personalizada aqui...",
  "imageUrl": "https://r2.example.com/images/new-photo.jpg",
  "youtubeUrl": "https://www.youtube.com/watch?v=newVideoId",
  "status": "unopened",
  "openedAt": null,
  "createdAt": "2025-01-05T10:00:00.000Z",
  "updatedAt": "2025-01-05T10:30:00.000Z"
}
```

**Error Responses:**
- `400`: Dados inválidos ou carta já foi aberta
- `404`: Carta não encontrada
- `500`: Erro interno do servidor

---

### POST /api/cards/[id]/open

Marca uma carta como aberta. Esta ação é irreversível e só pode ser feita uma vez.

**URL Parameters:**
- `id`: UUID da carta

**Request Body:**
```json
{}
```

**Response (200) - Primeira Abertura:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "collectionId": "550e8400-e29b-41d4-a716-446655440000",
  "order": 1,
  "title": "Abra quando... estiver tendo um dia difícil",
  "messageText": "Sei que hoje não está sendo fácil...",
  "imageUrl": "https://r2.example.com/images/photo1.jpg",
  "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "status": "opened",
  "openedAt": "2025-01-05T12:00:00.000Z",
  "createdAt": "2025-01-05T10:00:00.000Z",
  "updatedAt": "2025-01-05T12:00:00.000Z",
  "isFirstOpen": true
}
```

**Response (200) - Tentativa de Reabrir:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "status": "opened",
  "openedAt": "2025-01-05T12:00:00.000Z",
  "isFirstOpen": false,
  "message": "Esta carta já foi aberta anteriormente"
}
```

**Error Responses:**
- `400`: ID inválido
- `404`: Carta não encontrada
- `500`: Erro interno do servidor

---

## Checkout

### POST /api/checkout/card-collection

Cria uma sessão de checkout no Stripe para um conjunto de cartas.

**Request Body:**
```json
{
  "collectionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Validation:**
- `collectionId`: UUID válido, obrigatório
- Conjunto deve existir e ter status "pending"

**Response (200):**
```json
{
  "sessionId": "cs_test_a1b2c3d4e5f6g7h8i9j0",
  "url": "https://checkout.stripe.com/pay/cs_test_a1b2c3d4e5f6g7h8i9j0"
}
```

**Error Responses:**
- `400`: Dados inválidos ou conjunto já pago
- `404`: Conjunto não encontrado
- `500`: Erro ao criar sessão no Stripe

---

### POST /api/checkout/webhook

Webhook do Stripe para processar eventos de pagamento. Esta rota é chamada automaticamente pelo Stripe.

**Headers:**
- `stripe-signature`: Assinatura do webhook (obrigatória)

**Request Body:**
```json
{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_a1b2c3d4e5f6g7h8i9j0",
      "metadata": {
        "type": "card_collection",
        "collectionId": "550e8400-e29b-41d4-a716-446655440000"
      },
      "customer_details": {
        "email": "joao@example.com"
      }
    }
  }
}
```

**Ações Executadas:**
1. Valida assinatura do webhook
2. Gera slug único para o conjunto
3. Gera QR code
4. Atualiza status para "paid"
5. Envia email com link e QR code

**Response (200):**
```json
{
  "received": true
}
```

**Error Responses:**
- `400`: Assinatura inválida
- `500`: Erro ao processar webhook

---

## Códigos de Status HTTP

- `200 OK`: Requisição bem-sucedida
- `201 Created`: Recurso criado com sucesso
- `400 Bad Request`: Dados inválidos ou requisição malformada
- `404 Not Found`: Recurso não encontrado
- `500 Internal Server Error`: Erro interno do servidor

## Rate Limiting

Atualmente não implementado. Planejado para futuras versões:
- 100 requisições por minuto por IP
- 1000 requisições por hora por IP

## Exemplos de Uso

### Criar e Editar um Conjunto

```typescript
// 1. Criar conjunto
const createResponse = await fetch('/api/card-collections/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipientName: 'Maria',
    senderName: 'João',
    contactEmail: 'joao@example.com'
  })
});
const { collection, cards } = await createResponse.json();

// 2. Editar primeira carta
const updateResponse = await fetch(`/api/cards/${cards[0].id}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messageText: 'Mensagem personalizada...',
    imageUrl: 'https://r2.example.com/images/photo.jpg'
  })
});
const updatedCard = await updateResponse.json();

// 3. Criar checkout
const checkoutResponse = await fetch('/api/checkout/card-collection', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    collectionId: collection.id
  })
});
const { url } = await checkoutResponse.json();

// 4. Redirecionar para checkout
window.location.href = url;
```

### Visualizar e Abrir Cartas

```typescript
// 1. Buscar conjunto por slug
const collectionResponse = await fetch('/api/card-collections/slug/amor-eterno-abc123');
const { collection, cards } = await collectionResponse.json();

// 2. Abrir uma carta
const openResponse = await fetch(`/api/cards/${cards[0].id}/open`, {
  method: 'POST'
});
const openedCard = await openResponse.json();

if (openedCard.isFirstOpen) {
  // Primeira abertura - mostrar conteúdo completo
  console.log('Carta aberta pela primeira vez!');
} else {
  // Carta já foi aberta antes
  console.log('Esta carta já foi aberta');
}
```

## Versionamento

Versão atual: **v1**

Futuras versões da API serão prefixadas com `/api/v2/`, `/api/v3/`, etc.
