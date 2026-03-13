# Plano de Implementação - Editor 12 Cartas

## 🎯 Objetivo

Criar o editor `/editor/12-cartas` que permite ao usuário personalizar uma experiência de 12 cartas e, após o pagamento, visualizá-la em `/c/[slug]`.

## 📋 Checklist de Implementação

### Fase 1: APIs e Backend ✅

- [x] Rota `/api/card-collections/create` (já existe)
- [x] Rota `/api/card-collections/[id]` GET/PATCH (já existe)
- [ ] Rota `/api/cards/[id]` PATCH (criar)
- [ ] Rota `/api/upload/card-image` POST (criar)
- [ ] Atualizar webhook para gerar slug único
- [ ] Atualizar webhook para enviar email com link

### Fase 2: Componentes do Editor

- [ ] `SimpleCardCollectionEditor.tsx` - Editor principal
- [ ] `EditCardModal.tsx` - Modal para editar carta individual
- [ ] `CardBlockEditor.tsx` - Grid de 4 cartas por bloco
- [ ] `MusicSelector.tsx` - Seletor de música do YouTube
- [ ] `ContactForm.tsx` - Formulário de dados de contato

### Fase 3: Páginas

- [ ] `/editor/12-cartas/page.tsx` - Página do editor
- [ ] `/c/[slug]/page.tsx` - Página pública de visualização

### Fase 4: Testes e Ajustes

- [ ] Testar fluxo completo de criação
- [ ] Testar upload de imagens
- [ ] Testar checkout e webhook
- [ ] Testar página pública
- [ ] Testar sistema de "abrir apenas uma vez"

## 🔧 Implementação Detalhada

### 1. API: Update Card

**Arquivo:** `src/app/api/cards/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { cardService } from '@/services/CardService';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, message, imageUrl } = body;

    const card = await cardService.update(params.id, {
      title,
      messageText: message,
      imageUrl
    });

    return NextResponse.json({ card });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update card' },
      { status: 500 }
    );
  }
}
```

### 2. API: Upload Image

**Arquivo:** `src/app/api/upload/card-image/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2 } from '@/lib/r2-upload';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    const url = await uploadToR2(file, 'card-images');

    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
```

### 3. Editor Principal

**Arquivo:** `src/app/(marketing)/editor/12-cartas/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SimpleCardCollectionEditor } from '@/components/card-editor/SimpleCardCollectionEditor';

export default function Editor12CartasPage() {
  const router = useRouter();
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Criar coleção ao carregar
    createCollection();
  }, []);

  const createCollection = async () => {
    try {
      const response = await fetch('/api/card-collections/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: 'Destinatário',
          senderName: 'Remetente',
          contactName: '',
          contactEmail: '',
          contactPhone: ''
        })
      });

      const { collection } = await response.json();
      setCollectionId(collection.id);
    } catch (error) {
      console.error('Failed to create collection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async (collectionId: string) => {
    // Criar checkout session
    const response = await fetch('/api/checkout/card-collection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collectionId })
    });

    const { url } = await response.json();
    window.location.href = url;
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <SimpleCardCollectionEditor
      collectionId={collectionId!}
      onComplete={handleComplete}
    />
  );
}
```

### 4. Componente Editor

**Arquivo:** `src/components/card-editor/SimpleCardCollectionEditor.tsx`

Estrutura:
- Step 1: Informações básicas (destinatário, remetente)
- Step 2: Editar cartas bloco 1 (1-4)
- Step 3: Editar cartas bloco 2 (5-8)
- Step 4: Editar cartas bloco 3 (9-12)
- Step 5: Música e dados de contato
- Step 6: Resumo e pagamento

### 5. Página Pública

**Arquivo:** `src/app/(fullscreen)/c/[slug]/page.tsx`

```typescript
import { cardCollectionService } from '@/services/CardCollectionService';
import { cardService } from '@/services/CardService';
import CardCollectionViewer from '@/components/card-viewer/CardCollectionViewer';

export default async function PublicCardCollectionPage({
  params
}: {
  params: { slug: string }
}) {
  const collection = await cardCollectionService.getBySlug(params.slug);
  const cards = await cardService.getByCollectionId(collection.id);

  return (
    <CardCollectionViewer
      collection={collection}
      cards={cards}
    />
  );
}
```

## 📊 Estrutura de Dados

### CardCollection (após pagamento)

```typescript
{
  id: "uuid",
  recipientName: "Maria",
  senderName: "João",
  slug: "joao-para-maria-abc123",
  qrCodeUrl: "https://...",
  status: "paid",
  stripeSessionId: "cs_...",
  contactName: "João Silva",
  contactEmail: "joao@email.com",
  contactPhone: "+55 11 99999-9999",
  youtubeVideoId: "nSDgHBxUbVQ",
  createdAt: Date,
  updatedAt: Date
}
```

### Card

```typescript
{
  id: "uuid",
  collectionId: "uuid",
  order: 1,
  title: "Quando estiver triste",
  messageText: "Lembre-se: você é mais forte...",
  imageUrl: "https://...",
  status: "unopened",
  openedAt: null,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 UI/UX do Editor

### Layout

```
┌─────────────────────────────────────┐
│ Header: Paper Bloom | Passo 2 de 6 │
├─────────────────────────────────────┤
│                                     │
│  [Progress Bar: ████░░░░░░ 33%]    │
│                                     │
│  Edite as Cartas - Bloco 1          │
│  Para Momentos Difíceis             │
│                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│  │  1   │ │  2   │ │  3   │ │  4   ││
│  │ 🔒   │ │ 🔒   │ │ 🔒   │ │ 🔒   ││
│  │Triste│ │Corag.│ │Sozin.│ │Conqu.││
│  │[Edit]│ │[Edit]│ │[Edit]│ │[Edit]││
│  └──────┘ └──────┘ └──────┘ └──────┘│
│                                     │
│  [Voltar]           [Próximo Bloco]│
└─────────────────────────────────────┘
```

### Modal de Edição

```
┌─────────────────────────────────────┐
│ Editar Carta 1                    ✕ │
├─────────────────────────────────────┤
│                                     │
│  Título:                            │
│  [Quando estiver triste          ]  │
│                                     │
│  Mensagem:                          │
│  ┌─────────────────────────────────┐│
│  │Lembre-se: você é mais forte    ││
│  │do que imagina. Cada desafio... ││
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│  Foto (opcional):                   │
│  ┌─────────────────────────────────┐│
│  │  [📷 Fazer Upload]              ││
│  │  ou usar imagem genérica        ││
│  └─────────────────────────────────┘│
│                                     │
│  Preview:                           │
│  ┌─────────────────────────────────┐│
│  │ [Imagem]                        ││
│  │ Quando estiver triste           ││
│  │ Lembre-se: você é mais...       ││
│  └─────────────────────────────────┘│
│                                     │
│  [Cancelar]              [Salvar]   │
└─────────────────────────────────────┘
```

## 🔐 Segurança

1. **Validação de Dados:**
   - Validar todos os inputs no backend
   - Limitar tamanho de imagens (5MB)
   - Sanitizar textos

2. **Autenticação:**
   - Não requer login para criar
   - Slug único e não-guessable
   - QR Code para acesso fácil

3. **Rate Limiting:**
   - Limitar criação de coleções por IP
   - Limitar uploads de imagem

## 📈 Métricas

- Tempo médio de criação
- Taxa de abandono por step
- Número de fotos uploadadas
- Taxa de conversão (criação → pagamento)

---

**Status:** 🟡 Em Planejamento
**Próximo Passo:** Implementar APIs (Fase 1)
