import { notFound } from 'next/navigation';
import { digitalArtOrderService } from '@/services/DigitalArtOrderService';
import { catalogService } from '@/services/CatalogService';
import { SuccessClient } from './SuccessClient';

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default async function LojaSuccessPage({ params }: PageProps) {
  const { orderId } = await params;

  const order = await digitalArtOrderService.findById(orderId);

  if (!order) {
    notFound();
  }

  // Pedido ainda pendente — exibe tela de aguardando com meta refresh
  if (order.status === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFFAFA] to-white flex items-center justify-center py-16 px-4">
        {/* Meta refresh a cada 10s — aguarda o webhook confirmar o pagamento */}
        {/* eslint-disable-next-line @next/next/no-head-element */}
        <meta httpEquiv="refresh" content={`10;url=/loja/sucesso/${orderId}`} />
        <div className="max-w-lg w-full mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-8">
            <span className="text-4xl">⏳</span>
          </div>
          <h1
            style={{ fontFamily: 'Georgia, serif' }}
            className="text-3xl font-bold text-[#8B5F5F] mb-4"
          >
            Aguardando confirmação
          </h1>
          <p className="text-[#4A4A4A] mb-4">
            Seu pagamento está sendo processado. Esta página será atualizada automaticamente em alguns segundos.
          </p>
          <p className="text-sm text-muted-foreground">
            Se o pagamento foi concluído e esta tela persistir por mais de 2 minutos, entre em contato pelo WhatsApp.
          </p>
        </div>
      </div>
    );
  }

  // Pedido reembolsado
  if (order.status === 'refunded') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFFAFA] to-white flex items-center justify-center py-16 px-4">
        <div className="max-w-lg w-full mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-8">
            <span className="text-4xl">↩️</span>
          </div>
          <h1
            style={{ fontFamily: 'Georgia, serif' }}
            className="text-3xl font-bold text-[#8B5F5F] mb-4"
          >
            Pedido reembolsado
          </h1>
          <p className="text-[#4A4A4A]">
            Este pedido foi reembolsado. Se tiver dúvidas, entre em contato pelo WhatsApp.
          </p>
        </div>
      </div>
    );
  }

  // Pedido paid — busca produto para obter canvaTemplateUrl
  const product = catalogService.getProductBySlug(order.product_slug);

  if (!product?.art?.canvaTemplateUrl) {
    // Produto sem canvaTemplateUrl — exibe mensagem genérica de sucesso
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFFAFA] to-white flex items-center justify-center py-16 px-4">
        <div className="max-w-lg w-full mx-auto text-center">
          <h1
            style={{ fontFamily: 'Georgia, serif' }}
            className="text-3xl font-bold text-[#8B5F5F] mb-4"
          >
            Pagamento confirmado! ✅
          </h1>
          <p className="text-[#4A4A4A]">
            Você receberá o link da sua arte por email em breve.
          </p>
        </div>
      </div>
    );
  }

  return (
    <SuccessClient
      orderId={order.id}
      email={order.email}
      productTitle={order.product_title}
      canvaTemplateUrl={product.art.canvaTemplateUrl}
      canvaTemplateLabel={product.art.canvaTemplateLabel}
      canvaTemplateUrlSecondary={product.art.canvaTemplateUrlSecondary}
      canvaTemplateLabelSecondary={product.art.canvaTemplateLabelSecondary}
      licenseText={product.art.licenseText}
      amountCents={order.amount_cents}
    />
  );
}
