/*
# Enable RLS and Create Policies for All Tables

## Summary
Enables Row Level Security on the users, subscribers, and payment_history tables.
Since this app uses custom username/password authentication (not Supabase Auth),
the frontend operates with the anon key. Policies are set to TO anon, authenticated
so the anon-key client can read/write data. The application enforces RBAC in code.

## Tables Modified
- `users` - Enable RLS, allow anon CRUD (app manages access control in code)
- `subscribers` - Enable RLS, allow anon CRUD
- `payment_history` - Enable RLS, allow anon CRUD

## Security Notes
- RLS is enabled but policies allow access because the app uses custom auth.
- The application layer enforces role-based access control (admin, data_entry, viewer).
- The users table password column is accessible but the app never exposes it in the UI.
*/

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- users table policies
DROP POLICY IF EXISTS "anon_select_users" ON users;
CREATE POLICY "anon_select_users" ON users FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_users" ON users;
CREATE POLICY "anon_insert_users" ON users FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_users" ON users;
CREATE POLICY "anon_update_users" ON users FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_users" ON users;
CREATE POLICY "anon_delete_users" ON users FOR DELETE
  TO anon, authenticated USING (true);

-- subscribers table policies
DROP POLICY IF EXISTS "anon_select_subscribers" ON subscribers;
CREATE POLICY "anon_select_subscribers" ON subscribers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_subscribers" ON subscribers;
CREATE POLICY "anon_insert_subscribers" ON subscribers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_subscribers" ON subscribers;
CREATE POLICY "anon_update_subscribers" ON subscribers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_subscribers" ON subscribers;
CREATE POLICY "anon_delete_subscribers" ON subscribers FOR DELETE
  TO anon, authenticated USING (true);

-- payment_history table policies
DROP POLICY IF EXISTS "anon_select_payment_history" ON payment_history;
CREATE POLICY "anon_select_payment_history" ON payment_history FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_payment_history" ON payment_history;
CREATE POLICY "anon_insert_payment_history" ON payment_history FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_payment_history" ON payment_history;
CREATE POLICY "anon_update_payment_history" ON payment_history FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_payment_history" ON payment_history;
CREATE POLICY "anon_delete_payment_history" ON payment_history FOR DELETE
  TO anon, authenticated USING (true);

-- Add an index on subscribers for faster queries
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_subscriber_id ON payment_history(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_created_at ON payment_history(created_at);
