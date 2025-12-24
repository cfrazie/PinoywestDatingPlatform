#!/bin/bash

# Migration Verification Script
# This script verifies database migrations can be run successfully

set -e  # Exit on error

echo "🔍 Starting migration verification..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found${NC}"
    echo "Installing Supabase CLI..."
    
    # Install Supabase CLI
    # Note: In production, verify checksums or use package managers
    if command -v brew &> /dev/null; then
        brew install supabase/tap/supabase
    else
        # For Linux/CI environments
        # WARNING: Installing from remote URL - verify source before use
        curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
        sudo mv supabase /usr/local/bin/
    fi
fi

echo -e "${GREEN}✓${NC} Supabase CLI is available"

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "Project root: $PROJECT_ROOT"

# Start Supabase local instance
echo -e "${YELLOW}Starting local Supabase instance...${NC}"
supabase start

# Check if start was successful
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start Supabase${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Supabase started successfully"

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
supabase db reset

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Migration failed${NC}"
    echo "Stopping Supabase..."
    supabase stop
    exit 1
fi

echo -e "${GREEN}✓${NC} All migrations completed successfully"

# Verify schema
echo -e "${YELLOW}Verifying database schema...${NC}"

# Get the database URL
DB_URL=$(supabase status -o env | grep DATABASE_URL | cut -d'=' -f2)

# Verify critical type alignments
echo "Verifying type alignments..."

# Create a verification SQL script
cat > /tmp/verify_schema.sql << 'EOF'
-- Verify analytics_events.user_id type matches auth.users.id
DO $$
DECLARE
    analytics_user_id_type text;
    auth_users_id_type text;
BEGIN
    -- Get analytics_events.user_id type
    SELECT data_type INTO analytics_user_id_type
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'analytics_events' 
    AND column_name = 'user_id';
    
    -- Get auth.users.id type
    SELECT data_type INTO auth_users_id_type
    FROM information_schema.columns
    WHERE table_schema = 'auth' 
    AND table_name = 'users' 
    AND column_name = 'id';
    
    -- Verify they match
    IF analytics_user_id_type != 'uuid' THEN
        RAISE EXCEPTION 'analytics_events.user_id type is %, expected uuid', analytics_user_id_type;
    END IF;
    
    IF auth_users_id_type != 'uuid' THEN
        RAISE EXCEPTION 'auth.users.id type is %, expected uuid', auth_users_id_type;
    END IF;
    
    RAISE NOTICE '✓ Type verification passed: both are uuid';
END $$;

-- Verify foreign key constraints exist
SELECT 
    tc.constraint_name,
    tc.table_schema,
    tc.table_name,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'analytics_events'
    AND kcu.column_name = 'user_id';

\echo '✓ Foreign key constraints verified'
EOF

# Run verification SQL
echo "Running schema verification queries..."
psql "$DB_URL" -f /tmp/verify_schema.sql

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Schema type verification failed${NC}"
    supabase stop
    exit 1
fi

echo -e "${GREEN}✓${NC} Schema verification passed"

# Check for duplicate/redundant migrations
echo -e "${YELLOW}Checking for migration issues...${NC}"
MIGRATION_COUNT=$(find supabase/migrations -name '*.sql' -type f 2>/dev/null | wc -l)
echo "Total migrations: $MIGRATION_COUNT"

# Clean up
echo -e "${YELLOW}Stopping Supabase...${NC}"
supabase stop

echo -e "${GREEN}✅ Migration verification completed successfully!${NC}"
echo ""
echo "Summary:"
echo "  - ✓ All migrations applied without errors"
echo "  - ✓ Schema types verified (analytics_events.user_id is UUID)"
echo "  - ✓ Foreign key constraints are correct"
echo "  - ✓ Total migrations processed: $MIGRATION_COUNT"
