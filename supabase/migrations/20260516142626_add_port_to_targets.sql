-- Note: No DB schema change needed as 'targets' is JSONB.
-- Adding a comment for documentation.
comment on column public.reports.targets is 'Stores array of {id, host, ip, port} objects';
