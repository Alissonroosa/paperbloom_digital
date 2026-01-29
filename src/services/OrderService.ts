import pool from '../lib/db';
import { 
  Order, 
  OrderRow, 
  CreateOrderInput,
  rowToOrder,
  createOrderSchema
} from '../types/customer';
import { randomUUID } from 'crypto';

/**
 * OrderService
 * Handles all database operations for orders
 */
export class OrderService {
  /**
   * Create a new order
   * 
   * @param data - Order creation data
   * @returns Created order
   */
  async create(data: CreateOrderInput): Promise<Order> {
    // Validate input
    const validation = createOrderSchema.safeParse(data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${JSON.stringify(validation.error.issues)}`);
    }

    const validatedData = validation.data;
    const id = randomUUID();

    const query = `
      INSERT INTO orders (
        id, customer_id, message_id, stripe_session_id, 
        amount_cents, currency, status, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      id,
      validatedData.customerId,
      validatedData.messageId,
      validatedData.stripeSessionId || null,
      validatedData.amountCents,
      validatedData.currency,
      'pending', // Default status
    ];

    try {
      const result = await pool.query<OrderRow>(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Failed to create order');
      }

      return rowToOrder(result.rows[0]);
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error(`Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find an order by ID
   * 
   * @param id - Order UUID
   * @returns Order if found, null otherwise
   */
  async findById(id: string): Promise<Order | null> {
    const query = 'SELECT * FROM orders WHERE id = $1';

    try {
      const result = await pool.query<OrderRow>(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return rowToOrder(result.rows[0]);
    } catch (error) {
      console.error('Error finding order by ID:', error);
      throw new Error(`Failed to find order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find an order by Stripe session ID
   * 
   * @param stripeSessionId - Stripe checkout session ID
   * @returns Order if found, null otherwise
   */
  async findByStripeSessionId(stripeSessionId: string): Promise<Order | null> {
    const query = 'SELECT * FROM orders WHERE stripe_session_id = $1';

    try {
      const result = await pool.query<OrderRow>(query, [stripeSessionId]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return rowToOrder(result.rows[0]);
    } catch (error) {
      console.error('Error finding order by Stripe session ID:', error);
      throw new Error(`Failed to find order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update order status to paid
   * 
   * @param id - Order UUID
   * @param paymentIntentId - Stripe payment intent ID
   * @returns Updated order
   */
  async markAsPaid(id: string, paymentIntentId?: string): Promise<Order> {
    const query = `
      UPDATE orders
      SET 
        status = 'paid',
        stripe_payment_intent_id = $1,
        paid_at = NOW(),
        updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    try {
      const result = await pool.query<OrderRow>(query, [paymentIntentId || null, id]);
      
      if (result.rows.length === 0) {
        throw new Error(`Order with ID ${id} not found`);
      }

      return rowToOrder(result.rows[0]);
    } catch (error) {
      console.error('Error marking order as paid:', error);
      throw new Error(`Failed to update order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update order status
   * 
   * @param id - Order UUID
   * @param status - New status
   * @returns Updated order
   */
  async updateStatus(
    id: string,
    status: 'pending' | 'paid' | 'failed' | 'refunded'
  ): Promise<Order> {
    const query = `
      UPDATE orders
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    try {
      const result = await pool.query<OrderRow>(query, [status, id]);
      
      if (result.rows.length === 0) {
        throw new Error(`Order with ID ${id} not found`);
      }

      return rowToOrder(result.rows[0]);
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error(`Failed to update order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all orders for a customer
   * 
   * @param customerId - Customer UUID
   * @returns Array of orders
   */
  async findByCustomerId(customerId: string): Promise<Order[]> {
    const query = `
      SELECT * FROM orders
      WHERE customer_id = $1
      ORDER BY created_at DESC
    `;

    try {
      const result = await pool.query<OrderRow>(query, [customerId]);
      return result.rows.map(rowToOrder);
    } catch (error) {
      console.error('Error finding orders by customer ID:', error);
      throw new Error(`Failed to find orders: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all orders for a message
   * 
   * @param messageId - Message UUID
   * @returns Array of orders
   */
  async findByMessageId(messageId: string): Promise<Order[]> {
    const query = `
      SELECT * FROM orders
      WHERE message_id = $1
      ORDER BY created_at DESC
    `;

    try {
      const result = await pool.query<OrderRow>(query, [messageId]);
      return result.rows.map(rowToOrder);
    } catch (error) {
      console.error('Error finding orders by message ID:', error);
      throw new Error(`Failed to find orders: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const orderService = new OrderService();
