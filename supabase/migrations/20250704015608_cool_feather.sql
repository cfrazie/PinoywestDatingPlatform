/*
  # Fix Admin Policy Syntax Error

  1. Changes
    - Fix syntax error in the "Admins can read all contact submissions" policy
    - Add missing comma between email addresses in the IN clause
*/

-- Drop the existing policy with the syntax error
DROP POLICY IF EXISTS "Admins can read all contact submissions" ON contact_submissions;

-- Recreate the policy with correct syntax
CREATE POLICY "Admins can read all contact submissions" ON contact_submissions
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN ('admin@pinoywest.com', 'support@pinoywest.com', 'christopher@pinoywest.com')
    )
  );