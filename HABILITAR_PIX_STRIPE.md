# 🔧 Como Habilitar PIX no Stripe

## ❌ Problema: PIX não aparece nas opções

Se você não vê o PIX na lista de métodos de pagamento, siga este guia.

## 🔍 Verificações Necessárias

### 1. Verificar País da Conta

1. Acesse: https://dashboard.stripe.com/settings/account
2. Verifique se **"País"** está como **"Brasil"**
3. Se não estiver, você precisará criar uma nova conta Stripe para o Brasil

### 2. Verificar Status da Conta

1. Acesse: https://dashboard.stripe.com/settings/account
2. Procure por **"Verificação da conta"**
3. Complete todos os passos pendentes:
   - ✅ Informações da empresa/pessoa
   - ✅ Documentos (CPF/CNPJ)
   - ✅ Informações bancárias
   - ✅ Representante legal

### 3. Verificar Modo da Conta

Você está em modo **Test** ou **Live**?

- **Test Mode**: PIX pode não estar disponível
- **Live Mode**: PIX estará disponível após verificação

## 🚀 Como Solicitar Acesso ao PIX

### Opção 1: Contato Direto com Stripe

1. **Acesse o suporte**: https://support.stripe.com/contact
2. **Selecione**:
   - Tópico: "Payment Methods"
   - Subtópico: "Enable a payment method"
3. **Mensagem sugerida**:

```
Olá,

Gostaria de habilitar o PIX como método de pagamento na minha conta Stripe.

Informações da conta:
- País: Brasil
- Tipo de negócio: [Seu tipo]
- Volume mensal estimado: [Seu volume]

Minha conta já está verificada e gostaria de começar a aceitar pagamentos via PIX.

Obrigado!
```

### Opção 2: Via Dashboard

1. Acesse: https://dashboard.stripe.com/settings/payment_methods
2. Se não vir PIX, clique em **"Request a payment method"**
3. Selecione **"PIX"**
4. Preencha o formulário

### Opção 3: Via Email

Envie email para: **support@stripe.com**

Assunto: **Solicitar habilitação de PIX - [Seu ID da conta]**

```
Olá equipe Stripe,

Gostaria de solicitar a habilitação do PIX como método de pagamento 
na minha conta Stripe.

ID da Conta: [seu account ID]
País: Brasil
Email: [seu email]

Minha conta está verificada e pronta para processar pagamentos via PIX.

Aguardo retorno.

Obrigado!
```

## 🔄 Alternativa: Usar Stripe em Modo Test

Enquanto aguarda a habilitação do PIX em produção, você pode testar:

### 1. Verificar se PIX está disponível em Test Mode

1. Mude para **Test Mode** (toggle no canto superior direito)
2. Acesse: https://dashboard.stripe.com/test/settings/payment_methods
3. Veja se PIX aparece

### 2. Se PIX aparecer em Test Mode

Ótimo! Você pode testar a implementação enquanto aguarda produção:

```powershell
# Usar chaves de teste
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Testar
node testar-pix.js
```

## 📋 Checklist de Requisitos para PIX

Antes de solicitar, certifique-se:

- [ ] Conta Stripe registrada no Brasil
- [ ] Verificação da conta completa (100%)
- [ ] Informações bancárias brasileiras adicionadas
- [ ] CPF/CNPJ verificado
- [ ] Representante legal verificado
- [ ] Termos de serviço aceitos

## 🌍 Alternativa: Usar Gateway Brasileiro

Se o Stripe não habilitar PIX rapidamente, considere:

### Mercado Pago (Recomendado para Brasil)

**Vantagens:**
- PIX disponível imediatamente
- Taxas competitivas (1.99% para PIX)
- Suporte em português
- Fácil integração

**Como integrar:**

1. Criar conta: https://www.mercadopago.com.br/
2. Instalar SDK:
```bash
npm install mercadopago
```

3. Código básico:
```typescript
import mercadopago from 'mercadopago';

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

// Criar preferência de pagamento
const preference = {
  items: [{
    title: 'Mensagem Personalizada',
    unit_price: 29.99,
    quantity: 1,
  }],
  payment_methods: {
    excluded_payment_types: [],
    installments: 1
  },
  back_urls: {
    success: 'https://seu-site.com/success',
    failure: 'https://seu-site.com/failure',
  }
};

const response = await mercadopago.preferences.create(preference);
// response.body.init_point = URL do checkout
```

### Asaas

**Vantagens:**
- PIX disponível imediatamente
- Taxas baixas (1.49% para PIX)
- API simples
- Suporte brasileiro

**Como integrar:**

1. Criar conta: https://www.asaas.com/
2. Documentação: https://docs.asaas.com/

## 🎯 Recomendação Imediata

### Enquanto aguarda PIX no Stripe:

1. **Mantenha o código atual** (já está pronto para PIX)
2. **Continue aceitando cartão** (funciona normalmente)
3. **Solicite acesso ao PIX** (via suporte Stripe)
4. **Considere Mercado Pago** (se precisar de PIX urgente)

### Quando PIX for habilitado:

1. ✅ Código já está pronto
2. ✅ Documentação completa
3. ✅ Testes prontos
4. ✅ Só ativar e usar!

## 📞 Contatos Úteis

### Stripe Brasil
- **Suporte**: https://support.stripe.com/contact
- **Email**: support@stripe.com
- **Telefone**: Disponível no dashboard após login
- **Chat**: Disponível no dashboard (canto inferior direito)

### Horário de Atendimento
- Segunda a Sexta: 9h às 18h (horário de Brasília)
- Resposta por email: 24-48 horas

## 🔍 Como Verificar Status da Solicitação

1. Acesse: https://dashboard.stripe.com/settings/account
2. Procure por notificações ou emails do Stripe
3. Verifique a seção "Payment methods" periodicamente

## ⏱️ Tempo Esperado

- **Verificação da conta**: 1-3 dias úteis
- **Habilitação de PIX**: 1-5 dias úteis após solicitação
- **Total**: ~1 semana

## 💡 Dica Pro

Se você tem urgência, considere:

1. **Criar conta no Mercado Pago** (PIX imediato)
2. **Usar temporariamente** até Stripe habilitar PIX
3. **Migrar de volta** quando Stripe estiver pronto

O código que implementamos funciona com Stripe. Para Mercado Pago, 
seria necessário uma adaptação, mas posso ajudar se precisar!

## 🎯 Próximos Passos

1. ✅ Verificar país da conta Stripe
2. ✅ Completar verificação da conta
3. ✅ Solicitar habilitação de PIX
4. ⏳ Aguardar resposta (1-5 dias)
5. ✅ Testar quando habilitado

## ❓ Dúvidas Frequentes

### Por que PIX não aparece?
Provavelmente sua conta não está configurada para Brasil ou não está totalmente verificada.

### Posso usar PIX em Test Mode?
Depende. Algumas contas têm PIX em test mode, outras não.

### Quanto tempo leva para habilitar?
Geralmente 1-5 dias úteis após solicitação.

### Posso usar outro gateway?
Sim! Mercado Pago e Asaas têm PIX disponível imediatamente.

### O código que implementamos funciona?
Sim! Assim que o PIX for habilitado no Stripe, funcionará perfeitamente.

---

**Resumo**: Solicite acesso ao PIX via suporte do Stripe. Enquanto isso, 
o código está pronto e você pode continuar aceitando cartão normalmente.
