# Environment Configuration Guide

This guide explains how to set up and configure environment variables for the Paper Bloom Backend.

## Quick Start

1. **Copy the example file:**
   ```bash
   copy .env.example .env.local
   ```

2. **Fill in your values** in `.env.local`

3. **Validate your configuration:**
   ```bash
   npm run validate:env
   ```

## Required Environment Variables

### Database Configuration

#### `DATABASE_URL` (REQUIRED)
PostgreSQL connection string.

**Format:**
```
postgres://username:password@host:port/database_name
```

**Important Notes:**
- Special characters in the password must be URL-encoded:
  - `@` becomes `%40`
  - `#` becomes `%23`
  - `%` becomes `%25`
  - Space becomes `%20`

**Example:**
```
DATABASE_URL=postgres://myuser:MyP%40ssw0rd%23@localhost:5432/paperbloom
```

### Stripe Configuration

#### `STRIPE_SECRET_KEY` (REQUIRED)
Your Stripe secret API key for server-side operations.

**Format:**
- Development: `sk_test_...`
- Production: `sk_live_...`

**Where to find:**
- Go to [Stripe Dashboard → API Keys](https://dashboard.stripe.com/test/apikeys)
- Copy the "Secret key"

**Security:**
- ⚠️ NEVER expose this key in client-side code
- ⚠️ NEVER commit this key to version control
- Use TEST keys for development
- Use LIVE keys only in production

#### `STRIPE_WEBHOOK_SECRET` (REQUIRED)
Secret for verifying Stripe webhook signatures.

**Format:** `whsec_...`

**Where to find:**
- **Development:** Run `stripe listen --forward-to localhost:3000/api/checkout/webhook`
  - The webhook secret will be displayed in the terminal
- **Production:** Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
  - Create a new webhook endpoint
  - Copy the "Signing secret"

#### `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (REQUIRED)
Your Stripe publishable key for client-side checkout.

**Format:**
- Development: `pk_test_...`
- Production: `pk_live_...`

**Where to find:**
- Go to [Stripe Dashboard → API Keys](https://dashboard.stripe.com/test/apikeys)
- Copy the "Publishable key"

**Note:** This key is safe to expose in the browser (it's prefixed with `NEXT_PUBLIC_`)

### Application Configuration

#### `NEXT_PUBLIC_BASE_URL` (REQUIRED)
The base URL of your application.

**Examples:**
- Development: `http://localhost:3000`
- Production: `https://paperbloom.com`

**Used for:**
- Generating QR codes
- Creating redirect URLs after payment
- Building absolute URLs for messages

## Optional Environment Variables

### Database Connection Pool

#### `DB_POOL_MAX`
Maximum number of database connections in the pool.

**Default:** `20`
**Recommended:**
- Development: `10-20`
- Production: `20-50`

#### `DB_POOL_IDLE_TIMEOUT`
Time (in milliseconds) before closing idle connections.

**Default:** `30000` (30 seconds)

#### `DB_POOL_CONNECTION_TIMEOUT`
Time (in milliseconds) to wait for a connection.

**Default:** `2000` (2 seconds)

### Environment

#### `NODE_ENV`
Application environment mode.

**Values:** `development` | `production` | `test`
**Default:** `development`

### Logging

#### `LOG_LEVEL`
Logging verbosity level.

**Values:** `error` | `warn` | `info` | `debug`
**Default:** `info`

### File Upload

#### `MAX_IMAGE_SIZE`
Maximum image upload size in bytes.

**Default:** `10485760` (10MB)

#### `MAX_IMAGE_WIDTH`
Maximum image width for resizing.

**Default:** `1920`

#### `MAX_IMAGE_HEIGHT`
Maximum image height for resizing.

**Default:** `1080`

### Security

#### `ALLOWED_ORIGINS`
Comma-separated list of allowed CORS origins.

**Default:** `*` (all origins)
**Production:** Set to your frontend domain(s)

**Example:**
```
ALLOWED_ORIGINS=https://paperbloom.com,https://www.paperbloom.com
```

## Environment-Specific Configuration

### Development Environment

```env
NODE_ENV=development
DATABASE_URL=postgres://dev_user:dev_pass@localhost:5432/paperbloom_dev
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
LOG_LEVEL=debug
ALLOWED_ORIGINS=*
```

### Production Environment

```env
NODE_ENV=production
DATABASE_URL=postgres://prod_user:secure_pass@db.example.com:5432/paperbloom_prod
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_BASE_URL=https://paperbloom.com
LOG_LEVEL=info
ALLOWED_ORIGINS=https://paperbloom.com,https://www.paperbloom.com
DB_POOL_MAX=50
```

### Test Environment

```env
NODE_ENV=test
DATABASE_URL=postgres://test_user:test_pass@localhost:5432/paperbloom_test
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
LOG_LEVEL=error
```

## Validation

The application validates all environment variables on startup. If any required variables are missing or invalid, the application will fail to start with a clear error message.

### Manual Validation

Run the validation script to check your configuration:

```bash
npm run validate:env
```

This will:
- ✓ Check all required variables are set
- ✓ Validate variable formats (URLs, Stripe keys, etc.)
- ✓ Check for common configuration mistakes
- ✓ Display a summary of your configuration (with secrets masked)

### Automatic Validation

The application automatically validates environment variables when:
- The database connection is initialized
- The application starts
- Any service that depends on environment variables is used

## Security Best Practices

1. **Never commit `.env.local` to version control**
   - It's already in `.gitignore`
   - Only commit `.env.example`

2. **Use different keys for different environments**
   - Development: TEST keys (`sk_test_...`, `pk_test_...`)
   - Production: LIVE keys (`sk_live_...`, `pk_live_...`)

3. **Rotate secrets regularly**
   - Change database passwords periodically
   - Regenerate Stripe keys if compromised

4. **Use environment-specific databases**
   - Never use production database in development
   - Use separate test database for automated tests

5. **Restrict database access**
   - Use strong passwords
   - Limit database user permissions
   - Use SSL/TLS for database connections in production

6. **Monitor webhook secrets**
   - Verify webhook signatures on every request
   - Rotate webhook secrets if compromised

## Troubleshooting

### "DATABASE_URL is required"
- Make sure `.env.local` exists
- Check that `DATABASE_URL` is set in `.env.local`
- Verify there are no typos in the variable name

### "STRIPE_SECRET_KEY must start with sk_test_ or sk_live_"
- Check that you copied the correct key from Stripe Dashboard
- Make sure there are no extra spaces or newlines

### "NEXT_PUBLIC_BASE_URL must be a valid URL"
- Include the protocol (`http://` or `https://`)
- Don't include trailing slashes
- Example: `http://localhost:3000` ✓
- Example: `localhost:3000` ✗

### Database connection fails
- Verify the database is running
- Check the connection string format
- Ensure special characters in password are URL-encoded
- Test connection: `npm run db:test`

### Stripe webhook signature verification fails
- Make sure `STRIPE_WEBHOOK_SECRET` matches the webhook endpoint
- For development, use the secret from `stripe listen` command
- For production, use the secret from Stripe Dashboard

## Additional Resources

- [Stripe API Keys Documentation](https://stripe.com/docs/keys)
- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

## Support

If you encounter issues with environment configuration:

1. Run `npm run validate:env` to check your configuration
2. Check this documentation for common issues
3. Review `.env.example` for the correct format
4. Ensure all required services (database, Stripe) are properly set up
