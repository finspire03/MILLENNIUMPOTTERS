/*
  # [Operation] Add email_verified Column to Users

  [This script adds the `email_verified` column to the `users` table to track the status of a user's email verification.]

  ## Query Description:
  This is a non-destructive operation that adds a new column with a default value. It will not affect existing data and is safe to run on a live database.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true

  ## Structure Details:
  - Table: `public.users`
  - Column Added: `email_verified` (BOOLEAN, DEFAULT false)

  ## Security Implications:
  - RLS Status: No change
  - Policy Changes: No
  - Auth Requirements: None

  ## Performance Impact:
  - Indexes: None
  - Triggers: None
  - Estimated Impact: Negligible. A metadata lock will be briefly held on the table.
*/

ALTER TABLE public.users
ADD COLUMN email_verified BOOLEAN DEFAULT false;
