# 📊 Guia de Analytics e Tracking - Paper Bloom

Este documento descreve toda a implementação de tracking do Google Analytics 4 e Meta Pixel no projeto Paper Bloom.

---

## 📁 Arquivos de Implementação

### Componentes Principais
| Arquivo | Descrição |
|---------|-----------|
| `src/components/analytics/GoogleAnalytics.tsx` | Componente que carrega o GA4 |
| `src/components/analytics/MetaPixel.tsx` | Componente que carrega o Meta Pixel |
| `src/lib/analytics.ts` | **Serviço centralizado** - Use este para disparar eventos |
| `src/app/layout.tsx` | Layout raiz onde os scripts são carregados |

### Variáveis de Ambiente
```env
# .env.local
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=1234567890123456
```

---

## 🎯 Eventos Implementados por Página

### 1. Página de Produtos (`/produtos`)
**Arquivo:** `src/app/(marketing)/produtos/page.tsx`

| Evento | GA4 | Meta Pixel | Quando Dispara |
|--------|-----|------------|----------------|
| `view_item_list` | ✅ | `ViewContent` | Ao carregar a página |

```typescript
// Código implementado
useEffect(() => {
  analytics.viewProductsPage()
}, [])
```

---

### 2. Editor de 12 Cartas (`/editor/12-cartas`)
**Arquivo:** `src/app/(marketing)/editor/12-cartas/page.tsx`

| Evento | GA4 | Meta Pixel | Quando Dispara |
|--------|-----|------------|----------------|
| `begin_checkout` | ✅ | `InitiateCheckout` | Ao abrir o editor |
| `add_to_cart` | ✅ | `AddToCart` | Ao clicar em "Finalizar" |
| `add_payment_info` | ✅ | `AddPaymentInfo` | Ao iniciar checkout |

```typescript
// Início do editor
analytics.startEditor('card-collection');

// Ao finalizar
analytics.completeEditor('card-collection');
analytics.initiatePayment('card-collection', collectionId);
```

---

### 3. Editor de Revelação Virtual (`/editor/revelacao-virtual`)
**Arquivo:** `src/app/(fullscreen)/editor/revelacao-virtual/page.tsx`

| Evento | GA4 | Meta Pixel | Quando Dispara |
|--------|-----|------------|----------------|
| `begin_checkout` | ✅ | `InitiateCheckout` | Ao abrir o editor |
| `checkout_progress` | ✅ | `EditorStep` (custom) | A cada mudança de step |

**Arquivo:** `src/app/(fullscreen)/editor/revelacao-virtual/steps/Step4Contact.tsx`

| Evento | GA4 | Meta Pixel | Quando Dispara |
|--------|-----|------------|----------------|
| `add_to_cart` | ✅ | `AddToCart` | Ao clicar em "Finalizar Compra" |
| `add_payment_info` | ✅ | `AddPaymentInfo` | Ao iniciar checkout |

---

### 4. Páginas de Delivery (Pós-Pagamento)

#### Mensagem Digital (`/delivery/[messageId]`)
**Arquivo:** `src/app/(marketing)/delivery/[messageId]/page.tsx`

| Evento | GA4 | Meta Pixel | Quando Dispara |
|--------|-----|------------|----------------|
| `purchase` | ✅ | `Purchase` | Ao carregar com status "paid" |
| `share` | ✅ | `ShareLink` (custom) | Ao copiar link |
| `download_qr_code` | ✅ | `DownloadQRCode` (custom) | Ao baixar QR Code |

#### 12 Cartas (`/delivery/c/[collectionId]`)
**Arquivo:** `src/app/(marketing)/delivery/c/[collectionId]/page.tsx`

| Evento | GA4 | Meta Pixel | Quando Dispara |
|--------|-----|------------|----------------|
| `purchase` | ✅ | `Purchase` | Ao carregar com status "paid" |
| `share` | ✅ | `ShareLink` (custom) | Ao copiar link |
| `download_qr_code` | ✅ | `DownloadQRCode` (custom) | Ao baixar QR Code |

#### Revelação Virtual (`/delivery/revelacao-virtual/[revealId]`)
**Arquivo:** `src/app/(marketing)/delivery/revelacao-virtual/[revealId]/page.tsx`

| Evento | GA4 | Meta Pixel | Quando Dispara |
|--------|-----|------------|----------------|
| `purchase` | ✅ | `Purchase` | Ao carregar com status "paid" |
| `share` | ✅ | `ShareLink` (custom) | Ao copiar link |
| `download_qr_code` | ✅ | `DownloadQRCode` (custom) | Ao baixar QR Code |

---

### 5. Página de Votação (`/revelacao-virtual/[slug]`)
**Arquivo:** `src/app/(fullscreen)/revelacao-virtual/[slug]/page.tsx`

| Evento | GA4 | Meta Pixel | Quando Dispara |
|--------|-----|------------|----------------|
| `cast_vote` | ✅ | `CastVote` (custom) | Ao votar menino/menina |

---

## 📈 Funil de Conversão Completo

```
1. view_item_list (Página de Produtos)
        ↓
2. view_item (Clique em produto específico)
        ↓
3. begin_checkout / InitiateCheckout (Início do Editor)
        ↓
4. checkout_progress (Progresso no Editor - cada step)
        ↓
5. add_to_cart / AddToCart (Completou o Editor)
        ↓
6. add_payment_info / AddPaymentInfo (Clicou em Pagar)
        ↓
7. purchase / Purchase (Pagamento Confirmado) ⭐ CONVERSÃO
```

---

## ⚙️ Configuração Passo a Passo

### Google Analytics 4

#### 1. Criar Conta e Propriedade
1. Acesse [analytics.google.com](https://analytics.google.com)
2. Clique em "Administrador" (engrenagem)
3. Clique em "Criar propriedade"
4. Nome: "Paper Bloom"
5. Fuso horário: Brasil
6. Moeda: BRL

#### 2. Criar Stream de Dados Web
1. Na propriedade criada, vá em "Fluxos de dados"
2. Clique em "Adicionar fluxo" → "Web"
3. URL: `https://paperbloom.com.br`
4. Nome: "Paper Bloom Web"
5. Copie o **Measurement ID** (formato: `G-XXXXXXXXXX`)

#### 3. Configurar Variável de Ambiente
```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### 4. Configurar Eventos de Conversão
1. Vá em "Administrador" → "Eventos"
2. Encontre o evento `purchase`
3. Marque como "Conversão" (toggle)

#### 5. Verificar Instalação
1. Acesse seu site
2. No GA4, vá em "Relatórios" → "Tempo real"
3. Você deve ver seu acesso

---

### Meta Pixel (Facebook/Instagram)

#### 1. Criar Pixel
1. Acesse [business.facebook.com/events_manager](https://business.facebook.com/events_manager)
2. Clique em "Conectar fontes de dados"
3. Selecione "Web"
4. Escolha "Meta Pixel"
5. Nome: "Paper Bloom Pixel"
6. Copie o **Pixel ID** (número de 15-16 dígitos)

#### 2. Configurar Variável de Ambiente
```env
NEXT_PUBLIC_META_PIXEL_ID=1234567890123456
```

#### 3. Configurar Eventos de Conversão
1. No Events Manager, vá em "Configurações"
2. Role até "Eventos de conversão"
3. Adicione os eventos:
   - `Purchase` (Compra) - **Principal**
   - `InitiateCheckout` (Início de checkout)
   - `AddToCart` (Adicionar ao carrinho)

#### 4. Verificar Instalação
1. Instale a extensão [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
2. Acesse seu site
3. A extensão deve mostrar o Pixel ativo

#### 5. Testar Eventos
1. No Events Manager, vá em "Testar eventos"
2. Cole a URL do seu site
3. Navegue pelo site e veja os eventos chegando

---

## 🎯 Configurar Campanhas de Anúncios

### Meta Ads (Facebook/Instagram)

#### Criar Campanha de Conversão
1. Acesse [adsmanager.facebook.com](https://adsmanager.facebook.com)
2. Clique em "Criar"
3. Objetivo: **Vendas**
4. Evento de conversão: **Purchase**
5. Pixel: Selecione "Paper Bloom Pixel"

#### Configurar Público
```
Idade: 18-45 anos
Interesses: 
- Presentes
- Relacionamentos
- Datas comemorativas
- Gravidez (para Revelação Virtual)
```

#### Otimização
- Otimizar para: **Conversões**
- Evento: **Purchase**
- Janela de atribuição: 7 dias clique, 1 dia visualização

---

### Google Ads

#### Importar Conversões do GA4
1. No Google Ads, vá em "Ferramentas" → "Conversões"
2. Clique em "Nova ação de conversão"
3. Selecione "Importar" → "Google Analytics 4"
4. Selecione o evento `purchase`

---

## 🔍 Verificação e Debug

### Verificar GA4
```javascript
// No console do navegador
window.dataLayer
// Deve mostrar os eventos disparados
```

### Verificar Meta Pixel
```javascript
// No console do navegador
window.fbq.queue
// Deve mostrar os eventos na fila
```

### Extensões Úteis
- [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna)
- [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)

---

## 📊 Relatórios Importantes

### GA4 - Relatórios para Acompanhar
1. **Tempo Real** - Ver acessos ao vivo
2. **Aquisição** → **Visão geral** - De onde vem o tráfego
3. **Engajamento** → **Eventos** - Todos os eventos disparados
4. **Monetização** → **Compras de e-commerce** - Vendas

### Meta - Relatórios para Acompanhar
1. **Events Manager** → **Visão geral** - Todos os eventos
2. **Ads Manager** → **Colunas personalizadas**:
   - Custo por Purchase
   - ROAS (Retorno sobre investimento)
   - Conversões

---

## 🚀 Próximos Passos Recomendados

1. [ ] Configurar GA4 e Meta Pixel com os IDs reais
2. [ ] Testar todos os eventos com as extensões de debug
3. [ ] Criar primeira campanha de teste com R$50
4. [ ] Configurar públicos de remarketing:
   - Visitou produtos mas não comprou
   - Iniciou editor mas não finalizou
   - Compradores (para lookalike)
5. [ ] Configurar alertas de conversão no GA4

---

## 📞 Suporte

Se precisar de ajuda com a configuração:
- [Documentação GA4](https://support.google.com/analytics)
- [Documentação Meta Pixel](https://developers.facebook.com/docs/meta-pixel)
