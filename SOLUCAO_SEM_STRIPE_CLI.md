# 🚀 SOLUÇÃO SEM STRIPE CLI

## ✅ Você NÃO precisa instalar o Stripe CLI!

Use o script que já criei. É mais simples e funciona perfeitamente para desenvolvimento.

## 📋 Como Usar

### 1. Certifique-se que o Next.js está rodando

```powershell
npm run dev
```

### 2. Quando fizer um pagamento de teste

Após fazer o pagamento no Stripe, copie o **messageId** da URL ou do banco de dados.

### 3. Execute o script de processamento

```powershell
node processar-pendente-api.js SEU_MESSAGE_ID_AQUI
```

**Exemplo:**
```powershell
node processar-pendente-api.js 5ef14f3b-0559-4378-bb4f-4bb0445fc744
```

### 4. Pronto! ✅

O script vai:
- ✅ Mudar o status para "paid"
- ✅ Gerar o QR Code
- ✅ Criar o slug
- ✅ Enviar o email
- ✅ Mostrar os links para acessar

## 🎯 Fluxo Completo de Teste

```powershell
# 1. Iniciar servidor
npm run dev

# 2. Criar e pagar uma mensagem
# (use o wizard no navegador)

# 3. Copiar o messageId da URL ou banco

# 4. Processar a mensagem
node processar-pendente-api.js MESSAGE_ID

# 5. Acessar a página de delivery
# (o script mostra o link)
```

## 🔍 Como Encontrar o MessageId

### Opção 1: Da URL do checkout
Quando você vai para o checkout, a URL tem o messageId:
```
http://localhost:3000/checkout?messageId=AQUI_ESTA_O_ID
```

### Opção 2: Do banco de dados
Abra o arquivo `messages.db` com um visualizador SQLite e veja a última mensagem criada.

### Opção 3: Do console do navegador
Abra o DevTools (F12) e veja o console durante o checkout.

## 📝 Scripts Disponíveis

```powershell
# Processar uma mensagem específica
node processar-pendente-api.js MESSAGE_ID

# Testar fluxo completo (cria nova mensagem automaticamente)
node testar-fluxo-completo-com-email.js

# Verificar configuração
.\check-stripe.ps1
```

## 💡 Por que isso funciona?

O script `processar-pendente-api.js` faz exatamente o que o webhook do Stripe faria:
1. Atualiza o status para "paid"
2. Gera o QR Code
3. Cria o slug
4. Envia o email

A única diferença é que você executa manualmente em vez de ser automático.

## 🎉 Vantagens

- ✅ Não precisa instalar nada
- ✅ Funciona imediatamente
- ✅ Mais controle sobre o processo
- ✅ Fácil de debugar
- ✅ Perfeito para desenvolvimento

## 🚀 Para Produção

Em produção, você vai configurar o webhook diretamente no dashboard do Stripe, então não precisa do Stripe CLI mesmo!

---

**Resumo:** Use `node processar-pendente-api.js MESSAGE_ID` sempre que fizer um pagamento de teste! 🎯
