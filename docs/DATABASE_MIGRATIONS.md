# Database Migration Guide

This guide explains how to work with database migrations in the PinoyWest Dating Platform.

## Prerequisites

Before running migrations, ensure you have:

1. **Supabase CLI installed**
   ```bash
   # On macOS
   brew install supabase/tap/supabase
   
   # On Linux
   curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
   sudo mv supabase /usr/local/bin/
   
   # On Windows
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   ```

2. **Docker installed and running** (required for local Supabase instance)
   - Download from: https://www.docker.com/products/docker-desktop

3. **PostgreSQL client (psql)** - for manual database inspection
   ```bash
   # On macOS
   brew install postgresql
   
   # On Ubuntu/Debian
   sudo apt-get install postgresql-client
   ```

## Running Migrations Locally

### 1. Start Local Supabase Instance

From the project root directory:

```bash
cd /path/to/PinoywestDatingPlatform
supabase start
```

This will:
- Start a local PostgreSQL database
- Apply all migrations from `supabase/migrations/`
- Start Supabase Studio (local admin UI)
- Start supporting services (Auth, Storage, etc.)

**Access Points:**
- API URL: `http://localhost:54321`
- DB URL: `postgresql://postgres:postgres@localhost:54322/postgres`
- Studio URL: `http://localhost:54323`
- Inbucket URL: `http://localhost:54324` (email testing)

### 2. Verify Migrations

Run the verification script to ensure all migrations are correct:

```bash
./scripts/verify-migrations.sh
```

This script will:
- ✅ Start a fresh Supabase instance
- ✅ Run all migrations
- ✅ Verify schema types (especially analytics_events.user_id is UUID)
- ✅ Check foreign key constraints
- ✅ Report any errors or warnings
- ✅ Clean up after verification

### 3. View Migration Status

To see which migrations have been applied:

```bash
supabase migration list
```

### 4. Reset Database (Fresh Start)

To reset the database and reapply all migrations:

```bash
supabase db reset
```

**⚠️ Warning:** This will delete all local data!

### 5. Stop Local Instance

When done:

```bash
supabase stop
```

## Creating New Migrations

### Automatic Migration from Schema Changes

1. Make changes to your database schema in Supabase Studio or via SQL
2. Generate a migration file:

```bash
supabase db diff -f <migration_name>
```

This creates a new migration file in `supabase/migrations/` with your changes.

### Manual Migration Creation

Create a new migration file manually:

```bash
supabase migration new <migration_name>
```

This creates a new empty migration file with a timestamp prefix.

**Example:**
```bash
supabase migration new add_user_preferences
```

Creates: `supabase/migrations/20250624123456_add_user_preferences.sql`

### Migration Best Practices

1. **Always use transactions** (migrations are wrapped automatically)
2. **Make migrations idempotent** - use `IF NOT EXISTS` / `IF EXISTS`
3. **Add rollback instructions** as comments
4. **Test locally first** before pushing
5. **Keep migrations focused** - one logical change per migration
6. **Document complex changes** with comments

**Example Migration:**
```sql
-- Add new column to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'en';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_preferred_language 
  ON public.profiles(preferred_language);

-- Update RLS policies if needed
-- ... policy changes here ...
```

## Schema Verification

### Verify Type Alignment

Our database uses UUID for user IDs. Verify alignment with:

```bash
# Connect to local database
psql "postgresql://postgres:postgres@localhost:54322/postgres"

# Check analytics_events.user_id type
\d analytics_events

# Verify it matches auth.users.id
\d auth.users
```

Expected output:
- `analytics_events.user_id` → `uuid`
- `auth.users.id` → `uuid`

### Check Foreign Key Constraints

```sql
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'analytics_events';
```

## CI/CD Integration

### Automated Migration Testing

Every pull request automatically runs migration verification via GitHub Actions.

**Workflow:** `.github/workflows/verify-migrations.yml`

The CI pipeline:
1. ✅ Starts a fresh Supabase instance
2. ✅ Runs all migrations in order
3. ✅ Verifies schema types
4. ✅ Checks constraints
5. ✅ Fails the PR if any errors occur

**How to see CI results:**
1. Open your PR on GitHub
2. Scroll to "Checks" section
3. View "Database Migration Verification" status
4. Click "Details" to see logs

### Manual Workflow Trigger

You can manually run the migration verification workflow:

1. Go to GitHub Actions tab
2. Select "Database Migration Verification"
3. Click "Run workflow"
4. Select branch and run

## Troubleshooting

### Migration Fails Locally

**Error: "Supabase CLI not found"**
```bash
# Install Supabase CLI (see Prerequisites)
```

**Error: "Docker daemon not running"**
```bash
# Start Docker Desktop
```

**Error: "Port already in use"**
```bash
# Stop existing Supabase instance
supabase stop

# Or kill specific port usage
lsof -ti:54321 | xargs kill -9
```

**Error: "Migration already applied"**
```bash
# Reset database and start fresh
supabase db reset
```

### Type Mismatch Errors

If you see type mismatches between `analytics_events.user_id` and `auth.users.id`:

1. Check the column definition:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'analytics_events' 
   AND column_name = 'user_id';
   ```

2. The type should be `uuid`. If it's not:
   - Review migration files for any type changes
   - Check if redundant migrations conflict
   - Consult with team before making changes

### Viewing Logs

**Local logs:**
```bash
supabase status
docker logs supabase_db_<project_id>
```

**CI logs:**
- GitHub Actions → Workflow runs → Click on specific run

## Remote Database Operations

### Connecting to Dev/Staging Database

⚠️ **Caution:** Only run migrations on remote databases through proper CI/CD.

To link to a remote Supabase project:

```bash
supabase link --project-ref <project-ref>
```

To push migrations to remote:

```bash
supabase db push
```

**Best Practice:** Use CI/CD for remote deployments, not manual pushes.

## Migration Checklist

Before creating a PR with migrations:

- [ ] Migrations run successfully locally (`supabase db reset`)
- [ ] Verification script passes (`./scripts/verify-migrations.sh`)
- [ ] Schema types verified (UUID alignment)
- [ ] Foreign key constraints are correct
- [ ] Migrations are idempotent (can run multiple times)
- [ ] RLS policies updated if needed
- [ ] Indexes added for new columns (if queried frequently)
- [ ] Documentation updated (if schema changes affect docs)
- [ ] CI check passes on PR

## Additional Resources

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Database Migrations Guide](https://supabase.com/docs/guides/database/migrations)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## Support

For issues or questions:
- Create an issue on GitHub
- Check existing migrations for examples
- Review the base migration: `supabase/migrations/20250628220633_billowing_dawn.sql`
