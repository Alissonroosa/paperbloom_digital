# Database Migration Guide

Complete guide for managing database migrations in the Paper Bloom backend.

## Quick Start

### Run Migrations

```bash
npm run db:migrate
```

### Rollback Migrations

```bash
npm run db:rollback
```

### Test Migrations

```bash
npm run db:migrate:test
```

## Overview

The Paper Bloom backend uses a SQL-based migration system to manage database schema changes. This system provides:

- **Version control** for database schema
- **Repeatable deployments** across environments
- **Rollback capability** for safe schema changes
- **Transaction safety** to prevent partial updates
- **Automated testing** to verify migrations work correctly

## Migration Files

All migration files are located in `src/lib/migrations/`:

```
src/lib/migrations/
├── README.md                              # Migration documentation
├── migrate.ts                             # Migration runner script
├── test-migration.ts                      # Migration test script
├── 001_create_messages_table.sql          # Forward migration
└── 001_create_messages_table_rollback.sql # Rollback migration
```

## Available Commands

### NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run db:migrate` | Run all pending migrations |
| `npm run db:rollback` | Rollback the last migration |
| `npm run db:migrate:test` | Test migrations on clean database |
| `npm run db:test` | Test database connection |
| `npm run db:verify` | Verify database schema |

### Direct Execution

```bash
# Using tsx (recommended)
npx tsx src/lib/migrations/migrate.ts up
npx tsx src/lib/migrations/migrate.ts down

# Using ts-node
npx ts-node src/lib/migrations/migrate.ts up
npx ts-node src/lib/migrations/migrate.ts down
```

## Migration Process

### 1. Running Migrations

Migrations create or update the database schema:

```bash
npm run db:migrate
```

**What happens:**
1. Connects to PostgreSQL database
2. Starts a transaction
3. Executes SQL from migration file
4. Commits transaction if successful
5. Rolls back transaction if any error occurs

**Output:**
```
Starting database migrations...
✓ Migration 001_create_messages_table completed successfully
Database migrations completed successfully!
```

### 2. Rolling Back Migrations

Rollbacks undo database changes:

```bash
npm run db:rollback
```

**What happens:**
1. Connects to PostgreSQL database
2. Starts a transaction
3. Executes SQL from rollback file
4. Commits transaction if successful
5. Rolls back transaction if any error occurs

**Output:**
```
Starting database rollback...
✓ Rollback 001_create_messages_table completed successfully
Database rollback completed successfully!
```

### 3. Testing Migrations

Test migrations on a clean database:

```bash
npm run db:migrate:test
```

**What happens:**
1. Rolls back existing schema (clean slate)
2. Runs migrations
3. Verifies table exists
4. Verifies all columns exist
5. Verifies all indexes exist
6. Verifies all constraints exist
7. Verifies triggers exist
8. Tests insert/update operations
9. Verifies automatic timestamp updates

**Output:**
```
============================================================
Testing Database Migration on Clean Database
============================================================

[Step 1] Rolling back existing schema...
[Step 2] Running migrations...
[Step 3] Verifying schema...

✓ Table "messages" exists
✓ All columns exist
✓ All indexes exist
✓ All constraints exist
✓ Trigger exists
✓ Insert/Update operations work

============================================================
✓ ALL TESTS PASSED - Migration is working correctly!
============================================================
```

## Schema Details

### Messages Table

The migration creates a `messages` table with the following structure:

#### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique message identifier |
| `recipient_name` | VARCHAR(100) | NOT NULL | Recipient's name |
| `sender_name` | VARCHAR(100) | NOT NULL | Sender's name |
| `message_text` | VARCHAR(500) | NOT NULL | Message content |
| `image_url` | TEXT | NULLABLE | URL of uploaded image |
| `youtube_url` | TEXT | NULLABLE | YouTube video URL |
| `slug` | VARCHAR(255) | UNIQUE, NULLABLE | URL-friendly identifier |
| `qr_code_url` | TEXT | NULLABLE | QR code image URL |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'pending', CHECK | Payment status |
| `stripe_session_id` | VARCHAR(255) | NULLABLE | Stripe session ID |
| `view_count` | INTEGER | NOT NULL, DEFAULT 0 | View counter |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

#### Indexes

- `messages_pkey` - Primary key on `id`
- `idx_messages_slug` - Index on `slug` for fast lookups
- `idx_messages_status` - Index on `status` for filtering
- `idx_messages_stripe_session_id` - Index on `stripe_session_id` for Stripe lookups

#### Constraints

- **PRIMARY KEY** on `id`
- **UNIQUE** constraint on `slug`
- **CHECK** constraint on `status` (must be 'pending' or 'paid')
- **NOT NULL** constraints on required fields

#### Triggers

- `update_messages_updated_at` - Automatically updates `updated_at` timestamp on row updates

## Rollback Procedure

### When to Rollback

Rollback migrations when:

- Migration fails partway through
- Schema changes cause application errors
- Need to revert to previous database state
- Testing migration changes

### Rollback Steps

#### 1. Stop the Application

```bash
# Stop your Next.js development server
# Press Ctrl+C in the terminal running the dev server
```

#### 2. Backup Current Data (Optional but Recommended)

```bash
# Using pg_dump
pg_dump -U alisson_user -h 82.112.250.187 -d c_paperbloom > backup_$(date +%Y%m%d_%H%M%S).sql

# Or using psql
psql -U alisson_user -h 82.112.250.187 -d c_paperbloom -c "\copy messages TO 'messages_backup.csv' CSV HEADER"
```

#### 3. Run Rollback

```bash
npm run db:rollback
```

#### 4. Verify Rollback Success

```bash
# Check if table was dropped
psql -U alisson_user -h 82.112.250.187 -d c_paperbloom -c "SELECT table_name FROM information_schema.tables WHERE table_name = 'messages';"
```

Expected output: No rows (table should not exist)

#### 5. Restore from Backup (If Needed)

```bash
# Restore from SQL dump
psql -U alisson_user -h 82.112.250.187 -d c_paperbloom < backup_20241124_120000.sql

# Or restore from CSV
psql -U alisson_user -h 82.112.250.187 -d c_paperbloom -c "\copy messages FROM 'messages_backup.csv' CSV HEADER"
```

## Troubleshooting

### Migration Fails

**Error: "relation 'messages' already exists"**

Solution: The table already exists. Either:
- Run rollback first: `npm run db:rollback`
- Or manually drop the table: `DROP TABLE IF EXISTS messages CASCADE;`

**Error: "permission denied"**

Solution: Check database user permissions:
```sql
GRANT ALL PRIVILEGES ON DATABASE c_paperbloom TO alisson_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO alisson_user;
```

**Error: "connection refused"**

Solution: Check database connection:
1. Verify DATABASE_URL in `.env.local`
2. Check database server is running
3. Verify network connectivity
4. Check firewall rules

### Rollback Fails

**Error: "relation 'messages' does not exist"**

Solution: The table is already dropped. This is OK - rollback succeeded previously.

**Error: "cannot drop table messages because other objects depend on it"**

Solution: Use CASCADE to drop dependent objects:
```sql
DROP TABLE IF EXISTS messages CASCADE;
```

### Connection Issues

**Error: "database connection failed"**

Solution:
1. Check `.env.local` has correct DATABASE_URL
2. Test connection: `npm run db:test`
3. Verify credentials are correct
4. Check database server is accessible

## Best Practices

### Before Running Migrations

1. ✅ **Backup your data** (especially in production)
2. ✅ **Test migrations** in development first
3. ✅ **Review migration SQL** to understand changes
4. ✅ **Check database permissions**
5. ✅ **Verify database connection**

### During Migrations

1. ✅ **Monitor the output** for errors
2. ✅ **Don't interrupt** the migration process
3. ✅ **Check transaction status** if errors occur
4. ✅ **Verify schema** after migration completes

### After Migrations

1. ✅ **Verify schema** with `npm run db:verify`
2. ✅ **Test application** functionality
3. ✅ **Check logs** for any errors
4. ✅ **Document changes** in version control

### Production Deployments

1. ✅ **Schedule maintenance window**
2. ✅ **Backup database** before migration
3. ✅ **Test rollback procedure** beforehand
4. ✅ **Have rollback plan** ready
5. ✅ **Monitor application** after deployment
6. ✅ **Keep backup** for at least 24 hours

## Environment Variables

Required environment variables in `.env.local`:

```env
# Database connection
DATABASE_URL=postgres://username:password@host:port/database

# Optional: Connection pool settings
DB_POOL_MAX=20
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_CONNECTION_TIMEOUT=2000
```

## Manual Migration

If you need to run migrations manually:

### Using psql

```bash
# Run migration
psql -U alisson_user -h 82.112.250.187 -d c_paperbloom -f src/lib/migrations/001_create_messages_table.sql

# Run rollback
psql -U alisson_user -h 82.112.250.187 -d c_paperbloom -f src/lib/migrations/001_create_messages_table_rollback.sql
```

### Using SQL Client

1. Connect to database
2. Copy SQL from migration file
3. Execute in transaction:
   ```sql
   BEGIN;
   -- Paste migration SQL here
   COMMIT;
   ```

## Adding New Migrations

When you need to add new migrations:

### 1. Create Migration Files

```bash
# Create forward migration
touch src/lib/migrations/002_your_migration_name.sql

# Create rollback migration
touch src/lib/migrations/002_your_migration_name_rollback.sql
```

### 2. Write Migration SQL

Forward migration (`002_your_migration_name.sql`):
```sql
-- Migration: Your migration name
-- Description: What this migration does

-- Your SQL here
ALTER TABLE messages ADD COLUMN new_field VARCHAR(100);
```

Rollback migration (`002_your_migration_name_rollback.sql`):
```sql
-- Rollback: Your migration name
-- Description: Undo the migration

-- Your SQL here
ALTER TABLE messages DROP COLUMN IF EXISTS new_field;
```

### 3. Update migrate.ts

Add your migration to the runner:
```typescript
const migrations = [
  '001_create_messages_table.sql',
  '002_your_migration_name.sql',
];
```

### 4. Test Migration

```bash
# Test on clean database
npm run db:migrate:test

# Or test manually
npm run db:rollback
npm run db:migrate
npm run db:verify
```

### 5. Document Changes

Update `src/lib/migrations/README.md` with:
- What changed
- Why it changed
- Any breaking changes
- Rollback procedure

## Requirements Validation

This migration system satisfies the following requirements:

### Requirement 6.1: Database Connection
✅ Connects to PostgreSQL using credentials from environment variables

### Requirement 6.2: Automatic Timestamps
✅ `created_at` and `updated_at` timestamps are automatically managed
✅ Trigger automatically updates `updated_at` on row changes

### Requirement 6.3: Referential Integrity
✅ PRIMARY KEY constraint on `id`
✅ UNIQUE constraint on `slug`
✅ NOT NULL constraints on required fields
✅ CHECK constraint on `status` enum
✅ Indexes for performance

## Related Documentation

- `src/lib/migrations/README.md` - Detailed migration documentation
- `DATABASE_SETUP.md` - Database setup instructions
- `src/lib/db.ts` - Database connection pool
- `src/lib/verify-schema.ts` - Schema verification utility

## Support

If you encounter issues:

1. Check this guide for troubleshooting steps
2. Review error messages carefully
3. Test database connection: `npm run db:test`
4. Verify schema: `npm run db:verify`
5. Check logs for detailed error information

## Summary

The migration system provides a robust, tested way to manage database schema changes:

- ✅ SQL-based migrations for clarity
- ✅ Transaction safety for atomicity
- ✅ Rollback capability for safety
- ✅ Automated testing for confidence
- ✅ Clear documentation for maintainability

Run `npm run db:migrate:test` to verify everything is working correctly!
