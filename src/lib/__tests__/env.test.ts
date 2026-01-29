import { describe, it, expect, beforeAll } from 'vitest';
import dotenv from 'dotenv';

// Load environment variables before importing env module
dotenv.config({ path: '.env.local' });

import { validateEnv, env, isProduction, isDevelopment, isTest } from '../env';

describe('Environment Configuration', () => {
  beforeAll(() => {
    // Validate environment before running tests
    validateEnv();
  });

  describe('validateEnv', () => {
    it('should validate environment variables without throwing', () => {
      expect(() => validateEnv()).not.toThrow();
    });

    it('should return validated environment object', () => {
      const result = validateEnv();
      expect(result).toBeDefined();
      expect(result.DATABASE_URL).toBeDefined();
      expect(result.STRIPE_SECRET_KEY).toBeDefined();
    });
  });

  describe('env.database', () => {
    it('should provide database configuration', () => {
      const dbConfig = env.database;
      
      expect(dbConfig.url).toBeDefined();
      expect(typeof dbConfig.url).toBe('string');
      expect(dbConfig.url).toContain('postgres://');
    });

    it('should provide database pool configuration', () => {
      const poolConfig = env.database.pool;
      
      expect(poolConfig.max).toBeGreaterThan(0);
      expect(poolConfig.idleTimeoutMillis).toBeGreaterThan(0);
      expect(poolConfig.connectionTimeoutMillis).toBeGreaterThan(0);
    });
  });

  describe('env.stripe', () => {
    it('should provide Stripe configuration', () => {
      const stripeConfig = env.stripe;
      
      expect(stripeConfig.secretKey).toBeDefined();
      expect(stripeConfig.webhookSecret).toBeDefined();
      expect(stripeConfig.publishableKey).toBeDefined();
    });

    it('should validate Stripe key formats', () => {
      const stripeConfig = env.stripe;
      
      expect(
        stripeConfig.secretKey.startsWith('sk_test_') || 
        stripeConfig.secretKey.startsWith('sk_live_')
      ).toBe(true);
      
      expect(stripeConfig.webhookSecret.startsWith('whsec_')).toBe(true);
      
      expect(
        stripeConfig.publishableKey.startsWith('pk_test_') || 
        stripeConfig.publishableKey.startsWith('pk_live_')
      ).toBe(true);
    });

    it('should correctly identify test mode', () => {
      const stripeConfig = env.stripe;
      const isTestMode = stripeConfig.secretKey.startsWith('sk_test_');
      
      expect(stripeConfig.isTestMode).toBe(isTestMode);
    });
  });

  describe('env.app', () => {
    it('should provide application configuration', () => {
      const appConfig = env.app;
      
      expect(appConfig.baseUrl).toBeDefined();
      expect(typeof appConfig.baseUrl).toBe('string');
    });

    it('should validate base URL format', () => {
      const appConfig = env.app;
      
      expect(() => new URL(appConfig.baseUrl)).not.toThrow();
    });

    it('should provide environment flags', () => {
      const appConfig = env.app;
      
      expect(typeof appConfig.isProduction).toBe('boolean');
      expect(typeof appConfig.isDevelopment).toBe('boolean');
      expect(typeof appConfig.isTest).toBe('boolean');
    });
  });

  describe('env.upload', () => {
    it('should provide upload configuration', () => {
      const uploadConfig = env.upload;
      
      expect(uploadConfig.maxImageSize).toBeGreaterThan(0);
      expect(uploadConfig.maxImageWidth).toBeGreaterThan(0);
      expect(uploadConfig.maxImageHeight).toBeGreaterThan(0);
    });

    it('should have reasonable default values', () => {
      const uploadConfig = env.upload;
      
      // Default max size should be 10MB
      expect(uploadConfig.maxImageSize).toBeLessThanOrEqual(10 * 1024 * 1024);
      
      // Default dimensions should be reasonable
      expect(uploadConfig.maxImageWidth).toBeLessThanOrEqual(4000);
      expect(uploadConfig.maxImageHeight).toBeLessThanOrEqual(4000);
    });
  });

  describe('env.security', () => {
    it('should provide security configuration', () => {
      const securityConfig = env.security;
      
      expect(securityConfig.allowedOrigins).toBeDefined();
      expect(Array.isArray(securityConfig.allowedOrigins)).toBe(true);
    });
  });

  describe('environment helper functions', () => {
    it('should correctly identify environment', () => {
      const nodeEnv = process.env.NODE_ENV || 'development';
      
      expect(isProduction()).toBe(nodeEnv === 'production');
      expect(isDevelopment()).toBe(nodeEnv === 'development');
      expect(isTest()).toBe(nodeEnv === 'test');
    });

    it('should have exactly one environment flag true', () => {
      const flags = [isProduction(), isDevelopment(), isTest()];
      const trueCount = flags.filter(f => f).length;
      
      expect(trueCount).toBe(1);
    });
  });

  describe('configuration consistency', () => {
    it('should use test Stripe keys in development', () => {
      if (isDevelopment()) {
        expect(env.stripe.secretKey.startsWith('sk_test_')).toBe(true);
        expect(env.stripe.publishableKey.startsWith('pk_test_')).toBe(true);
      }
    });

    it('should have matching Stripe key modes', () => {
      const secretIsTest = env.stripe.secretKey.startsWith('sk_test_');
      const publishableIsTest = env.stripe.publishableKey.startsWith('pk_test_');
      
      expect(secretIsTest).toBe(publishableIsTest);
    });
  });
});
