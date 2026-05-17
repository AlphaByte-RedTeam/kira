-- Clients table
create table public.clients (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users on delete cascade not null,
    name text not null,
    created_at timestamptz default now()
);

alter table public.clients enable row level security;

create policy "Users can manage their own clients"
    on public.clients for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
