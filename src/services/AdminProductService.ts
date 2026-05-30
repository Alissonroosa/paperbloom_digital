/**
 * AdminProductService
 * Gerencia o catálogo de produtos do admin (tabela `products`).
 * Separado de src/config/products.ts (que serve as 3 experiências digitais)
 * e de src/data/catalog/*.json (que serve o site público da loja).
 */

import pool from '@/lib/db';

export interface AdminProduct {
  id: string;
  name: string;
  default_cost_cents: number;
  default_price_cents: number;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductInput {
  name: string;
  defaultCostCents?: number;
  defaultPriceCents?: number;
  active?: boolean;
}

export interface UpdateProductInput {
  name?: string;
  defaultCostCents?: number;
  defaultPriceCents?: number;
  active?: boolean;
}

export class AdminProductService {
  async listAll(includeInactive = false): Promise<AdminProduct[]> {
    const result = await pool.query<AdminProduct>(
      includeInactive
        ? `SELECT * FROM products ORDER BY active DESC, lower(name)`
        : `SELECT * FROM products WHERE active = true ORDER BY lower(name)`
    );
    return result.rows;
  }

  async findById(id: string): Promise<AdminProduct | null> {
    const result = await pool.query<AdminProduct>(
      `SELECT * FROM products WHERE id = $1`,
      [id]
    );
    return result.rows[0] ?? null;
  }

  async create(input: CreateProductInput): Promise<AdminProduct> {
    const result = await pool.query<AdminProduct>(
      `INSERT INTO products (name, default_cost_cents, default_price_cents, active)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        input.name.trim(),
        input.defaultCostCents ?? 0,
        input.defaultPriceCents ?? 0,
        input.active ?? true,
      ]
    );
    return result.rows[0];
  }

  async update(id: string, input: UpdateProductInput): Promise<AdminProduct | null> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    if (input.name !== undefined) {
      sets.push(`name = $${i++}`);
      values.push(input.name.trim());
    }
    if (input.defaultCostCents !== undefined) {
      sets.push(`default_cost_cents = $${i++}`);
      values.push(input.defaultCostCents);
    }
    if (input.defaultPriceCents !== undefined) {
      sets.push(`default_price_cents = $${i++}`);
      values.push(input.defaultPriceCents);
    }
    if (input.active !== undefined) {
      sets.push(`active = $${i++}`);
      values.push(input.active);
    }

    if (sets.length === 0) return this.findById(id);

    sets.push(`updated_at = now()`);
    values.push(id);

    const result = await pool.query<AdminProduct>(
      `UPDATE products SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    return result.rows[0] ?? null;
  }

  async delete(id: string): Promise<boolean> {
    // Soft delete: marca como inativo. Não remove de fato pra manter integridade
    // dos pedidos antigos (physical_orders.product_id é FK ON DELETE SET NULL,
    // mas inactive preserva o histórico de associação).
    const result = await pool.query(
      `UPDATE products SET active = false, updated_at = now() WHERE id = $1`,
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }
}

export const adminProductService = new AdminProductService();
