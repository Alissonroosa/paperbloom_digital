'use client'

/**
 * Serviço centralizado de Analytics
 * Dispara eventos para Google Analytics 4 e Meta Pixel simultaneamente
 */

// ============================================
// TIPOS
// ============================================

type ProductType = 'message' | 'card-collection' | 'gender-reveal'

interface ProductInfo {
  type: ProductType
  name: string
  price: number
}

const PRODUCTS: Record<ProductType, ProductInfo> = {
  'message': { type: 'message', name: 'Mensagem Digital', price: 19.90 },
  'card-collection': { type: 'card-collection', name: '12 Cartas', price: 29.90 },
  'gender-reveal': { type: 'gender-reveal', name: 'Revelação Virtual', price: 29.90 },
}

// ============================================
// HELPERS
// ============================================

function gtag(...args: unknown[]) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args)
  }
}

function fbq(...args: unknown[]) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq(...args)
  }
}

function getProduct(productType: ProductType): ProductInfo {
  return PRODUCTS[productType] || PRODUCTS['message']
}

// Evita disparar o mesmo evento múltiplas vezes na mesma sessão
function shouldTrack(eventKey: string): boolean {
  if (typeof window === 'undefined') return false
  const key = `tracked_${eventKey}`
  if (sessionStorage.getItem(key)) return false
  sessionStorage.setItem(key, 'true')
  return true
}

// ============================================
// EVENTOS DO FUNIL
// ============================================

export const analytics = {
  /**
   * 1. PAGE VIEW - Visualização de página (automático via componentes)
   */
  pageView: (pagePath: string, pageTitle: string) => {
    gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle,
    })
    // Meta Pixel faz PageView automaticamente
  },

  /**
   * 2. VIEW PRODUCTS PAGE - Usuário viu a página de produtos
   */
  viewProductsPage: () => {
    if (!shouldTrack('view_products_page')) return
    
    gtag('event', 'view_item_list', {
      item_list_name: 'Produtos Paper Bloom',
      items: Object.values(PRODUCTS).map(p => ({
        item_name: p.name,
        price: p.price,
        currency: 'BRL'
      }))
    })
    
    fbq('track', 'ViewContent', {
      content_type: 'product_group',
      content_name: 'Produtos Paper Bloom'
    })
  },

  /**
   * 3. VIEW PRODUCT - Usuário clicou/viu detalhes de um produto específico
   */
  viewProduct: (productType: ProductType) => {
    const product = getProduct(productType)
    
    gtag('event', 'view_item', {
      currency: 'BRL',
      value: product.price,
      items: [{
        item_name: product.name,
        price: product.price,
        quantity: 1
      }]
    })
    
    fbq('track', 'ViewContent', {
      content_name: product.name,
      content_type: 'product',
      content_ids: [product.type],
      value: product.price,
      currency: 'BRL'
    })
  },

  /**
   * 4. START EDITOR - Usuário iniciou o editor (começou a criar)
   */
  startEditor: (productType: ProductType) => {
    if (!shouldTrack(`start_editor_${productType}`)) return
    
    const product = getProduct(productType)
    
    gtag('event', 'begin_checkout', {
      currency: 'BRL',
      value: product.price,
      items: [{
        item_name: product.name,
        price: product.price,
        quantity: 1
      }]
    })
    
    fbq('track', 'InitiateCheckout', {
      content_name: product.name,
      content_ids: [product.type],
      value: product.price,
      currency: 'BRL',
      num_items: 1
    })
    
    // Evento customizado
    fbq('trackCustom', 'StartEditor', {
      product_type: product.type,
      product_name: product.name
    })
  },

  /**
   * 5. EDITOR STEP - Usuário avançou para um step do editor
   */
  editorStep: (productType: ProductType, step: number, stepName: string) => {
    const product = getProduct(productType)
    
    gtag('event', 'checkout_progress', {
      currency: 'BRL',
      value: product.price,
      checkout_step: step,
      checkout_option: stepName,
      items: [{
        item_name: product.name,
        price: product.price,
        quantity: 1
      }]
    })
    
    fbq('trackCustom', 'EditorStep', {
      product_type: product.type,
      step_number: step,
      step_name: stepName
    })
  },

  /**
   * 6. COMPLETE EDITOR - Usuário completou o editor (antes do pagamento)
   */
  completeEditor: (productType: ProductType) => {
    if (!shouldTrack(`complete_editor_${productType}`)) return
    
    const product = getProduct(productType)
    
    gtag('event', 'add_to_cart', {
      currency: 'BRL',
      value: product.price,
      items: [{
        item_name: product.name,
        price: product.price,
        quantity: 1
      }]
    })
    
    fbq('track', 'AddToCart', {
      content_name: product.name,
      content_ids: [product.type],
      content_type: 'product',
      value: product.price,
      currency: 'BRL'
    })
  },

  /**
   * 7. INITIATE PAYMENT - Usuário clicou para pagar
   */
  initiatePayment: (productType: ProductType, itemId: string) => {
    const product = getProduct(productType)
    
    gtag('event', 'add_payment_info', {
      currency: 'BRL',
      value: product.price,
      payment_type: 'mercado_pago',
      items: [{
        item_id: itemId,
        item_name: product.name,
        price: product.price,
        quantity: 1
      }]
    })
    
    fbq('track', 'AddPaymentInfo', {
      content_name: product.name,
      content_ids: [itemId],
      value: product.price,
      currency: 'BRL'
    })
  },

  /**
   * 8. PURCHASE - Compra concluída (conversão principal)
   */
  purchase: (productType: ProductType, transactionId: string, value?: number) => {
    if (!shouldTrack(`purchase_${transactionId}`)) return
    
    const product = getProduct(productType)
    const finalValue = value || product.price
    
    gtag('event', 'purchase', {
      transaction_id: transactionId,
      currency: 'BRL',
      value: finalValue,
      items: [{
        item_id: transactionId,
        item_name: product.name,
        price: finalValue,
        quantity: 1
      }]
    })
    
    fbq('track', 'Purchase', {
      content_name: product.name,
      content_ids: [transactionId],
      content_type: 'product',
      value: finalValue,
      currency: 'BRL',
      num_items: 1
    })
    
    console.log('[Analytics] Purchase tracked:', {
      product: product.name,
      value: finalValue,
      transactionId
    })
  },

  /**
   * 9. LEAD - Usuário demonstrou interesse (ex: salvou rascunho)
   */
  lead: (productType: ProductType, source?: string) => {
    const product = getProduct(productType)
    
    gtag('event', 'generate_lead', {
      currency: 'BRL',
      value: product.price,
      lead_source: source || 'editor'
    })
    
    fbq('track', 'Lead', {
      content_name: product.name,
      content_category: 'digital_gift',
      value: product.price,
      currency: 'BRL'
    })
  },

  // ============================================
  // EVENTOS DE ENGAJAMENTO
  // ============================================

  /**
   * Visualização de mensagem pelo destinatário
   */
  viewMessage: (messageId: string, productType: ProductType = 'message') => {
    gtag('event', 'view_message', {
      message_id: messageId,
      product_type: productType
    })
    
    fbq('trackCustom', 'ViewMessage', {
      message_id: messageId,
      product_type: productType
    })
  },

  /**
   * QR Code escaneado
   */
  scanQRCode: (itemId: string, productType: ProductType) => {
    gtag('event', 'scan_qr_code', {
      item_id: itemId,
      product_type: productType
    })
    
    fbq('trackCustom', 'ScanQRCode', {
      item_id: itemId,
      product_type: productType
    })
  },

  /**
   * Download do QR Code
   */
  downloadQRCode: (itemId: string, productType: ProductType) => {
    gtag('event', 'download_qr_code', {
      item_id: itemId,
      product_type: productType
    })
    
    fbq('trackCustom', 'DownloadQRCode', {
      item_id: itemId,
      product_type: productType
    })
  },

  /**
   * Compartilhamento de link
   */
  shareLink: (itemId: string, productType: ProductType, method: 'copy' | 'whatsapp' | 'social') => {
    gtag('event', 'share', {
      method,
      content_type: productType,
      item_id: itemId
    })
    
    fbq('trackCustom', 'ShareLink', {
      item_id: itemId,
      product_type: productType,
      share_method: method
    })
  },

  // ============================================
  // EVENTOS ESPECÍFICOS - REVELAÇÃO VIRTUAL
  // ============================================

  /**
   * Voto na revelação
   */
  castVote: (revealId: string, vote: 'menino' | 'menina') => {
    gtag('event', 'cast_vote', {
      reveal_id: revealId,
      vote
    })
    
    fbq('trackCustom', 'CastVote', {
      reveal_id: revealId,
      vote
    })
  },

  /**
   * Visualização do dashboard
   */
  viewDashboard: (revealId: string) => {
    gtag('event', 'view_dashboard', {
      reveal_id: revealId
    })
    
    fbq('trackCustom', 'ViewDashboard', {
      reveal_id: revealId
    })
  },

  /**
   * Revelação do resultado
   */
  revealResult: (revealId: string, result: 'menino' | 'menina') => {
    gtag('event', 'reveal_result', {
      reveal_id: revealId,
      result
    })
    
    fbq('trackCustom', 'RevealResult', {
      reveal_id: revealId,
      result
    })
  },

  // ============================================
  // EVENTOS ESPECÍFICOS - 12 CARTAS
  // ============================================

  /**
   * Abertura de carta
   */
  openCard: (collectionId: string, cardNumber: number) => {
    gtag('event', 'open_card', {
      collection_id: collectionId,
      card_number: cardNumber
    })
    
    fbq('trackCustom', 'OpenCard', {
      collection_id: collectionId,
      card_number: cardNumber
    })
  },

  // ============================================
  // EVENTOS DE ERRO
  // ============================================

  /**
   * Erro no processo
   */
  error: (errorType: string, errorMessage: string, context?: Record<string, unknown>) => {
    gtag('event', 'exception', {
      description: `${errorType}: ${errorMessage}`,
      fatal: false,
      ...context
    })
  },
}

// ============================================
// DECLARAÇÕES DE TIPO GLOBAL
// ============================================

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    fbq: (...args: unknown[]) => void
    dataLayer: unknown[]
  }
}

export default analytics
