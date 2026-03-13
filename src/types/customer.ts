import { z } from 'zod';

/**
 * Customer Entity
 * Represents a customer who purchases messages
 */
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Order Entity
 * Represents a purchase transaction
 */
export interface Order {
  id: string;
  customerId: string;
  messageId: string;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  amountCents: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Email Log Entity
 * Tracks email delivery attempts
 */
export interface EmailLog {
  id: string;
  customerId: string | null;
  messageId: string | null;
  orderId: string | null;
  emailType: string;
  recipientEmail: string;
  subject: string | null;
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  providerMessageId: string | null;
  errorMessage: string | null;
  sentAt: Date | null;
  createdAt: Date;
}

/**
 * Database row representations (snake_case from PostgreSQL)
 */
export interface CustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface OrderRow {
  id: string;
  customer_id: string;
  message_id: string;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  amount_cents: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paid_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface EmailLogRow {
  id: string;
  customer_id: string | null;
  message_id: string | null;
  order_id: string | null;
  email_type: string;
  recipient_email: string;
  subject: string | null;
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  provider_message_id: string | null;
  error_message: string | null;
  sent_at: Date | null;
  created_at: Date;
}

/**
 * Validation Schemas
 */
export const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email format').max(255),
  phone: z.string().max(20).nullable().optional(),
});

export const createOrderSchema = z.object({
  customerId: z.string().uuid(),
  messageId: z.string().uuid(),
  stripeSessionId: z.string().nullable().optional(),
  amountCents: z.number().int().positive(),
  currency: z.string().length(3).default('brl'),
});

export const createEmailLogSchema = z.object({
  customerId: z.string().uuid().nullable().optional(),
  messageId: z.string().uuid().nullable().optional(),
  orderId: z.string().uuid().nullable().optional(),
  emailType: z.string().min(1).max(50),
  recipientEmail: z.string().email(),
  subject: z.string().max(255).nullable().optional(),
});

/**
 * Type inference from schemas
 */
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateEmailLogInput = z.infer<typeof createEmailLogSchema>;

/**
 * Conversion functions
 */
export function rowToCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function rowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
    customerId: row.customer_id,
    messageId: row.message_id,
    stripeSessionId: row.stripe_session_id,
    stripePaymentIntentId: row.stripe_payment_intent_id,
    amountCents: row.amount_cents,
    currency: row.currency,
    status: row.status,
    paidAt: row.paid_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function rowToEmailLog(row: EmailLogRow): EmailLog {
  return {
    id: row.id,
    customerId: row.customer_id,
    messageId: row.message_id,
    orderId: row.order_id,
    emailType: row.email_type,
    recipientEmail: row.recipient_email,
    subject: row.subject,
    status: row.status,
    providerMessageId: row.provider_message_id,
    errorMessage: row.error_message,
    sentAt: row.sent_at,
    createdAt: row.created_at,
  };
}
