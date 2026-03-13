# Guia Rápido de Troubleshooting

## Problema: Email não foi enviado

### Causa Provável
O serviço de email (Resend) não está configurado ou há erro nas variáveis de ambiente.

### Solução

1. **Verificar variáveis de ambiente**
   
   Abra `.env.local` e confirme que tem:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   RESEND_FROM_EMAIL=noreply@seudominio.com
   RESEND_FROM_NAME=Paper Bloom
   ```

2. **Obter API Key do Resend**
   
   - Acesse: https://resend.com/api-keys
   - Crie uma nova API key
   - Copie e cole no `.env.local`

3. **Verificar email remetente**
   
   - O email em `RESEND_FROM_EMAIL` precisa estar verificado no Resend
   - Para testes, use: `onboarding@resend.dev` (não precisa verificar)

4. **Testar envio de email**
   
   ```bash
   curl http://localhost:3000/api/test/send-qrcode-email
   ```

5. **Ver logs de erro**
   
   Verifique o terminal onde o Next.js está rodando para ver mensagens de erro.

### Nota Importante
A ferramenta de teste (`/test/update-message-status`) **NÃO envia email automaticamente**. Ela apenas:
- Atualiza o status para 'paid'
- Gera o QR Code
- Gera o slug

O email só é enviado automaticamente quando o webhook do Stripe é acionado após um pagamento real.

---

## Problema: Link leva para página 404

### Causa Provável
O slug está sendo gerado corretamente, mas a URL não está sendo construída da forma certa.

### Solução

1. **Verificar o slug no banco de dados**
   
   ```sql
   SELECT id, recipient_name, slug, qr_code_url 
   FROM messages 
   WHERE status = 'paid' 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```
   
   O slug deve estar no formato: `/mensagem/nome-do-destinatario/uuid`

2. **Testar a URL manualmente**
   
   Se o slug é `/mensagem/maria-silva/abc-123`, a URL completa deve ser:
   ```
   http://localhost:3000/mensagem/maria-silva/abc-123
   ```

3. **Verificar se a rota existe**
   
   A rota deve estar em:
   ```
   src/app/(fullscreen)/mensagem/[recipient]/[id]/page.tsx
   ```

4. **Usar a ferramenta de teste atualizada**
   
   Após atualizar uma mensagem em `/test/update-message-status`:
   - Clique em "Ver Mensagem Pública" (novo botão)
   - Isso vai abrir a URL correta da mensagem

5. **Verificar logs do servidor**
   
   No terminal do Next.js, você deve ver:
   ```
   📍 Message URL: http://localhost:3000/mensagem/nome/id
   ```

---

## Problema: QR Code não foi gerado

### Causa Provável
O serviço de QR Code não conseguiu criar o arquivo ou salvar na pasta pública.

### Solução

1. **Verificar se a pasta existe**
   
   ```bash
   # Windows
   dir public\qr-codes
   
   # macOS/Linux
   ls -la public/qr-codes
   ```

2. **Criar a pasta se não existir**
   
   ```bash
   # Windows
   mkdir public\qr-codes
   
   # macOS/Linux
   mkdir -p public/qr-codes
   ```

3. **Verificar permissões**
   
   A pasta `public/qr-codes` precisa ter permissão de escrita.

4. **Ver logs de erro**
   
   Verifique o terminal para mensagens como:
   ```
   Error generating QR code: ...
   ```

5. **Testar geração manual**
   
   Execute no terminal do Node.js:
   ```javascript
   const QRCode = require('qrcode');
   QRCode.toFile('public/qr-codes/test.png', 'https://example.com', (err) => {
     if (err) console.error(err);
     else console.log('QR Code gerado!');
   });
   ```

---

## Problema: Página de delivery mostra "Mensagem não encontrada"

### Causa Provável
O ID da mensagem está incorreto ou a mensagem não existe no banco.

### Solução

1. **Verificar se a mensagem existe**
   
   ```sql
   SELECT id, recipient_name, status 
   FROM messages 
   WHERE id = 'seu-message-id';
   ```

2. **Verificar a URL**
   
   A URL deve ser:
   ```
   http://localhost:3000/delivery/abc-123-def-456
   ```
   
   Onde `abc-123-def-456` é o UUID da mensagem (não o slug).

3. **Usar o link correto da ferramenta**
   
   Após atualizar uma mensagem, use o botão "Ver Página de Entrega" que já tem a URL correta.

---

## Problema: Preview da mensagem não aparece na página de delivery

### Causa Provável
A API não está retornando todos os campos necessários.

### Solução

1. **Testar a API diretamente**
   
   ```bash
   curl http://localhost:3000/api/messages/id/seu-message-id
   ```

2. **Verificar resposta**
   
   Deve retornar JSON com todos os campos:
   ```json
   {
     "id": "...",
     "recipientName": "...",
     "messageText": "...",
     "imageUrl": "...",
     "galleryImages": [...],
     "closingMessage": "...",
     "signature": "..."
   }
   ```

3. **Verificar no navegador**
   
   Abra o DevTools (F12) → Network → Veja a resposta da API

---

## Checklist de Verificação Rápida

Antes de reportar um problema, verifique:

- [ ] O servidor Next.js está rodando (`npm run dev`)
- [ ] O banco de dados está acessível
- [ ] As variáveis de ambiente estão configuradas (`.env.local`)
- [ ] A pasta `public/qr-codes` existe
- [ ] A mensagem existe no banco e tem status 'paid'
- [ ] O slug foi gerado corretamente
- [ ] O QR Code foi criado
- [ ] A URL está no formato correto

---

## Comandos Úteis para Debug

### Ver última mensagem criada
```sql
SELECT * FROM messages ORDER BY created_at DESC LIMIT 1;
```

### Ver mensagens com problema
```sql
SELECT id, recipient_name, status, slug, qr_code_url 
FROM messages 
WHERE status = 'paid' AND (slug IS NULL OR qr_code_url IS NULL);
```

### Limpar mensagens de teste
```sql
DELETE FROM messages WHERE recipient_name LIKE '%teste%';
```

### Ver logs do servidor em tempo real
```bash
npm run dev | grep -E "(Error|Success|📍)"
```

### Testar se o Resend está funcionando
```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "seu-email@example.com",
    "subject": "Teste",
    "html": "<p>Teste de email</p>"
  }'
```

---

## Ainda com Problemas?

1. **Reinicie o servidor**
   ```bash
   # Pare o servidor (Ctrl+C)
   # Inicie novamente
   npm run dev
   ```

2. **Limpe o cache do Next.js**
   ```bash
   rm -rf .next
   npm run dev
   ```

3. **Verifique os logs completos**
   - Terminal do Next.js
   - Console do navegador (F12)
   - Logs do PostgreSQL

4. **Teste com dados novos**
   - Crie uma nova mensagem do zero
   - Use a ferramenta de teste com o novo ID
   - Verifique se funciona

5. **Consulte a documentação**
   - `WEBHOOK_TESTING_GUIDE.md` - Para problemas com webhook
   - `CUSTOMER_TABLES_SETUP.md` - Para problemas com banco de dados
   - `DELIVERY_PAGE_README.md` - Para problemas com a página de entrega
