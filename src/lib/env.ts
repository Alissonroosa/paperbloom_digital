/**
 * Environment Configuration and Validation
 * 
 * This module validates and provides type-safe access to environment variables.
 * It ensures all required variables are present on startup and provides defaults
 * for optional variables.
 */

import { z } from 'zod';

/**
 * Environment schema definition using Zod
 * This ensures type safety and validation at runtime
 */
const envSchema = z.object({
  // Database Configuration (REQUIRED)
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // Mercado Pago Configuration (REQUIRED)
  MERCADOPAGO_ACCESS_TOKEN: z.string()
    .min(1, 'MERCADOPAGO_ACCESS_TOKEN is required'),
  
  MERCADOPAGO_PUBLIC_KEY: z.string()
    .min(1, 'MERCADOPAGO_PUBLIC_KEY is required'),
  
  MERCADOPAGO_WEBHOOK_SECRET: z.string()
    .min(1, 'MERCADOPAGO_WEBHOOK_SECRET is required'),
  
  // Application Configuration (REQUIRED)
  NEXT_PUBLIC_BASE_URL: z.string()
    .min(1, 'NEXT_PUBLIC_BASE_URL is required')
    .url('NEXT_PUBLIC_BASE_URL must be a valid URL'),
  
  // Database Pool Configuration (OPTIONAL)
  DB_POOL_MAX: z.string().optional().default('20'),
  DB_POOL_IDLE_TIMEOUT: z.string().optional().default('30000'),
  DB_POOL_CONNECTION_TIMEOUT: z.string().optional().default('2000'),
  
  // Environment (OPTIONAL)
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
  
  // Logging (OPTIONAL)
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).optional().default('info'),
  
  // Cloudflare R2 Storage (REQUIRED)
  R2_ACCOUNT_ID: z.string().min(1, 'R2_ACCOUNT_ID is required'),
  R2_ACCESS_KEY_ID: z.string().min(1, 'R2_ACCESS_KEY_ID is required'),
  R2_SECRET_ACCESS_KEY: z.string().min(1, 'R2_SECRET_ACCESS_KEY is required'),
  R2_BUCKET_NAME: z.string().min(1, 'R2_BUCKET_NAME is required'),
  R2_ENDPOINT: z.string().min(1, 'R2_ENDPOINT is required').url('R2_ENDPOINT must be a valid URL'),
  R2_PUBLIC_URL: z.string().min(1, 'R2_PUBLIC_URL is required').url('R2_PUBLIC_URL must be a valid URL'),
  
  // File Upload (OPTIONAL)
  MAX_IMAGE_SIZE: z.string().optional().default('10485760'), // 10MB
  MAX_IMAGE_WIDTH: z.string().optional().default('1920'),
  MAX_IMAGE_HEIGHT: z.string().optional().default('1080'),
  
  // Security (OPTIONAL)
  ALLOWED_ORIGINS: z.string().optional().default('*'),
  
  // Resend Email Service (REQUIRED)
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
  RESEND_FROM_EMAIL: z.string().email('RESEND_FROM_EMAIL must be a valid email'),
  RESEND_FROM_NAME: z.string().min(1, 'RESEND_FROM_NAME is required'),
});

/**
 * Parsed and validated environment variables
 */
type Env = z.infer<typeof envSchema>;

/**
 * Validated environment configuration
 * This is populated after validateEnv() is called
 */
let validatedEnv: Env | null = null;

/**
 * Validates environment variables on startup
 * Throws an error if validation fails
 * 
 * @throws {Error} If required environment variables are missing or invalid
 */
export function validateEnv(): Env {
  if (validatedEnv) {
    return validatedEnv;
  }

  try {
    validatedEnv = envSchema.parse(process.env);
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((err) => {
        const path = err.path.join('.');
        return `  - ${path}: ${err.message}`;
      }).join('\n');
      
      throw new Error(
        `Environment validation failed:\n${missingVars}\n\n` +
        `Please check your .env.local file and ensure all required variables are set.\n` +
        `See .env.example for reference.`
      );
    }
    throw error;
  }
}

/**
 * Gets the validated environment configuration
 * Must call validateEnv() first
 * 
 * @throws {Error} If validateEnv() hasn't been called yet
 */
export function getEnv(): Env {
  if (!validatedEnv) {
    throw new Error('Environment not validated. Call validateEnv() first.');
  }
  return validatedEnv;
}

/**
 * Type-safe environment configuration with parsed values
 */
export const env = {
  /**
   * Gets the database configuration
   */
  get database() {
    const config = getEnv();
    return {
      url: config.DATABASE_URL,
      pool: {
        max: parseInt(config.DB_POOL_MAX, 10),
        idleTimeoutMillis: parseInt(config.DB_POOL_IDLE_TIMEOUT, 10),
        connectionTimeoutMillis: parseInt(config.DB_POOL_CONNECTION_TIMEOUT, 10),
      },
    };
  },

  /**
   * Gets the Mercado Pago configuration
   */
  get mercadoPago() {
    const config = getEnv();
    return {
      accessToken: config.MERCADOPAGO_ACCESS_TOKEN,
      publicKey: config.MERCADOPAGO_PUBLIC_KEY,
      webhookSecret: config.MERCADOPAGO_WEBHOOK_SECRET,
      isTestMode: config.MERCADOPAGO_ACCESS_TOKEN.startsWith('TEST-'),
    };
  },

  /**
   * Gets the application configuration
   */
  get app() {
    const config = getEnv();
    return {
      baseUrl: config.NEXT_PUBLIC_BASE_URL,
      nodeEnv: config.NODE_ENV,
      isProduction: config.NODE_ENV === 'production',
      isDevelopment: config.NODE_ENV === 'development',
      isTest: config.NODE_ENV === 'test',
    };
  },

  /**
   * Gets the logging configuration
   */
  get logging() {
    const config = getEnv();
    return {
      level: config.LOG_LEVEL,
    };
  },

  /**
   * Gets the file upload configuration
   */
  get upload() {
    const config = getEnv();
    return {
      maxImageSize: parseInt(config.MAX_IMAGE_SIZE, 10),
      maxImageWidth: parseInt(config.MAX_IMAGE_WIDTH, 10),
      maxImageHeight: parseInt(config.MAX_IMAGE_HEIGHT, 10),
    };
  },

  /**
   * Gets the security configuration
   */
  get security() {
    const config = getEnv();
    return {
      allowedOrigins: config.ALLOWED_ORIGINS.split(',').map(o => o.trim()),
    };
  },

  /**
   * Gets the Cloudflare R2 storage configuration
   */
  get r2() {
    const config = getEnv();
    return {
      accountId: config.R2_ACCOUNT_ID,
      accessKeyId: config.R2_ACCESS_KEY_ID,
      secretAccessKey: config.R2_SECRET_ACCESS_KEY,
      bucketName: config.R2_BUCKET_NAME,
      endpoint: config.R2_ENDPOINT,
      publicUrl: config.R2_PUBLIC_URL,
    };
  },

  /**
   * Gets the Resend email service configuration
   */
  get resend() {
    const config = getEnv();
    return {
      apiKey: config.RESEND_API_KEY,
      fromEmail: config.RESEND_FROM_EMAIL,
      fromName: config.RESEND_FROM_NAME,
    };
  },
};

/**
 * Checks if the application is running in production mode
 */
export function isProduction(): boolean {
  return env.app.isProduction;
}

/**
 * Checks if the application is running in development mode
 */
export function isDevelopment(): boolean {
  return env.app.isDevelopment;
}

/**
 * Checks if the application is running in test mode
 */
export function isTest(): boolean {
  return env.app.isTest;
}

/**
 * Prints environment configuration summary (safe for logging)
 * Masks sensitive values
 */
export function printEnvSummary(): void {
  const config = getEnv();
  
  console.log('=== Environment Configuration ===');
  console.log(`Environment: ${config.NODE_ENV}`);
  console.log(`Base URL: ${config.NEXT_PUBLIC_BASE_URL}`);
  console.log(`Database: ${maskConnectionString(config.DATABASE_URL)}`);
  console.log(`Mercado Pago Mode: ${config.MERCADOPAGO_ACCESS_TOKEN.startsWith('TEST-') ? 'TEST' : 'LIVE'}`);
  console.log(`Mercado Pago Access Token: ${maskSecret(config.MERCADOPAGO_ACCESS_TOKEN)}`);
  console.log(`Mercado Pago Webhook Secret: ${maskSecret(config.MERCADOPAGO_WEBHOOK_SECRET)}`);
  console.log(`DB Pool Max: ${config.DB_POOL_MAX}`);
  console.log(`Log Level: ${config.LOG_LEVEL}`);
  console.log(`Max Image Size: ${parseInt(config.MAX_IMAGE_SIZE, 10) / 1024 / 1024}MB`);
  console.log(`R2 Bucket: ${config.R2_BUCKET_NAME}`);
  console.log(`R2 Endpoint: ${config.R2_ENDPOINT}`);
  console.log(`R2 Access Key: ${maskSecret(config.R2_ACCESS_KEY_ID)}`);
  console.log(`Resend API Key: ${maskSecret(config.RESEND_API_KEY)}`);
  console.log(`Resend From: ${config.RESEND_FROM_NAME} <${config.RESEND_FROM_EMAIL}>`);
  console.log('================================\n');
}

/**
 * Masks a connection string for safe logging
 */
function maskConnectionString(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.password) {
      parsed.password = '****';
    }
    return parsed.toString();
  } catch {
    return '****';
  }
}

/**
 * Masks a secret for safe logging
 */
function maskSecret(secret: string): string {
  if (secret.length <= 10) {
    return '****';
  }
  return `${secret.substring(0, 10)}...${secret.substring(secret.length - 4)}`;
}
