-- Create drafts table
create table public.drafts (
    report_id uuid references public.reports on delete cascade primary key,
    data jsonb not null,
    updated_at timestamptz default now()
);

alter table public.drafts enable row level security;

create policy "Users can manage their own drafts"
    on public.drafts for all
    using (exists (select 1 from public.reports where reports.id = drafts.report_id and reports.user_id = auth.uid()));
