# Paper Bloom Digital

Plataforma de mensagens digitais personalizadas. Crie mensagens com fotos, músicas do YouTube e temas visuais, compartilhe via QR Code ou link.

## Stack

- **Framework:** Next.js 14 (App Router, standalone output)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Banco de dados:** PostgreSQL (com connection pooling via `pg`)
- **Pagamentos:** Mercado Pago
- **Storage de imagens:** Cloudflare R2 (S3-compatible)
- **Emails transacionais:** Resend
- **Animações:** Framer Motion
- **Deploy:** Docker + Coolify

## Produtos

| Produto | Descrição |
|---------|-----------|
| **Mensagem Digital** | Mensagem personalizada com foto, texto e música |
| **12 Cartas** | Coleção de 12 cartas com fotos e mensagens individuais |
| **Revelação Virtual** | Revelação de gênero interativa com votação |

## Estrutura do Projeto

```
src/
├── app/
│   ├── (fullscreen)/       # Páginas de visualização (sem header/footer)
│   │   ├── c/              # Visualização de coleção de cartas
│   │   ├── cartas/         # Visualização individual de cartas
│   │   ├── demo/           # Demo do editor
│   │   ├── editor/         # Editor de cartas (fullscreen)
│   │   ├── mensagem/       # Visualização de mensagem digital
│   │   └── revelacao-virtual/
│   ├── (marketing)/        # Páginas com layout marketing (header/footer)
│   │   ├── 12-cartas/      # Landing page 12 cartas
│   │   ├── checkout/       # Página de checkout
│   │   ├── delivery/       # Página de entrega pós-pagamento
│   │   ├── mensagem-digital/
│   │   ├── produtos/       # Catálogo de produtos
│   │   ├── revelacao-virtual/
│   │   └── success/        # Página de sucesso pós-pagamento
│   ├── admin/              # Painel administrativo
│   │   ├── login/
│   │   ├── marketing/
│   │   ├── pedidos/
│   │   ├── precos/
│   │   └── produtos/
│   └── api/                # API Routes
│       ├── admin/
│       ├── card-collections/
│       ├── cards/
│       ├── checkout/       # Checkout + webhook Mercado Pago
│       ├── gender-reveal/
│       ├── health/
│       ├── messages/
│       ├── prices/
│       ├── upload/         # Upload de imagens para R2
│       └── youtube/        # Busca de títulos do YouTube
├── components/
├── config/
├── contexts/
├── data/
├── hooks/
├── lib/
│   ├── migrations/         # Migrations SQL do banco
│   └── ...                 # DB, validação, utils
├── services/
└── types/
```

## Setup Local

### Pré-requisitos

- Node.js 20+
- PostgreSQL
- Conta no Mercado Pago (developer)
- Bucket Cloudflare R2
- Conta Resend (para emails)

### Instalação

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env.local
# Preencher .env.local com seus valores

# Testar conexão com banco
npm run db:test

# Rodar migrations
npm run db:migrate

# Iniciar dev server
npm run dev
```

### Variáveis de Ambiente

Veja `.env.example` para a lista completa. As principais são:

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | Connection string PostgreSQL |
| `MERCADOPAGO_ACCESS_TOKEN` | Token de acesso Mercado Pago |
| `MERCADOPAGO_PUBLIC_KEY` | Chave pública Mercado Pago |
| `MERCADOPAGO_WEBHOOK_SECRET` | Secret do webhook Mercado Pago |
| `NEXT_PUBLIC_BASE_URL` | URL base da aplicação |
| `R2_*` | Credenciais Cloudflare R2 |
| `RESEND_API_KEY` | API key do Resend |
| `RESEND_FROM_EMAIL` | Email remetente verificado |
| `ADMIN_JWT_SECRET` | Secret para JWT do painel admin |

## Scripts Disponíveis

```bash
npm run dev              # Dev server
npm run build            # Build de produção
npm run start            # Iniciar produção
npm run lint             # Linter
npm run test             # Rodar testes (vitest)

# Banco de dados
npm run db:test          # Testar conexão
npm run db:migrate       # Rodar migrations
npm run db:rollback      # Reverter migrations
npm run db:verify        # Verificar schema

# Validação
npm run validate:env     # Validar variáveis de ambiente
npm run validate-setup   # Validar setup completo
npm run r2:test          # Testar conexão R2
```

## Banco de Dados

### Migrations

As migrations ficam em `src/lib/migrations/`. Ordem:

1. `001` — Tabela `messages` (mensagens digitais)
2. `002` — Campos adicionais de mensagem
3. `003` — Campos de tema
4. `004` — Tabela `card_collections` (coleções de 12 cartas)
5. `005` — Tabela `cards` (cartas individuais)
6. `006` — Tabela `gender_reveals` (revelação virtual)
7. `007` — Tabelas admin + votos de revelação

```bash
# Rodar todas as migrations
npm run db:migrate

# Reverter
npm run db:rollback
```

## Deploy (Produção)

O projeto usa Docker com deploy via Coolify.

### Build Docker

```bash
docker build -t paperbloom .
docker run -p 3000:3000 --env-file .env.production paperbloom
```

### Checklist de Deploy

1. Build local funciona (`npm run build`)
2. Variáveis de produção configuradas (ver `.env.production.example`)
3. Migrations executadas no banco de produção
4. Webhook do Mercado Pago configurado apontando para `/api/checkout/webhook`
5. Domínio e SSL configurados
6. Health check: `GET /api/health` retorna `{"status":"healthy"}`

### Variáveis de Produção

Veja `.env.production.example` para o template completo com todas as variáveis necessárias para produção.
