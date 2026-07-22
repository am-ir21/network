-- 1. CLEAN SLATE ------------------------------------------------------
DROP TABLE IF EXISTS payment_history CASCADE;
DROP TABLE IF EXISTS subscribers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. EXTENSIONS ---------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 3. TABLES -------------------------------------------------------------

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'collector')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subscription_fee numeric NOT NULL DEFAULT 0,
  paid_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'red' CHECK (status IN ('red', 'yellow', 'green')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE payment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  collector_id uuid REFERENCES users(id) ON DELETE SET NULL,
  amount_paid numeric NOT NULL,
  previous_paid_amount numeric NOT NULL,
  previous_status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  received_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_history_subscriber ON payment_history(subscriber_id);
CREATE INDEX idx_payment_history_created_at ON payment_history(created_at);
CREATE INDEX idx_payment_history_received_at ON payment_history(received_at);
CREATE INDEX idx_subscribers_status ON subscribers(status);

-- 4. TRIGGER: auto-update subscriber on new payment ----------------------

CREATE OR REPLACE FUNCTION apply_payment()
RETURNS TRIGGER AS $$
DECLARE
  v_fee numeric;
  v_new_paid numeric;
  v_new_status text;
BEGIN
  SELECT subscription_fee, paid_amount
  INTO v_fee, NEW.previous_paid_amount
  FROM subscribers WHERE id = NEW.subscriber_id
  FOR UPDATE;

  SELECT status INTO NEW.previous_status
  FROM subscribers WHERE id = NEW.subscriber_id;

  v_new_paid := NEW.previous_paid_amount + NEW.amount_paid;

  IF v_new_paid <= 0 THEN
    v_new_status := 'red';
  ELSIF v_new_paid >= v_fee THEN
    v_new_status := 'green';
  ELSE
    v_new_status := 'yellow';
  END IF;

  UPDATE subscribers
  SET paid_amount = v_new_paid,
      status = v_new_status,
      updated_at = now()
  WHERE id = NEW.subscriber_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_apply_payment
BEFORE INSERT ON payment_history
FOR EACH ROW
EXECUTE FUNCTION apply_payment();

-- 5. FUNCTION: undo a payment --------------------------------------------

CREATE OR REPLACE FUNCTION undo_payment(p_payment_id uuid)
RETURNS void AS $$
DECLARE
  v_row payment_history%ROWTYPE;
BEGIN
  SELECT * INTO v_row FROM payment_history WHERE id = p_payment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment record % not found', p_payment_id;
  END IF;

  UPDATE subscribers
  SET paid_amount = v_row.previous_paid_amount,
      status = v_row.previous_status,
      updated_at = now()
  WHERE id = v_row.subscriber_id;

  DELETE FROM payment_history WHERE id = p_payment_id;
END;
$$ LANGUAGE plpgsql;

-- 6. DISABLE RLS (frontend handles all authorization logic) -------------

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history DISABLE ROW LEVEL SECURITY;

-- 7. SEED DATA ------------------------------------------------------------

INSERT INTO users (username, password, role)
VALUES ('admin', '1', 'admin');

-- Optional example collector account (uncomment to use):
-- INSERT INTO users (username, password, role) VALUES ('collector1', '1', 'collector');