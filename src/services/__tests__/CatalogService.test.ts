/**
 * Testes unitários para CatalogService
 * Cobertura: getCollection, getProductBySlug, getAllProducts, getAllSlugs
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CatalogService } from '../CatalogService';
import type { CatalogCollection, CatalogProduct } from '@/types/catalog';

// --- Fixture inline (não depende de arquivos do disco) ---
const mockCollection: CatalogCollection = {
  slug: 'test-collection-2026',
  title: 'Coleção de Teste 2026',
  description: 'Coleção usada apenas nos testes',
  startsAt: '2026-01-01T00:00:00-03:00',
  endsAt: '2026-12-31T23:59:59-03:00',
  products: [
    {
      id: 'test_001',
      slug: 'arte-digital-teste',
      title: 'Arte Digital de Teste',
      shortDescription: 'Descrição curta da arte digital',
      longDescription: 'Descrição longa da arte digital de teste',
      images: ['https://example.com/image1.jpg'],
      type: 'art_only',
      art: {
        priceInCents: 1990,
        priceFormatted: 'R$ 19,90',
        canvaTemplateUrl: 'https://www.canva.com/design/PLACEHOLDER/edit?utm_content=PLACEHOLDER',
        licenseText: 'Licença pessoal',
      },
      active: true,
    },
    {
      id: 'test_002',
      slug: 'produto-fisico-teste',
      title: 'Produto Físico de Teste',
      shortDescription: 'Descrição curta do produto físico',
      longDescription: 'Descrição longa do produto físico de teste',
      images: ['https://example.com/image2.jpg'],
      type: 'physical_only',
      physical: {
        whatsappMessage: 'Olá, quero encomendar o produto físico',
        label: 'Encomendar pelo WhatsApp',
      },
      active: true,
    },
    {
      id: 'test_003',
      slug: 'produto-combinado-teste',
      title: 'Produto Combinado de Teste',
      shortDescription: 'Descrição curta do produto combinado',
      longDescription: 'Descrição longa do produto combinado de teste',
      images: ['https://example.com/image3.jpg'],
      type: 'both',
      art: {
        priceInCents: 2990,
        priceFormatted: 'R$ 29,90',
        canvaTemplateUrl: 'https://www.canva.com/design/PLACEHOLDER/edit?utm_content=PLACEHOLDER',
        licenseText: 'Licença pessoal',
      },
      physical: {
        whatsappMessage: 'Olá, quero encomendar a versão impressa',
        label: 'Encomendar versão impressa',
      },
      active: true,
    },
    {
      id: 'test_004',
      slug: 'produto-inativo-teste',
      title: 'Produto Inativo de Teste',
      shortDescription: 'Este produto não deve aparecer na listagem',
      longDescription: 'Produto inativo para teste de filtragem',
      images: [],
      type: 'art_only',
      art: {
        priceInCents: 1000,
        priceFormatted: 'R$ 10,00',
        canvaTemplateUrl: 'https://www.canva.com/design/PLACEHOLDER/edit?utm_content=PLACEHOLDER',
        licenseText: 'Licença pessoal',
      },
      active: false,
    },
  ],
};

/**
 * Subclasse de CatalogService que injeta coleções mock via override interno.
 * Evita dependência de arquivos do disco em testes unitários.
 */
class TestableCatalogService extends CatalogService {
  constructor(collections: Record<string, CatalogCollection>) {
    super();
    // Sobrescreve os caches com as coleções de teste
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).collectionsCache = new Map(Object.entries(collections));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).productsCache = new Map<string, CatalogProduct>();
    for (const collection of Object.values(collections)) {
      for (const product of collection.products) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this as any).productsCache.set(product.slug, product);
      }
    }
  }
}

describe('CatalogService', () => {
  let service: TestableCatalogService;

  beforeEach(() => {
    service = new TestableCatalogService({
      'test-collection-2026': mockCollection,
    });
  });

  // ---------------------------------------------------------------
  // getCollection
  // ---------------------------------------------------------------
  describe('getCollection', () => {
    it('deve retornar a coleção pelo slug correto', () => {
      const collection = service.getCollection('test-collection-2026');
      expect(collection).not.toBeNull();
      expect(collection?.slug).toBe('test-collection-2026');
      expect(collection?.title).toBe('Coleção de Teste 2026');
    });

    it('deve retornar null para slug inexistente', () => {
      const collection = service.getCollection('colecao-inexistente');
      expect(collection).toBeNull();
    });

    it('deve retornar a lista completa de produtos da coleção', () => {
      const collection = service.getCollection('test-collection-2026');
      // 4 produtos, incluindo o inativo
      expect(collection?.products).toHaveLength(4);
    });
  });

  // ---------------------------------------------------------------
  // getProductBySlug
  // ---------------------------------------------------------------
  describe('getProductBySlug', () => {
    it('deve retornar produto art_only pelo slug', () => {
      const product = service.getProductBySlug('arte-digital-teste');
      expect(product).not.toBeNull();
      expect(product?.type).toBe('art_only');
      expect(product?.art).toBeDefined();
      expect(product?.art?.priceInCents).toBe(1990);
    });

    it('deve retornar produto physical_only pelo slug', () => {
      const product = service.getProductBySlug('produto-fisico-teste');
      expect(product).not.toBeNull();
      expect(product?.type).toBe('physical_only');
      expect(product?.physical).toBeDefined();
      // Verifica que a mensagem é uma string não-vazia (conteúdo específico é responsabilidade do dado)
      expect(typeof product?.physical?.whatsappMessage).toBe('string');
      expect(product?.physical?.whatsappMessage.length).toBeGreaterThan(0);
    });

    it('deve retornar produto both pelo slug com art e physical definidos', () => {
      const product = service.getProductBySlug('produto-combinado-teste');
      expect(product).not.toBeNull();
      expect(product?.type).toBe('both');
      expect(product?.art).toBeDefined();
      expect(product?.physical).toBeDefined();
    });

    it('deve retornar produto inativo (getProductBySlug não filtra active)', () => {
      // getProductBySlug é lookup direto — filtragem de active é responsabilidade do caller
      const product = service.getProductBySlug('produto-inativo-teste');
      expect(product).not.toBeNull();
      expect(product?.active).toBe(false);
    });

    it('deve retornar null para slug inexistente', () => {
      const product = service.getProductBySlug('slug-que-nao-existe');
      expect(product).toBeNull();
    });
  });

  // ---------------------------------------------------------------
  // getAllProducts
  // ---------------------------------------------------------------
  describe('getAllProducts', () => {
    it('deve retornar apenas os produtos ativos', () => {
      const products = service.getAllProducts();
      // 3 produtos ativos de 4 total
      expect(products).toHaveLength(3);
      for (const product of products) {
        expect(product.active).toBe(true);
      }
    });

    it('não deve incluir o produto inativo', () => {
      const products = service.getAllProducts();
      const slugs = products.map((p) => p.slug);
      expect(slugs).not.toContain('produto-inativo-teste');
    });

    it('deve conter os 3 tipos de produtos (art_only, physical_only, both)', () => {
      const products = service.getAllProducts();
      const types = products.map((p) => p.type);
      expect(types).toContain('art_only');
      expect(types).toContain('physical_only');
      expect(types).toContain('both');
    });
  });

  // ---------------------------------------------------------------
  // getAllSlugs
  // ---------------------------------------------------------------
  describe('getAllSlugs', () => {
    it('deve retornar array de { slug } apenas para produtos ativos', () => {
      const slugs = service.getAllSlugs();
      expect(slugs).toHaveLength(3);
      expect(slugs[0]).toHaveProperty('slug');
    });

    it('deve ter formato compatível com generateStaticParams do Next.js', () => {
      const slugs = service.getAllSlugs();
      for (const item of slugs) {
        expect(typeof item.slug).toBe('string');
        expect(item.slug.length).toBeGreaterThan(0);
      }
    });

    it('não deve incluir slug de produto inativo', () => {
      const slugs = service.getAllSlugs().map((s) => s.slug);
      expect(slugs).not.toContain('produto-inativo-teste');
    });
  });
});
