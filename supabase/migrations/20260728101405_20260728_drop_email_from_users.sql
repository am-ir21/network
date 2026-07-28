/*
# Remove email column from users table

## Purpose
The user management system has been simplified to use only username + password
(no email). The email column is no longer needed and is removed.

## Changes
- Drops the `email` column from the `users` table.
- Drops the partial unique index `users_email_unique`.

## Notes
- This is a destructive operation requested explicitly by the user.
- The migration is idempotent (safe to re-run).
*/

DROP INDEX IF EXISTS users_email_unique;
ALTER TABLE users DROP COLUMN IF EXISTS email;
