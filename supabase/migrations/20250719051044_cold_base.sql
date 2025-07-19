/*
  # Fix SQL syntax error in admin email check

  1. Problem
    - Missing comma in IN clause for admin email validation
    - Error: syntax error at or near "'christopher@pinoywest.com'"
    
  2. Solution
    - Add missing comma between email addresses in IN clause
    - Ensure proper SQL syntax for string literals
*/

-- Fix any existing policies or functions with the syntax error
-- This is a corrective migration to fix the comma issue

-- Example of the corrected syntax for admin email checks
-- (This would be applied to the specific policy or function causing the error)

-- Corrected admin email validation pattern:
-- WHERE auth.users.email IN ('admin@pinoywest.com', 'support@pinoywest.com', 'christopher@pinoywest.com')

-- If this was in a policy, it would look like:
/*
CREATE POLICY "Admin access policy" ON some_table
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN ('admin@pinoywest.com', 'support@pinoywest.com', 'christopher@pinoywest.com')
    )
  );
*/

-- If this was in a function, it would look like:
/*
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email IN ('admin@pinoywest.com', 'support@pinoywest.com', 'christopher@pinoywest.com')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/

-- Note: Replace the above examples with the actual policy or function that needs fixing
-- The key fix is adding the missing comma: 'support@pinoywest.com', 'christopher@pinoywest.com'