# Environment Configuration Implementation

## Overview

This implementation provides a robust, type-safe environment configuration system for the Paper Bloom Backend. It validates all environment variables on startup and provides convenient access to configuration throughout the application.

## Files Created/Modified

### New Files

1. **`src/lib/env.ts`** - Core environment validation and configuration module
   - Defines environment schema using Zod
   - Validates all environment variables
   - Provides type-safe access to configuration
   - Includes helper functions for environment checks

2. **`src/lib/validate-env.ts`** - Standalone validation script
   - Can be run independently to check configuration
   - Provides detailed error messages
   - Checks for common configuration mistakes
   - Displays configuration summary (with secrets masked)

3. **`ENVIRONMENT_SETUP.md`** - Comprehensive documentation
   - Explains all environment variables
   - Provides examples for different environments
   - Includes troubleshooting guide
   - Security best practices

### Modified Files

1. **`.env.example`** - Enhanced with detailed documentation
   - Added comments for each variable
   - Included format specifications
   - Added optional variables with defaults
   - Security notes and warnings

2. **`src/lib/db.ts`** - Updated to use new env module
   - Validates environment on startup
   - Uses type-safe configuration access
   - Better error handling

3. **`package.json`** - Added validation script
   - New script: `npm run validate:env`

## Features

### 1. Type-Safe Configuration

```typescript
import { env } from './lib/env';

// Type-safe access to configuration
const dbUrl = env.database.url;
const stripeKey = env.stripe.secretKey;
const baseUrl = env.app.baseUrl;
```

### 2. Automatic Validation

All environment variables are validated on startup:
- Required variables must be present
- Stripe keys must have correct format (sk_test_/sk_live_)
- URLs must be valid
- Numeric values are parsed and validated

### 3. Environment-Specific Configuration

```typescript
import { isProduction, isDevelopment } from './lib/env';

if (isProduction()) {
  // Production-specific logic
}

if (isDevelopment()) {
  // Development-specific logic
}
```

### 4. Safe Logging

```typescript
import { printEnvSummary } from './lib/env';

// Prints configuration with secrets masked
printEnvSummary();
```

### 5. Grouped Configuration

Configuration is organized by domain:

```typescript
env.database    // Database configuration
env.stripe      // Stripe configuration
env.app         // Application configuration
env.logging     // Logging configuration
env.upload      // File upload configuration
env.security    // Security configuration
```

## Usage

### Validating Environment

Run the validation script before starting the application:

```bash
npm run validate:env
```

This will:
- Check all required variables are set
- Validate formats and values
- Display configuration summary
- Check for common mistakes

### In Application Code

```typescript
import { validateEnv, env } from './lib/env';

// Validate on startup (already done in db.ts)
validateEnv();

// Access configuration
const maxImageSize = env.upload.maxImageSize;
const isTestMode = env.stripe.isTestMode;
const poolMax = env.database.pool.max;
```

### Environment Checks

```typescript
import { isProduction, isDevelopment, isTest } from './lib/env';

if (isProduction()) {
  console.log('Running in production mode');
}

if (isDevelopment()) {
  console.log('Running in development mode');
}

if (isTest()) {
  console.log('Running in test mode');
}
```

## Environment Variables

### Required Variables

- `DATABASE_URL` - PostgreSQL connection string
- `STRIPE_SECRET_KEY` - Stripe secret API key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `NEXT_PUBLIC_BASE_URL` - Application base URL

### Optional Variables (with defaults)

- `DB_POOL_MAX` (default: 20)
- `DB_POOL_IDLE_TIMEOUT` (default: 30000)
- `DB_POOL_CONNECTION_TIMEOUT` (default: 2000)
- `NODE_ENV` (default: development)
- `LOG_LEVEL` (default: info)
- `MAX_IMAGE_SIZE` (default: 10485760)
- `MAX_IMAGE_WIDTH` (default: 1920)
- `MAX_IMAGE_HEIGHT` (default: 1080)
- `ALLOWED_ORIGINS` (default: *)

## Validation Rules

### Stripe Keys

- `STRIPE_SECRET_KEY` must start with `sk_test_` or `sk_live_`
- `STRIPE_WEBHOOK_SECRET` must start with `whsec_`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` must start with `pk_test_` or `pk_live_`

### URLs

- `NEXT_PUBLIC_BASE_URL` must be a valid URL with protocol
- `DATABASE_URL` must be a valid PostgreSQL connection string

### Environment Checks

- Development mode should use TEST Stripe keys
- Production mode must use LIVE Stripe keys
- Production mode should not use localhost URLs

## Error Handling

### Missing Variables

If required variables are missing, the application will fail to start with a clear error message:

```
Environment validation failed:
  - DATABASE_URL: Required
  - STRIPE_SECRET_KEY: Required

Please check your .env.local file and ensure all required variables are set.
See .env.example for reference.
```

### Invalid Formats

If variables have invalid formats:

```
Environment validation failed:
  - STRIPE_SECRET_KEY: STRIPE_SECRET_KEY must start with sk_test_ or sk_live_
  - NEXT_PUBLIC_BASE_URL: NEXT_PUBLIC_BASE_URL must be a valid URL
```

## Security Features

1. **Secret Masking** - Secrets are masked in logs and summaries
2. **Environment Validation** - Prevents using wrong keys in wrong environments
3. **Type Safety** - Prevents accessing undefined configuration
4. **No Defaults for Secrets** - Required secrets must be explicitly set

## Testing

The environment configuration can be tested with:

```bash
# Validate environment
npm run validate:env

# Test database connection (uses env config)
npm run db:test

# Validate Stripe setup (uses env config)
npm run stripe:validate
```

## Migration Guide

If you have existing code that accesses `process.env` directly:

### Before
```typescript
const dbUrl = process.env.DATABASE_URL;
const stripeKey = process.env.STRIPE_SECRET_KEY;
```

### After
```typescript
import { env } from './lib/env';

const dbUrl = env.database.url;
const stripeKey = env.stripe.secretKey;
```

## Benefits

1. **Type Safety** - TypeScript knows the types of all configuration values
2. **Validation** - Catches configuration errors at startup, not at runtime
3. **Documentation** - Configuration is self-documenting through types
4. **Convenience** - Grouped configuration is easier to use
5. **Security** - Secrets are masked in logs
6. **Maintainability** - Single source of truth for configuration

## Future Enhancements

Possible future improvements:

1. Support for multiple environment files (.env.development, .env.production)
2. Configuration hot-reloading in development
3. Integration with secret management services (AWS Secrets Manager, etc.)
4. Configuration versioning and migration
5. Runtime configuration updates (for non-sensitive values)

## References

- **Zod Documentation**: https://zod.dev/
- **Next.js Environment Variables**: https://nextjs.org/docs/basic-features/environment-variables
- **Twelve-Factor App Config**: https://12factor.net/config
