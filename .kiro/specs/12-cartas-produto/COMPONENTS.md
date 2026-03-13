# Componentes - 12 Cartas

Documentação dos componentes React utilizados no produto "12 Cartas".

## Índice

- [Componentes de Edição](#componentes-de-edição)
- [Componentes de Visualização](#componentes-de-visualização)
- [Componentes de Seleção](#componentes-de-seleção)
- [Context API](#context-api)
- [Hooks Personalizados](#hooks-personalizados)

---

## Componentes de Edição

### CardCollectionEditor

**Localização:** `src/components/card-editor/CardCollectionEditor.tsx`

Componente principal do wizard de edição das 12 cartas.

**Props:**
```typescript
interface CardCollectionEditorProps {
  collectionId: string;
  onComplete?: () => void;
}
```

**Funcionalidades:**
- Gerencia navegação entre as 12 cartas
- Exibe indicador de progresso
- Auto-save de alterações
- Validação antes do checkout
- Integração com CardCollectionEditorContext

**Exemplo de Uso:**
```tsx
import { CardCollectionEditor } from '@/components/card-editor';

export default function EditorPage() {
  const collectionId = '550e8400-e29b-41d4-a716-446655440000';
  
  return (
    <CardCollectionEditor
      collectionId={collectionId}
      onComplete={() => {
        // Redirecionar para checkout
        window.location.href = '/checkout';
      }}
    />
  );
}
```

**Estados Internos:**
- `currentStep`: Índice da carta atual (0-11)
- `isLoading`: Carregando dados
- `isSaving`: Salvando alterações
- `validationErrors`: Erros de validação

**Documentação Completa:** [CardCollectionEditor.README.md](../../src/components/card-editor/CardCollectionEditor.README.md)

---

### CardEditorStep

**Localização:** `src/components/card-editor/CardEditorStep.tsx`

Componente de edição individual de cada carta.

**Props:**
```typescript
interface CardEditorStepProps {
  card: Card;
  onUpdate: (cardId: string, data: Partial<Card>) => Promise<void>;
  isActive: boolean;
}
```

**Funcionalidades:**
- Edição de título (até 200 caracteres)
- Edição de mensagem (até 500 caracteres)
- Upload de foto via ImageService
- Validação de URL do YouTube
- Preview em tempo real
- Contador de caracteres

**Exemplo de Uso:**
```tsx
import { CardEditorStep } from '@/components/card-editor';

function EditorWizard() {
  const handleUpdate = async (cardId: string, data: Partial<Card>) => {
    await fetch(`/api/cards/${cardId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  };

  return (
    <CardEditorStep
      card={currentCard}
      onUpdate={handleUpdate}
      isActive={true}
    />
  );
}
```

**Validações:**
- Título: 1-200 caracteres
- Mensagem: 1-500 caracteres
- Foto: Formatos JPG, PNG, WebP (máx 5MB)
- Música: URL válida do YouTube

**Documentação Completa:** [CardEditorStep.README.md](../../src/components/card-editor/CardEditorStep.README.md)

---

## Componentes de Visualização

### CardCollectionViewer

**Localização:** `src/components/card-viewer/CardCollectionViewer.tsx`

Componente para visualização do conjunto de 12 cartas pelo destinatário.

**Props:**
```typescript
interface CardCollectionViewerProps {
  collection: CardCollection;
  cards: Card[];
  onCardOpen: (cardId: string) => Promise<void>;
}
```

**Funcionalidades:**
- Grid responsivo com as 12 cartas
- Indicação visual de status (aberta/fechada)
- Modal de confirmação antes de abrir
- Animações de transição
- Informações do remetente

**Exemplo de Uso:**
```tsx
import { CardCollectionViewer } from '@/components/card-viewer';

export default function ViewerPage({ slug }: { slug: string }) {
  const { collection, cards } = await fetchCollection(slug);
  
  const handleCardOpen = async (cardId: string) => {
    await fetch(`/api/cards/${cardId}/open`, { method: 'POST' });
  };

  return (
    <CardCollectionViewer
      collection={collection}
      cards={cards}
      onCardOpen={handleCardOpen}
    />
  );
}
```

**Estados Visuais:**
- **Unopened**: Card com efeito de brilho, cursor pointer
- **Opened**: Card com opacidade reduzida, sem interação
- **Hover**: Animação de elevação (apenas unopened)

**Documentação Completa:** [CardCollectionViewer.README.md](../../src/components/card-viewer/CardCollectionViewer.README.md)

---

### CardModal

**Localização:** `src/components/card-viewer/CardModal.tsx`

Modal para exibir o conteúdo completo de uma carta aberta.

**Props:**
```typescript
interface CardModalProps {
  card: Card;
  isOpen: boolean;
  onClose: () => void;
  isFirstOpen: boolean;
}
```

**Funcionalidades:**
- Exibição de foto em alta resolução
- Reprodução automática de música (YouTube)
- Animação especial na primeira abertura
- Efeito de emojis caindo (FallingEmojis)
- Responsivo mobile/desktop

**Exemplo de Uso:**
```tsx
import { CardModal } from '@/components/card-viewer';

function CardGrid() {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isFirstOpen, setIsFirstOpen] = useState(false);

  return (
    <>
      {/* Grid de cartas */}
      <CardModal
        card={selectedCard}
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        isFirstOpen={isFirstOpen}
      />
    </>
  );
}
```

**Animações:**
- **Primeira Abertura**: Fade in + scale + emojis caindo
- **Reabertura**: Fade in simples
- **Fechamento**: Fade out

**Documentação Completa:** [CardModal.README.md](../../src/components/card-viewer/CardModal.README.md)

---

## Componentes de Seleção

### ProductSelector

**Localização:** `src/components/products/ProductSelector.tsx`

Componente para seleção entre os produtos disponíveis.

**Props:**
```typescript
interface ProductSelectorProps {
  onSelect?: (productType: 'message' | 'card-collection') => void;
}
```

**Funcionalidades:**
- Exibição de cards dos produtos
- Descrição, preço e preview
- Navegação para editores correspondentes
- Responsivo mobile/desktop

**Exemplo de Uso:**
```tsx
import { ProductSelector } from '@/components/products';

export default function HomePage() {
  return (
    <div>
      <h1>Escolha seu Produto</h1>
      <ProductSelector
        onSelect={(type) => {
          if (type === 'card-collection') {
            router.push('/editor/12-cartas');
          } else {
            router.push('/editor/mensagem');
          }
        }}
      />
    </div>
  );
}
```

**Produtos Exibidos:**
1. **Mensagem Digital** (R$ 29,90)
   - 1 mensagem personalizada
   - Até 7 fotos
   - 1 música
   - Acesso ilimitado

2. **12 Cartas** (R$ 49,90)
   - 12 cartas únicas
   - 1 foto por carta
   - 1 música por carta
   - Abertura única

**Documentação Completa:** [README.md](../../src/components/products/README.md)

---

## Context API

### CardCollectionEditorContext

**Localização:** `src/contexts/CardCollectionEditorContext.tsx`

Context para gerenciar o estado global do editor de cartas.

**Interface:**
```typescript
interface CardCollectionEditorContextType {
  // Estado
  collection: CardCollection | null;
  cards: Card[];
  currentCardIndex: number;
  isLoading: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  
  // Ações
  setCurrentCardIndex: (index: number) => void;
  updateCard: (cardId: string, data: Partial<Card>) => Promise<void>;
  saveProgress: () => Promise<void>;
  loadCollection: (collectionId: string) => Promise<void>;
  proceedToCheckout: () => Promise<void>;
  
  // Navegação
  goToNextCard: () => void;
  goToPreviousCard: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}
```

**Provider:**
```tsx
import { CardCollectionEditorProvider } from '@/contexts/CardCollectionEditorContext';

export default function EditorLayout({ children }) {
  return (
    <CardCollectionEditorProvider>
      {children}
    </CardCollectionEditorProvider>
  );
}
```

**Hook de Consumo:**
```tsx
import { useCardCollectionEditor } from '@/contexts/CardCollectionEditorContext';

function EditorComponent() {
  const {
    cards,
    currentCardIndex,
    updateCard,
    goToNextCard
  } = useCardCollectionEditor();
  
  const currentCard = cards[currentCardIndex];
  
  return (
    <div>
      <CardEditorStep
        card={currentCard}
        onUpdate={updateCard}
      />
      <button onClick={goToNextCard}>Próxima</button>
    </div>
  );
}
```

**Funcionalidades:**
- Auto-save a cada 2 segundos
- Persistência em sessionStorage
- Validação antes de navegação
- Gerenciamento de estado de loading

**Documentação Completa:** [CardCollectionEditorContext.README.md](../../src/contexts/CardCollectionEditorContext.README.md)

---

## Hooks Personalizados

### useAutoSave

**Localização:** `src/hooks/useAutoSave.ts`

Hook para auto-save de dados com debounce.

**Uso:**
```tsx
import { useAutoSave } from '@/hooks/useAutoSave';

function Editor() {
  const [data, setData] = useState({});
  
  useAutoSave(
    data,
    async (dataToSave) => {
      await fetch('/api/save', {
        method: 'POST',
        body: JSON.stringify(dataToSave)
      });
    },
    2000 // 2 segundos de debounce
  );
  
  return <input onChange={(e) => setData({ text: e.target.value })} />;
}
```

---

### useWizardState

**Localização:** `src/hooks/useWizardState.ts`

Hook para gerenciar estado de wizard multi-step.

**Uso:**
```tsx
import { useWizardState } from '@/hooks/useWizardState';

function Wizard() {
  const {
    currentStep,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    canGoNext,
    canGoPrevious
  } = useWizardState(12); // 12 steps
  
  return (
    <div>
      <p>Step {currentStep + 1} of 12</p>
      <button onClick={goToPreviousStep} disabled={!canGoPrevious}>
        Anterior
      </button>
      <button onClick={goToNextStep} disabled={!canGoNext}>
        Próxima
      </button>
    </div>
  );
}
```

---

## Componentes Reutilizados

Os seguintes componentes do produto "Mensagem Digital" são reutilizados:

### YouTubePlayer
- **Localização:** `src/components/media/YouTubePlayer.tsx`
- **Uso:** Reprodução de músicas nas cartas
- **Documentação:** [YOUTUBE_PLAYER_README.md](../../src/components/media/YOUTUBE_PLAYER_README.md)

### FallingEmojis
- **Localização:** `src/components/effects/FallingEmojis.tsx`
- **Uso:** Animação na primeira abertura de carta

### PhoneMockup
- **Localização:** `src/components/ui/PhoneMockup.tsx`
- **Uso:** Preview mobile no editor

### Componentes UI
- **Localização:** `src/components/ui/`
- **Componentes:** Button, Input, Textarea, Card, Label, Badge
- **Uso:** Elementos básicos de interface

---

## Estrutura de Arquivos

```
src/components/
├── card-editor/
│   ├── CardCollectionEditor.tsx
│   ├── CardCollectionEditor.README.md
│   ├── CardEditorStep.tsx
│   ├── CardEditorStep.README.md
│   └── index.ts
├── card-viewer/
│   ├── CardCollectionViewer.tsx
│   ├── CardCollectionViewer.README.md
│   ├── CardModal.tsx
│   ├── CardModal.README.md
│   └── index.ts
├── products/
│   ├── ProductSelector.tsx
│   └── README.md
├── media/
│   └── YouTubePlayer.tsx (reutilizado)
├── effects/
│   └── FallingEmojis.tsx (reutilizado)
└── ui/
    ├── Button.tsx (reutilizado)
    ├── Input.tsx (reutilizado)
    ├── Textarea.tsx (reutilizado)
    ├── Card.tsx (reutilizado)
    └── ... (outros componentes UI)
```

---

## Padrões de Design

### Composição
Componentes são compostos de componentes menores e reutilizáveis:
```tsx
<CardCollectionEditor>
  <WizardStepper />
  <CardEditorStep>
    <Input />
    <Textarea />
    <ImageUpload />
    <YouTubeInput />
  </CardEditorStep>
  <PreviewPanel />
</CardCollectionEditor>
```

### Separação de Responsabilidades
- **Apresentação**: Componentes React (UI)
- **Lógica de Negócio**: Services
- **Estado Global**: Context API
- **Efeitos Colaterais**: Hooks personalizados

### Tipagem Forte
Todos os componentes são fortemente tipados com TypeScript:
```typescript
interface Props {
  card: Card;
  onUpdate: (id: string, data: Partial<Card>) => Promise<void>;
}

export function CardEditor({ card, onUpdate }: Props) {
  // ...
}
```

---

## Testes

### Testes de Componentes
```bash
# Testar todos os componentes
npm test -- card

# Testar componente específico
npm test -- CardCollectionEditor
```

### Exemplo de Teste
```typescript
import { render, screen } from '@testing-library/react';
import { CardEditorStep } from '@/components/card-editor';

describe('CardEditorStep', () => {
  it('should render card title and message', () => {
    const card = {
      id: '123',
      title: 'Test Title',
      messageText: 'Test Message',
      // ...
    };
    
    render(<CardEditorStep card={card} onUpdate={jest.fn()} />);
    
    expect(screen.getByDisplayValue('Test Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Message')).toBeInTheDocument();
  });
});
```

---

## Performance

### Otimizações Implementadas
- **Lazy Loading**: Imagens carregadas sob demanda
- **Memoization**: Componentes pesados usam `React.memo`
- **Debounce**: Auto-save com debounce de 2s
- **Code Splitting**: Componentes de visualização carregados dinamicamente

### Métricas
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Lighthouse Score**: > 90

---

## Acessibilidade

Todos os componentes seguem as diretrizes WCAG 2.1 AA:
- ✅ Navegação por teclado
- ✅ Screen reader support
- ✅ ARIA labels apropriados
- ✅ Contraste de cores adequado
- ✅ Foco visível
- ✅ Textos alternativos para imagens

---

## Próximos Passos

- [ ] Adicionar testes E2E com Playwright
- [ ] Implementar modo offline com Service Workers
- [ ] Adicionar suporte a temas dark/light
- [ ] Melhorar animações com Framer Motion
- [ ] Adicionar analytics de uso
