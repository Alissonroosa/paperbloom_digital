'use client'

import Script from 'next/script'

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

export function MetaPixel() {
  if (!META_PIXEL_ID) return null

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}

// Função para rastrear eventos do Meta Pixel
export function trackMetaEvent(eventName: string, parameters?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, parameters)
  }
}

// Função para eventos customizados
export function trackMetaCustomEvent(eventName: string, parameters?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', eventName, parameters)
  }
}

// Eventos específicos do Paper Bloom para Meta
export const metaEvents = {
  // Eventos padrão do Meta (para otimização de campanhas)
  viewContent: (productType: string, value: number) => trackMetaEvent('ViewContent', {
    content_name: productType,
    content_type: 'product',
    value,
    currency: 'BRL'
  }),
  
  addToCart: (productType: string, value: number) => trackMetaEvent('AddToCart', {
    content_name: productType,
    content_type: 'product',
    value,
    currency: 'BRL'
  }),
  
  initiateCheckout: (productType: string, value: number) => trackMetaEvent('InitiateCheckout', {
    content_name: productType,
    value,
    currency: 'BRL',
    num_items: 1
  }),
  
  purchase: (productType: string, value: number, transactionId?: string) => trackMetaEvent('Purchase', {
    content_name: productType,
    content_type: 'product',
    value,
    currency: 'BRL',
    transaction_id: transactionId
  }),
  
  lead: (productType: string) => trackMetaEvent('Lead', {
    content_name: productType,
    content_category: 'digital_gift'
  }),
  
  // Eventos customizados Paper Bloom
  startEditor: (productType: string) => trackMetaCustomEvent('StartEditor', {
    product_type: productType
  }),
  
  completeEditor: (productType: string) => trackMetaCustomEvent('CompleteEditor', {
    product_type: productType
  }),
  
  viewMessage: (messageId: string) => trackMetaCustomEvent('ViewMessage', {
    message_id: messageId
  }),
  
  castVote: (revealId: string) => trackMetaCustomEvent('CastVote', {
    reveal_id: revealId
  }),
}

// Declaração de tipo para window.fbq
declare global {
  interface Window {
    fbq: (...args: unknown[]) => void
  }
}
