/**
 * DigitalArtOrderService
 * Gerencia pedidos de arte digital na tabela digital_art_orders.
 * Segue o padrão singleton de MessageService / CardCollectionService.
 * Usa pg raw — sem Prisma/Drizzle.
 */

import pool from '@/lib/db';

export interface DigitalArtOrder {
  id: string;
  email: string;
  product_slug: string;
  product_title: string;
  amount_cents: number;
  mp_payment_id: string | null;
  mp_preference_id: string | null;
  status: 'pending' | 'paid' | 'refunded';
  created_at: Date;
  paid_at: Date | null;
  refunded_at: Date | null;
}

export interface CreatePendingOrderInput {
  email: string;
  productSlug: string;
  productTitle: string;
  amountCents: number;
  mpPreferenceId?: string;
}

export class DigitalArtOrderService {
  /**
   * Cria um pedido com status 'pending'.
   * mpPreferenceId é opcional pois o MP preference pode ser criado depois.
   */
  async createPendingOrder(input: CreatePendingOrderInput): Promise<DigitalArtOrder> {
    const { email, productSlug, productTitle, amountCents, mpPreferenceId } = input;

    const result = await pool.query<DigitalArtOrder>(
      `INSERT INTO digital_art_orders
         (email, product_slug, product_title, amount_cents, mp_preference_id, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [email, productSlug, productTitle, amountCents, mpPreferenceId ?? null]
    );

    return result.rows[0];
  }

  /**
   * Atualiza o mp_preference_id de um pedido existente.
   * Chamado logo após criar a preferência no MP.
   */
  async updatePreferenceId(orderId: string, mpPreferenceId: string): Promise<void> {
    await pool.query(
      `UPDATE digital_art_orders
       SET mp_preference_id = $1
       WHERE id = $2`,
      [mpPreferenceId, orderId]
    );
  }

  /**
   * Marca o pedido como pago e registra o mp_payment_id.
   * Chamado pelo webhook MP quando payment.status === 'approved'.
   */
  async markAsPaid(orderId: string, mpPaymentId: string): Promise<void> {
    await pool.query(
      `UPDATE digital_art_orders
       SET status = 'paid', paid_at = now(), mp_payment_id = $1
       WHERE id = $2`,
      [mpPaymentId, orderId]
    );
  }

  /**
   * Marca o pedido como reembolsado pelo mp_payment_id.
   * Chamado pelo webhook MP quando payment.status === 'refunded'.
   */
  async markAsRefunded(mpPaymentId: string): Promise<void> {
    await pool.query(
      `UPDATE digital_art_orders
       SET status = 'refunded', refunded_at = now()
       WHERE mp_payment_id = $1`,
      [mpPaymentId]
    );
  }

  /**
   * Retorna todos os pedidos pagos de um email.
   * Usado pela rota de recuperação de arte.
   */
  async findByEmail(email: string): Promise<DigitalArtOrder[]> {
    const result = await pool.query<DigitalArtOrder>(
      `SELECT * FROM digital_art_orders
       WHERE email = $1 AND status = 'paid'
       ORDER BY paid_at DESC`,
      [email]
    );

    return result.rows;
  }

  /**
   * Retorna um pedido pelo id (uuid).
   * Retorna null se não encontrado.
   */
  async findById(orderId: string): Promise<DigitalArtOrder | null> {
    const result = await pool.query<DigitalArtOrder>(
      `SELECT * FROM digital_art_orders WHERE id = $1`,
      [orderId]
    );

    return result.rows[0] ?? null;
  }

  /**
   * Retorna um pedido pelo mp_payment_id.
   * Usado para idempotência do webhook — evita processar o mesmo pagamento duas vezes.
   */
  async findByMpPaymentId(mpPaymentId: string): Promise<DigitalArtOrder | null> {
    const result = await pool.query<DigitalArtOrder>(
      `SELECT * FROM digital_art_orders WHERE mp_payment_id = $1`,
      [mpPaymentId]
    );

    return result.rows[0] ?? null;
  }
}

// Export singleton instance — padrão do projeto
export const digitalArtOrderService = new DigitalArtOrderService();
