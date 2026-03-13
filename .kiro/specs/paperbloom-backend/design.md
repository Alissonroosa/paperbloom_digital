# Design Document - Paper Bloom Backend

## Overview

O Paper Bloom Backend é um sistema completo para gerenciar presentes digitais personalizados. O sistema permite que usuários criem mensagens personalizadas com imagens, texto e música, processem pagamentos através do Stripe, e compartilhem as mensagens através de links únicos e QR codes.

A arquitetura é baseada em Next.js com API Routes, PostgreSQL para persistência de dados, Stripe para processamento de pagamentos, e bibliotecas especializadas para geração de QR codes e processamento de imagens.

## Architecture

### High-Level Architecture

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Frontend  │────────▶│   Next.js API    │────────▶│ PostgreSQL  │
│  (React)    │         │     Routes       │         │  Database   │
└─────────────┘         └──────────────────┘         └─────────────┘
                               │      │
                               │      │
                        ┌──────┘      └──────┐
                        ▼                     ▼
                 ┌─────────────┐      ┌─────────────┐
                 │   Stripe    │      │   Storage   │
                 │     API     │      │  (Images/   │
                 └─────────────┘      │  QR Codes)  │
                                      └─────────────┘
```

### Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL com pg ou Prisma ORM
- **Payment**: Stripe SDK
- **QR Code**: qrcode library
- **Image Processing**: sharp
- **File Storage**: Sistema de arquivos local ou serviço de storage (public folder)
- **Validation**: zod
- **Type Safety**: TypeScript

### API Routes Structure

```
/api
  /messages
    POST /create          - Criar nova mensagem (draft)
    POST /upload-image    - Upload de imagem
    GET /[slug]           - Buscar mensagem por slug
  /checkout
    POST /create-session  - Criar sessão de checkout Stripe
    POST /webhook         - Webhook do Stripe
  /qrcode
    POST /generate        - Gerar QR code
```

## Components and Interfaces

### 1. Database Schema

```typescript
// Message Table
interface Message {
  id: string;                    // UUID
  recipientName: string;         // Nome do destinatário
  senderName: string;            // Nome do remetente
  messageText: string;           // Texto da mensagem
  imageUrl: string | null;       // URL da imagem
  youtubeUrl: string | null;     // URL do YouTube
  slug: string | null;           // Slug único
  qrCodeUrl: string | null;      // URL do QR code
  status: 'pending' | 'paid';    // Status do pagamento
  stripeSessionId: string | null;// ID da sessão Stripe
  viewCount: number;             // Contador de visualizações
  createdAt: Date;               // Data de criação
  updatedAt: Date;               // Data de atualização
}
```

### 2. API Interfaces

```typescript
// POST /api/messages/create
interface CreateMessageRequest {
  recipientName: string;
  senderName: string;
  messageText: string;
  imageUrl?: string;
  youtubeUrl?: string;
}

interface CreateMessageResponse {
  id: string;
  message: string;
}

// POST /api/messages/upload-image
interface UploadImageRequest {
  // multipart/form-data
  image: File;
}

interface UploadImageResponse {
  url: string;
}

// GET /api/messages/[slug]
interface GetMessageResponse {
  id: string;
  recipientName: string;
  senderName: string;
  messageText: string;
  imageUrl: string | null;
  youtubeUrl: string | null;
  qrCodeUrl: string | null;
  viewCount: number;
  createdAt: string;
}

// POST /api/checkout/create-session
interface CreateCheckoutRequest {
  messageId: string;
}

interface CreateCheckoutResponse {
  sessionId: string;
  url: string;
}

// POST /api/checkout/webhook
interface StripeWebhookEvent {
  type: string;
  data: {
    object: {
      id: string;
      metadata: {
        messageId: string;
      };
    };
  };
}

// POST /api/qrcode/generate
interface GenerateQRCodeRequest {
  url: string;
  messageId: string;
}

interface GenerateQRCodeResponse {
  qrCodeUrl: string;
}
```

### 3. Service Layer

```typescript
// MessageService
class MessageService {
  async create(data: CreateMessageRequest): Promise<Message>;
  async findById(id: string): Promise<Message | null>;
  async findBySlug(slug: string): Promise<Message | null>;
  async updateStatus(id: string, status: 'paid'): Promise<Message>;
  async updateQRCode(id: string, qrCodeUrl: string, slug: string): Promise<Message>;
  async incrementViewCount(id: string): Promise<void>;
}

// StripeService
class StripeService {
  async createCheckoutSession(messageId: string, amount: number): Promise<{ sessionId: string; url: string }>;
  async verifyWebhookSignature(payload: string, signature: string): boolean;
  async handleSuccessfulPayment(sessionId: string): Promise<void>;
}

// QRCodeService
class QRCodeService {
  async generate(url: string, messageId: string): Promise<string>;
}

// ImageService
class ImageService {
  async upload(file: File): Promise<string>;
  async resize(buffer: Buffer, maxWidth: number, maxHeight: number): Promise<Buffer>;
  async validateImageType(file: File): boolean;
}

// SlugService
class SlugService {
  generateSlug(recipientName: string, messageId: string): string;
  normalizeString(input: string): string;
}
```

## Data Models

### Message Entity

O modelo central do sistema que representa uma mensagem personalizada.

**Campos:**
- `id`: Identificador único (UUID v4)
- `recipientName`: Nome do destinatário (1-100 caracteres)
- `senderName`: Nome do remetente (1-100 caracteres)
- `messageText`: Texto da mensagem (1-500 caracteres)
- `imageUrl`: URL da imagem (opcional, validada)
- `youtubeUrl`: URL do YouTube (opcional, formato validado)
- `slug`: Slug único para acesso (gerado após pagamento)
- `qrCodeUrl`: URL do QR code (gerado após pagamento)
- `status`: Status do pagamento ('pending' | 'paid')
- `stripeSessionId`: ID da sessão Stripe (para rastreamento)
- `viewCount`: Contador de visualizações (default: 0)
- `createdAt`: Timestamp de criação
- `updatedAt`: Timestamp de última atualização

**Constraints:**
- `id` é PRIMARY KEY
- `slug` é UNIQUE quando não null
- `status` default é 'pending'
- `viewCount` default é 0
- `recipientName`, `senderName`, `messageText` são NOT NULL

### Database Migrations

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_name VARCHAR(100) NOT NULL,
  sender_name VARCHAR(100) NOT NULL,
  message_text VARCHAR(500) NOT NULL,
  image_url TEXT,
  youtube_url TEXT,
  slug VARCHAR(255) UNIQUE,
  qr_code_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  stripe_session_id VARCHAR(255),
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_slug ON messages(slug);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_stripe_session_id ON messages(stripe_session_id);
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Message validation rejects incomplete data
*For any* message creation request missing required fields (recipientName, senderName, or messageText), the system should reject the request with a validation error.
**Validates: Requirements 1.1**

### Property 2: Image upload round-trip
*For any* valid image file uploaded, retrieving the returned URL should return the same image data.
**Validates: Requirements 1.2**

### Property 3: YouTube URL validation
*For any* string that is not a valid YouTube URL format, the system should reject it. For valid YouTube URLs, the system should accept them.
**Validates: Requirements 1.3**

### Property 4: Message ID uniqueness
*For any* set of messages created, all message IDs should be unique.
**Validates: Requirements 1.4**

### Property 5: Message persistence round-trip
*For any* message created, querying the database by ID should return a message with identical field values.
**Validates: Requirements 1.5**

### Property 6: Stripe session contains message data
*For any* valid message, creating a checkout session should return a session that contains the message ID in metadata.
**Validates: Requirements 2.1**

### Property 7: Successful payment updates status
*For any* valid Stripe webhook indicating successful payment, the corresponding message status should change to 'paid'.
**Validates: Requirements 2.2, 2.3**

### Property 8: Failed payment preserves pending status
*For any* payment failure or pending message, the message status should remain 'pending'.
**Validates: Requirements 2.4**

### Property 9: Invalid webhook signatures are rejected
*For any* webhook with an invalid signature, the system should reject it. For valid signatures, the system should process the webhook.
**Validates: Requirements 2.5**

### Property 10: Slug format validation
*For any* paid message, the generated slug should match the format /mensagem/{normalized_recipient_name}/{message_id}.
**Validates: Requirements 3.1**

### Property 11: QR code URL round-trip
*For any* generated QR code, decoding the QR code image should return the original message URL.
**Validates: Requirements 3.2**

### Property 12: QR code URL accessibility
*For any* QR code generated, the returned URL should be accessible and return a valid PNG image.
**Validates: Requirements 3.3**

### Property 13: Payment confirmation returns both link and QR code
*For any* confirmed payment, the response should contain both a message link and a QR code URL.
**Validates: Requirements 3.4**

### Property 14: Special characters are normalized in slugs
*For any* recipient name containing special characters (accents, spaces, symbols), the generated slug should contain only URL-safe characters (a-z, 0-9, hyphens).
**Validates: Requirements 3.5**

### Property 15: Slug lookup returns correct message
*For any* valid slug, querying by slug should return the message with matching ID.
**Validates: Requirements 4.1**

### Property 16: Paid messages return complete data
*For any* message with status 'paid', the API response should include all non-null fields (recipientName, senderName, messageText, imageUrl if set, youtubeUrl if set).
**Validates: Requirements 4.2**

### Property 17: Non-existent slugs return 404
*For any* slug that does not exist in the database, the API should return HTTP status 404.
**Validates: Requirements 4.3**

### Property 18: Unpaid messages are not accessible
*For any* message with status 'pending', attempting to access it should return an error (not 404, but a specific "not available" error).
**Validates: Requirements 4.4**

### Property 19: View count increments on access
*For any* message accessed, the view count should increase by exactly 1.
**Validates: Requirements 4.5**

### Property 20: Invalid JSON is rejected
*For any* API request with malformed JSON, the system should return a 400 error with a descriptive message.
**Validates: Requirements 5.1**

### Property 21: Validation errors return 4xx with message
*For any* validation error, the HTTP status code should be in the 4xx range and the response should contain a descriptive error message.
**Validates: Requirements 5.2**

### Property 22: Successful operations return 2xx
*For any* successful API operation, the HTTP status code should be 200 or 201.
**Validates: Requirements 5.3**

### Property 23: CORS headers are present
*For any* API response, the response should include appropriate CORS headers (Access-Control-Allow-Origin, etc.).
**Validates: Requirements 5.4**

### Property 24: Multipart uploads are supported
*For any* valid multipart/form-data request with an image, the system should successfully process the upload.
**Validates: Requirements 5.5**

### Property 25: Timestamps are automatically set
*For any* message created, both createdAt and updatedAt timestamps should be set and be valid dates.
**Validates: Requirements 6.2**

### Property 26: Referential integrity is enforced
*For any* operation that would violate database constraints (e.g., duplicate slug), the operation should fail with an error.
**Validates: Requirements 6.3**

### Property 27: Failed transactions rollback
*For any* database transaction that fails midway, the database state should remain unchanged (no partial updates).
**Validates: Requirements 6.4**

### Property 28: Stored URLs are accessible
*For any* URL stored in the database (imageUrl, qrCodeUrl), making an HTTP request to that URL should return a successful response (2xx status).
**Validates: Requirements 6.5**

### Property 29: Form validation before payment
*For any* checkout attempt with invalid form data, the system should not create a Stripe session and should display validation errors.
**Validates: Requirements 7.3**

### Property 30: Error messages match fields
*For any* form field with a validation error, there should be a corresponding error message for that specific field.
**Validates: Requirements 7.4**

### Property 31: Invalid image types are rejected
*For any* file that is not JPEG, PNG, or WebP, the upload should be rejected. For valid types, the upload should succeed.
**Validates: Requirements 8.1**

### Property 32: Large images are resized
*For any* image larger than the maximum dimensions, the processed image should have dimensions less than or equal to the maximum.
**Validates: Requirements 8.2**

### Property 33: Processed images are publicly accessible
*For any* processed image, the returned URL should be publicly accessible without authentication.
**Validates: Requirements 8.3**

### Property 34: Upload failures return error messages
*For any* failed upload, the response should contain a clear error message explaining the failure.
**Validates: Requirements 8.4**

### Property 35: Stored images have public URLs
*For any* stored image, the system should return a valid, accessible URL.
**Validates: Requirements 8.5**

### Property 36: QR codes meet minimum resolution
*For any* generated QR code, the image dimensions should be at least 300x300 pixels.
**Validates: Requirements 9.1**

### Property 37: QR codes contain complete URLs
*For any* QR code generated, decoding it should return the complete message URL including protocol and domain.
**Validates: Requirements 9.2**

### Property 38: QR codes redirect correctly
*For any* QR code scanned, following the URL should lead to the correct message page.
**Validates: Requirements 9.3**

### Property 39: QR code storage and URL return
*For any* QR code generated, the system should store the image and return a valid, accessible URL.
**Validates: Requirements 9.4**

### Property 40: QR code filenames are unique
*For any* set of QR codes generated, all filenames should be unique.
**Validates: Requirements 9.5**

### Property 41: Image size limit enforcement
*For any* image upload, files up to 10MB should be accepted, and files larger than 10MB should be rejected.
**Validates: Requirements 10.3**

## Error Handling

### Error Types

1. **Validation Errors (400)**
   - Missing required fields
   - Invalid field formats
   - Invalid file types
   - File size exceeded

2. **Not Found Errors (404)**
   - Message slug not found
   - Resource not found

3. **Payment Errors (402)**
   - Message not paid
   - Payment required

4. **Server Errors (500)**
   - Database connection failures
   - Stripe API failures
   - File system errors
   - QR code generation failures

### Error Response Format

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
```

### Error Handling Strategy

1. **Input Validation**: Use Zod schemas to validate all inputs before processing
2. **Database Errors**: Wrap all database operations in try-catch blocks
3. **External API Errors**: Handle Stripe API errors gracefully with retries where appropriate
4. **File Operations**: Validate file operations and clean up on failures
5. **Logging**: Log all errors with context for debugging
6. **User-Friendly Messages**: Return clear, actionable error messages to users

## Testing Strategy

### Unit Testing

Unit tests will cover individual functions and services:

- **Validation Functions**: Test Zod schemas with valid and invalid inputs
- **Slug Generation**: Test normalization of various strings
- **Image Processing**: Test resize and validation functions
- **Database Queries**: Test CRUD operations with mock database

**Testing Framework**: Jest or Vitest

### Property-Based Testing

Property-based tests will verify universal properties across many inputs:

- **Library**: fast-check (JavaScript/TypeScript property-based testing library)
- **Configuration**: Each property test should run a minimum of 100 iterations
- **Tagging**: Each test must be tagged with the format: `**Feature: paperbloom-backend, Property {number}: {property_text}**`

**Key Property Tests**:
- Message validation with randomly generated incomplete data
- Slug generation with random strings containing special characters
- QR code round-trip with random URLs
- Database round-trip with random message data
- View count increment with concurrent access
- Image upload with various file types and sizes

### Integration Testing

Integration tests will verify end-to-end flows:

- Complete message creation flow
- Payment processing with Stripe test mode
- QR code generation and access
- Message retrieval by slug

### Test Database

- Use a separate test database or in-memory database for tests
- Reset database state between tests
- Use database transactions that rollback after each test

## Implementation Notes

### Stripe Integration

1. **Webhook Security**: Always verify webhook signatures using Stripe's library
2. **Idempotency**: Handle duplicate webhook events gracefully
3. **Test Mode**: Use Stripe test keys during development
4. **Metadata**: Store messageId in Stripe session metadata for tracking

### File Storage

**Option 1: Local File System (Development)**
- Store in `public/uploads/images` and `public/uploads/qrcodes`
- Serve via Next.js static file serving

**Option 2: Cloud Storage (Production)**
- Use AWS S3, Cloudinary, or similar
- Generate signed URLs for secure access
- Implement CDN for better performance

### Database Connection

```typescript
// Use connection pooling
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Environment Variables

```env
DATABASE_URL=postgres://alisson_user:A%23A%40T4rrm%25172628@82.112.250.187:5432/c_paperbloom
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Security Considerations

1. **SQL Injection**: Use parameterized queries or ORM
2. **File Upload**: Validate file types and sizes
3. **Rate Limiting**: Implement rate limiting on API routes
4. **CORS**: Configure CORS appropriately for production
5. **Environment Variables**: Never commit secrets to version control
6. **Webhook Verification**: Always verify Stripe webhook signatures

### Performance Optimizations

1. **Database Indexing**: Index slug, status, and stripeSessionId columns
2. **Connection Pooling**: Reuse database connections
3. **Image Optimization**: Resize and compress images on upload
4. **Caching**: Cache frequently accessed messages (optional)
5. **Lazy Loading**: Load images lazily on the frontend

## Deployment Considerations

### Database Setup

1. Run migrations to create tables
2. Set up database backups
3. Configure connection pooling
4. Monitor database performance

### Stripe Setup

1. Create Stripe account
2. Configure webhook endpoint
3. Set up product and pricing
4. Test with Stripe test mode

### Environment Configuration

1. Set all environment variables in production
2. Use different Stripe keys for production
3. Configure proper CORS origins
4. Set up monitoring and logging

### Monitoring

1. Log all errors with context
2. Monitor Stripe webhook delivery
3. Track message creation and payment success rates
4. Monitor database performance
5. Set up alerts for failures
