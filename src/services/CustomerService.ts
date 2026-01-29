import pool from '../lib/db';
import { 
  Customer, 
  CustomerRow, 
  CreateCustomerInput,
  rowToCustomer,
  createCustomerSchema
} from '../types/customer';
import { randomUUID } from 'crypto';

/**
 * CustomerService
 * Handles all database operations for customers
 */
export class CustomerService {
  /**
   * Create a new customer or return existing one by email
   * 
   * @param data - Customer creation data
   * @returns Created or existing customer
   */
  async createOrFind(data: CreateCustomerInput): Promise<Customer> {
    // Validate input
    const validation = createCustomerSchema.safeParse(data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${JSON.stringify(validation.error.issues)}`);
    }

    const validatedData = validation.data;

    // First, try to find existing customer by email
    const existingCustomer = await this.findByEmail(validatedData.email);
    if (existingCustomer) {
      // Update name and phone if provided
      return await this.update(existingCustomer.id, {
        name: validatedData.name,
        phone: validatedData.phone || existingCustomer.phone,
      });
    }

    // Create new customer
    const id = randomUUID();

    const query = `
      INSERT INTO customers (id, name, email, phone, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      id,
      validatedData.name,
      validatedData.email,
      validatedData.phone || null,
    ];

    try {
      const result = await pool.query<CustomerRow>(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Failed to create customer');
      }

      return rowToCustomer(result.rows[0]);
    } catch (error) {
      console.error('Error creating customer:', error);
      throw new Error(`Failed to create customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find a customer by ID
   * 
   * @param id - Customer UUID
   * @returns Customer if found, null otherwise
   */
  async findById(id: string): Promise<Customer | null> {
    const query = 'SELECT * FROM customers WHERE id = $1';

    try {
      const result = await pool.query<CustomerRow>(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return rowToCustomer(result.rows[0]);
    } catch (error) {
      console.error('Error finding customer by ID:', error);
      throw new Error(`Failed to find customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find a customer by email
   * 
   * @param email - Customer email
   * @returns Customer if found, null otherwise
   */
  async findByEmail(email: string): Promise<Customer | null> {
    const query = 'SELECT * FROM customers WHERE email = $1';

    try {
      const result = await pool.query<CustomerRow>(query, [email]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return rowToCustomer(result.rows[0]);
    } catch (error) {
      console.error('Error finding customer by email:', error);
      throw new Error(`Failed to find customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update customer information
   * 
   * @param id - Customer UUID
   * @param data - Fields to update
   * @returns Updated customer
   */
  async update(
    id: string,
    data: Partial<Pick<Customer, 'name' | 'phone'>>
  ): Promise<Customer> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }

    if (data.phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(data.phone);
    }

    if (updates.length === 0) {
      // No updates, just return existing customer
      const customer = await this.findById(id);
      if (!customer) {
        throw new Error(`Customer with ID ${id} not found`);
      }
      return customer;
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE customers
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    try {
      const result = await pool.query<CustomerRow>(query, values);
      
      if (result.rows.length === 0) {
        throw new Error(`Customer with ID ${id} not found`);
      }

      return rowToCustomer(result.rows[0]);
    } catch (error) {
      console.error('Error updating customer:', error);
      throw new Error(`Failed to update customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all orders for a customer
   * 
   * @param customerId - Customer UUID
   * @returns Array of orders
   */
  async getOrders(customerId: string): Promise<any[]> {
    const query = `
      SELECT o.*, m.recipient_name, m.title
      FROM orders o
      JOIN messages m ON o.message_id = m.id
      WHERE o.customer_id = $1
      ORDER BY o.created_at DESC
    `;

    try {
      const result = await pool.query(query, [customerId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting customer orders:', error);
      throw new Error(`Failed to get orders: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const customerService = new CustomerService();
