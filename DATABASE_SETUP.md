# Database Setup Documentation

## Overview

This document describes the database infrastructure setup for Paper Bloom Backend.

## Database Configuration

### Environment Variables

The following environment variables are required:

- `DATABASE_URL`: PostgreSQL connection string
- `DB_POOL_MAX`: Maximum number of connections in the pool (default: 20)
- `DB_POOL_IDLE_TIMEOUT`: Idle timeout in milliseconds (default: 30000)
- `DB_POOL_CONNECTION_TIMEOUT`: Connection timeout in milliseconds (default: 2000)

### Configuration Files

- `.env.example`: Template for environment variables
- `.env.local`: Local development environment variables (not committed to git)

## Database Schema

### Messages Table

The `messages` table stores all personalized messages with the following structure:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier (auto-generated) |
| recipient_name | VARCHAR(100) | NOT NULL | Name of the recipient |
| sender_name | VARCHAR(100) | NOT NULL | Name of the sender |
| message_text | VARCHAR(500) | NOT NULL | The message text |
| image_url | TEXT | NULL | URL of uploaded image |
| youtube_url | TEXT | NULL | YouTube video URL |
| slug | VARCHAR(255) | UNIQUE | URL slug (generated after payment) |
| qr_code_url | TEXT | NULL | QR code image URL |
| status | VARCHAR(20) | NOT NULL, CHECK | Payment status: 'pending' or 'paid' |
| stripe_session_id | VARCHAR(255) | NULL | Stripe checkout session ID |
| view_count | INTEGER | NOT NULL, DEFAULT 0 | Number of views |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

### Indexes

- `idx_messages_slug`: Index on slug column for fast lookups
- `idx_messages_status`: Index on status column for filtering
- `idx_messages_stripe_session_id`: Index on Stripe session ID for webhook processing

### Triggers

- `update_messages_updated_at`: Automatically updates `updated_at` timestamp on row updates

## Database Connection

### Connection Pooling

The application uses PostgreSQL connection pooling for optimal performance:

```typescript
import pool from '@/lib/db';

// Use the pool in your code
const result = await pool.query('SELECT * FROM messages WHERE id = $1', [id]);
```

### Connection Pool Configuration

- Maximum connections: 20 (configurable via `DB_POOL_MAX`)
- Idle timeout: 30 seconds (configurable via `DB_POOL_IDLE_TIMEOUT`)
- Connection timeout: 2 seconds (configurable via `DB_POOL_CONNECTION_TIMEOUT`)

## Migration Scripts

### Available Commands

```bash
# Test database connection
npm run db:test

# Run migrations (create tables)
npm run db:migrate

# Rollback migrations (drop tables)
npm run db:rollback
```

### Migration Files

- `src/lib/migrations/001_create_messages_table.sql`: Creates the messages table
- `src/lib/migrations/001_create_messages_table_rollback.sql`: Drops the messages table
- `src/lib/migrations/migrate.ts`: Migration runner script

### Running Migrations

1. Ensure `.env.local` is configured with valid `DATABASE_URL`
2. Run `npm run db:test` to verify connection
3. Run `npm run db:migrate` to create tables
4. Verify tables were created in your PostgreSQL database

### Rollback Procedure

If you need to rollback the database:

```bash
npm run db:rollback
```

This will drop all tables and associated objects (triggers, functions, indexes).

## Type Definitions

TypeScript interfaces for the Message entity are defined in `src/types/message.ts`:

- `Message`: Application-level interface (camelCase)
- `MessageRow`: Database-level interface (snake_case)
- `rowToMessage()`: Converter function from database row to application entity

## Validation

All database constraints are enforced at the database level:

- **NOT NULL constraints**: Required fields cannot be null
- **UNIQUE constraint**: Slug must be unique across all messages
- **CHECK constraint**: Status must be either 'pending' or 'paid'
- **Foreign key integrity**: Enforced through PostgreSQL constraints

## Security Considerations

1. **Connection String**: Never commit `.env.local` to version control
2. **Parameterized Queries**: Always use parameterized queries to prevent SQL injection
3. **Connection Pooling**: Limits concurrent connections to prevent resource exhaustion
4. **Error Handling**: Database errors are caught and logged without exposing sensitive information

## Performance Optimization

1. **Indexes**: Strategic indexes on frequently queried columns (slug, status, stripe_session_id)
2. **Connection Pooling**: Reuses database connections for better performance
3. **Automatic Timestamps**: Database-level triggers for timestamp management
4. **Query Optimization**: Use indexes and avoid full table scans

## Monitoring

The connection pool emits error events that are logged:

```typescript
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});
```

## Troubleshooting

### Connection Errors

If you get connection errors:

1. Verify `DATABASE_URL` is correct in `.env.local`
2. Check that PostgreSQL server is running
3. Verify network connectivity to database host
4. Check firewall rules allow connection to PostgreSQL port

### Migration Errors

If migrations fail:

1. Check database user has CREATE TABLE permissions
2. Verify database exists
3. Check for existing tables with same names
4. Review migration logs for specific error messages

### Pool Exhaustion

If you see "pool exhausted" errors:

1. Increase `DB_POOL_MAX` in `.env.local`
2. Check for connection leaks (always release clients)
3. Monitor active connections in PostgreSQL

## Requirements Validation

This setup satisfies the following requirements:

- **Requirement 6.1**: Database connection with environment variables ✓
- **Requirement 6.2**: Automatic timestamp management ✓
- **Requirement 6.3**: Referential integrity constraints ✓
