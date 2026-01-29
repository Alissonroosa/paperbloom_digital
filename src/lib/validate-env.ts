#!/usr/bin/env node
/**
 * Environment Variables Validation Script
 * 
 * This script validates that all required environment variables are set
 * and have valid values. Run this before starting the application.
 * 
 * Usage: npm run validate:env
 */

import dotenv from 'dotenv';
import { validateEnv, printEnvSummary } from './env';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function main() {
  console.log('=== Paper Bloom Environment Validation ===\n');
  
  try {
    // Validate environment variables
    console.log('Validating environment variables...\n');
    validateEnv();
    
    console.log('✓ All environment variables are valid!\n');
    
    // Print summary
    printEnvSummary();
    
    // Additional checks
    console.log('=== Additional Checks ===');
    
    // Check if using test mode in development
    const config = validateEnv();
    if (config.NODE_ENV === 'development' && !config.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
      console.warn('⚠ WARNING: Using LIVE Stripe keys in development mode!');
      console.warn('  Consider using TEST keys (sk_test_...) for development.\n');
    }
    
    // Check if using test mode in production
    if (config.NODE_ENV === 'production' && config.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
      console.error('✗ ERROR: Using TEST Stripe keys in production mode!');
      console.error('  You must use LIVE keys (sk_live_...) for production.\n');
      process.exit(1);
    }
    
    // Check if base URL matches environment
    if (config.NODE_ENV === 'production' && config.NEXT_PUBLIC_BASE_URL.includes('localhost')) {
      console.warn('⚠ WARNING: Base URL contains "localhost" in production mode!');
      console.warn('  Make sure to set the correct production URL.\n');
    }
    
    console.log('✓ All checks passed!\n');
    
    console.log('=== Next Steps ===');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Run database migrations: npm run db:migrate');
    console.log('3. Test Stripe integration: npm run stripe:validate');
    console.log('4. Start Stripe webhook listener: npm run stripe:listen\n');
    
  } catch (error) {
    console.error('✗ Environment validation failed!\n');
    
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    
    console.error('\n=== How to Fix ===');
    console.error('1. Copy .env.example to .env.local');
    console.error('2. Fill in all required environment variables');
    console.error('3. Run this script again: npm run validate:env\n');
    
    process.exit(1);
  }
}

main();
