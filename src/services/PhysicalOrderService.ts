/**
 * PhysicalOrderService
 * Gerencia pedidos físicos cadastrados manualmente (vendas via WhatsApp).
 * Tabela `physical_orders`.
 */

import pool from '@/lib/db';

export type DeliveryType = 'entrega-canoas' | 'mercado-envios' | 'retirada' | 'outro';
export type PaymentStatus = 'pago' | 'reserva-30' | 'pendente';
export type OrderStatus = 'novo' | 'em-producao' | 'pronto' | 'entregue' | 'cancelado';

export interface PhysicalOrder {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string | null;
  customer_city: string | null;
  product_id: string | null;
  product_name: string;
  quantity: number;
  cost_cents: number;
  price_cents: number;
  production_days: number | null;
  order_date: Date;
  delivery_date: Date | null;
  delivery_type: DeliveryType;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePhysicalOrderInput {
  customerName: string;
  customerPhone?: string | null;
  customerCity?: string | null;
  productId?: string | null;
  productName: string;
  quantity?: number;
  costCents?: number;
  priceCents?: number;
  productionDays?: number | null;
  orderDate?: string; // ISO date
  deliveryDate?: string | null;
  deliveryType?: DeliveryType;
  paymentStatus?: PaymentStatus;
  orderStatus?: OrderStatus;
  notes?: string | null;
}

export interface UpdatePhysicalOrderInput {
  customerName?: string;
  customerPhone?: string | null;
  customerCity?: string | null;
  productId?: string | null;
  productName?: string;
  quantity?: number;
  costCents?: number;
  priceCents?: number;
  productionDays?: number | null;
  orderDate?: string;
  deliveryDate?: string | null;
  deliveryType?: DeliveryType;
  paymentStatus?: PaymentStatus;
  orderStatus?: OrderStatus;
  notes?: string | null;
}

export interface OrderFilters {
  paymentStatus?: PaymentStatus;
  orderStatus?: OrderStatus;
  productId?: string;
  search?: string; // busca por nome do cliente
  fromDate?: string; // order_date >=
  toDate?: string; // order_date <=
}

export interface OrderSummary {
  totalOrders: number;
  totalRevenueCents: number;
  totalCostCents: number;
  totalProfitCents: number;
  pendingPaymentCount: number;
  inProductionCount: number;
  readyToDeliverCount: number;
}

export interface ProductGrouped {
  product_id: string | null;
  product_name: string;
  order_count: number;
  total_quantity: number;
  total_revenue_cents: number;
  total_cost_cents: number;
  total_profit_cents: number;
}

export class PhysicalOrderService {
  /**
   * Lista pedidos com filtros opcionais.
   * Ordena por order_number desc (mais recentes primeiro).
   */
  async list(filters: OrderFilters = {}): Promise<PhysicalOrder[]> {
    const conds: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    if (filters.paymentStatus) {
      conds.push(`payment_status = $${i++}`);
      values.push(filters.paymentStatus);
    }
    if (filters.orderStatus) {
      conds.push(`order_status = $${i++}`);
      values.push(filters.orderStatus);
    }
    if (filters.productId) {
      conds.push(`product_id = $${i++}`);
      values.push(filters.productId);
    }
    if (filters.search) {
      conds.push(`lower(customer_name) LIKE $${i++}`);
      values.push(`%${filters.search.toLowerCase()}%`);
    }
    if (filters.fromDate) {
      conds.push(`order_date >= $${i++}`);
      values.push(filters.fromDate);
    }
    if (filters.toDate) {
      conds.push(`order_date <= $${i++}`);
      values.push(filters.toDate);
    }

    const where = conds.length > 0 ? `WHERE ${conds.join(' AND ')}` : '';
    const result = await pool.query<PhysicalOrder>(
      `SELECT * FROM physical_orders ${where} ORDER BY order_number DESC`,
      values
    );
    return result.rows;
  }

  async findById(id: string): Promise<PhysicalOrder | null> {
    const result = await pool.query<PhysicalOrder>(
      `SELECT * FROM physical_orders WHERE id = $1`,
      [id]
    );
    return result.rows[0] ?? null;
  }

  async create(input: CreatePhysicalOrderInput): Promise<PhysicalOrder> {
    const result = await pool.query<PhysicalOrder>(
      `INSERT INTO physical_orders
        (customer_name, customer_phone, customer_city,
         product_id, product_name, quantity,
         cost_cents, price_cents,
         production_days, order_date, delivery_date,
         delivery_type, payment_status, order_status, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING *`,
      [
        input.customerName.trim(),
        input.customerPhone ?? null,
        input.customerCity ?? null,
        input.productId ?? null,
        input.productName.trim(),
        input.quantity ?? 1,
        input.costCents ?? 0,
        input.priceCents ?? 0,
        input.productionDays ?? null,
        input.orderDate ?? new Date().toISOString().slice(0, 10),
        input.deliveryDate ?? null,
        input.deliveryType ?? 'outro',
        input.paymentStatus ?? 'pendente',
        input.orderStatus ?? 'novo',
        input.notes ?? null,
      ]
    );
    return result.rows[0];
  }

  async update(id: string, input: UpdatePhysicalOrderInput): Promise<PhysicalOrder | null> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    const map: Record<string, unknown> = {
      customer_name: input.customerName?.trim(),
      customer_phone: input.customerPhone,
      customer_city: input.customerCity,
      product_id: input.productId,
      product_name: input.productName?.trim(),
      quantity: input.quantity,
      cost_cents: input.costCents,
      price_cents: input.priceCents,
      production_days: input.productionDays,
      order_date: input.orderDate,
      delivery_date: input.deliveryDate,
      delivery_type: input.deliveryType,
      payment_status: input.paymentStatus,
      order_status: input.orderStatus,
      notes: input.notes,
    };

    for (const [col, val] of Object.entries(map)) {
      if (val !== undefined) {
        sets.push(`${col} = $${i++}`);
        values.push(val);
      }
    }

    if (sets.length === 0) return this.findById(id);

    sets.push(`updated_at = now()`);
    values.push(id);

    const result = await pool.query<PhysicalOrder>(
      `UPDATE physical_orders SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    return result.rows[0] ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM physical_orders WHERE id = $1`,
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Resumo agregado (default: mês corrente).
   */
  async summary(fromDate?: string, toDate?: string): Promise<OrderSummary> {
    const conds: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    if (fromDate) {
      conds.push(`order_date >= $${i++}`);
      values.push(fromDate);
    }
    if (toDate) {
      conds.push(`order_date <= $${i++}`);
      values.push(toDate);
    }
    const where = conds.length > 0 ? `WHERE ${conds.join(' AND ')}` : '';

    const r = await pool.query<{
      total_orders: string;
      total_revenue_cents: string;
      total_cost_cents: string;
      pending_payment_count: string;
      in_production_count: string;
      ready_to_deliver_count: string;
    }>(
      `SELECT
         COUNT(*)::text AS total_orders,
         COALESCE(SUM(price_cents * quantity), 0)::text AS total_revenue_cents,
         COALESCE(SUM(cost_cents * quantity), 0)::text AS total_cost_cents,
         COUNT(*) FILTER (WHERE payment_status = 'pendente')::text AS pending_payment_count,
         COUNT(*) FILTER (WHERE order_status = 'em-producao')::text AS in_production_count,
         COUNT(*) FILTER (WHERE order_status = 'pronto')::text AS ready_to_deliver_count
       FROM physical_orders ${where}`,
      values
    );

    const row = r.rows[0];
    const revenue = parseInt(row.total_revenue_cents, 10);
    const cost = parseInt(row.total_cost_cents, 10);

    return {
      totalOrders: parseInt(row.total_orders, 10),
      totalRevenueCents: revenue,
      totalCostCents: cost,
      totalProfitCents: revenue - cost,
      pendingPaymentCount: parseInt(row.pending_payment_count, 10),
      inProductionCount: parseInt(row.in_production_count, 10),
      readyToDeliverCount: parseInt(row.ready_to_deliver_count, 10),
    };
  }

  /**
   * Pedidos agrupados por produto — visão de performance por produto.
   */
  async groupedByProduct(fromDate?: string, toDate?: string): Promise<ProductGrouped[]> {
    const conds: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    if (fromDate) {
      conds.push(`order_date >= $${i++}`);
      values.push(fromDate);
    }
    if (toDate) {
      conds.push(`order_date <= $${i++}`);
      values.push(toDate);
    }
    const where = conds.length > 0 ? `WHERE ${conds.join(' AND ')}` : '';

    const r = await pool.query<{
      product_id: string | null;
      product_name: string;
      order_count: string;
      total_quantity: string;
      total_revenue_cents: string;
      total_cost_cents: string;
    }>(
      `SELECT
         product_id,
         product_name,
         COUNT(*)::text AS order_count,
         COALESCE(SUM(quantity), 0)::text AS total_quantity,
         COALESCE(SUM(price_cents * quantity), 0)::text AS total_revenue_cents,
         COALESCE(SUM(cost_cents * quantity), 0)::text AS total_cost_cents
       FROM physical_orders ${where}
       GROUP BY product_id, product_name
       ORDER BY SUM(price_cents * quantity) DESC NULLS LAST`,
      values
    );

    return r.rows.map((row) => {
      const revenue = parseInt(row.total_revenue_cents, 10);
      const cost = parseInt(row.total_cost_cents, 10);
      return {
        product_id: row.product_id,
        product_name: row.product_name,
        order_count: parseInt(row.order_count, 10),
        total_quantity: parseInt(row.total_quantity, 10),
        total_revenue_cents: revenue,
        total_cost_cents: cost,
        total_profit_cents: revenue - cost,
      };
    });
  }
}

export const physicalOrderService = new PhysicalOrderService();
