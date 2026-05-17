-- Remove foreign key constraint that requires a report to exist
ALTER TABLE public.drafts DROP CONSTRAINT IF EXISTS drafts_report_id_fkey;

-- Since report_id is the primary key, ensure it's not strictly tied to the reports table
-- We keep the column as it is our unique draft identifier.
