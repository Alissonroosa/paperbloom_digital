'use client'

import Script from 'next/script'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null

  return (
    <>
      {/* Inline-snippet com fila de gtag — roda antes do script externo carregar.
          Eventos disparados pelo analytics.ts vão pra dataLayer e são processados
          quando o script lazy carrega. Garante que `analytics.viewProduct()` no
          mount da LP não se perde, mesmo com script externo em lazyOnload. */}
      <Script id="google-analytics-init" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          window.gtag = window.gtag || function(){dataLayer.push(arguments);};
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_title: document.title,
            page_location: window.location.href,
          });
        `}
      </Script>
      {/* Script externo (160KB) com lazyOnload — carrega só depois do window.onload.
          Tira do critical path do LCP. Antes era afterInteractive e custava ~600ms
          no mobile por competir com hydration na main thread. */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="lazyOnload"
      />
    </>
  )
}

// Função para rastrear eventos customizados
export function trackEvent(eventName: string, parameters?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters)
  }
}

// Eventos específicos do Paper Bloom
export const analyticsEvents = {
  // Funil de conversão
  viewProduct: (productType: string) => trackEvent('view_item', { item_name: productType }),
  startEditor: (productType: string) => trackEvent('begin_checkout', { item_name: productType }),
  completeEditor: (productType: string) => trackEvent('add_to_cart', { item_name: productType }),
  initiateCheckout: (productType: string, value: number) => trackEvent('initiate_checkout', { 
    item_name: productType, 
    value,
    currency: 'BRL'
  }),
  purchase: (productType: string, value: number, transactionId: string) => trackEvent('purchase', {
    transaction_id: transactionId,
    value,
    currency: 'BRL',
    items: [{ item_name: productType }]
  }),
  
  // Engajamento
  viewMessage: (messageId: string) => trackEvent('view_message', { message_id: messageId }),
  scanQRCode: (messageId: string) => trackEvent('scan_qr_code', { message_id: messageId }),
  
  // Revelação Virtual
  castVote: (revealId: string, vote: string) => trackEvent('cast_vote', { reveal_id: revealId, vote }),
  viewReveal: (revealId: string) => trackEvent('view_reveal', { reveal_id: revealId }),
}

// Declaração de tipo para window.gtag
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
  }
}
