import pool from '../lib/db';
import { 
  EmailLog, 
  EmailLogRow, 
  CreateEmailLogInput,
  rowToEmailLog,
  createEmailLogSchema
} from '../types/customer';
import { randomUUID } from 'crypto';

/**
 * EmailLogService
 * Handles all database operations for email logs
 */
export class EmailLogService {
  /**
   * Create a new email log entry
   * 
   * @param data - Email log creation data
   * @returns Created email log
   */
  async create(data: CreateEmailLogInput): Promise<EmailLog> {
    // Validate input
    const validation = createEmailLogSchema.safeParse(data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${JSON.stringify(validation.error.issues)}`);
    }

    const validatedData = validation.data;
    const id = randomUUID();

    const query = `
      INSERT INTO email_logs (
        id, customer_id, message_id, order_id, email_type,
        recipient_email, subject, status, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING *
    `;

    const values = [
      id,
      validatedData.customerId || null,
      validatedData.messageId || null,
      validatedData.orderId || null,
      validatedData.emailType,
      validatedData.recipientEmail,
      validatedData.subject || null,
      'pending', // Default status
    ];

    try {
      const result = await pool.query<EmailLogRow>(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Failed to create email log');
      }

      return rowToEmailLog(result.rows[0]);
    } catch (error) {
      console.error('Error creating email log:', error);
      throw new Error(`Failed to create email log: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mark email as sent
   * 
   * @param id - Email log UUID
   * @param providerMessageId - Message ID from email provider
   * @returns Updated email log
   */
  async markAsSent(id: string, providerMessageId: string): Promise<EmailLog> {
    const query = `
      UPDATE email_logs
      SET 
        status = 'sent',
        provider_message_id = $1,
        sent_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    try {
      const result = await pool.query<EmailLogRow>(query, [providerMessageId, id]);
      
      if (result.rows.length === 0) {
        throw new Error(`Email log with ID ${id} not found`);
      }

      return rowToEmailLog(result.rows[0]);
    } catch (error) {
      console.error('Error marking email as sent:', error);
      throw new Error(`Failed to update email log: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mark email as failed
   * 
   * @param id - Email log UUID
   * @param errorMessage - Error message
   * @returns Updated email log
   */
  async markAsFailed(id: string, errorMessage: string): Promise<EmailLog> {
    const query = `
      UPDATE email_logs
      SET 
        status = 'failed',
        error_message = $1
      WHERE id = $2
      RETURNING *
    `;

    try {
      const result = await pool.query<EmailLogRow>(query, [errorMessage, id]);
      
      if (result.rows.length === 0) {
        throw new Error(`Email log with ID ${id} not found`);
      }

      return rowToEmailLog(result.rows[0]);
    } catch (error) {
      console.error('Error marking email as failed:', error);
      throw new Error(`Failed to update email log: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all email logs for a customer
   * 
   * @param customerId - Customer UUID
   * @returns Array of email logs
   */
  async findByCustomerId(customerId: string): Promise<EmailLog[]> {
    const query = `
      SELECT * FROM email_logs
      WHERE customer_id = $1
      ORDER BY created_at DESC
    `;

    try {
      const result = await pool.query<EmailLogRow>(query, [customerId]);
      return result.rows.map(rowToEmailLog);
    } catch (error) {
      console.error('Error finding email logs by customer ID:', error);
      throw new Error(`Failed to find email logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all email logs for a message
   * 
   * @param messageId - Message UUID
   * @returns Array of email logs
   */
  async findByMessageId(messageId: string): Promise<EmailLog[]> {
    const query = `
      SELECT * FROM email_logs
      WHERE message_id = $1
      ORDER BY created_at DESC
    `;

    try {
      const result = await pool.query<EmailLogRow>(query, [messageId]);
      return result.rows.map(rowToEmailLog);
    } catch (error) {
      console.error('Error finding email logs by message ID:', error);
      throw new Error(`Failed to find email logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const emailLogService = new EmailLogService();
