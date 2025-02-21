-- Add auth_id column to Clients table
ALTER TABLE "Clients" ADD COLUMN auth_id UUID REFERENCES auth.users(id);

-- Create a unique index on auth_id to ensure one-to-one relationship
CREATE UNIQUE INDEX clients_auth_id_idx ON "Clients"(auth_id);

-- Remove the password column since we're using Supabase Auth
ALTER TABLE "Clients" DROP COLUMN IF EXISTS "Password";
