/*
  # Create Deployment Status Table

  1. New Tables
    - `deployment_status`
      - `id` (uuid, primary key)
      - `deploy_id` (text, unique)
      - `status` (text)
      - `deploy_url` (text)
      - `claim_url` (text)
      - `claimed` (boolean)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
  2. Security
    - Enable RLS on `deployment_status` table
    - Add policy for authenticated users to read deployment status
*/

CREATE TABLE IF NOT EXISTS deployment_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deploy_id text UNIQUE NOT NULL,
  status text NOT NULL,
  deploy_url text,
  claim_url text,
  claimed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE deployment_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read deployment status"
  ON deployment_status
  FOR SELECT
  TO authenticated
  USING (true);

-- Add trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_deployment_status_updated_at
BEFORE UPDATE ON deployment_status
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();