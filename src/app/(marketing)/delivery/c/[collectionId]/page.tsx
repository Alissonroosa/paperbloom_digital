import { DeliveryCardCollectionClient } from './DeliveryCardCollectionClient';

/**
 * Delivery page para 12 cartas — espera o webhook do Mercado Pago processar
 * (gerar dashboardToken) e redireciona pro painel.
 *
 * Antes era server component que redirecionava na hora. Se o webhook ainda
 * não rodou, o cliente caía na home sem feedback (perdíamos a venda na percepção).
 * Agora faz polling no client com UI clara de "confirmando pagamento".
 */
export default function Page({ params }: { params: { collectionId: string } }) {
  return <DeliveryCardCollectionClient collectionId={params.collectionId} />;
}
