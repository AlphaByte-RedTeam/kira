-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create tables
create table public.reports (
    id uuid primary key,
    user_id uuid references auth.users not null,
    title text not null,
    client_name text,
    executive_summary text,
    target_list text,
    confidentiality_statement text,
    logo_url text,
    status text check (status in ('draft', 'published', 'archived')) default 'draft',
    deleted_at timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table public.vulnerabilities (
    id uuid primary key,
    report_id uuid references public.reports on delete cascade not null,
    synopsis text not null,
    description text not null,
    impact text not null,
    mitigation text not null,
    cvss_vector text,
    cvss_score numeric,
    severity text,
    order_index integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS
alter table public.reports enable row level security;
alter table public.vulnerabilities enable row level security;

-- Policies for reports
create policy "Users can perform all actions on their own reports"
    on public.reports
    for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Policies for vulnerabilities
create policy "Users can perform all actions on vulnerabilities of their reports"
    on public.vulnerabilities
    for all
    using (
        exists (
            select 1 from public.reports
            where reports.id = vulnerabilities.report_id
            and reports.user_id = auth.uid()
        )
    )
    with check (
        exists (
            select 1 from public.reports
            where reports.id = vulnerabilities.report_id
            and reports.user_id = auth.uid()
        )
    );

-- Function for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger on_reports_updated
    before update on public.reports
    for each row
    execute procedure public.handle_updated_at();

create trigger on_vulnerabilities_updated
    before update on public.vulnerabilities
    for each row
    execute procedure public.handle_updated_at();

-- Storage bucket for logos and attachments
insert into storage.buckets (id, name, public)
values ('reports', 'reports', false);

-- Storage policies
create policy "Users can upload report assets"
    on storage.objects
    for insert
    with check (
        bucket_id = 'reports' 
        and (auth.uid()::text = (storage.foldername(name))[1])
    );

create policy "Users can view their own report assets"
    on storage.objects
    for select
    using (
        bucket_id = 'reports' 
        and (auth.uid()::text = (storage.foldername(name))[1])
    );

create policy "Users can update their own report assets"
    on storage.objects
    for update
    using (
        bucket_id = 'reports' 
        and (auth.uid()::text = (storage.foldername(name))[1])
    );

create policy "Users can delete their own report assets"
    on storage.objects
    for delete
    using (
        bucket_id = 'reports' 
        and (auth.uid()::text = (storage.foldername(name))[1])
    );
