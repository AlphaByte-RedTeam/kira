-- Clean up reports table by removing redundant columns
ALTER TABLE public.reports 
DROP COLUMN IF EXISTS logo_url,
DROP COLUMN IF EXISTS confidentiality_statement,
DROP COLUMN IF EXISTS target_list,
DROP COLUMN IF EXISTS target_data,
DROP COLUMN IF EXISTS client_name;
