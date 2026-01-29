# Database Constraints and Indexes

This document describes all database constraints and indexes implemented for the Paper Bloom backend system.

**Requirements:** 6.3 - Ensure data integrity through proper database constraints

## Table: messages

### Primary Key

- **Column:** `id` (UUID)
- **Constraint:** `messages_pkey`
- **Purpose:** Ensures each message has a unique identifier

### UNIQUE Constraints

#### Slug Uniqueness
- **Column:** `slug`
- **Constraint:** `messages_slug_key`
- **Purpose:** Ensures each paid message has a unique URL slug
- **Note:** NULL values are allowed (for pending messages), and multiple NULL values can exist

### NOT NULL Constraints

The following columns have NOT NULL constraints to ensure data integrity:

1. **recipient_name** - Required field for message recipient
2. **sender_name** - Required field for message sender
3. **message_text** - Required field for the message content
4. **status** - Required field to track payment status
5. **view_count** - Required field to track message views (defaults to 0)
6. **created_at** - Required timestamp for message creation
7. **updated_at** - Required timestamp for last update

### CHECK Constraints

#### Status Enum
- **Column:** `status`
- **Constraint:** `messages_status_check`
- **Definition:** `CHECK (status IN ('pending', 'paid'))`
- **Purpose:** Ensures status can only be 'pending' or 'paid'
- **Validates:** Requirements 2.2, 2.3, 2.4

## Indexes

Indexes are created to optimize query performance for common access patterns:

### 1. idx_messages_slug
- **Type:** B-tree index
- **Column:** `slug`
- **Purpose:** Fast lookup of messages by slug (primary access pattern for viewing messages)
- **Query Pattern:** `SELECT * FROM messages WHERE slug = ?`

### 2. idx_messages_status
- **Type:** B-tree index
- **Column:** `status`
- **Purpose:** Fast filtering of messages by payment status
- **Query Pattern:** `SELECT * FROM messages WHERE status = ?`

### 3. idx_messages_stripe_session_id
- **Type:** B-tree index
- **Column:** `stripe_session_id`
- **Purpose:** Fast lookup of messages by Stripe session ID (for webhook processing)
- **Query Pattern:** `SELECT * FROM messages WHERE stripe_session_id = ?`

## Default Values

The following columns have default values automatically set by the database:

1. **id:** `gen_random_uuid()` - Auto-generates UUID v4
2. **status:** `'pending'` - New messages start as pending
3. **view_count:** `0` - Initialize view counter to zero
4. **created_at:** `NOW()` - Auto-set creation timestamp
5. **updated_at:** `NOW()` - Auto-set update timestamp

## Triggers

### update_messages_updated_at
- **Event:** BEFORE UPDATE
- **Action:** Automatically updates `updated_at` column to current timestamp
- **Purpose:** Ensures `updated_at` is always accurate without manual intervention
- **Validates:** Requirements 6.2

## Testing

### Running Constraint Tests

```bash
# Run all constraint tests
npm run test:constraints

# Verify constraints are properly configured
npm run db:verify-constraints
```

### Test Coverage

The constraint tests verify:

1. ✓ UNIQUE constraint prevents duplicate slugs
2. ✓ UNIQUE constraint allows multiple NULL slugs
3. ✓ NOT NULL constraints reject NULL values for required fields
4. ✓ NOT NULL constraints allow NULL for optional fields
5. ✓ CHECK constraint accepts valid status values ('pending', 'paid')
6. ✓ CHECK constraint rejects invalid status values
7. ✓ All required indexes exist
8. ✓ Primary key enforces uniqueness
9. ✓ Default values are properly set
10. ✓ updated_at trigger automatically updates timestamp

## Constraint Violations

### Duplicate Slug Error
```
ERROR: duplicate key value violates unique constraint "messages_slug_key"
```
**Cause:** Attempting to insert a message with a slug that already exists
**Solution:** Generate a new unique slug

### NOT NULL Violation
```
ERROR: null value in column "recipient_name" violates not-null constraint
```
**Cause:** Attempting to insert/update a message without required fields
**Solution:** Ensure all required fields are provided

### CHECK Constraint Violation
```
ERROR: new row for relation "messages" violates check constraint "messages_status_check"
```
**Cause:** Attempting to set status to a value other than 'pending' or 'paid'
**Solution:** Use only valid status values

## Performance Considerations

1. **Slug Index:** Enables O(log n) lookup time for message retrieval by slug
2. **Status Index:** Optimizes queries filtering by payment status
3. **Stripe Session Index:** Speeds up webhook processing by session ID
4. **Connection Pooling:** Database pool configured with max 20 connections

## Migration

All constraints and indexes are created by the migration file:
- `src/lib/migrations/001_create_messages_table.sql`

To apply constraints:
```bash
npm run db:migrate
```

To rollback:
```bash
npm run db:rollback
```

## Referential Integrity

**Validates:** Requirements 6.3

The database enforces referential integrity through:
- Primary key constraints
- UNIQUE constraints
- NOT NULL constraints
- CHECK constraints
- Foreign key constraints (if added in future)

All constraints work together to ensure data consistency and prevent invalid states.
