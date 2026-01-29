# Library Utilities

This directory contains core utility modules for the Paper Bloom backend.

## Modules

### Error Handling (`errors.ts`, `errorHandler.ts`)

Centralized error handling system for consistent API error responses.

**Key Features:**
- Custom error classes for different error types
- Automatic error mapping (Database, Stripe, File System)
- Consistent error response formatting
- Structured error logging with context
- CORS header management
- Type-safe error handling

**Quick Start:**
```typescript
import { withErrorHandler, parseJSON, createSuccessResponse } from '@/lib/errorHandler';
import { ValidationError, NotFoundError } from '@/lib/errors';

export const POST = withErrorHandler(async (request) => {
  const body = await parseJSON(request);
  
  if (!body.name) {
    throw new ValidationError('Name is required', { name: 'Required field' });
  }
  
  return createSuccessResponse({ id: '123' }, 201);
});
```

**Documentation:**
- [Error Handling Guide](./ERROR_HANDLING.md) - Complete documentation
- [Migration Example](./MIGRATION_EXAMPLE.md) - Before/after comparison
- [Implementation Summary](./ERROR_HANDLING_SUMMARY.md) - Overview and verification

**Verification:**
```bash
npm run errors:verify
```

---

### Database (`db.ts`)

PostgreSQL connection pool management.

**Features:**
- Connection pooling for optimal performance
- Environment variable configuration
- Error handling for connection failures

**Usage:**
```typescript
import pool from '@/lib/db';

const result = await pool.query('SELECT * FROM messages WHERE id = $1', [id]);
```

---

### Database Migrations (`migrations/`)

Database schema migration system.

**Files:**
- `migrate.ts` - Migration runner
- `001_create_messages_table.sql` - Initial schema
- `001_create_messages_table_rollback.sql` - Rollback script

**Commands:**
```bash
npm run db:migrate    # Run migrations
npm run db:rollback   # Rollback last migration
npm run db:verify     # Verify schema
```

---

### Validation and Setup

**Files:**
- `validate-setup.ts` - Validate environment configuration
- `validate-stripe-setup.ts` - Validate Stripe configuration
- `verify-schema.ts` - Verify database schema
- `test-db-connection.ts` - Test database connectivity

**Commands:**
```bash
npm run validate-setup     # Validate environment
npm run stripe:validate    # Validate Stripe setup
npm run db:verify          # Verify database schema
npm run db:test            # Test database connection
```

---

### Utilities (`utils.ts`)

General utility functions (if any).

---

## Directory Structure

```
src/lib/
├── errors.ts                          # Custom error classes
├── errorHandler.ts                    # Error handling utilities
├── db.ts                              # Database connection
├── utils.ts                           # General utilities
├── validate-setup.ts                  # Environment validation
├── validate-stripe-setup.ts           # Stripe validation
├── verify-schema.ts                   # Schema verification
├── test-db-connection.ts              # Connection testing
├── ERROR_HANDLING.md                  # Error handling docs
├── ERROR_HANDLING_SUMMARY.md          # Implementation summary
├── MIGRATION_EXAMPLE.md               # Migration guide
├── README.md                          # This file
├── migrations/
│   ├── migrate.ts                     # Migration runner
│   ├── 001_create_messages_table.sql
│   └── 001_create_messages_table_rollback.sql
├── examples/
│   └── error-handling-example.ts      # Error handling examples
└── __tests__/
    ├── verify-error-handling.ts       # Error handling tests
    └── error-handling.test.ts         # Vitest tests (if available)
```

---

## Testing

### Error Handling Tests
```bash
npm run errors:verify
```

All 42 tests pass successfully! ✅

### Database Tests
```bash
npm run db:test      # Test connection
npm run db:verify    # Verify schema
```

### Stripe Tests
```bash
npm run stripe:validate    # Validate configuration
npm run stripe:verify      # Verify service
```

---

## Best Practices

### Error Handling
1. Always use `withErrorHandler` wrapper for API routes
2. Use specific error classes (ValidationError, NotFoundError, etc.)
3. Include context when logging errors
4. Never expose sensitive data in error messages
5. Let database/Stripe errors propagate - they'll be automatically mapped

### Database
1. Always use parameterized queries to prevent SQL injection
2. Use connection pooling (already configured)
3. Handle connection errors gracefully
4. Close connections properly (pool handles this)

### Validation
1. Validate all user inputs
2. Use Zod schemas for type-safe validation
3. Return detailed validation errors
4. Validate environment variables on startup

---

## Environment Variables

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `NEXT_PUBLIC_BASE_URL` - Application base URL
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

Validate with:
```bash
npm run validate-setup
```

---

## Contributing

When adding new utilities:
1. Add the module to this directory
2. Export functions/classes clearly
3. Add TypeScript types
4. Document usage in this README
5. Add tests if applicable
6. Update relevant documentation

---

## Support

For questions or issues:
1. Check the documentation in this directory
2. Review examples in `examples/`
3. Run verification scripts
4. Check the design document at `.kiro/specs/paperbloom-backend/design.md`
