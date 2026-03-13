# Card Collection Checkout Integration Example

## Frontend Integration

### In CardCollectionEditor Component

```typescript
// src/components/card-editor/CardCollectionEditor.tsx

import { useState } from 'react';

export function CardCollectionEditor() {
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const collectionId = '...'; // From context or props

  const handleProceedToCheckout = async () => {
    setIsProcessingCheckout(true);

    try {
      // Call the checkout API
      const response = await fetch('/api/checkout/card-collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error.message);
      }

      const { url } = await response.json();
      
      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Falha ao criar sessão de pagamento. Por favor, tente novamente.');
      setIsProcessingCheckout(false);
    }
  };

  return (
    <div>
      {/* Your editor UI */}
      
      <button
        onClick={handleProceedToCheckout}
        disabled={isProcessingCheckout}
        className="btn-primary"
      >
        {isProcessingCheckout ? 'Processando...' : 'Finalizar e Pagar'}
      </button>
    </div>
  );
}
```

### In Editor Page

```typescript
// src/app/(marketing)/editor/12-cartas/page.tsx

'use client';

import { CardCollectionEditor } from '@/components/card-editor/CardCollectionEditor';
import { CardCollectionEditorProvider } from '@/contexts/CardCollectionEditorContext';

export default function CardCollectionEditorPage() {
  return (
    <CardCollectionEditorProvider>
      <CardCollectionEditor />
    </CardCollectionEditorProvider>
  );
}
```

### With Context Integration

```typescript
// src/contexts/CardCollectionEditorContext.tsx

export function CardCollectionEditorProvider({ children }: Props) {
  const [collection, setCollection] = useState<CardCollection | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const proceedToCheckout = async () => {
    if (!collection) {
      throw new Error('No collection to checkout');
    }

    setIsCheckingOut(true);

    try {
      const response = await fetch('/api/checkout/card-collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionId: collection.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error.message);
      }

      const { url } = await response.json();
      
      // Redirect to Stripe
      window.location.href = url;
    } catch (error) {
      console.error('Checkout failed:', error);
      setIsCheckingOut(false);
      throw error;
    }
  };

  return (
    <CardCollectionEditorContext.Provider
      value={{
        collection,
        isCheckingOut,
        proceedToCheckout,
        // ... other context values
      }}
    >
      {children}
    </CardCollectionEditorContext.Provider>
  );
}
```

## Validation Before Checkout

```typescript
// Validate all cards are properly filled before allowing checkout
function validateCollectionForCheckout(cards: Card[]): boolean {
  // Check all 12 cards exist
  if (cards.length !== 12) {
    return false;
  }

  // Check each card has required content
  for (const card of cards) {
    // Title is required
    if (!card.title || card.title.trim().length === 0) {
      return false;
    }

    // Message is required and must be <= 500 chars
    if (!card.messageText || card.messageText.trim().length === 0) {
      return false;
    }

    if (card.messageText.length > 500) {
      return false;
    }

    // If YouTube URL is provided, validate format
    if (card.youtubeUrl) {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
      if (!youtubeRegex.test(card.youtubeUrl)) {
        return false;
      }
    }
  }

  return true;
}

// Usage in component
const handleCheckout = async () => {
  if (!validateCollectionForCheckout(cards)) {
    alert('Por favor, preencha todas as cartas antes de finalizar.');
    return;
  }

  await proceedToCheckout();
};
```

## Error Handling

```typescript
async function handleCheckoutWithErrorHandling(collectionId: string) {
  try {
    const response = await fetch('/api/checkout/card-collection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ collectionId }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific error codes
      switch (data.error.code) {
        case 'COLLECTION_NOT_FOUND':
          alert('Conjunto de cartas não encontrado. Por favor, recarregue a página.');
          break;
        case 'COLLECTION_ALREADY_PAID':
          alert('Este conjunto já foi pago. Redirecionando...');
          // Redirect to success page or collection view
          window.location.href = '/success';
          break;
        case 'VALIDATION_ERROR':
          alert('Dados inválidos. Por favor, verifique o conjunto de cartas.');
          break;
        default:
          alert('Erro ao processar pagamento. Por favor, tente novamente.');
      }
      return;
    }

    // Success - redirect to Stripe
    window.location.href = data.url;
  } catch (error) {
    console.error('Checkout error:', error);
    alert('Erro de conexão. Por favor, verifique sua internet e tente novamente.');
  }
}
```

## Loading States

```typescript
function CheckoutButton({ collectionId, cards }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/checkout/card-collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId }),
      });

      if (!response.ok) {
        throw new Error('Checkout failed');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error(error);
      alert('Falha ao processar pagamento');
      setIsLoading(false);
    }
  };

  const isValid = validateCollectionForCheckout(cards);

  return (
    <button
      onClick={handleClick}
      disabled={!isValid || isLoading}
      className={`
        px-6 py-3 rounded-lg font-semibold
        ${isValid && !isLoading
          ? 'bg-blue-600 hover:bg-blue-700 text-white'
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }
      `}
    >
      {isLoading ? (
        <>
          <span className="animate-spin mr-2">⏳</span>
          Processando...
        </>
      ) : (
        'Finalizar e Pagar R$ 49,99'
      )}
    </button>
  );
}
```

## Success Flow

After successful payment, Stripe redirects to:
```
/success?session_id={CHECKOUT_SESSION_ID}
```

The success page should:
1. Retrieve session details from `/api/checkout/session`
2. Extract `collectionId` from metadata
3. Wait for webhook to process (status becomes 'paid')
4. Display success message with link to collection

```typescript
// src/app/(marketing)/success/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [collectionSlug, setCollectionSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    // Poll for collection status
    const checkStatus = async () => {
      const response = await fetch(`/api/checkout/session?session_id=${sessionId}`);
      const data = await response.json();

      if (data.productType === 'card-collection') {
        // Check if collection has been processed
        const collectionResponse = await fetch(`/api/card-collections/${data.collectionId}`);
        const collection = await collectionResponse.json();

        if (collection.status === 'paid' && collection.slug) {
          setCollectionSlug(collection.slug);
        }
      }
    };

    // Check immediately and then every 2 seconds
    checkStatus();
    const interval = setInterval(checkStatus, 2000);

    return () => clearInterval(interval);
  }, [sessionId]);

  if (!collectionSlug) {
    return <div>Processando pagamento...</div>;
  }

  return (
    <div>
      <h1>Pagamento confirmado! 🎉</h1>
      <p>Seu conjunto de 12 cartas está pronto!</p>
      <a href={`/cartas/${collectionSlug}`}>
        Ver minhas cartas
      </a>
    </div>
  );
}
```

## Testing in Development

```bash
# 1. Start the dev server
npm run dev

# 2. Create a test collection
curl -X POST http://localhost:3000/api/card-collections/create \
  -H "Content-Type: application/json" \
  -d '{
    "recipientName": "Test User",
    "senderName": "Test Sender",
    "contactEmail": "test@example.com"
  }'

# 3. Use the returned ID to create checkout
curl -X POST http://localhost:3000/api/checkout/card-collection \
  -H "Content-Type: application/json" \
  -d '{
    "collectionId": "YOUR_COLLECTION_ID"
  }'

# 4. Visit the returned URL to complete test payment
# Use Stripe test card: 4242 4242 4242 4242
```
