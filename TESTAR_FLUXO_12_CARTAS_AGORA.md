# 🚀 Testar Fluxo de 12 Cartas - AGORA

## Pré-requisitos

Certifique-se de que:
- ✅ Servidor Next.js está rodando (`npm run dev`)
- ✅ Stripe CLI está rodando e escutando webhooks
- ✅ Variáveis de ambiente estão configuradas (`.env.local`)

## Comandos Rápidos

### 1. Iniciar Servidor (se não estiver rodando)
```bash
npm run dev
```

### 2. Iniciar Stripe Webhook (em outro terminal)
```bash
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

## Teste Passo a Passo

### Passo 1: Acessar o Editor
```
URL: http://localhost:3000/editor/12-cartas
```

**O que deve acontecer:**
- ✅ Página carrega com o editor de 5 passos
- ✅ Sistema cria automaticamente uma coleção
- ✅ Você vê o Passo 1 (Mensagem de Abertura)

### Passo 2: Preencher Passo 1 - Mensagem de Abertura
```
De: João
Para: Maria
Mensagem: "Preparei 12 cartas especiais para você..."
```

**Ações:**
1. Preencher campo "De"
2. Preencher campo "Para"
3. Escrever mensagem de abertura
4. Clicar em "Próximo"

### Passo 3: Preencher Passos 2-4 - As 12 Cartas

**Passo 2 - Cartas 1-4:**
```
Carta 1: "Abra quando estiver feliz"
Carta 2: "Abra quando precisar de um abraço"
Carta 3: "Abra quando sentir saudade"
Carta 4: "Abra quando quiser sorrir"
```

**Passo 3 - Cartas 5-8:**
```
Carta 5: "Abra quando estiver triste"
Carta 6: "Abra quando precisar de força"
Carta 7: "Abra quando quiser lembrar de mim"
Carta 8: "Abra quando estiver sozinha"
```

**Passo 4 - Cartas 9-12:**
```
Carta 9: "Abra quando for dormir"
Carta 10: "Abra quando acordar"
Carta 11: "Abra quando estiver com medo"
Carta 12: "Abra quando quiser me dizer algo"
```

**Ações em cada passo:**
1. Clicar em cada carta para editar
2. Preencher título e mensagem
3. Clicar em "Próximo" após preencher as 4 cartas

### Passo 4: Preencher Passo 5 - Dados de Contato
```
Nome Completo: João Silva
Telefone: (11) 98765-4321
Email: joao@exemplo.com
```

**Ações:**
1. Preencher nome completo
2. Preencher telefone
3. Preencher email válido
4. Clicar em "Finalizar e Pagar"

**O que deve acontecer:**
- ✅ Sistema salva os dados de contato
- ✅ Sistema cria sessão de checkout no Stripe
- ✅ Você é redirecionado para página de pagamento do Stripe

### Passo 5: Pagar no Stripe

**Dados do Cartão de Teste:**
```
Número: 4242 4242 4242 4242
Data: 12/34 (qualquer data futura)
CVC: 123
CEP: 12345-678
```

**Ações:**
1. Preencher dados do cartão
2. Clicar em "Pagar"

**O que deve acontecer:**
- ✅ Pagamento é processado
- ✅ Você é redirecionado para `/success?session_id=xxx`

### Passo 6: Página de Sucesso

**O que deve acontecer:**
- ✅ Página mostra "Processando seu pagamento..."
- ✅ Sistema aguarda 3 segundos
- ✅ Sistema verifica se webhook processou
- ✅ Você é redirecionado para `/delivery/c/[collectionId]`

**Verificar nos logs do terminal:**
```
[Webhook] Processing card-collection payment for session xxx
[Webhook] Starting card collection email send process
[Webhook] ✅ Successfully sent card collection email
```

### Passo 7: Página de Delivery

**O que você deve ver:**
- ✅ Mensagem "Suas 12 Cartas Estão Prontas!"
- ✅ Nome do destinatário (Maria)
- ✅ Confirmação de email enviado (banner azul)
- ✅ QR Code grande e destacado
- ✅ Link compartilhável
- ✅ Botões funcionando:
  - Baixar QR Code
  - Copiar Link
  - Abrir Link

**Testar funcionalidades:**
1. Clicar em "Copiar Link" → deve copiar para área de transferência
2. Clicar em "Baixar QR Code" → deve baixar arquivo PNG
3. Clicar em "Abrir Link" → deve abrir a coleção em nova aba

### Passo 8: Visualizar a Coleção

**Ao clicar em "Abrir Link":**
- ✅ Abre página `/c/maria/[uuid]`
- ✅ Mostra as 12 cartas disponíveis
- ✅ Cada carta tem seu título
- ✅ Ao clicar em uma carta, ela abre
- ✅ Após abrir, a carta fica marcada como "aberta"

## Verificações Importantes

### 1. Verificar Email Enviado

**Logs do EmailService:**
```
[EmailService] Attempting to send card collection email
[EmailService] Card collection email sent successfully
```

**Verificar inbox:**
- Email deve ter sido enviado para `joao@exemplo.com`
- Assunto: "Suas 12 Cartas para Maria estão prontas! 💌"
- Conteúdo: QR Code + Link + Instruções

### 2. Verificar Banco de Dados

```bash
# Abrir banco de dados SQLite
sqlite3 messages.db

# Verificar coleção criada
SELECT id, recipientName, senderName, status, slug, qrCodeUrl 
FROM card_collections 
ORDER BY createdAt DESC 
LIMIT 1;

# Deve mostrar:
# - status: paid
# - slug: /c/maria/[uuid]
# - qrCodeUrl: /uploads/qrcodes/[uuid].png
```

### 3. Verificar QR Code Gerado

```bash
# Verificar se arquivo existe
ls public/uploads/qrcodes/

# Deve ter um arquivo PNG recente
```

## Problemas Comuns

### ❌ Erro: "Falha ao criar checkout"
**Solução:** Verificar se Stripe está configurado corretamente
```bash
# Verificar variáveis de ambiente
cat .env.local | grep STRIPE
```

### ❌ Erro: "Email não enviado"
**Solução:** Verificar configuração do Resend
```bash
# Verificar variáveis de ambiente
cat .env.local | grep RESEND
```

### ❌ Webhook não processa
**Solução:** Verificar se Stripe CLI está rodando
```bash
# Reiniciar Stripe CLI
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

### ❌ QR Code não aparece
**Solução:** Aguardar alguns segundos e recarregar a página
- O webhook pode demorar alguns segundos para processar

## Teste Rápido (1 minuto)

Se quiser testar rapidamente sem preencher tudo:

```bash
# 1. Acessar
http://localhost:3000/editor/12-cartas

# 2. Preencher apenas o essencial
De: João
Para: Maria
Email: seu-email@exemplo.com

# 3. Clicar rapidamente em "Próximo" em todos os passos
# (pode deixar mensagens vazias para teste)

# 4. No último passo, preencher email e clicar em "Finalizar"

# 5. Pagar com cartão de teste

# 6. Verificar se chega na página de delivery
```

## Sucesso! 🎉

Se você chegou até aqui e tudo funcionou:
- ✅ Fluxo de checkout está funcionando
- ✅ Webhook está processando corretamente
- ✅ QR Code está sendo gerado
- ✅ Email está sendo enviado
- ✅ Página de delivery está exibindo tudo corretamente

**O sistema está 100% funcional!** 🚀
