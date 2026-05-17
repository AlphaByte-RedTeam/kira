-- Alter reports
alter table public.reports 
rename column target_list to targets; -- targets will hold jsonb of {host, ip}[]
alter table public.reports 
add column if not exists client_id uuid references public.clients;

-- Soft delete column was already added in init_schema.sql
