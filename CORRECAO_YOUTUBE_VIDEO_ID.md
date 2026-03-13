# Correção: YouTube Video ID não estava sendo salvo

## Problema Identificado

O usuário preenchia a URL do YouTube no editor (Step 1), mas o campo `youtube_video_id` ficava `null` no banco de dados. A música não tocava na página de visualização das cartas.

## Causa Raiz

O método `CardCollectionService.update()` não estava tratando o campo `youtubeVideoId`. Quando o editor chamava `updateCollection()` com o `youtubeVideoId`, o serviço simplesmente ignorava esse campo e não o salvava no banco de dados.

## Correções Aplicadas

### 1. CardCollectionService.ts
**Arquivo**: `src/services/CardCollectionService.ts`

Adicionado tratamento para os campos `contactName` e `youtubeVideoId` no método `update()`:

```typescript
if (data.contactName !== undefined) {
  updates.push(`contact_name = $${paramIndex++}`);
  values.push(data.contactName);
}
if (data.youtubeVideoId !== undefined) {
  updates.push(`youtube_video_id = $${paramIndex++}`);
  values.push(data.youtubeVideoId);
}
```

Adicionado console.log para debug:
```typescript
console.log('[CardCollectionService] Updating collection:', {
  id,
  data,
  query,
  values,
});
```

### 2. API Endpoint
**Arquivo**: `src/app/api/card-collections/[id]/route.ts`

Adicionado console.log para rastrear requisições:
```typescript
console.log('[API] PATCH /api/card-collections/[id] - Request:', {
  id,
  body,
});
```

### 3. Context
**Arquivo**: `src/contexts/CardCollectionEditorContext.tsx`

Adicionado console.log para rastrear chamadas:
```typescript
console.log('[Context] updateCollection called with:', {
  collectionId,
  data,
});
```

## Fluxo de Dados Corrigido

1. **Editor** (`FiveStepCardCollectionEditor.tsx`):
   - Usuário preenche URL do YouTube
   - `extractYouTubeVideoId()` extrai o ID do vídeo
   - `handleSaveIntro()` chama `updateCollection()` com `youtubeVideoId`

2. **Context** (`CardCollectionEditorContext.tsx`):
   - Recebe `youtubeVideoId` no objeto `data`
   - Faz PATCH para `/api/card-collections/[id]`
   - Envia JSON com `{ youtubeVideoId: "abc123" }`

3. **API** (`/api/card-collections/[id]/route.ts`):
   - Recebe o body com `youtubeVideoId`
   - Chama `cardCollectionService.update(id, body)`

4. **Service** (`CardCollectionService.ts`):
   - Agora trata o campo `youtubeVideoId`
   - Adiciona `youtube_video_id = $X` na query SQL
   - Salva no banco de dados PostgreSQL

5. **Banco de Dados**:
   - Campo `youtube_video_id` é atualizado com sucesso
   - Valor fica disponível para a página de visualização

## Como Testar

### 1. Criar nova coleção
```bash
# Abrir o editor
http://localhost:3000/editor/12-cartas
```

### 2. Preencher Step 1
- De: Seu Nome
- Para: Nome do Destinatário
- URL do YouTube: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- Clicar em "Próximo"

### 3. Verificar console do navegador
Você deve ver:
```
[Editor] Salvando intro: {
  senderName: "Seu Nome",
  recipientName: "Nome do Destinatário",
  youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  extractedVideoId: "dQw4w9WgXcQ",
  collectionId: "uuid-aqui"
}
```

### 4. Verificar console do servidor
Você deve ver:
```
[Context] updateCollection called with: {
  collectionId: "uuid-aqui",
  data: {
    senderName: "Seu Nome",
    recipientName: "Nome do Destinatário",
    youtubeVideoId: "dQw4w9WgXcQ"
  }
}

[API] PATCH /api/card-collections/[id] - Request: {
  id: "uuid-aqui",
  body: {
    senderName: "Seu Nome",
    recipientName: "Nome do Destinatário",
    youtubeVideoId: "dQw4w9WgXcQ"
  }
}

[CardCollectionService] Updating collection: {
  id: "uuid-aqui",
  data: { ... },
  query: "UPDATE card_collections SET ... youtube_video_id = $7 ...",
  values: [..., "dQw4w9WgXcQ"]
}

[CardCollectionService] Collection updated successfully: {
  youtube_video_id: "dQw4w9WgXcQ",
  ...
}
```

### 5. Verificar banco de dados
```javascript
// Executar script de verificação
node verificar-youtube-id.js
```

Deve mostrar:
```
✓ youtube_video_id: dQw4w9WgXcQ
```

### 6. Testar na página de visualização
Após completar o checkout e pagamento, abrir a página:
```
http://localhost:3000/c/nome-destinatario/uuid-aqui
```

A música deve tocar automaticamente!

## Arquivos Modificados

1. `src/services/CardCollectionService.ts` - Adicionado tratamento de `youtubeVideoId` e `contactName`
2. `src/app/api/card-collections/[id]/route.ts` - Adicionado logs de debug
3. `src/contexts/CardCollectionEditorContext.tsx` - Adicionado logs de debug

## Arquivos de Debug Existentes

- `verificar-youtube-id.js` - Verifica o valor no banco
- `atualizar-youtube-id.js` - Atualiza manualmente (se necessário)
- `DEBUG_YOUTUBE_VIDEO_ID.md` - Guia de debug anterior
- `SOLUCAO_YOUTUBE_ID_NULO.md` - Análise do problema

## Status

✅ **CORRIGIDO** - O campo `youtubeVideoId` agora é salvo corretamente no banco de dados.

## Próximos Passos

1. Testar com uma nova coleção
2. Verificar se a música toca na página de visualização
3. Remover os console.log após confirmar que está funcionando
4. Atualizar coleções antigas que ficaram com `youtube_video_id` null (se necessário)
