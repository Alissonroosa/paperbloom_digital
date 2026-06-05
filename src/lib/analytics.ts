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

    // Evento customizado — InitiateCheckout padrão só dispara em initiatePayment
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
   * 5a. EDITOR FIELD FILLED — primeira vez que o usuário preenche um campo significativo.
   * Idempotente por sessão (1 disparo por campo).
   * Permite construir funil de "% de quem chegou no Step → % que preencheu campo X".
   */
  editorFieldFilled: (productType: ProductType, field: string) => {
    if (!shouldTrack(`editor_field_${productType}_${field}`)) return
    gtag('event', 'editor_field_filled', {
      product_type: productType,
      field_name: field,
    })
    fbq('trackCustom', 'EditorFieldFilled', {
      product_type: productType,
      field_name: field,
    })
  },

  /**
   * 5b. EDITOR TIME ON STEP — disparado ao sair de um step.
   * `seconds` = tempo total que o usuário ficou nele.
   * Identifica steps que levam tempo demais (= confusos).
   */
  editorTimeOnStep: (productType: ProductType, step: number, stepName: string, seconds: number) => {
    gtag('event', 'editor_time_on_step', {
      product_type: productType,
      step_number: step,
      step_name: stepName,
      seconds_on_step: Math.round(seconds),
    })
    fbq('trackCustom', 'EditorTimeOnStep', {
      product_type: productType,
      step_number: step,
      step_name: stepName,
      seconds_on_step: Math.round(seconds),
    })
  },

  /**
   * 5c. EDITOR BACK NAVIGATION — clicou em "voltar" ou usou modal de "ajustar algo antes".
   * Sinal de UX confusa (algo no step destino foi mal explicado).
   */
  editorBackNavigation: (productType: ProductType, fromStep: number, toStep: number, source: 'wizard_back' | 'edit_menu' | 'preview_back') => {
    gtag('event', 'editor_back_navigation', {
      product_type: productType,
      from_step: fromStep,
      to_step: toStep,
      source,
    })
    fbq('trackCustom', 'EditorBackNavigation', {
      product_type: productType,
      from_step: fromStep,
      to_step: toStep,
      source,
    })
  },

  /**
   * 5d. EDITOR ABANDON — disparado no `beforeunload` se o usuário fechar a aba/navegar pra fora.
   * Envia o último step ativo + tempo total na sessão do editor.
   * Usa `navigator.sendBeacon` indiretamente via gtag/fbq (que já lidam com unload).
   */
  editorAbandon: (productType: ProductType, lastStep: number, lastStepName: string, totalSeconds: number, fieldsCompleted: string[]) => {
    gtag('event', 'editor_abandon', {
      product_type: productType,
      last_step: lastStep,
      last_step_name: lastStepName,
      total_seconds: Math.round(totalSeconds),
      fields_completed_count: fieldsCompleted.length,
      fields_completed: fieldsCompleted.join(','),
    })
    fbq('trackCustom', 'EditorAbandon', {
      product_type: productType,
      last_step: lastStep,
      last_step_name: lastStepName,
      total_seconds: Math.round(totalSeconds),
      fields_completed_count: fieldsCompleted.length,
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
    
    fbq('track', 'InitiateCheckout', {
      content_name: product.name,
      content_ids: [itemId],
      value: product.price,
      currency: 'BRL',
      num_items: 1
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
   * Entrou na demo cinematográfica /demo/card-collection.
   * `source` identifica de onde veio (hero, after_how_it_works, sticky_mobile…)
   * — útil pra atribuir performance da demo a cada ponto da LP.
   * Idempotente por sessão+source.
   */
  viewDemo: (source: string = 'unknown') => {
    if (!shouldTrack(`view_demo_${source}`)) return;
    gtag('event', 'view_demo', {
      product_type: 'card-collection',
      demo_source: source,
    });
    fbq('trackCustom', 'ViewDemo', {
      product_type: 'card-collection',
      demo_source: source,
    });
  },

  /**
   * Usuário abriu (selou) a primeira carta dentro da demo cinematográfica.
   * Sinaliza intenção forte — leu a mensagem inteira e fechou.
   * Idempotente: dispara só na primeira carta selada na sessão.
   */
  demoCardOpened: (cardOrder: number) => {
    if (!shouldTrack(`demo_first_card_opened`)) return;
    gtag('event', 'demo_card_opened', {
      product_type: 'card-collection',
      card_order: cardOrder,
    });
    fbq('trackCustom', 'DemoCardOpened', {
      product_type: 'card-collection',
      card_order: cardOrder,
    });
  },

  /**
   * Clique em qualquer CTA da demo que leva pro editor.
   * `source` distingue qual CTA: post_seal_overlay, main_view_button, cta_final…
   */
  demoToEditor: (source: string) => {
    gtag('event', 'demo_to_editor', {
      product_type: 'card-collection',
      cta_source: source,
    });
    fbq('trackCustom', 'DemoToEditor', {
      product_type: 'card-collection',
      cta_source: source,
    });
  },

  /**
   * Abertura de item do FAQ.
   * `source` identifica em qual página (lp_12_cartas, etc).
   * Útil pra ver quais objeções os usuários mais buscam responder.
   */
  faqOpen: (question: string, source: string) => {
    gtag('event', 'faq_open', {
      source,
      faq_question: question,
    });
    fbq('trackCustom', 'FaqOpen', {
      source,
      faq_question: question,
    });
  },

  /**
   * Clique em botão de contato via WhatsApp.
   * `source` distingue onde apareceu: header, after_pricing, after_faq,
   * floating_button, support_inline. Sinaliza onde estão as dúvidas reais.
   */
  contactWhatsApp: (source: string) => {
    gtag('event', 'contact_whatsapp', {
      source,
    });
    fbq('trackCustom', 'ContactWhatsApp', {
      source,
    });
  },

  /**
   * Cópia do link de compartilhamento no painel
   */
  copyShareLink: (collectionId: string) => {
    gtag('event', 'painel_copy_link', { collection_id: collectionId });
    fbq('trackCustom', 'PainelCopyLink', { collection_id: collectionId });
  },

  /**
   * Abertura do WhatsApp para compartilhamento no painel
   */
  openWhatsAppShare: (collectionId: string) => {
    gtag('event', 'painel_whatsapp_share', { collection_id: collectionId });
    fbq('trackCustom', 'PainelWhatsAppShare', { collection_id: collectionId });
  },

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

  // ============================================
  // EVENTOS DA LOJA — CATÁLOGO PAPER BLOOM
  // ============================================

  /**
   * Visualização do catálogo geral da loja (/loja)
   * Eventos genéricos — sem coleção específica.
   */
  viewLojaCatalog: () => {
    if (!shouldTrack('view_loja_catalog')) return

    gtag('event', 'view_item_list', {
      item_list_id: 'loja_geral',
      item_list_name: 'Loja Paper Bloom',
    })

    fbq('track', 'ViewContent', {
      content_type: 'product_group',
      content_category: 'loja',
      content_name: 'Loja Paper Bloom',
    })
  },

  /**
   * Visualização de uma coleção sazonal (/loja/colecao/[slug])
   * Evento separado de viewLojaCatalog para isolar performance de campanhas sazonais.
   */
  viewLojaCollection: (slug: string, title: string) => {
    if (!shouldTrack(`view_loja_collection_${slug}`)) return

    gtag('event', 'view_item_list', {
      item_list_id: `colecao_${slug}`,
      item_list_name: title,
    })

    fbq('track', 'ViewContent', {
      content_type: 'product_group',
      content_category: 'colecao',
      content_ids: [slug],
      content_name: title,
    })
  },

  /**
   * Visualização da página intermediária /escolher-presente
   * CTA principal do Header — útil pra medir conversão Home → Escolher → Loja/Experiências.
   */
  viewEscolherPresente: () => {
    if (!shouldTrack('view_escolher_presente')) return

    gtag('event', 'select_promotion', {
      promotion_id: 'escolher_presente',
      promotion_name: 'Escolher Presente — Hub',
    })

    fbq('track', 'ViewContent', {
      content_type: 'landing_page',
      content_name: 'Escolher Presente',
    })
  },

  /**
   * Visualização de produto individual (/loja/[slug])
   */
  viewLojaProduct: (info: { slug: string; title: string; type: 'art_only' | 'physical_only' | 'both'; value: number }) => {
    if (!shouldTrack(`view_loja_product_${info.slug}`)) return

    gtag('event', 'view_item', {
      currency: 'BRL',
      value: info.value,
      items: [{
        item_id: info.slug,
        item_name: info.title,
        item_category: 'loja',
        item_variant: info.type,
        price: info.value,
        quantity: 1,
      }],
    })

    fbq('track', 'ViewContent', {
      content_type: 'product',
      content_ids: [info.slug],
      content_name: info.title,
      content_category: info.type,
      value: info.value,
      currency: 'BRL',
    })
  },

  /**
   * Clique no botão de checkout WhatsApp (produto físico)
   */
  clickWhatsAppCheckout: (info: { slug: string; title: string; value: number }) => {
    gtag('event', 'begin_checkout', {
      currency: 'BRL',
      value: info.value,
      items: [{
        item_id: info.slug,
        item_name: info.title,
        price: info.value,
        quantity: 1,
      }],
      checkout_source: 'whatsapp',
    })

    fbq('track', 'InitiateCheckout', {
      content_ids: [info.slug],
      content_name: info.title,
      content_type: 'product',
      value: info.value,
      currency: 'BRL',
      num_items: 1,
    })

    fbq('trackCustom', 'WhatsAppCheckout', { slug: info.slug, title: info.title })
  },

  /**
   * Clique no botão de checkout de arte digital
   */
  clickArtCheckout: (info: { slug: string; title: string; value: number }) => {
    gtag('event', 'begin_checkout', {
      currency: 'BRL',
      value: info.value,
      items: [{
        item_id: info.slug,
        item_name: info.title,
        price: info.value,
        quantity: 1,
      }],
      checkout_source: 'art_digital',
    })

    fbq('track', 'InitiateCheckout', {
      content_ids: [info.slug],
      content_name: info.title,
      content_type: 'product',
      value: info.value,
      currency: 'BRL',
      num_items: 1,
    })

    fbq('trackCustom', 'ArtCheckout', { slug: info.slug, title: info.title })
  },

  /**
   * Compra de arte digital concluída — disparado na /loja/sucesso/[orderId]
   * Idempotente: recarregar a página não dispara de novo.
   */
  purchaseArt: (
    orderId: string,
    product: { slug: string; title: string },
    amountInCents: number
  ) => {
    if (!shouldTrack(`purchase_art_${orderId}`)) return

    const value = amountInCents / 100

    gtag('event', 'purchase', {
      transaction_id: orderId,
      currency: 'BRL',
      value,
      items: [{
        item_id: product.slug,
        item_name: product.title,
        price: value,
        quantity: 1,
      }],
    })

    fbq('track', 'Purchase', {
      content_ids: [product.slug],
      content_name: product.title,
      content_type: 'product',
      value,
      currency: 'BRL',
      num_items: 1,
    })

    console.log('[Analytics] purchaseArt tracked:', {
      orderId,
      product: product.title,
      value,
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
