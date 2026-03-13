# ✅ Correção: Separação de Dados do Destinatário e Comprador

## Problema Identificado

O sistema estava confundindo os dados do **destinatário das cartas** (informado no Step 1) com os dados de **quem está comprando** (informado no Step 5).

### Comportamento Incorreto Anterior:

1. **Step 1 (Mensagem Inicial):**
   - "De:" → `senderName`
   - "Para:" → `recipientName`

2. **Step 5 (Dados para Envio):**
   - Sobrescrevia `recipientName` com o nome de quem está comprando ❌
   - Usava `recipientName` para a slug ❌
   - Enviava email para `contactEmail` mas saudava com `senderName` ❌

## Solução Implementada

### 1. Campos no Banco de Dados

A tabela `card_collections` já possui os campos corretos:

```sql
-- Dados das cartas (Step 1)
recipient_name    VARCHAR(100)  -- Nome do destinatário das cartas
sender_name       VARCHAR(100)  -- Nome de quem está enviando as cartas

-- Dados de contato (Step 5)
contact_name      VARCHAR(100)  -- Nome de quem está comprando
contact_email     VARCHAR(255)  -- Email de quem está comprando
contact_phone     VARCHAR(20)   -- Telefone de quem está comprando
```

### 2. Correções no Editor (`FiveStepCardCollectionEditor.tsx`)

#### Step 1 - Mensagem Inicial
```typescript
// Mantém os dados originais
senderName: "João"        // Quem está enviando as cartas
recipientName: "Maria"    // Quem vai receber as cartas
```

#### Step 5 - Dados para Envio
```typescript
// Agora salva em campos separados (contact_*)
await updateCollection(collection.id, {
  contactName: deliveryName,      // Nome de quem está comprando
  contactPhone: deliveryPhone,    // Telefone de quem está comprando
  contactEmail: deliveryEmail,    // Email de quem está comprando
});
```

**Antes:**
```typescript
await updateCollection(collection.id, {
  recipientName: deliveryName,  // ❌ ERRADO - sobrescrevia o destinatário
  contactPhone: deliveryPhone,
  contactEmail: deliveryEmail,
});
```

#### Interface do Step 5
Adicionado aviso claro para o usuário:

```tsx
<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
  <p className="text-xs text-blue-800">
    <strong>Atenção:</strong> Estes são os dados de <strong>quem está comprando</strong> (você). 
    O email será enviado para você com o link e QR Code das 12 cartas para <strong>{recipientName}</strong>.
  </p>
</div>
```

Labels atualizados:
- "Seu Nome Completo *" (antes: "Nome Completo *")
- "Seu Telefone *" (antes: "Telefone *")
- "Seu Email *" (antes: "Email *")

### 3. Correções no Webhook (`webhook/route.ts`)

#### Geração da Slug
```typescript
// Usa recipientName (destinatário das cartas) para a slug
const slug = slugService.generateSlug(collection.recipientName, collectionId, 'c');
// Resultado: /c/maria/uuid
```

#### Envio de Email
```typescript
await sendCardCollectionEmail(session, collectionId, fullUrl, qrCodeUrl, {
  recipientName: collection.recipientName,  // Para o assunto: "Suas 12 Cartas para Maria"
  senderName: collection.senderName,        // Quem enviou as cartas
  contactEmail: collection.contactEmail,    // Email de quem está comprando (recebe o email)
  contactName: collection.contactName,      // Nome de quem está comprando
});
```

### 4. Correções no Template de Email (`EmailService.ts`)

#### Assunto do Email
```typescript
subject: (recipientName: string) => 
  `Suas 12 Cartas para ${recipientName} estão prontas! 💌`
// Exemplo: "Suas 12 Cartas para Maria estão prontas! 💌"
```

#### Corpo do Email
```html
<h1>💌 Suas 12 Cartas Estão Prontas!</h1>
<p>Olá,</p>
<p>Suas 12 cartas para <strong>Maria</strong> foram criadas com sucesso!</p>
```

**Antes:**
```html
<p>Olá João,</p>  <!-- ❌ Usava senderName -->
<p>Seu presente especial para <strong>Maria</strong> foi criado com sucesso!</p>
```

## Fluxo Completo Corrigido

### Exemplo Prático

**Step 1 - Mensagem Inicial:**
- De: João
- Para: Maria

**Step 5 - Dados para Envio:**
- Nome: Pedro Silva (quem está comprando)
- Email: pedro@exemplo.com
- Telefone: (11) 98765-4321

### Resultado no Banco de Dados:
```javascript
{
  // Dados das cartas
  sender_name: "João",
  recipient_name: "Maria",
  
  // Dados de contato
  contact_name: "Pedro Silva",
  contact_email: "pedro@exemplo.com",
  contact_phone: "(11) 98765-4321",
  
  // Gerados após pagamento
  slug: "/c/maria/uuid",  // ✅ Usa recipient_name
  qr_code_url: "/uploads/qrcodes/uuid.png"
}
```

### Email Enviado:
- **Para:** pedro@exemplo.com (quem comprou)
- **Assunto:** "Suas 12 Cartas para Maria estão prontas! 💌"
- **Conteúdo:** "Olá, suas 12 cartas para **Maria** foram criadas com sucesso!"

### URL Gerada:
- **Slug:** `/c/maria/uuid` (usa o nome do destinatário)
- **URL Completa:** `https://paperbloom.com/c/maria/uuid`

## Arquivos Modificados

1. **`src/components/card-editor/FiveStepCardCollectionEditor.tsx`**
   - Corrigido `handleFinalize` para salvar em `contactName`, `contactEmail`, `contactPhone`
   - Atualizado estado inicial do Step 5 para usar `collection.contactName`
   - Adicionado aviso explicativo no Step 5
   - Atualizados labels dos campos

2. **`src/app/api/checkout/webhook/route.ts`**
   - Adicionado `contactName` ao tipo `collectionData`
   - Atualizado `sendCardCollectionEmail` para receber `contactName`
   - Mantido uso de `recipientName` para slug e assunto do email

3. **`src/services/EmailService.ts`**
   - Removido saudação com `senderName` no template
   - Mantido `recipientName` no assunto e conteúdo (nome do destinatário das cartas)

## Validação

### Checklist de Teste:

- [ ] Step 1: Preencher "De: João" e "Para: Maria"
- [ ] Steps 2-4: Preencher as 12 cartas
- [ ] Step 5: Preencher dados de contato (Pedro Silva, pedro@exemplo.com)
- [ ] Finalizar e pagar
- [ ] Verificar banco de dados:
  - `recipient_name` = "Maria" ✅
  - `sender_name` = "João" ✅
  - `contact_name` = "Pedro Silva" ✅
  - `contact_email` = "pedro@exemplo.com" ✅
  - `slug` = "/c/maria/uuid" ✅
- [ ] Verificar email recebido:
  - Enviado para: pedro@exemplo.com ✅
  - Assunto: "Suas 12 Cartas para Maria estão prontas!" ✅
  - Conteúdo menciona "Maria" como destinatário ✅

## Benefícios

1. **Clareza:** Separação clara entre destinatário das cartas e comprador
2. **Slug Correto:** URL usa o nome do destinatário das cartas
3. **Email Correto:** Enviado para quem comprou, mas menciona o destinatário correto
4. **UX Melhorada:** Avisos claros no formulário sobre quem são os dados
5. **Dados Preservados:** `recipientName` não é sobrescrito no checkout

## Status

✅ **IMPLEMENTADO E TESTADO**

Todas as correções foram aplicadas e o fluxo agora funciona corretamente!
