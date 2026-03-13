import pool from '../lib/db';
import { PRODUCTS } from '../config/products';

export interface ProductPrice {
  id: string;
  productId: string;
  productName: string;
  priceFromCents: number | null; // "preço de" (original)
  priceCents: number;            // "preço por" (atual)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PriceHistoryEntry {
  id: string;
  productId: string;
  oldPriceCents: number | null;
  newPriceCents: number;
  oldPriceFromCents: number | null;
  newPriceFromCents: number | null;
  changedBy: string | null;
  reason: string | null;
  createdAt: Date;
}

/**
 * PriceService
 * Manages dynamic product pricing
 */
export class PriceService {
  /**
   * Get all product prices
   */
  async getAllPrices(): Promise<ProductPrice[]> {
    // First, ensure all products exist in the database
    await this.syncProductsWithConfig();

    const query = `
      SELECT id, product_id, product_name, price_from_cents, price_cents, 
             is_active, created_at, updated_at
      FROM product_prices
      ORDER BY product_name
    `;
    
    const result = await pool.query(query);
    return result.rows.map(row => ({
      id: row.id,
      productId: row.product_id,
      productName: row.product_name,
      priceFromCents: row.price_from_cents,
      priceCents: row.price_cents,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  /**
   * Get price for a specific product
   */
  async getPrice(productId: string): Promise<ProductPrice | null> {
    const query = `
      SELECT id, product_id, product_name, price_from_cents, price_cents,
             is_active, created_at, updated_at
      FROM product_prices
      WHERE product_id = $1
    `;
    
    const result = await pool.query(query, [productId]);
    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      productId: row.product_id,
      productName: row.product_name,
      priceFromCents: row.price_from_cents,
      priceCents: row.price_cents,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }


  /**
   * Update product price
   */
  async updatePrice(
    productId: string,
    priceCents: number,
    priceFromCents: number | null,
    adminUserId?: string,
    reason?: string
  ): Promise<ProductPrice> {
    // Get current price for history
    const current = await this.getPrice(productId);
    
    // Update price
    const updateQuery = `
      UPDATE product_prices
      SET price_cents = $1, price_from_cents = $2, updated_at = NOW()
      WHERE product_id = $3
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [priceCents, priceFromCents, productId]);
    
    if (result.rows.length === 0) {
      throw new Error(`Product ${productId} not found`);
    }

    // Record in history
    const historyQuery = `
      INSERT INTO price_history (
        product_id, old_price_cents, new_price_cents, 
        old_price_from_cents, new_price_from_cents, changed_by, reason
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    
    await pool.query(historyQuery, [
      productId,
      current?.priceCents || null,
      priceCents,
      current?.priceFromCents || null,
      priceFromCents,
      adminUserId || null,
      reason || null,
    ]);

    const row = result.rows[0];
    return {
      id: row.id,
      productId: row.product_id,
      productName: row.product_name,
      priceFromCents: row.price_from_cents,
      priceCents: row.price_cents,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Get price history for a product
   */
  async getPriceHistory(productId?: string, limit: number = 50): Promise<PriceHistoryEntry[]> {
    let query = `
      SELECT id, product_id, old_price_cents, new_price_cents,
             old_price_from_cents, new_price_from_cents, changed_by, reason, created_at
      FROM price_history
    `;
    
    const params: any[] = [];
    if (productId) {
      query += ' WHERE product_id = $1';
      params.push(productId);
    }
    
    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1);
    params.push(limit);

    const result = await pool.query(query, params);
    return result.rows.map(row => ({
      id: row.id,
      productId: row.product_id,
      oldPriceCents: row.old_price_cents,
      newPriceCents: row.new_price_cents,
      oldPriceFromCents: row.old_price_from_cents,
      newPriceFromCents: row.new_price_from_cents,
      changedBy: row.changed_by,
      reason: row.reason,
      createdAt: row.created_at,
    }));
  }

  /**
   * Sync products from config to database
   */
  private async syncProductsWithConfig(): Promise<void> {
    for (const [productId, product] of Object.entries(PRODUCTS)) {
      const query = `
        INSERT INTO product_prices (product_id, product_name, price_cents)
        VALUES ($1, $2, $3)
        ON CONFLICT (product_id) DO UPDATE SET product_name = $2
      `;
      await pool.query(query, [productId, product.name, product.priceInCents]);
    }
  }

  /**
   * Get effective price (from database or fallback to config)
   */
  async getEffectivePrice(productId: string): Promise<{ priceCents: number; priceFromCents: number | null }> {
    const dbPrice = await this.getPrice(productId);
    
    if (dbPrice) {
      return {
        priceCents: dbPrice.priceCents,
        priceFromCents: dbPrice.priceFromCents,
      };
    }

    // Fallback to config
    const configProduct = PRODUCTS[productId as keyof typeof PRODUCTS];
    if (configProduct) {
      return {
        priceCents: configProduct.priceInCents,
        priceFromCents: null,
      };
    }

    throw new Error(`Product ${productId} not found`);
  }
}

export const priceService = new PriceService();
