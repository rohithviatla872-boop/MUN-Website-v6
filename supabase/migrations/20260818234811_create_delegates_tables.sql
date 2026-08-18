/*
# Create delegates tables for MUN website

This migration sets up the data layer for managing MUN conference delegates.
There are two distinct delegate populations, each with its own table:

1. Ambitus delegates — internal/home delegates of the host institution.
2. External delegates — delegates visiting from other institutions.

Each table captures personal details and allocation preferences, plus the
final committee/portfolio assignment set by the organizing team.

## Tables

### ambitus_delegates
- id (uuid, primary key)
- full_name (text, not null) — delegate's full name
- email (text) — contact email
- phone (text) — contact phone number
- institution (text) — host institution name
- class_year (text) — class / year of study
- experience (text) — prior MUN experience description
- preferred_committee_1 (text) — first committee preference
- preferred_committee_2 (text) — second committee preference
- preferred_portfolio_1 (text) — first portfolio preference
- preferred_portfolio_2 (text) — second portfolio preference
- allocated_committee (text) — final assigned committee
- allocated_portfolio (text) — final assigned portfolio / country
- status (text, default 'pending') — pending / confirmed / withdrawn
- notes (text) — internal notes from organizers
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())

### external_delegates
- id (uuid, primary key)
- full_name (text, not null) — delegate's full name
- email (text) — contact email
- phone (text) — contact phone number
- institution (text) — delegate's home institution (external)
- accommodation_required (boolean, default false) — needs accommodation?
- experience (text) — prior MUN experience description
- preferred_committee_1 (text) — first committee preference
- preferred_committee_2 (text) — second committee preference
- preferred_portfolio_1 (text) — first portfolio preference
- preferred_portfolio_2 (text) — second portfolio preference
- allocated_committee (text) — final assigned committee
- allocated_portfolio (text) — final assigned portfolio / country
- status (text, default 'pending') — pending / confirmed / withdrawn
- notes (text) — internal notes from organizers
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())

## Security
This is a single-tenant management app (no sign-in screen). RLS is enabled
on both tables with anon+authenticated CRUD access because the data is
intentionally shared among the organizing team using the app.
*/

CREATE TABLE IF NOT EXISTS ambitus_delegates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text,
  phone text,
  institution text,
  class_year text,
  experience text,
  preferred_committee_1 text,
  preferred_committee_2 text,
  preferred_portfolio_1 text,
  preferred_portfolio_2 text,
  allocated_committee text,
  allocated_portfolio text,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ambitus_delegates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_ambitus_delegates" ON ambitus_delegates;
CREATE POLICY "anon_select_ambitus_delegates"
  ON ambitus_delegates FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_ambitus_delegates" ON ambitus_delegates;
CREATE POLICY "anon_insert_ambitus_delegates"
  ON ambitus_delegates FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_ambitus_delegates" ON ambitus_delegates;
CREATE POLICY "anon_update_ambitus_delegates"
  ON ambitus_delegates FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_ambitus_delegates" ON ambitus_delegates;
CREATE POLICY "anon_delete_ambitus_delegates"
  ON ambitus_delegates FOR DELETE
  TO anon, authenticated USING (true);


CREATE TABLE IF NOT EXISTS external_delegates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text,
  phone text,
  institution text,
  accommodation_required boolean NOT NULL DEFAULT false,
  experience text,
  preferred_committee_1 text,
  preferred_committee_2 text,
  preferred_portfolio_1 text,
  preferred_portfolio_2 text,
  allocated_committee text,
  allocated_portfolio text,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE external_delegates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_external_delegates" ON external_delegates;
CREATE POLICY "anon_select_external_delegates"
  ON external_delegates FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_external_delegates" ON external_delegates;
CREATE POLICY "anon_insert_external_delegates"
  ON external_delegates FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_external_delegates" ON external_delegates;
CREATE POLICY "anon_update_external_delegates"
  ON external_delegates FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_external_delegates" ON external_delegates;
CREATE POLICY "anon_delete_external_delegates"
  ON external_delegates FOR DELETE
  TO anon, authenticated USING (true);
