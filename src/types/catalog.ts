/**
 * Catalog Types
 * Interfaces TypeScript para o catálogo de artes digitais da Paperbloom.
 * Separado de src/config/products.ts (que gerencia as 3 experiências digitais existentes).
 */

/**
 * Tipo de produto do catálogo:
 * - 'art_only': apenas arte digital (download via checkout MP)
 * - 'physical_only': apenas produto físico (deep link WhatsApp)
 * - 'both': produto físico + arte digital disponíveis
 */
export type CatalogProductType = 'art_only' | 'physical_only' | 'both';

/**
 * Configuração do produto físico — gera deep link WhatsApp
 */
export interface PhysicalConfig {
  /** Mensagem pré-preenchida no WhatsApp (o número vem de WHATSAPP_PHONE_NUMBER) */
  whatsappMessage: string;
  /** Descrição curta exibida junto ao botão de WhatsApp (ex: "Encomende pelo WhatsApp") */
  label: string;
  /** Texto de prazo de produção exibido no card e na página (ex: "5-7 dias úteis") */
  productionTime?: string;
  /** Preço formatado exibido no card (ex: "R$ 55,00" ou "A partir de R$ 39,00") */
  priceFormatted?: string;
}

/**
 * Configuração da arte digital — gera checkout MP + entrega via R2
 */
export interface ArtConfig {
  /** Preço em centavos de BRL (ex: 2990 = R$ 29,90) */
  priceInCents: number;
  /** Preço formatado para exibição (ex: "R$ 29,90") */
  priceFormatted: string;
  /**
   * URL pública do template Canva, gerada via "Compartilhar como modelo".
   * Exemplo: "https://www.canva.com/design/DAB.../edit?utm_content=..."
   * Ao abrir, o Canva oferece "Usar como modelo" — o cliente cria uma cópia editável na própria conta.
   */
  canvaTemplateUrl: string;
  /** Label do botão principal no email (padrão: "Abrir no Canva") */
  canvaTemplateLabel?: string;
  /** URL de um segundo arquivo Canva — ex: Livro com capa separada do miolo */
  canvaTemplateUrlSecondary?: string;
  /** Label do botão secundário no email (ex: "Abrir Miolo no Canva") */
  canvaTemplateLabelSecondary?: string;
  /** Texto de licença exibido na página do produto e no email */
  licenseText: string;
}

/**
 * Produto individual do catálogo
 */
export interface CatalogProduct {
  /** UUID estável do produto (não muda entre deploys) */
  id: string;
  /** Slug URL-friendly único (ex: "aquarela-rosas-dia-dos-namorados") */
  slug: string;
  /** Título do produto exibido na vitrine */
  title: string;
  /** Descrição curta para cards da listagem (max ~120 chars) */
  shortDescription: string;
  /** Descrição longa para a página individual do produto */
  longDescription: string;
  /**
   * URLs das imagens do produto (hospedadas no R2).
   * Primeira imagem é usada como capa no card da listagem.
   */
  images: string[];
  /** Tipo determina quais botões de compra são exibidos */
  type: CatalogProductType;
  /** Configuração do produto físico — obrigatória se type é 'physical_only' ou 'both' */
  physical?: PhysicalConfig;
  /** Configuração da arte digital — obrigatória se type é 'art_only' ou 'both' */
  art?: ArtConfig;
  /** Badge exibido no canto do card (ex: "Dia dos Namorados", "Novo") */
  badge?: string;
  /** Se false, produto não aparece na listagem (útil para produtos fora de estoque) */
  active: boolean;
}

/**
 * Coleção de produtos do catálogo
 */
export interface CatalogCollection {
  /** Slug da coleção (ex: "dia-dos-namorados-2026") */
  slug: string;
  /** Título da coleção para SEO e exibição */
  title: string;
  /** Descrição da coleção */
  description: string;
  /** Data de início da coleção (ISO 8601) */
  startsAt: string;
  /** Data de fim da coleção — usada para desativar automaticamente (ISO 8601) */
  endsAt: string;
  /** Produtos da coleção */
  products: CatalogProduct[];
  /** Datas-chave para urgência exibidas nas páginas */
  keyDates?: {
    /** Data limite para encomendar produtos físicos (ex: "31/05") */
    lastOrderDate?: string;
    /** Texto curto da deadline (ex: "Dia dos Namorados — 12/06") */
    deliveryEvent?: string;
  };
}
