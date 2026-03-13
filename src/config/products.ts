/**
 * Product Catalog
 * Centralized product definitions for Paper Bloom Digital
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  /** Price in BRL cents (e.g., 1990 = R$ 19,90) */
  priceInCents: number;
  /** Formatted price string for display */
  priceFormatted: string;
  editorPath: string;
}

export const PRODUCTS: Record<string, Product> = {
  message: {
    id: 'message',
    name: 'Paper Bloom Digital - Mensagem Personalizada',
    description: 'Presente digital personalizado com mensagem, foto e música',
    priceInCents: 1990,
    priceFormatted: 'R$ 19,90',
    editorPath: '/editor/mensagem',
  },
  'card-collection': {
    id: 'card-collection',
    name: 'Paper Bloom Digital - 12 Cartas',
    description: 'Jornada emocional única com 12 mensagens personalizadas',
    priceInCents: 2990,
    priceFormatted: 'R$ 29,90',
    editorPath: '/editor/12-cartas',
  },
  'gender-reveal': {
    id: 'gender-reveal',
    name: 'Paper Bloom Digital - Revelação Virtual',
    description: 'Experiência interativa de revelação do sexo do bebê com votação',
    priceInCents: 1990,
    priceFormatted: 'R$ 19,90',
    editorPath: '/editor/revelacao-virtual',
  },
};

export type ProductType = keyof typeof PRODUCTS;

export function getProduct(type: ProductType): Product {
  const product = PRODUCTS[type];
  if (!product) {
    throw new Error(`Unknown product type: ${type}`);
  }
  return product;
}
