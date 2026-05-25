'use client';

/**
 * WhatsAppButton — Botão de checkout via WhatsApp
 * Deep link wa.me/{phone}?text={mensagem pré-preenchida}.
 * Dispara analytics.clickWhatsAppCheckout(slug) antes do redirect.
 * Reusa <Button> de @/components/ui/Button.
 */

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { analytics } from '@/lib/analytics';

interface WhatsAppButtonProps {
  productSlug: string;
  productTitle?: string;
  productValue?: number;
  whatsappMessage: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

export default function WhatsAppButton({
  productSlug,
  productTitle,
  productValue,
  whatsappMessage,
  label = 'Comprar pelo WhatsApp',
  variant = 'outline',
}: WhatsAppButtonProps) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER || '';

  const handleClick = () => {
    // Tracking antes do redirect
    analytics.clickWhatsAppCheckout({
      slug: productSlug,
      title: productTitle ?? productSlug,
      value: productValue ?? 0,
    });

    const encodedMessage = encodeURIComponent(whatsappMessage);
    const url = phone
      ? `https://wa.me/${phone}?text=${encodedMessage}`
      : `https://wa.me/?text=${encodedMessage}`;

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      id={`btn-whatsapp-${productSlug}`}
      variant={variant}
      size="lg"
      onClick={handleClick}
      className="w-full gap-2"
      aria-label={`Comprar ${productSlug} pelo WhatsApp`}
    >
      <MessageCircle size={20} />
      {label}
    </Button>
  );
}
