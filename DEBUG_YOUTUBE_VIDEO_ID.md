# 🔍 Debug: YouTube Video ID Não Está Tocando

## Problema

A música que toca não é a que foi salva na criação da mensagem.

## Verificações Necessárias

### 1. Verificar no Banco de Dados

Execute o script de verificação:

```bash
node verificar-youtube-id.js
```

**O que verificar:**
- ✅ O campo `youtube_video_id` está preenchido?
- ✅ O valor está correto (ID do vídeo do YouTube)?

**Exemplo de saída esperada:**
```
✅ YouTube Video ID encontrado: dQw4w9WgXcQ
📍 URL do vídeo: https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

### 2. Verificar no Console do Navegador

Abra a página `/c/cynthia-luz/be256b01-...` e verifique o console:

**Logs esperados:**
```javascript
[CardCollectionPage] Collection found: {
  id: "be256b01-...",
  recipientName: "Cynthia Luz",
  youtubeVideoId: "dQw4w9WgXcQ"  // ← Deve ter o ID correto
}

[CardCollectionViewer] Collection data: {
  id: "be256b01-...",
  recipientName: "Cynthia Luz",
  youtubeVideoId: "dQw4w9WgXcQ",  // ← Valor do banco
  youtubeVideoIdUsed: "dQw4w9WgXcQ"  // ← Valor usado no player
}
```

### 3. Verificar no Editor

No Step 1 do editor (`/editor/12-cartas`):

1. Cole uma URL do YouTube
2. Verifique se aparece: "✅ URL válida! ID do vídeo: ..."
3. Clique em "Próximo"
4. Verifique no console do navegador se o `updateCollection` foi chamado

**Log esperado:**
```javascript
// No console do navegador
updateCollection called with: {
  senderName: "João",
  recipientName: "Maria",
  youtubeVideoId: "dQw4w9WgXcQ"
}
```

## Possíveis Causas

### Causa 1: YouTube Video ID Não Foi Salvo

**Sintoma:**
- No banco: `youtube_video_id` está `NULL`
- No console: `youtubeVideoId: null`

**Solução:**
1. Verifique se o usuário colou uma URL válida do YouTube no Step 1
2. Verifique se clicou em "Próximo" (não pulou o step)
3. Verifique se a função `extractYouTubeVideoId` está funcionando

**Teste:**
```javascript
// No console do navegador, na página do editor
const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
const patterns = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  /^([a-zA-Z0-9_-]{11})$/
];

for (const pattern of patterns) {
  const match = url.match(pattern);
  if (match) {
    console.log("Video ID:", match[1]);
    break;
  }
}
```

### Causa 2: Coleção Antiga (Criada Antes da Funcionalidade)

**Sintoma:**
- Coleção foi criada antes de implementar o campo `youtube_video_id`
- No banco: campo existe mas está `NULL`

**Solução:**
- Criar uma nova coleção de teste
- Ou atualizar manualmente no banco:

```sql
UPDATE card_collections 
SET youtube_video_id = 'dQw4w9WgXcQ' 
WHERE id = 'be256b01-f30a-47f6-8c4b-642ef7c0ab72';
```

### Causa 3: Cache do Navegador

**Sintoma:**
- Banco está correto
- Logs mostram valor correto
- Mas música errada toca

**Solução:**
1. Limpar cache do navegador (Ctrl+Shift+Delete)
2. Abrir em aba anônima
3. Hard refresh (Ctrl+F5)

### Causa 4: YouTube Player Não Inicializou

**Sintoma:**
- Logs mostram ID correto
- Mas nenhuma música toca

**Solução:**
Verificar no console se há erros do YouTube Player:

```javascript
// Verificar se o player foi criado
console.log('YouTube Player:', window.YT);
console.log('Player Ready:', youtubeReady);
```

## Fluxo Completo de Dados

### 1. Editor (Step 1)

```
Usuário cola URL → extractYouTubeVideoId() → videoId
                                              ↓
                                    updateCollection({
                                      youtubeVideoId: videoId
                                    })
                                              ↓
                                    Salvo no banco: youtube_video_id
```

### 2. Banco de Dados

```sql
card_collections
├─ id: "be256b01-..."
├─ recipient_name: "Cynthia Luz"
└─ youtube_video_id: "dQw4w9WgXcQ"  ← Deve estar aqui
```

### 3. API (Busca)

```
GET /api/card-collections/[id]
         ↓
CardCollectionService.findBySlug()
         ↓
SELECT * FROM card_collections WHERE slug = ...
         ↓
rowToCardCollection(row)
         ↓
{
  id: "be256b01-...",
  youtubeVideoId: row.youtube_video_id  ← Mapeamento
}
```

### 4. Página de Visualização

```
CardCollectionViewer recebe collection
         ↓
const youtubeVideoId = collection.youtubeVideoId || "nSDgHBxUbVQ"
         ↓
YouTube Player inicializa com videoId
         ↓
Música toca
```

## Teste Rápido

1. **Criar nova coleção:**
   - Acesse `/editor/12-cartas`
   - Step 1: Cole `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - Verifique: "✅ URL válida! ID do vídeo: dQw4w9WgXcQ"
   - Clique "Próximo"

2. **Verificar no banco:**
   ```bash
   node verificar-youtube-id.js
   ```

3. **Finalizar e pagar:**
   - Complete todos os steps
   - Finalize e pague
   - Acesse a URL gerada

4. **Verificar no console:**
   - Abra DevTools (F12)
   - Veja os logs:
     - `[CardCollectionPage] Collection found`
     - `[CardCollectionViewer] Collection data`
   - Verifique se `youtubeVideoId` está correto

5. **Verificar música:**
   - Clique no botão de música (canto superior direito)
   - Deve tocar a música escolhida

## Status dos Logs Adicionados

✅ **Logs adicionados para debug:**

1. `src/app/(fullscreen)/c/[...slug]/page.tsx`
   - Log ao buscar coleção
   - Mostra `youtubeVideoId` retornado do banco

2. `src/app/(fullscreen)/c/[...slug]/CardCollectionViewer.tsx`
   - Log ao inicializar componente
   - Mostra `youtubeVideoId` recebido e usado

## Próximos Passos

1. Acesse a página da coleção
2. Abra o console do navegador (F12)
3. Verifique os logs
4. Me envie os valores que aparecem nos logs
5. Vou identificar onde está o problema

## Comandos Úteis

```bash
# Verificar YouTube Video ID no banco
node verificar-youtube-id.js

# Ver logs do servidor Next.js
# (no terminal onde está rodando npm run dev)

# Limpar cache do Next.js
rm -rf .next
npm run dev
```
