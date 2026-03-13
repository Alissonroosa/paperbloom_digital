# Design Document - 12 Cartas: Jornada Emocional

## Overview

O produto "12 Cartas" é uma experiência digital única que permite aos usuários criar um conjunto de 12 mensagens personalizadas que só podem ser abertas uma única vez cada. Este design reutiliza ao máximo a infraestrutura existente do produto "Mensagem Digital", incluindo banco de dados PostgreSQL, Stripe para pagamentos, R2 para armazenamento de imagens, Resend para emails, e componentes React existentes.

A arquitetura segue o padrão já estabelecido no projeto, com separação clara entre camadas de apresentação (React/Next.js), lógica de negócio (Services), e persistência de dados (PostgreSQL).

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js/React)                 │
├─────────────────────────────────────────────────────────────┤
│  Product Selection Page  │  Card Editor Wizard  │  Viewer   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Routes (Next.js)                    │
├─────────────────────────────────────────────────────────────┤
│  /api/card-collections/*  │  /api/cards/*  │  /api/checkout │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                           │
├─────────────────────────────────────────────────────────────┤
│ CardCollectionService │ CardService │ StripeService (reuse)  │
│ ImageService (reuse)  │ EmailService (reuse) │ QRCodeService│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer (PostgreSQL)                   │
├─────────────────────────────────────────────────────────────┤
│         card_collections table  │  cards table               │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack (Reused)

- **Frontend**: React 18, Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL (existing instance)
- **Storage**: Cloudflare R2 (existing)
- **Payment**: Stripe (existing)
- **Email**: Resend (existing)
- **Validation**: Zod (existing)

## Components and Interfaces

### 1. Data Models

#### CardCollection Entity

```typescript
interface CardCollection {
  id: string;                      // UUID
  recipientName: string;           // Nome do destinatário (1-100 chars)
  senderName: string;              // Nome do remetente (1-100 chars)
  slug: string | null;             // URL slug único (gerado após pagamento)
  qrCodeUrl: string | null;        // URL do QR code
  status: 'pending' | 'paid';      // Status de pagamento
  stripeSessionId: string | null;  // ID da sessão Stripe
  contactEmail: string | null;     // Email para envio
  createdAt: Date;
  updatedAt: Date;
}
```

#### Card Entity

```typescript
interface Card {
  id: string;                      // UUID
  collectionId: string;            // FK para card_collections
  order: number;                   // Ordem da carta (1-12)
  title: string;                   // Título da carta (ex: "Abra quando...")
  messageText: string;             // Texto da mensagem (1-500 chars)
  imageUrl: string | null;         // URL da foto (opcional)
  youtubeUrl: string | null;       // URL do YouTube (opcional)
  status: 'unopened' | 'opened';   // Status de abertura
  openedAt: Date | null;           // Data/hora da primeira abertura
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. Database Schema

#### Migration: Create card_collections table

```sql
CREATE TABLE card_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_name VARCHAR(100) NOT NULL,
  sender_name VARCHAR(100) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  qr_code_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  stripe_session_id VARCHAR(255) UNIQUE,
  contact_email VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_card_collections_slug ON card_collections(slug);
CREATE INDEX idx_card_collections_stripe_session ON card_collections(stripe_session_id);
CREATE INDEX idx_card_collections_status ON card_collections(status);
```

#### Migration: Create cards table

```sql
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES card_collections(id) ON DELETE CASCADE,
  "order" INTEGER NOT NULL CHECK ("order" >= 1 AND "order" <= 12),
  title VARCHAR(200) NOT NULL,
  message_text VARCHAR(500) NOT NULL,
  image_url TEXT,
  youtube_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'unopened' CHECK (status IN ('unopened', 'opened')),
  opened_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(collection_id, "order")
);

CREATE INDEX idx_cards_collection_id ON cards(collection_id);
CREATE INDEX idx_cards_status ON cards(status);
CREATE INDEX idx_cards_order ON cards(collection_id, "order");
```

### 3. Card Templates

```typescript
interface CardTemplate {
  order: number;
  title: string;
  defaultMessage: string;
}

const CARD_TEMPLATES: CardTemplate[] = [
  {
    order: 1,
    title: "Abra quando... estiver tendo um dia difícil",
    defaultMessage: "Sei que hoje não está sendo fácil, mas quero que saiba que você é mais forte do que imagina. Cada desafio que você enfrenta te torna mais resiliente. Lembre-se: eu acredito em você, sempre. Respire fundo, você vai superar isso. ❤️"
  },
  {
    order: 2,
    title: "Abra quando... estiver se sentindo inseguro(a)",
    defaultMessage: "Você é incrível exatamente do jeito que é. Sua gentileza, sua inteligência, seu sorriso - tudo em você é especial. Não deixe que a insegurança te faça esquecer o quanto você é valioso(a). Eu te admiro mais do que você imagina. 💪"
  },
  {
    order: 3,
    title: "Abra quando... estivermos longe um do outro",
    defaultMessage: "A distância física não muda nada entre nós. Você está sempre no meu coração, não importa onde esteja. Mal posso esperar para te ver novamente e te dar um abraço apertado. Até lá, saiba que penso em você todos os dias. 🌍"
  },
  {
    order: 4,
    title: "Abra quando... estiver estressado(a) com o trabalho",
    defaultMessage: "Respire. Você está fazendo o seu melhor, e isso é mais do que suficiente. Lembre-se de fazer pausas, beber água, e não se cobrar tanto. O trabalho é importante, mas sua saúde mental vem primeiro. Você merece descanso. 🧘"
  },
  {
    order: 5,
    title: "Abra quando... quiser saber o quanto eu te amo",
    defaultMessage: "Te amo mais do que as palavras podem expressar. Você ilumina meus dias, me faz querer ser uma pessoa melhor, e torna minha vida infinitamente mais feliz. Cada momento ao seu lado é um presente. Te amo hoje, amanhã e sempre. 💕"
  },
  {
    order: 6,
    title: "Abra quando... completarmos mais um ano juntos",
    defaultMessage: "Mais um ano ao seu lado, e cada dia me apaixono mais por você. Obrigado por cada risada, cada abraço, cada momento compartilhado. Você é meu melhor amigo, meu amor, minha pessoa. Que venham muitos e muitos anos juntos! 🎉"
  },
  {
    order: 7,
    title: "Abra quando... estivermos celebrando uma conquista sua",
    defaultMessage: "Parabéns! Você conseguiu! Sua dedicação e esforço finalmente foram recompensados. Estou tão orgulhoso(a) de você e de tudo que você conquistou. Continue brilhando, você merece todo o sucesso do mundo! 🏆"
  },
  {
    order: 8,
    title: "Abra quando... for uma noite de chuva e tédio",
    defaultMessage: "Que tal preparar um chocolate quente, colocar aquele filme que a gente ama, e se aconchegar no sofá? Ou podemos fazer aquela receita nova que você queria tentar. Noites assim são perfeitas para criar memórias especiais juntos. ☕🎬"
  },
  {
    order: 9,
    title: "Abra quando... tivermos nossa primeira briga boba",
    defaultMessage: "Ei, a gente brigou por uma bobagem, né? Quero que saiba que nosso amor é muito maior do que qualquer discussão. Me desculpe se eu exagerei. No final do dia, você é a pessoa mais importante para mim. Vamos fazer as pazes? 🤝"
  },
  {
    order: 10,
    title: "Abra quando... você precisar dar uma risada",
    defaultMessage: "Lembra daquela vez que a gente [insira aqui uma memória engraçada de vocês]? Eu rio até hoje quando penso nisso! Você tem o dom de transformar momentos simples em memórias inesquecíveis. Obrigado por todas as risadas! 😂"
  },
  {
    order: 11,
    title: "Abra quando... eu tiver feito algo que te irritou",
    defaultMessage: "Me desculpe. Eu errei, e reconheço isso. Você merece ser tratado(a) com todo o amor e respeito do mundo, e prometo fazer melhor. Obrigado por ter paciência comigo e por me dar a chance de crescer ao seu lado. Te amo. 🙏"
  },
  {
    order: 12,
    title: "Abra quando... você não conseguir dormir",
    defaultMessage: "Feche os olhos e respire devagar. Pense em um lugar tranquilo, onde você se sente seguro(a) e em paz. Lembre-se de que amanhã é um novo dia, cheio de possibilidades. Você está seguro(a), você está amado(a). Boa noite. 🌙"
  }
];
```

### 4. Services

#### CardCollectionService

```typescript
class CardCollectionService {
  // Cria um novo conjunto com 12 cartas pré-preenchidas
  async create(data: CreateCardCollectionInput): Promise<CardCollection>
  
  // Busca conjunto por ID
  async findById(id: string): Promise<CardCollection | null>
  
  // Busca conjunto por slug
  async findBySlug(slug: string): Promise<CardCollection | null>
  
  // Atualiza status após pagamento
  async updateStatus(id: string, status: 'paid' | 'pending'): Promise<CardCollection>
  
  // Atualiza com QR code e slug após pagamento
  async updateQRCode(id: string, qrCodeUrl: string, slug: string): Promise<CardCollection>
  
  // Busca por Stripe session ID
  async findByStripeSessionId(sessionId: string): Promise<CardCollection | null>
  
  // Atualiza Stripe session ID
  async updateStripeSession(id: string, sessionId: string): Promise<CardCollection>
}
```

#### CardService

```typescript
class CardService {
  // Cria uma carta individual
  async create(data: CreateCardInput): Promise<Card>
  
  // Cria 12 cartas de uma vez (usado na criação do conjunto)
  async createBulk(collectionId: string, templates: CardTemplate[]): Promise<Card[]>
  
  // Busca carta por ID
  async findById(id: string): Promise<Card | null>
  
  // Busca todas as cartas de um conjunto
  async findByCollectionId(collectionId: string): Promise<Card[]>
  
  // Atualiza conteúdo da carta
  async update(id: string, data: UpdateCardInput): Promise<Card>
  
  // Marca carta como aberta
  async markAsOpened(id: string): Promise<Card>
  
  // Verifica se carta pode ser aberta
  async canOpen(id: string): Promise<boolean>
}
```

### 5. API Routes

#### POST /api/card-collections/create
- Cria novo conjunto com 12 cartas pré-preenchidas
- Input: `{ recipientName, senderName, contactEmail }`
- Output: `{ collection, cards }`

#### GET /api/card-collections/[id]
- Busca conjunto por ID
- Output: `{ collection, cards }`

#### GET /api/card-collections/slug/[slug]
- Busca conjunto por slug (para visualização)
- Output: `{ collection, cards }` (cards sem conteúdo se já abertas)

#### PATCH /api/cards/[id]
- Atualiza conteúdo de uma carta
- Input: `{ title?, messageText?, imageUrl?, youtubeUrl? }`
- Output: `{ card }`

#### POST /api/cards/[id]/open
- Marca carta como aberta (primeira visualização)
- Output: `{ card }` (com conteúdo completo)

#### POST /api/checkout/card-collection
- Cria sessão de checkout para conjunto de cartas
- Input: `{ collectionId }`
- Output: `{ sessionId, url }`

### 6. React Components

#### Reused Components
- `WizardStepper` - Adaptado para 12 steps
- `PreviewPanel` - Reutilizado para preview de cartas
- `YouTubePlayer` - Reutilizado para música
- `PhoneMockup` - Reutilizado para preview mobile
- Componentes de UI (Button, Input, Textarea, Card, etc.)

#### New Components

**ProductSelector**
- Exibe os dois produtos disponíveis
- Permite seleção entre "Mensagem Digital" e "12 Cartas"

**CardCollectionEditor**
- Wizard principal para edição das 12 cartas
- Gerencia estado do conjunto completo
- Auto-save de progresso

**CardEditorStep**
- Editor individual para cada carta
- Campos: título, mensagem, foto, música
- Preview em tempo real

**CardCollectionViewer**
- Interface de visualização das 12 cartas
- Grid de cards mostrando status (aberta/fechada)
- Modal de confirmação antes de abrir

**CardModal**
- Modal para exibir conteúdo da carta aberta
- Exibe foto, texto e reproduz música
- Animação especial na primeira abertura

## Data Models

### Validation Schemas (Zod)

```typescript
// Schema para criação de conjunto
const createCardCollectionSchema = z.object({
  recipientName: z.string().min(1).max(100).trim(),
  senderName: z.string().min(1).max(100).trim(),
  contactEmail: z.string().email().max(255).trim().optional(),
});

// Schema para criação de carta
const createCardSchema = z.object({
  collectionId: z.string().uuid(),
  order: z.number().int().min(1).max(12),
  title: z.string().min(1).max(200).trim(),
  messageText: z.string().min(1).max(500).trim(),
  imageUrl: z.string().url().nullable().optional(),
  youtubeUrl: z.string().regex(YOUTUBE_URL_REGEX).nullable().optional(),
});

// Schema para atualização de carta
const updateCardSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  messageText: z.string().min(1).max(500).trim().optional(),
  imageUrl: z.string().url().nullable().optional(),
  youtubeUrl: z.string().regex(YOUTUBE_URL_REGEX).nullable().optional(),
});
```

### State Management

```typescript
// Context para o editor de cartas
interface CardCollectionEditorContext {
  collection: CardCollection | null;
  cards: Card[];
  currentCardIndex: number;
  isLoading: boolean;
  isSaving: boolean;
  
  // Actions
  setCurrentCardIndex: (index: number) => void;
  updateCard: (cardId: string, data: Partial<Card>) => Promise<void>;
  saveProgress: () => Promise<void>;
  proceedToCheckout: () => Promise<void>;
}
```

## Correctness Properties

*Uma propriedade é uma característica ou comportamento que deve ser verdadeiro em todas as execuções válidas de um sistema - essencialmente, uma declaração formal sobre o que o sistema deve fazer. As propriedades servem como ponte entre especificações legíveis por humanos e garantias de correção verificáveis por máquina.*

### Property 1: Conjunto sempre criado com 12 cartas
*Para qualquer* conjunto de cartas criado, o sistema deve criar exatamente 12 cartas com conteúdo pré-preenchido dos templates.
**Validates: Requirements 1.1, 1.3**

### Property 2: UUID único para cada conjunto
*Para qualquer* conjunto criado, o ID deve ser um UUID válido e único no sistema.
**Validates: Requirements 1.2**

### Property 3: Validação de tamanho de texto
*Para qualquer* texto de carta, se tiver ≤500 caracteres deve ser aceito, se tiver >500 caracteres deve ser rejeitado.
**Validates: Requirements 1.5, 3.3**

### Property 4: Validação de URL do YouTube
*Para qualquer* URL fornecida para música, URLs válidas do YouTube devem ser aceitas e URLs inválidas devem ser rejeitadas.
**Validates: Requirements 1.7, 3.5**

### Property 5: Upload e armazenamento de imagem
*Para qualquer* imagem válida enviada, o sistema deve retornar uma URL acessível que aponta para a imagem armazenada.
**Validates: Requirements 1.6, 3.4**

### Property 6: Ordem mantida dos templates
*Para qualquer* conjunto criado, as cartas devem estar ordenadas de 1 a 12 conforme os templates.
**Validates: Requirements 2.4**

### Property 7: Persistência de edições
*Para qualquer* carta editada, após salvar e recarregar, as alterações devem estar presentes.
**Validates: Requirements 3.2, 8.4, 8.5**

### Property 8: Status inicial unopened
*Para qualquer* carta recém-criada, o status deve ser "unopened".
**Validates: Requirements 4.1**

### Property 9: Transição de status ao abrir
*Para qualquer* carta com status "unopened", ao ser aberta pela primeira vez, o status deve mudar para "opened" e um timestamp deve ser registrado.
**Validates: Requirements 4.2, 4.4**

### Property 10: Bloqueio de conteúdo após abertura
*Para qualquer* carta com status "opened", tentativas subsequentes de acesso não devem retornar o conteúdo completo.
**Validates: Requirements 4.3, 4.5**

### Property 11: Geração de slug único após pagamento
*Para qualquer* pagamento confirmado, um slug único deve ser gerado e associado ao conjunto.
**Validates: Requirements 6.3**

### Property 12: Geração de QR code após pagamento
*Para qualquer* slug gerado, um QR code válido deve ser criado e armazenado.
**Validates: Requirements 6.4**

### Property 13: Envio de email após pagamento
*Para qualquer* pagamento confirmado com email válido, um email deve ser enviado contendo o link e QR code.
**Validates: Requirements 6.5**

### Property 14: Atualização de status após pagamento
*Para qualquer* conjunto após pagamento confirmado, o status deve ser atualizado para "paid".
**Validates: Requirements 6.6**

### Property 15: Validação antes do checkout
*Para qualquer* conjunto, se os dados são inválidos (ex: cartas sem texto), o checkout deve ser bloqueado; se válidos, deve ser permitido.
**Validates: Requirements 8.7**

### Property 16: Integridade referencial
*Para qualquer* operação que viola integridade referencial (ex: deletar collection com cards), o sistema deve falhar; operações válidas devem suceder.
**Validates: Requirements 10.7**

### Property 17: Armazenamento completo de metadados
*Para qualquer* conjunto criado, todos os metadados especificados (id, slug, qr_code_url, status, stripe_session_id, etc.) devem estar presentes no banco.
**Validates: Requirements 10.4**

### Property 18: Armazenamento completo de dados da carta
*Para qualquer* carta criada, todos os dados especificados (id, collection_id, order, title, message, image_url, youtube_url, status, opened_at) devem estar presentes no banco.
**Validates: Requirements 10.5**

## Error Handling

### Validation Errors
- Texto excedendo 500 caracteres: retornar erro 400 com mensagem clara
- URL do YouTube inválida: retornar erro 400 com mensagem clara
- Campos obrigatórios faltando: retornar erro 400 com lista de campos

### Business Logic Errors
- Tentativa de abrir carta já aberta: retornar erro 403 com mensagem "Esta carta já foi aberta"
- Tentativa de checkout com dados inválidos: retornar erro 400 com lista de problemas
- Conjunto não encontrado: retornar erro 404

### External Service Errors
- Falha no upload de imagem: retornar erro 500, permitir retry
- Falha no Stripe: retornar erro 500, preservar dados do usuário
- Falha no envio de email: logar erro, não bloquear fluxo principal

### Database Errors
- Violação de constraint: retornar erro 400 com mensagem apropriada
- Timeout de conexão: retornar erro 503, sugerir retry
- Erro de integridade referencial: retornar erro 400

## Testing Strategy

### Unit Tests
- Validação de schemas Zod
- Funções de transformação de dados (rowToEntity)
- Lógica de negócio em Services
- Componentes React individuais

### Property-Based Tests
- Todas as 18 propriedades listadas acima devem ser implementadas como property tests
- Usar biblioteca `fast-check` para TypeScript
- Mínimo 100 iterações por teste
- Cada teste deve referenciar sua propriedade no design

### Integration Tests
- Fluxo completo de criação → edição → pagamento → visualização
- Webhook do Stripe para atualização de status
- Upload de imagens para R2
- Envio de emails via Resend

### End-to-End Tests
- Criar conjunto completo via UI
- Editar todas as 12 cartas
- Completar checkout
- Visualizar cartas como destinatário
- Abrir cartas e verificar bloqueio

### Test Configuration
```typescript
// Exemplo de property test
describe('Feature: 12-cartas-produto, Property 1: Conjunto sempre criado com 12 cartas', () => {
  it('should create exactly 12 cards with pre-filled content', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          recipientName: fc.string({ minLength: 1, maxLength: 100 }),
          senderName: fc.string({ minLength: 1, maxLength: 100 }),
        }),
        async (input) => {
          const result = await cardCollectionService.create(input);
          const cards = await cardService.findByCollectionId(result.id);
          
          expect(cards).toHaveLength(12);
          cards.forEach(card => {
            expect(card.messageText).not.toBe('');
            expect(card.title).not.toBe('');
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

## Implementation Notes

### Reuse Strategy
1. **Database**: Adicionar novas tabelas ao PostgreSQL existente
2. **Services**: Criar novos services seguindo padrão de MessageService
3. **API Routes**: Seguir estrutura de /api/messages/*
4. **Components**: Adaptar WizardEditor existente para 12 steps
5. **Styling**: Usar mesmos temas e cores do Tailwind config
6. **Validation**: Usar Zod como no resto do projeto

### Performance Considerations
- Lazy loading de imagens nas cartas
- Paginação não necessária (sempre 12 cartas)
- Cache de conjunto completo no frontend
- Índices de banco otimizados para queries comuns

### Security Considerations
- Validação de ownership antes de editar cartas
- Rate limiting em endpoints de criação
- Sanitização de inputs de texto
- Validação de URLs antes de armazenar
- CSRF protection em formulários

### Accessibility
- Keyboard navigation entre cartas
- Screen reader support para status de cartas
- Alt text para imagens
- ARIA labels apropriados
- Contraste de cores adequado (WCAG AA)
