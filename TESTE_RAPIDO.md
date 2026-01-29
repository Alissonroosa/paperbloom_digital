# Teste Rápido - Passo a Passo

## ✅ Problema Resolvido

Criei a API que estava faltando: `/api/messages/mensagem/[recipient]/[id]/route.ts`

Agora a mensagem pública vai funcionar!

## 🚀 Como Testar AGORA

### Passo 1: Pegar ID de uma Mensagem

Execute no banco de dados:

```sql
SELECT id, recipient_name, sender_name, status 
FROM messages 
ORDER BY created_at DESC 
LIMIT 1;
```

Copie o `id` (UUID).

### Passo 2: Atualizar a Mensagem

1. Acesse: `http://localhost:3000/test/update-message-status`
2. Cole o ID
3. Clique em "Atualizar para 'Paid' e Gerar QR Code"
4. Aguarde aparecer a mensagem de sucesso

### Passo 3: Testar a Mensagem Pública

Clique no botão **"Ver Mensagem Pública"**

Ou copie a URL que aparece em "URL Pública" e cole no navegador.

### Passo 4: Verificar

Você deve ver:
- ✅ Tela de loading
- ✅ Animação de introdução
- ✅ Botão "Toque para sentir"
- ✅ Foto da mensagem
- ✅ Texto da mensagem
- ✅ Experiência cinematográfica completa

## 🔍 Se Ainda Der Erro

### Verificar no Console do Navegador

1. Abra o DevTools (F12)
2. Vá na aba "Console"
3. Veja se há erros em vermelho
4. Copie e me envie os erros

### Verificar no Terminal do Servidor

No terminal onde o Next.js está rodando, veja se aparece:

```
GET /api/messages/mensagem/nome/id 200
```

Se aparecer `404` ou `500`, há um problema.

### Testar a API Diretamente

Abra no navegador ou use curl:

```bash
# Substitua pelos valores reais
curl http://localhost:3000/api/messages/mensagem/maria-silva/seu-uuid-aqui
```

Deve retornar JSON com os dados da mensagem.

## 📊 Estrutura Completa

### URLs Criadas

1. **Ferramenta de Teste**
   ```
   http://localhost:3000/test/update-message-status
   ```

2. **API de Atualização**
   ```
   POST http://localhost:3000/api/test/update-message-status
   ```

3. **API da Mensagem Pública** (NOVA!)
   ```
   GET http://localhost:3000/api/messages/mensagem/[recipient]/[id]
   ```

4. **Página da Mensagem Pública**
   ```
   http://localhost:3000/mensagem/[recipient]/[id]
   ```

5. **Página de Delivery**
   ```
   http://localhost:3000/delivery/[messageId]
   ```

### Fluxo de Dados

```
Ferramenta de Teste
    ↓
Atualiza Mensagem no Banco
    ↓
Gera QR Code + Slug
    ↓
Retorna URLs
    ↓
Usuário clica "Ver Mensagem Pública"
    ↓
Abre /mensagem/[recipient]/[id]
    ↓
Página faz fetch para API
    ↓
API busca mensagem no banco
    ↓
Retorna dados
    ↓
Página exibe experiência cinematográfica
```

## 🎯 Checklist Final

Antes de testar, confirme:

- [ ] Servidor Next.js está rodando (`npm run dev`)
- [ ] Banco de dados está acessível
- [ ] Existe pelo menos 1 mensagem no banco
- [ ] A pasta `public/qr-codes` existe
- [ ] Você tem o ID (UUID) da mensagem

## 💡 Dica

Se quiser testar com dados mockados sem precisar do banco:

1. Acesse: `http://localhost:3000/delivery/test-delivery-preview`
2. Veja como a página de delivery aparece com dados de exemplo

## 🆘 Ainda com Problema?

Me envie:

1. **URL que você está tentando acessar**
2. **Mensagem de erro exata**
3. **Screenshot da tela**
4. **Logs do console do navegador (F12)**
5. **Logs do terminal do servidor**

E eu vou te ajudar a resolver!

## 📝 Exemplo Completo

Vamos supor que você tem uma mensagem com:
- ID: `123e4567-e89b-12d3-a456-426614174000`
- Recipient: `Maria Silva`

Após atualizar na ferramenta, você terá:

**Slug gerado:**
```
/mensagem/maria-silva/123e4567-e89b-12d3-a456-426614174000
```

**URL completa:**
```
http://localhost:3000/mensagem/maria-silva/123e4567-e89b-12d3-a456-426614174000
```

**API que será chamada:**
```
http://localhost:3000/api/messages/mensagem/maria-silva/123e4567-e89b-12d3-a456-426614174000
```

**Resposta da API:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "recipientName": "Maria Silva",
  "senderName": "João Santos",
  "messageText": "Mensagem especial...",
  "imageUrl": "/uploads/image.jpg",
  "youtubeUrl": "https://youtube.com/...",
  "qrCodeUrl": "/qr-codes/123e4567.png",
  "viewCount": 1,
  "createdAt": "2024-03-15T10:00:00.000Z"
}
```

Tudo isso deve funcionar agora! 🎉
