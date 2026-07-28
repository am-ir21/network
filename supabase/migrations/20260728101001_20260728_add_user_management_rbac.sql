/*
# User Management & Role-Based Access Control (RBAC)

## Purpose
Extends the existing `users` table to support a full user-management system
with multiple roles, account activation/deactivation, last-login tracking,
and email addresses.

## Changes to the `users` table
1. `email` (text, UNIQUE) — login identifier alongside username.
2. `is_active` (boolean, default true) — lets admins enable/disable accounts
   without deleting them. Disabled accounts cannot log in.
3. `last_login` (timestamptz, nullable) — timestamp of the user's most recent
   successful login. Updated by the frontend on each login.
4. Role CHECK constraint expanded from ('admin','collector') to
   ('admin','data_entry','viewer'). Existing 'collector' rows are migrated
   to 'data_entry' so no data is lost.

## Security
- RLS remains DISABLED on all tables (this app uses a custom auth model with
  plaintext passwords stored in `users`; authorization is enforced in the
  frontend). This is the existing design and is not changed here.
- No new tables are created.

## Notes
- The migration is idempotent: each ALTER uses `IF NOT EXISTS` / conditional
  logic so re-running is safe.
- The old role 'collector' is mapped to 'data_entry' (data entry / sales clerk).
*/

-- 1. Add new columns (idempotent) ---------------------------------------
ALTER TABLE users ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login timestamptz;

-- 2. Enforce unique email (only when non-null) ---------------------------
DROP INDEX IF EXISTS users_email_unique;
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (email) WHERE email IS NOT NULL;

-- 3. Expand role CHECK constraint ----------------------------------------
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

UPDATE users SET role = 'data_entry' WHERE role = 'collector';

ALTER TABLE users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'data_entry', 'viewer'));

-- 4. Backfill email for existing users from username (if email is null) --
UPDATE users SET email = username WHERE email IS NULL;
