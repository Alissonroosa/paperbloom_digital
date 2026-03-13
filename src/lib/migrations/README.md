# Database Migrations

This directory contains SQL migration scripts and a TypeScript migration runner for the Paper Bloom backend database.

## Overview

The migration system provides a structured way to:
- Create and modify database schema
- Maintain version control of database changes
- Rollback changes when needed
- Document database structure

## Migration Files

### 001_create_messages_table.sql

Creates the main `messages` table with:

**Columns:**
- `id` (UUID, PRIMARY KEY) - Unique message identifier
- `recipient_name` (VARCHAR(100), NOT NULL) - Recipient's name
- `sender_name` (VARCHAR(100), NOT NULL) - Sender's name
- `message_text` (VARCHAR(500), NOT NULL) - Message content
- `image_url` (TEXT, NULLABLE) - URL of uploaded image
- `youtube_url` (TEXT, NULLABLE) - YouTube video URL
- `slug` (VARCHAR(255), UNIQUE, NULLABLE) - URL-friendly identifier
- `qr_code_url` (TEXT, NULLABLE) - QR code image URL
- `status` (VARCHAR(20), NOT NULL, DEFAULT 'pending') - Payment status
- `stripe_session_id` (VARCHAR(255), NULLABLE) - Stripe session ID
- `view_count` (INTEGER, NOT NULL, DEFAULT 0) - View counter
- `created_at` (TIMESTAMP, NOT NULL, DEFAULT NOW()) - Creation timestamp
- `updated_at` (TIMESTAMP, NOT NULL, DEFAULT NOW()) - Last update timestamp

**Constraints:**
- PRIMARY KEY on `id`
- UNIQUE constraint on `slug`
- CHECK constraint on `status` (must be 'pending' or 'paid')
- NOT NULL constraints on required fields

**Indexes:**
- `idx_messages_slug` - For fast slug lookups
- `idx_messages_status` - For filtering by payment status
- `idx_messages_stripe_session_id` - For Stripe session lookups

**Triggers:**
- `update_messages_updated_at` - Automatically updates `updated_at` on row changes

### 001_create_messages_table_rollback.sql

Rollback script that:
- Drops the `update_messages_updated_at` trigger
- Drops the `update_updated_at_column()` function
- Drops all indexes
- Drops the `messages` table

## Migration Runner (migrate.ts)

TypeScript script that executes migrations and rollbacks.

### Functions

#### `runMigrations()`
Executes forward migrations to create/update database schema.

#### `rollbackMigrations()`
Executes rollback migrations to undo database changes.

## Usage

### Running Migrations

```bash
# Using ts-node
npx ts-node src/lib/migrations/migrate.ts up

# Using tsx
npx tsx src/lib/migrations/migrate.ts up
```

### Rolling Back Migrations

```bash
# Using ts-node
npx ts-node src/lib/migrations/migrate.ts down

# Using tsx
npx tsx src/lib/migrations/migrate.ts down
```

### Programmatic Usage

```typescript
import { runMigrations, rollbackMigrations } from '@/lib/migrations/migrate';

// Run migrations
await runMigrations();

// Rollback migrations
await rollbackMigrations();
```

## Testing Migrations

### Test on Clean Database

1. **Backup existing data** (if any):
   ```bash
   pg_dump -U alisson_user -h 82.112.250.187 -d c_paperbloom > backup.sql
   ```

2. **Run rollback** to clean database:
   ```bash
   npx tsx src/lib/migrations/migrate.ts down
   ```

3. **Run migration** to recreate schema:
   ```bash
   npx tsx src/lib/migrations/migrate.ts up
   ```

4. **Verify schema** was created correctly:
   ```bash
   npx tsx src/lib/verify-schema.ts
   ```

### Verify Migration Success

After running migrations, verify:

1. **Table exists:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'messages';
   ```

2. **Columns are correct:**
   ```sql
   SELECT column_name, data_type, is_nullable, column_default
   FROM information_schema.columns
   WHERE table_name = 'messages'
   ORDER BY ordinal_position;
   ```

3. **Indexes exist:**
   ```sql
   SELECT indexname FROM pg_indexes 
   WHERE tablename = 'messages';
   ```

4. **Constraints are in place:**
   ```sql
   SELECT constraint_name, constraint_type
   FROM information_schema.table_constraints
   WHERE table_name = 'messages';
   ```

5. **Trigger exists:**
   ```sql
   SELECT trigger_name FROM information_schema.triggers
   WHERE event_object_table = 'messages';
   ```

## Rollback Procedure

### When to Rollback

Rollback migrations when:
- Migration fails partway through
- Schema changes cause application errors
- Need to revert to previous database state
- Testing migration changes

### Rollback Steps

1. **Stop the application** to prevent data corruption:
   ```bash
   # Stop your Next.js server
   ```

2. **Backup current data** (if needed):
   ```bash
   pg_dump -U alisson_user -h 82.112.250.187 -d c_paperbloom > backup_before_rollback.sql
   ```

3. **Run rollback script:**
   ```bash
   npx tsx src/lib/migrations/migrate.ts down
   ```

4. **Verify rollback success:**
   ```sql
   -- Table should not exist
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'messages';
   ```

5. **Restore from backup** (if needed):
   ```bash
   psql -U alisson_user -h 82.112.250.187 -d c_paperbloom < backup.sql
   ```

### Rollback Safety

The rollback script uses:
- `IF EXISTS` clauses to prevent errors if objects don't exist
- Proper order of operations (triggers → functions → indexes → table)
- Transaction wrapping for atomicity

## Transaction Safety

Both migration and rollback operations are wrapped in transactions:

```typescript
await client.query('BEGIN');
try {
  // Execute migration/rollback SQL
  await client.query(sql);
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
}
```

This ensures:
- All changes succeed or none do (atomicity)
- Database remains in consistent state
- Failed migrations don't leave partial changes

## Environment Variables

Required environment variables:

```env
DATABASE_URL=postgres://username:password@host:port/database
DB_POOL_MAX=20                    # Optional: Max connections
DB_POOL_IDLE_TIMEOUT=30000        # Optional: Idle timeout (ms)
DB_POOL_CONNECTION_TIMEOUT=2000   # Optional: Connection timeout (ms)
```

## Adding New Migrations

When adding new migrations:

1. **Create migration file:**
   ```
   src/lib/migrations/002_your_migration_name.sql
   ```

2. **Create rollback file:**
   ```
   src/lib/migrations/002_your_migration_name_rollback.sql
   ```

3. **Update migrate.ts** to include new migration

4. **Test migration:**
   - Run on clean database
   - Verify schema changes
   - Test rollback
   - Test application functionality

5. **Document changes** in this README

## Troubleshooting

### Migration Fails

If migration fails:

1. Check error message for specific issue
2. Verify database connection
3. Check if table already exists
4. Verify SQL syntax
5. Check database permissions

### Rollback Fails

If rollback fails:

1. Check if table exists
2. Verify dependent objects are removed first
3. Check database permissions
4. Manually drop objects if needed

### Connection Issues

If connection fails:

1. Verify DATABASE_URL is correct
2. Check database server is running
3. Verify network connectivity
4. Check firewall rules
5. Verify database credentials

## Best Practices

1. **Always backup** before running migrations in production
2. **Test migrations** on development/staging first
3. **Use transactions** for atomicity
4. **Document changes** in migration files
5. **Version control** all migration files
6. **Never modify** existing migration files after deployment
7. **Create new migrations** for schema changes
8. **Test rollbacks** to ensure they work

## Requirements Validation

This migration system satisfies:

- **Requirement 6.1**: Database connection using PostgreSQL credentials
- **Requirement 6.2**: Automatic timestamp management (created_at, updated_at)
- **Requirement 6.3**: Referential integrity constraints (UNIQUE, NOT NULL, CHECK)

## Related Files

- `src/lib/db.ts` - Database connection pool
- `src/lib/verify-schema.ts` - Schema verification utility
- `src/lib/validate-setup.ts` - Setup validation
- `DATABASE_SETUP.md` - Database setup instructions
