-- Improve performance for common queries
-- Reports lookup by user and soft deletion status
create index if not exists idx_reports_user_deleted on public.reports (user_id, deleted_at) where deleted_at is null;

-- Vulnerabilities lookup by report
create index if not exists idx_vulnerabilities_report_id on public.vulnerabilities (report_id);

-- JSONB GIN index for targets and vulnerability details for fast filtering if needed
create index if not exists idx_reports_targets_gin on public.reports using gin (targets);

-- Optimize client lookups
create index if not exists idx_clients_user_id on public.clients (user_id);

-- Optimize profile lookups
create index if not exists idx_profiles_id on public.profiles (id);
