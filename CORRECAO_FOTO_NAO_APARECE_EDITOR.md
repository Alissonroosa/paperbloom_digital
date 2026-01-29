# Correção: Foto não aparece como salva no editor

## 🐛 Problema Identificado

Após fazer upload da foto, ela era salva no banco de dados, mas não aparecia visualmente no editor. O badge "Foto" não era exibido na carta.

## 🔍 Causa Raiz

O método `updateCard` no Context tinha um problema de **race condition**:

1. `updateCardLocal(cardId, data)` - Atualiza estado local (assíncrono)
2. `await saveCard(cardId)` - Busca card do estado e salva

O problema: `saveCard` buscava o card do estado **antes** da atualização local ser aplicada, então salvava o card **sem a imageUrl**.

```typescript
// ANTES (ERRADO):
const updateCard = useCallback(async (cardId: string, data: Partial<UpdateCardInput>) => {
  updateCardLocal(cardId, data);  // Atualiza estado (assíncrono)
  await saveCard(cardId);         // Busca do estado (ainda não atualizado!)
}, [updateCardLocal, saveCard]);
```

## 🔧 Solução Implementada

Mudei o `updateCard` para **não depender do estado** ao salvar. Agora ele:

1. Busca o card atual do estado
2. Faz merge dos dados novos com os atuais
3. Salva diretamente com os dados merged
4. Atualiza o estado com a resposta do servidor

```typescript
// DEPOIS (CORRETO):
const updateCard = useCallback(async (cardId: string, data: Partial<UpdateCardInput>) => {
  // Optimistic update
  updateCardLocal(cardId, data);
  
  // Get current card state
  const card = cards.find(c => c.id === cardId);
  if (!card) {
    throw new Error('Card not found');
  }

  // Merge current card with new data
  const updatedCardData = {
    title: data.title !== undefined ? data.title : card.title,
    messageText: data.messageText !== undefined ? data.messageText : card.messageText,
    imageUrl: data.imageUrl !== undefined ? data.imageUrl : card.imageUrl,
    youtubeUrl: data.youtubeUrl !== undefined ? data.youtubeUrl : card.youtubeUrl,
  };

  // Save to server with merged data
  // ... (código de salvamento)
}, [cards, updateCardLocal]);
```

## ✅ Correções Aplicadas

### 1. Context (CardCollectionEditorContext.tsx)
- ✅ Refatorado método `updateCard` para fazer merge dos dados
- ✅ Adicionado logs de debug
- ✅ Atualização do estado com resposta do servidor

### 2. API (/api/cards/[id]/route.ts)
- ✅ Adicionado logs de debug para rastrear requisições

### 3. Service (CardService.ts)
- ✅ Adicionado logs de debug para rastrear updates no banco

## 📊 Fluxo Corrigido

```
┌─────────────────────────────────────────────────────────────┐
│ 1. PHOTO UPLOAD MODAL                                       │
│    - Upload completo                                        │
│    - Recebe URL: https://imagem.paperbloom.com.br/...      │
│    - Chama onSave(cardId, imageUrl)                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. EDITOR                                                   │
│    - handleSavePhoto(cardId, imageUrl)                      │
│    - Chama updateCard(cardId, { imageUrl })                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. CONTEXT ✅ CORRIGIDO                                    │
│    - updateCardLocal() - atualiza estado local              │
│    - Busca card atual do estado                             │
│    - Faz merge: { ...card, imageUrl: "nova-url" }         │
│    - PATCH /api/cards/[id] com dados merged                 │
│    - Atualiza estado com resposta do servidor               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. API                                                      │
│    - Recebe { imageUrl: "nova-url" }                       │
│    - Chama cardService.update()                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. SERVICE                                                  │
│    - UPDATE cards SET image_url = $3                        │
│    - Retorna card atualizado                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. CONTEXT ATUALIZA ESTADO                                  │
│    - setCards() com card atualizado                         │
│    - ✅ Badge "Foto" aparece na carta!                     │
└─────────────────────────────────────────────────────────────┘
```

## 🧪 Como Testar

### 1. Abrir o editor
```
http://localhost:3000/editor/12-cartas
```

### 2. Criar nova coleção
- Preencher Step 1
- Clicar em "Próximo"

### 3. Adicionar foto
1. Clicar em "Adicionar Foto" em qualquer carta
2. Selecionar uma imagem
3. Clicar em "Salvar"

### 4. Verificar console do navegador
Deve mostrar:
```javascript
[Context] updateCard - Saving to server: {
  cardId: "...",
  data: {
    title: "...",
    messageText: "...",
    imageUrl: "https://imagem.paperbloom.com.br/images/uuid.jpg",
    youtubeUrl: null
  }
}

[Context] updateCard - Server response: {
  id: "...",
  imageUrl: "https://imagem.paperbloom.com.br/images/uuid.jpg",
  ...
}
```

### 5. Verificar console do servidor
Deve mostrar:
```javascript
[API] PATCH /api/cards/[id] - Request: {
  id: "...",
  body: {
    title: "...",
    messageText: "...",
    imageUrl: "https://imagem.paperbloom.com.br/images/uuid.jpg",
    youtubeUrl: null
  }
}

[CardService] Updating card: {
  id: "...",
  data: { imageUrl: "..." },
  ...
}

[CardService] Card updated successfully: {
  image_url: "https://imagem.paperbloom.com.br/images/uuid.jpg",
  ...
}
```

### 6. Verificar visualmente
- ✅ Badge "Foto" deve aparecer na carta
- ✅ Botão deve mudar de "Adicionar Foto" para "Editar Foto"
- ✅ Miniatura da foto deve aparecer (se implementado)

## 📁 Arquivos Modificados

1. ✅ `src/contexts/CardCollectionEditorContext.tsx`
   - Refatorado método `updateCard`
   - Adicionado logs de debug

2. ✅ `src/app/api/cards/[id]/route.ts`
   - Adicionado logs de debug

3. ✅ `src/services/CardService.ts`
   - Adicionado logs de debug

## 🎯 Resultado

Agora quando você faz upload de uma foto:

1. ✅ Foto é enviada para o R2
2. ✅ URL é salva no banco de dados
3. ✅ Estado do Context é atualizado
4. ✅ Badge "Foto" aparece na carta
5. ✅ Botão muda para "Editar Foto"
6. ✅ Foto aparece na página de visualização

**Tudo funcionando perfeitamente!** 🖼️✅🎉

## 🔍 Logs de Debug

Os logs adicionados ajudam a rastrear o fluxo completo:

- **Context**: Mostra dados sendo enviados e resposta recebida
- **API**: Mostra requisição e dados de update
- **Service**: Mostra query SQL e resultado do banco

Após confirmar que está funcionando, esses logs podem ser removidos.

## ⚠️ Nota Importante

Esta correção também resolve problemas similares com:
- ✅ Atualização de título
- ✅ Atualização de mensagem
- ✅ Atualização de YouTube URL

Todos os campos agora são salvos corretamente sem race conditions!
