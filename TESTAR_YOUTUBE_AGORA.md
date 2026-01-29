# 🎵 Testar YouTube Video ID - Guia Rápido

## ⚡ Teste Rápido (2 minutos)

### 1. Executar teste automatizado
```bash
node testar-youtube-fix.js
```

**Resultado esperado**: 🎉 TODOS OS TESTES PASSARAM!

---

## 🖥️ Teste Manual Completo (5 minutos)

### 1. Iniciar servidor de desenvolvimento
```bash
npm run dev
```

### 2. Abrir o editor
```
http://localhost:3000/editor/12-cartas
```

### 3. Preencher Step 1 - Mensagem Inicial

**De**: João  
**Para**: Maria  
**URL do YouTube**: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`

✅ Deve aparecer: "URL válida! ID do vídeo: dQw4w9WgXcQ"

### 4. Clicar em "Próximo"

**Console do navegador** deve mostrar:
```javascript
[Editor] Salvando intro: {
  senderName: "João",
  recipientName: "Maria",
  youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  extractedVideoId: "dQw4w9WgXcQ",
  collectionId: "..."
}
[Editor] Intro salvo com sucesso!
```

**Console do servidor** (terminal) deve mostrar:
```javascript
[Context] updateCollection called with: { ... }
[API] PATCH /api/card-collections/[id] - Request: { ... }
[CardCollectionService] Updating collection: { ... }
[CardCollectionService] Collection updated successfully: {
  youtube_video_id: "dQw4w9WgXcQ",
  ...
}
```

### 5. Verificar banco de dados

Copiar o `collectionId` do console e executar:
```bash
node verificar-youtube-id.js
```

Ou verificar diretamente no banco:
```sql
SELECT id, recipient_name, youtube_video_id 
FROM card_collections 
ORDER BY created_at DESC 
LIMIT 1;
```

**Resultado esperado**:
```
youtube_video_id: dQw4w9WgXcQ
```

### 6. Completar o fluxo (opcional)

1. Preencher as 12 cartas (pode usar mensagens padrão)
2. Preencher dados de envio no Step 5
3. Clicar em "Ir para Pagamento"
4. Usar cartão de teste do Stripe:
   - Número: `4242 4242 4242 4242`
   - Data: qualquer data futura
   - CVC: qualquer 3 dígitos
5. Após pagamento, abrir o link recebido por email
6. **Verificar**: A música deve tocar automaticamente! 🎵

---

## 🔍 Verificações Importantes

### ✅ Checklist de Sucesso

- [ ] URL do YouTube é validada no editor
- [ ] ID do vídeo é extraído corretamente
- [ ] Console do navegador mostra logs do editor
- [ ] Console do servidor mostra logs da API e Service
- [ ] Banco de dados tem `youtube_video_id` preenchido
- [ ] Página de visualização toca a música

### ❌ Se algo não funcionar

1. **URL não é validada**:
   - Verificar se a URL é do YouTube
   - Formato aceito: `https://www.youtube.com/watch?v=...`
   - Ou: `https://youtu.be/...`

2. **Logs não aparecem**:
   - Verificar se o servidor está rodando
   - Abrir DevTools do navegador (F12)
   - Verificar aba Console

3. **Banco de dados não atualiza**:
   - Executar: `node testar-youtube-fix.js`
   - Verificar credenciais do banco em `.env.local`
   - Verificar se o campo `youtube_video_id` existe na tabela

4. **Música não toca**:
   - Verificar se o vídeo existe no YouTube
   - Verificar se o vídeo permite embed
   - Verificar console do navegador por erros

---

## 🎯 URLs de Teste Recomendadas

### Músicas Populares
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
Rick Astley - Never Gonna Give You Up

https://www.youtube.com/watch?v=kJQP7kiw5Fk
Luis Fonsi - Despacito

https://www.youtube.com/watch?v=fJ9rUzIMcZQ
Queen - Bohemian Rhapsody
```

### Músicas Românticas
```
https://www.youtube.com/watch?v=450p7goxZqg
Ed Sheeran - Perfect

https://www.youtube.com/watch?v=nfWlot6h_JM
Taylor Swift - Shake It Off

https://www.youtube.com/watch?v=JGwWNGJdvx8
Ed Sheeran - Shape of You
```

---

## 📊 Comandos Úteis

### Verificar última coleção criada
```bash
node verificar-youtube-id.js
```

### Atualizar manualmente (se necessário)
```bash
node atualizar-youtube-id.js
```

### Verificar todas as coleções
```bash
node diagnostico-completo.js
```

### Limpar banco de dados de teste
```sql
DELETE FROM card_collections 
WHERE recipient_name = 'Teste Destinatário';
```

---

## 🎉 Resultado Esperado

Após seguir todos os passos, você deve ter:

1. ✅ Uma coleção criada com `youtube_video_id` preenchido
2. ✅ Logs no console confirmando o salvamento
3. ✅ Banco de dados atualizado corretamente
4. ✅ Música tocando na página de visualização

**Tudo funcionando?** 🎵 Parabéns! O problema foi resolvido! 🎉
