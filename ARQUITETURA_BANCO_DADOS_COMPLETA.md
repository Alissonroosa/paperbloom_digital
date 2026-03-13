# 🗄️ Arquitetura do Banco de Dados - Paper Bloom

## Visão Geral

O sistema Paper Bloom possui **2 produtos** principais e utiliza **3 tabelas** no banco de dados PostgreSQL para gerenciar todo o fluxo de criação, pagamento e entrega.

## 📦 Produtos

### 1. Mensagem Personalizada (R$ 29,99)
- **Editor:** `/editor/mensagem`
- **Visualização:** `/mensagem/[slug]`
- **Delivery:** `/delivery/[messageId]`
- **Tabela:** `messages`

### 2. 12 Cartas (R$ 49,99)
- **Editor:** `/editor/12-cartas`
- **Visualização:** `/c/[slug]`
- **Delivery:** `/delivery/c/[collectionId]`
- **Tabelas:** `card_collections` + `cards`

---

## 🗃️ Estrutura das Tabelas

### Tabela 1: `messages`

Armazena mensagens personalizadas individuais.

#### Schema Completo

```sql
CREATE TABLE messages (
  -- Identificação
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dados Básicos
  recipient_name        VARCHAR(100) NOT NULL,
  sender_name           VARCHAR(100) NOT NULL,
  title                 VARCHAR(200),
  message_text          VARCHAR(1000) NOT NULL,
  
  -- Mídia
  image_url             TEXT,
  youtube_url           TEXT,
  gallery_images        TEXT[],  -- Array de URLs
  
  -- Personalização
  special_date          DATE,
  closing_message       VARCHAR(500),
  signature             VARCHAR(100),
  background_color      VARCHAR(20),
  theme                 VARCHAR(50),
  custom_emoji          VARCHAR(10),
  
  -- Música
  music_start_time      INTEGER,  -- Segundos
  
  -- Contador de Tempo
  show_time_counter     BOOLEAN DEFAULT false,
  time_counter_label    VARCHAR(100),
  
  -- Acesso e Compartilhamento
  slug                  VARCHAR(255) UNIQUE,
  qr_code_url           TEXT,
  view_count            INTEGER DEFAULT 0,
  
  -- Pagamento
  status                VARCHAR(20) NOT NULL DEFAULT 'pending',
  stripe_session_id     VARCHAR(255) UNIQUE,
  
  -- Contato
  contact_name          VARCHAR(100),
  contact_email         VARCHAR(255),
  contact_phone         VARCHAR(20),
  
  -- Auditoria
  created_at            TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### Campos por Categoria

**Identificação:**
- `id` - UUID único da mensagem

**Dados Básicos:**
- `recipient_name` - Nome do destinatário
- `sender_name` - Nome do remetente
- `title` - Título da mensagem
- `message_text` - Texto principal da mensagem

**Mídia:**
- `image_url` - Imagem principal
- `youtube_url` - Vídeo/música do YouTube
- `gallery_images` - Array com até 7 fotos

**Personalização:**
- `special_date` - Data especial (aniversário, etc)
- `closing_message` - Mensagem de encerramento
- `signature` - Assinatura do remetente
- `background_color` - Cor de fundo personalizada
- `theme` - Tema visual escolhido
- `custom_emoji` - Emoji personalizado

**Música:**
- `music_start_time` - Tempo inicial do vídeo (em segundos)

**Contador de Tempo:**
- `show_time_counter` - Se deve mostrar contador
- `time_counter_label` - Texto do contador (ex: "Juntos há")

**Acesso:**
- `slug` - URL amigável (ex: `/mensagem/maria/uuid`)
- `qr_code_url` - URL do QR Code gerado
- `view_count` - Número de visualizações

**Pagamento:**
- `status` - `pending` ou `paid`
- `stripe_session_id` - ID da sessão Stripe

**Contato:**
- `contact_name` - Nome para contato
- `contact_email` - Email para envio do QR Code
- `contact_phone` - Telefone de contato

---

### Tabela 2: `card_collections`

Armazena coleções de 12 cartas.

#### Schema Completo

```sql
CREATE TABLE card_collections (
  -- Identificação
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dados Básicos
  recipient_name        VARCHAR(100) NOT NULL,
  sender_name           VARCHAR(100) NOT NULL,
  intro_message         TEXT,
  
  -- Mídia
  youtube_video_id      VARCHAR(50),
  
  -- Acesso e Compartilhamento
  slug                  VARCHAR(255) UNIQUE,
  qr_code_url           TEXT,
  
  -- Pagamento
  status                VARCHAR(20) NOT NULL DEFAULT 'pending',
  stripe_session_id     VARCHAR(255) UNIQUE,
  
  -- Contato
  contact_name          VARCHAR(100),
  contact_email         VARCHAR(255),
  contact_phone         VARCHAR(20),
  
  -- Auditoria
  created_at            TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### Campos por Categoria

**Identificação:**
- `id` - UUID único da coleção

**Dados Básicos:**
- `recipient_name` - Nome do destinatário
- `sender_name` - Nome do remetente
- `intro_message` - Mensagem de abertura (antes das cartas)

**Mídia:**
- `youtube_video_id` - ID do vídeo YouTube (música de fundo)

**Acesso:**
- `slug` - URL amigável (ex: `/c/maria/uuid`)
- `qr_code_url` - URL do QR Code gerado

**Pagamento:**
- `status` - `pending` ou `paid`
- `stripe_session_id` - ID da sessão Stripe

**Contato:**
- `contact_name` - Nome para contato
- `contact_email` - Email para envio do QR Code
- `contact_phone` - Telefone de contato

---

### Tabela 3: `cards`

Armazena as 12 cartas individuais de cada coleção.

#### Schema Completo

```sql
CREATE TABLE cards (
  -- Identificação
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id         UUID NOT NULL REFERENCES card_collections(id) ON DELETE CASCADE,
  
  -- Ordenação
  "order"               INTEGER NOT NULL CHECK ("order" >= 1 AND "order" <= 12),
  
  -- Conteúdo
  title                 VARCHAR(200) NOT NULL,
  message_text          VARCHAR(500) NOT NULL,
  
  -- Mídia
  image_url             TEXT,
  youtube_url           TEXT,
  
  -- Status de Abertura
  status                VARCHAR(20) NOT NULL DEFAULT 'unopened',
  opened_at             TIMESTAMP,
  
  -- Auditoria
  created_at            TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(collection_id, "order")
);
```

#### Campos por Categoria

**Identificação:**
- `id` - UUID único da carta
- `collection_id` - FK para `card_collections`

**Ordenação:**
- `order` - Posição da carta (1-12)

**Conteúdo:**
- `title` - Título da carta (ex: "Abra quando estiver feliz")
- `message_text` - Mensagem personalizada

**Mídia:**
- `image_url` - Imagem da carta (opcional)
- `youtube_url` - Vídeo/música (opcional)

**Status:**
- `status` - `unopened` ou `opened`
- `opened_at` - Data/hora da primeira abertura

---

## 🔄 Fluxo de Dados por Produto

### Produto 1: Mensagem Personalizada

#### 1. Criação (Editor)

**Endpoint:** `POST /api/messages/create`

**Dados Salvos na Tabela `messages`:**
```javascript
{
  // Criação inicial
  recipient_name: "Maria",
  sender_name: "João",
  message_text: "Mensagem inicial",
  status: "pending",
  
  // Campos opcionais (preenchidos durante edição)
  title: null,
  image_url: null,
  youtube_url: null,
  gallery_images: [],
  special_date: null,
  closing_message: null,
  signature: null,
  background_color: null,
  theme: null,
  custom_emoji: null,
  music_start_time: null,
  show_time_counter: false,
  time_counter_label: null,
  
  // Campos de acesso (gerados após pagamento)
  slug: null,
  qr_code_url: null,
  view_count: 0,
  
  // Campos de pagamento
  stripe_session_id: null,
  
  // Campos de contato
  contact_name: null,
  contact_email: null,
  contact_phone: null
}
```

#### 2. Edição (Durante Criação)

**Endpoint:** `PATCH /api/messages/[id]`

**Dados Atualizados:**
- Todos os campos de conteúdo conforme usuário preenche
- Auto-save a cada alteração

#### 3. Checkout

**Endpoint:** `POST /api/checkout/create-session`

**Dados Atualizados na Tabela `messages`:**
```javascript
{
  stripe_session_id: "cs_test_xxx",
  contact_name: "João Silva",
  contact_email: "joao@exemplo.com",
  contact_phone: "(11) 98765-4321"
}
```

#### 4. Pagamento (Webhook)

**Endpoint:** `POST /api/checkout/webhook`

**Dados Atualizados na Tabela `messages`:**
```javascript
{
  status: "paid",
  slug: "/mensagem/maria/uuid",
  qr_code_url: "/uploads/qrcodes/uuid.png"
}
```

**Ações Executadas:**
1. Atualiza status para `paid`
2. Gera slug único
3. Gera QR Code
4. Envia email com QR Code

#### 5. Visualização

**Endpoint:** `GET /api/messages/slug/[slug]`

**Dados Retornados:**
- Todos os campos da mensagem
- Incrementa `view_count`

---

### Produto 2: 12 Cartas

#### 1. Criação (Editor)

**Endpoint:** `POST /api/card-collections/create`

**Dados Salvos na Tabela `card_collections`:**
```javascript
{
  recipient_name: "Destinatário",
  sender_name: "Remetente",
  status: "pending",
  
  // Campos opcionais
  intro_message: null,
  youtube_video_id: null,
  
  // Campos de acesso (gerados após pagamento)
  slug: null,
  qr_code_url: null,
  
  // Campos de pagamento
  stripe_session_id: null,
  
  // Campos de contato
  contact_name: null,
  contact_email: null,
  contact_phone: null
}
```

**Dados Salvos na Tabela `cards` (12 registros):**
```javascript
// Para cada carta (1-12)
{
  collection_id: "uuid-da-colecao",
  order: 1, // 1 a 12
  title: "",
  message_text: "",
  image_url: null,
  youtube_url: null,
  status: "unopened",
  opened_at: null
}
```

#### 2. Edição (Durante Criação)

**Endpoint:** `PATCH /api/card-collections/[id]`

**Dados Atualizados na Tabela `card_collections`:**
- `recipient_name`, `sender_name`, `intro_message`, etc.

**Endpoint:** `PATCH /api/cards/[id]`

**Dados Atualizados na Tabela `cards`:**
- `title`, `message_text`, `image_url`, `youtube_url`

#### 3. Checkout

**Endpoint:** `POST /api/checkout/card-collection`

**Dados Atualizados na Tabela `card_collections`:**
```javascript
{
  stripe_session_id: "cs_test_xxx",
  contact_name: "João Silva",
  contact_email: "joao@exemplo.com",
  contact_phone: "(11) 98765-4321"
}
```

#### 4. Pagamento (Webhook)

**Endpoint:** `POST /api/checkout/webhook`

**Dados Atualizados na Tabela `card_collections`:**
```javascript
{
  status: "paid",
  slug: "/c/maria/uuid",
  qr_code_url: "/uploads/qrcodes/uuid.png"
}
```

**Ações Executadas:**
1. Atualiza status para `paid`
2. Gera slug único
3. Gera QR Code
4. Envia email com QR Code

**Tabela `cards` não é alterada no pagamento**

#### 5. Visualização

**Endpoint:** `GET /api/card-collections/[id]`

**Dados Retornados:**
- Dados da coleção (`card_collections`)
- Todas as 12 cartas (`cards`)
- Cartas abertas retornam dados limitados

#### 6. Abertura de Carta

**Endpoint:** `POST /api/cards/[id]/open`

**Dados Atualizados na Tabela `cards`:**
```javascript
{
  status: "opened",
  opened_at: "2024-01-21T10:30:00Z"
}
```

**Regra:** Uma vez aberta, a carta não pode ser visualizada novamente (experiência única)

---

## 📊 Comparação de Dados por Produto

| Aspecto | Mensagem | 12 Cartas |
|---------|----------|-----------|
| **Tabelas** | 1 (`messages`) | 2 (`card_collections` + `cards`) |
| **Registros Criados** | 1 | 1 + 12 (coleção + cartas) |
| **Preço** | R$ 29,99 | R$ 49,99 |
| **Status** | `pending` → `paid` | `pending` → `paid` |
| **Slug** | `/mensagem/[nome]/[uuid]` | `/c/[nome]/[uuid]` |
| **QR Code** | Sim | Sim |
| **Email** | Sim | Sim |
| **Galeria de Fotos** | Sim (até 7) | Não |
| **Múltiplas Mensagens** | Não | Sim (12 cartas) |
| **Abertura Única** | Não | Sim (cada carta) |
| **Contador de Tempo** | Sim | Não |
| **Temas** | Sim | Não |

---

## 🔐 Campos de Segurança e Rastreamento

### Campos Comuns em Ambos os Produtos

**Pagamento:**
- `stripe_session_id` - Rastreamento da sessão Stripe
- `status` - Controle de pagamento (`pending`/`paid`)

**Acesso:**
- `slug` - URL única e amigável
- `qr_code_url` - QR Code para compartilhamento

**Contato:**
- `contact_name` - Nome do comprador
- `contact_email` - Email para envio do QR Code
- `contact_phone` - Telefone de contato

**Auditoria:**
- `created_at` - Data de criação
- `updated_at` - Última atualização

---

## 🔄 Relacionamentos

### Mensagem (Standalone)
```
messages (1 registro)
  └─ Sem relacionamentos
```

### 12 Cartas (Relacionamento 1:N)
```
card_collections (1 registro)
  └─ cards (12 registros)
       └─ collection_id → card_collections.id
```

**Constraint:** `ON DELETE CASCADE`
- Se uma coleção for deletada, todas as 12 cartas são deletadas automaticamente

---

## 📈 Estatísticas Atuais

**Banco de Dados:** PostgreSQL em `82.112.250.187:5432/c_paperbloom`

| Tabela | Registros | Descrição |
|--------|-----------|-----------|
| `messages` | 71 | Mensagens personalizadas |
| `card_collections` | 91 | Coleções de 12 cartas |
| `cards` | 1,020 | Cartas individuais (85 coleções × 12) |

---

## 🚀 Fluxo Completo de Compra

### Mensagem Personalizada

```
1. Usuário acessa /editor/mensagem
   ↓
2. Sistema cria registro em messages (status: pending)
   ↓
3. Usuário preenche dados e clica em "Finalizar"
   ↓
4. Sistema atualiza messages com contact_email
   ↓
5. Sistema cria sessão Stripe e salva stripe_session_id
   ↓
6. Usuário paga no Stripe
   ↓
7. Webhook atualiza messages:
   - status: paid
   - slug: /mensagem/nome/uuid
   - qr_code_url: /uploads/qrcodes/uuid.png
   ↓
8. Sistema envia email com QR Code
   ↓
9. Usuário acessa /delivery/[messageId]
```

### 12 Cartas

```
1. Usuário acessa /editor/12-cartas
   ↓
2. Sistema cria:
   - 1 registro em card_collections (status: pending)
   - 12 registros em cards (status: unopened)
   ↓
3. Usuário preenche 5 passos e clica em "Finalizar"
   ↓
4. Sistema atualiza card_collections com contact_email
   ↓
5. Sistema cria sessão Stripe e salva stripe_session_id
   ↓
6. Usuário paga no Stripe
   ↓
7. Webhook atualiza card_collections:
   - status: paid
   - slug: /c/nome/uuid
   - qr_code_url: /uploads/qrcodes/uuid.png
   ↓
8. Sistema envia email com QR Code
   ↓
9. Usuário acessa /delivery/c/[collectionId]
   ↓
10. Destinatário abre cartas (atualiza cards.status)
```

---

## 🎯 Conclusão

O sistema Paper Bloom utiliza uma arquitetura simples e eficiente:

- **1 tabela** para mensagens individuais (`messages`)
- **2 tabelas** para coleções de cartas (`card_collections` + `cards`)
- **Campos padronizados** para pagamento, acesso e contato
- **Fluxo consistente** entre os dois produtos
- **Rastreamento completo** via Stripe e auditoria

Todos os dados necessários para o fluxo de checkout, pagamento e entrega estão corretamente estruturados e funcionando! ✅
