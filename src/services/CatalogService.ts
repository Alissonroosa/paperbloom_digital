/**
 * CatalogService
 * Serviço de leitura do catálogo de artes digitais.
 * Carrega JSONs em build time com cache em memória — sem banco de dados.
 * Segue o padrão singleton de MessageService / CardCollectionService.
 */

import type { CatalogCollection, CatalogProduct } from '@/types/catalog';
import diaDoNamorados2026 from '@/data/catalog/dia-dos-namorados-2026.json';

// Cast explícito — o JSON reflete 1:1 a interface CatalogCollection
const diaDoNamorados2026Collection = diaDoNamorados2026 as unknown as CatalogCollection;

/** Mapa de coleções disponíveis, indexado por slug */
const COLLECTIONS: Record<string, CatalogCollection> = {
  'dia-dos-namorados-2026': diaDoNamorados2026Collection,
};

export class CatalogService {
  /** Cache em memória: slug → CatalogCollection */
  private collectionsCache: Map<string, CatalogCollection> = new Map();
  /** Cache em memória: productSlug → CatalogProduct */
  private productsCache: Map<string, CatalogProduct> = new Map();

  constructor() {
    this.buildCache();
  }

  /**
   * Constrói os caches em memória a partir dos dados estáticos.
   * Chamado uma única vez no construtor.
   */
  private buildCache(): void {
    // Object.entries() é seguro com qualquer target — não usamos Map.entries() aqui
    for (const [slug, collection] of Object.entries(COLLECTIONS)) {
      this.collectionsCache.set(slug, collection);
      for (const product of collection.products) {
        this.productsCache.set(product.slug, product);
      }
    }
  }

  /**
   * Retorna uma coleção pelo slug.
   *
   * @param slug - Slug da coleção (ex: "dia-dos-namorados-2026")
   * @returns A coleção, ou null se não encontrada
   */
  getCollection(slug: string): CatalogCollection | null {
    return this.collectionsCache.get(slug) ?? null;
  }

  /**
   * Retorna um produto pelo slug.
   * Busca em todas as coleções disponíveis.
   *
   * @param slug - Slug do produto (ex: "aquarela-rosas-carta-de-amor")
   * @returns O produto, ou null se não encontrado
   */
  getProductBySlug(slug: string): CatalogProduct | null {
    return this.productsCache.get(slug) ?? null;
  }

  /**
   * Retorna todos os produtos ativos de todas as coleções.
   * Ordem: os produtos aparecem na ordem dos JSONs.
   *
   * @returns Array de CatalogProduct com active === true
   */
  getAllProducts(): CatalogProduct[] {
    const all: CatalogProduct[] = [];
    // Usar Array.from para compatibilidade com target TypeScript sem downlevelIteration
    const collections = Array.from(this.collectionsCache.values());
    for (const collection of collections) {
      for (const product of collection.products) {
        if (product.active) {
          all.push(product);
        }
      }
    }
    return all;
  }

  /**
   * Retorna todos os slugs de produtos ativos.
   * Usado em generateStaticParams das páginas do Next.js.
   *
   * @returns Array de { slug: string }
   */
  getAllSlugs(): { slug: string }[] {
    return this.getAllProducts().map((p) => ({ slug: p.slug }));
  }

  /**
   * Retorna a coleção que contém o produto com o slug dado.
   * Útil para a página [slug]/page.tsx passar keyDates ao client.
   *
   * @param productSlug - Slug do produto
   * @returns A coleção pai, ou null se não encontrada
   */
  getCollectionByProductSlug(productSlug: string): CatalogCollection | null {
    const collections = Array.from(this.collectionsCache.values());
    for (const collection of collections) {
      const found = collection.products.find((p) => p.slug === productSlug);
      if (found) return collection;
    }
    return null;
  }

  /**
   * Retorna a primeira coleção disponível (atalho para quando há apenas uma).
   * Usado na página /loja para não precisar hardcodar o slug.
   *
   * @returns A primeira CatalogCollection, ou null se não houver nenhuma
   */
  getFirstCollection(): CatalogCollection | null {
    const collections = Array.from(this.collectionsCache.values());
    return collections[0] ?? null;
  }

  /**
   * Retorna a coleção ativa baseada na data corrente (entre startsAt e endsAt).
   * Se houver mais de uma ativa, retorna a primeira encontrada.
   *
   * @returns A coleção ativa, ou null se nenhuma estiver no período
   */
  getActiveCollection(now: Date = new Date()): CatalogCollection | null {
    const collections = Array.from(this.collectionsCache.values());
    for (const collection of collections) {
      const startsAt = new Date(collection.startsAt);
      const endsAt = new Date(collection.endsAt);
      if (now >= startsAt && now <= endsAt) {
        return collection;
      }
    }
    return null;
  }
}

// Export singleton instance — padrão do projeto
export const catalogService = new CatalogService();
