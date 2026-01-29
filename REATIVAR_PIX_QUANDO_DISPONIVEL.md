# 🔄 Como Reativar PIX Quando Disponível

## 📝 Status Atual

✅ **PIX está DESATIVADO** - Apenas cartão está ativo
✅ **Código PIX está COMENTADO** - Pronto para reativar
✅ **Documentação completa** - Tudo pronto para quando precisar

## 🚀 Como Reativar PIX (3 passos simples)

### Passo 1: Ativar PIX no StripeService

Arquivo: `src/services/StripeService.ts`

**Encontre esta linha (~linha 63):**
```typescript
payment_method_types: ['card'], // Apenas cartão por enquanto
```

**Mude para:**
```typescript
payment_method_types: ['card', 'pix'], // Cartão + PIX
```

**E descomente as opções do PIX (~linha 82):**
```typescript
// Configurações para PIX (descomente quando PIX estiver disponível)
// payment_method_options: {
//   pix: {
//     expires_after_seconds: 3600, // PIX expira em 1 hora
//   },
// },
```

**Mude para:**
```typescript
// Configurações para PIX
payment_method_options: {
  pix: {
    expires_after_seconds: 3600, // PIX expira em 1 hora
  },
},
```

### Passo 2: Reativar Eventos PIX no Webhook

Arquivo: `src/app/api/checkout/webhook/route.ts`

**Encontre este bloco (~linha 67):**
```typescript
// NOTA: Código PIX comentado - reativar quando PIX estiver disponível no Stripe
// Para PIX, verificar se o pagamento foi realmente concluído
// PIX pode ter status 'unpaid' quando o QR code é gerado
// if (session.payment_status === 'unpaid') {
//   console.log(`Checkout session ${session.id} completed but payment is unpaid (PIX QR code generated)`);
//   // Não processar ainda, aguardar evento 'checkout.session.async_payment_succeeded'
//   return NextResponse.json(
//     { received: true, message: 'PIX QR code generated, awaiting payment' },
//     { status: 200 }
//   );
// }
```

**Descomente:**
```typescript
// Para PIX, verificar se o pagamento foi realmente concluído
// PIX pode ter status 'unpaid' quando o QR code é gerado
if (session.payment_status === 'unpaid') {
  console.log(`Checkout session ${session.id} completed but payment is unpaid (PIX QR code generated)`);
  // Não processar ainda, aguardar evento 'checkout.session.async_payment_succeeded'
  return NextResponse.json(
    { received: true, message: 'PIX QR code generated, awaiting payment' },
    { status: 200 }
  );
}
```

**Encontre este bloco (~linha 225):**
```typescript
// EVENTOS PIX - COMENTADOS (Reativar quando PIX estiver disponível no Stripe)
// 
// Handle 'checkout.session.async_payment_succeeded' event
// if (event.type === 'checkout.session.async_payment_succeeded') {
//   ... (todo o código PIX comentado)
// }
```

**Descomente TODO o bloco** (são ~150 linhas)

### Passo 3: Testar

```powershell
# Terminal 1
npm run dev

# Terminal 2
.\iniciar-webhook.ps1

# Terminal 3
node testar-pix.js
```

## ✅ Checklist de Reativação

- [ ] Descomentei `'pix'` no StripeService
- [ ] Descomentei `payment_method_options.pix`
- [ ] Descomentei verificação de `payment_status === 'unpaid'`
- [ ] Descomentei evento `async_payment_succeeded`
- [ ] Descomentei evento `async_payment_failed`
- [ ] Testei em desenvolvimento
- [ ] Verifiquei logs do webhook
- [ ] Testei em produção

## 🎯 Alternativa Rápida: Usar Git

Se você tiver o código original antes de comentar:

```powershell
# Ver mudanças
git diff src/services/StripeService.ts
git diff src/app/api/checkout/webhook/route.ts

# Reverter para versão com PIX ativo
git checkout HEAD -- src/services/StripeService.ts
git checkout HEAD -- src/app/api/checkout/webhook/route.ts
```

## 📚 Documentação

Toda a documentação PIX está pronta:
- [README_PIX.md](README_PIX.md) - Índice master
- [LEIA_ME_PIX.md](LEIA_ME_PIX.md) - Início rápido
- [IMPLEMENTACAO_PIX.md](IMPLEMENTACAO_PIX.md) - Detalhes técnicos
- [COMANDOS_PIX.md](COMANDOS_PIX.md) - Comandos úteis
- [ATIVAR_PIX_CHECKLIST.md](ATIVAR_PIX_CHECKLIST.md) - Checklist completo

## 🎉 Pronto!

Quando o Stripe habilitar PIX na sua conta, é só seguir estes 3 passos e começar a usar!

---

**Tempo estimado**: 5 minutos
**Dificuldade**: Fácil
**Resultado**: PIX funcionando perfeitamente! 🚀
