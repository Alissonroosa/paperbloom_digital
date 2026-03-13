# Atualização de Preços - Paper Bloom

## Resumo das Alterações

### Novos Preços

**Mensagem Digital:**
- Preço: R$ 19,90 (antes R$ 29,99)

**12 Cartas:**
- Preço promocional: R$ 29,90 (de R$ 49,90)
- Desconto: 40% OFF

---

## Arquivos Atualizados

### 1. Frontend - Interface do Usuário

**`src/components/products/ProductSelector.tsx`**
- ✅ Adicionado campo `originalPrice` na interface `Product`
- ✅ Atualizado preço do produto "12 Cartas" para R$ 29,90
- ✅ Adicionado preço original R$ 49,90 com tachado
- ✅ Adicionado badge "40% OFF" em verde

### 2. Backend - API de Checkout

**`src/app/api/checkout/create-session/route.ts`**
- ✅ Atualizado valor de 2999 para 1990 centavos (R$ 19,90)
- ✅ Atualizado comentário explicativo

**`src/app/api/checkout/card-collection/route.ts`**
- ✅ Atualizado valor de 4999 para 2990 centavos (R$ 29,90)
- ✅ Atualizado comentário explicativo com nota sobre preço promocional

**`src/services/StripeService.ts`**
- ✅ Atualizado comentário da documentação com novos valores de exemplo

### 3. Testes

**`src/app/api/checkout/create-session/__tests__/verify-create-session.ts`**
- ✅ Atualizado valor de teste de 2999 para 1990 centavos

**`src/app/api/checkout/webhook/__tests__/verify-webhook.ts`**
- ✅ Atualizado valor de teste de 2999 para 1990 centavos

**`src/app/api/checkout/webhook/__tests__/integration-test.ts`**
- ✅ Atualizado valores de teste de 2999 para 1990 centavos (2 ocorrências)

---

## Valores no Stripe

Os valores são enviados em centavos para o Stripe:

| Produto | Valor Display | Valor Stripe (centavos) |
|---------|---------------|-------------------------|
| Mensagem Digital | R$ 19,90 | 1990 |
| 12 Cartas | R$ 29,90 | 2990 |

---

## Próximos Passos

1. ✅ Testar o fluxo de checkout completo para ambos os produtos
2. ✅ Verificar se os valores estão corretos no Stripe Dashboard
3. ✅ Confirmar que os emails de confirmação mostram os valores corretos
4. ✅ Validar que o desconto está sendo exibido corretamente na interface

---

## Notas Importantes

- O preço de R$ 29,90 para "12 Cartas" é um **preço promocional**
- O preço original de R$ 49,90 é exibido com tachado para destacar o desconto
- Badge verde "40% OFF" chama atenção para a promoção
- Todos os testes foram atualizados para refletir os novos valores
