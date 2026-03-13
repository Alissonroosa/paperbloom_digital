# 🎯 COMO USAR O SISTEMA AGORA

## ✅ VOCÊ NÃO PRECISA DO STRIPE CLI!

Use os scripts que já criei. É mais simples e funciona perfeitamente.

---

## 🚀 MÉTODO 1: Processar Última Mensagem Pendente (MAIS FÁCIL)

```powershell
# 1. Certifique-se que o Next.js está rodando
npm run dev

# 2. Execute o script
node processar-ultima-pendente.js
```

Isso vai:
- ✅ Buscar automaticamente a última mensagem pendente
- ✅ Processar ela (status → paid, gerar QR Code, enviar email)
- ✅ Mostrar os links para acessar

---

## 🎯 MÉTODO 2: Processar Mensagem Específica

Se você souber o ID da mensagem:

```powershell
node processar-pendente-api.js SEU_MESSAGE_ID
```

Exemplo:
```powershell
node processar-pendente-api.js 5ef14f3b-0559-4378-bb4f-4bb0445fc744
```

---

## 🧪 MÉTODO 3: Testar Fluxo Completo (CRIA NOVA MENSAGEM)

```powershell
node testar-fluxo-completo-com-email.js
```

Isso vai:
- ✅ Criar uma nova mensagem
- ✅ Simular o pagamento
- ✅ Gerar o QR Code
- ✅ Enviar o email
- ✅ Mostrar todos os links

---

## 📋 FLUXO DE TRABALHO RECOMENDADO

### Para Testar o Sistema:

```powershell
# Passo 1: Iniciar servidor
npm run dev

# Passo 2: Criar mensagem de teste
node testar-fluxo-completo-com-email.js

# Passo 3: Acessar os links que aparecerem
```

### Para Usar com Pagamentos Reais:

```powershell
# Passo 1: Iniciar servidor
npm run dev

# Passo 2: Criar mensagem pelo wizard
# (acesse http://localhost:3000/editor/mensagem)

# Passo 3: Fazer o pagamento no Stripe

# Passo 4: Processar a mensagem
node processar-ultima-pendente.js

# Passo 5: Acessar a página de delivery
```

---

## 🔍 Como Encontrar o MessageId

### Opção 1: Última mensagem criada
```powershell
node processar-ultima-pendente.js
```
(Ele busca automaticamente!)

### Opção 2: Da URL
Quando você cria uma mensagem, a URL tem o ID:
```
http://localhost:3000/checkout?messageId=AQUI_ESTA_O_ID
```

### Opção 3: Do console do navegador
Abra DevTools (F12) durante o checkout e veja o console.

---

## 📝 Comandos Úteis

```powershell
# Verificar se tudo está configurado
.\check-stripe.ps1

# Processar última mensagem pendente
node processar-ultima-pendente.js

# Processar mensagem específica
node processar-pendente-api.js MESSAGE_ID

# Testar fluxo completo
node testar-fluxo-completo-com-email.js
```

---

## ✅ TESTE AGORA!

Execute este comando para testar tudo:

```powershell
node testar-fluxo-completo-com-email.js
```

Depois acesse o link que aparecer! 🎉

---

## 🎯 Resumo

**Você NÃO precisa:**
- ❌ Instalar Stripe CLI
- ❌ Configurar PATH do Windows
- ❌ Rodar webhook listener

**Você SÓ precisa:**
- ✅ Rodar `npm run dev`
- ✅ Executar `node processar-ultima-pendente.js` após criar mensagens

**Simples assim!** 🚀

---

## 🚀 Para Produção

Em produção, você vai configurar o webhook diretamente no dashboard do Stripe:

1. Acesse: https://dashboard.stripe.com/webhooks
2. Adicione endpoint: `https://seudominio.com/api/checkout/webhook`
3. Selecione evento: `checkout.session.completed`
4. Copie o webhook secret para as variáveis de ambiente

Pronto! Em produção funciona automaticamente! ✅
