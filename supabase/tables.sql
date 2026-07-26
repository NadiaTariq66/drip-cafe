-- Digital Coffee Table — physical QR → interactive table session

create table if not exists cafe_tables (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  label text not null,
  zone text default 'Main Room',
  seats integer default 2,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists table_sessions (
  id uuid primary key default gen_random_uuid(),
  table_code text not null references cafe_tables(code) on delete cascade,
  status text default 'open' check (status in ('open','dining','closing','closed')),
  guest_name text,
  current_drink text,
  current_item text,
  order_status text default 'idle' check (order_status in ('idle','received','brewing','on_the_way','served','billed')),
  order_note text,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists table_requests (
  id uuid primary key default gen_random_uuid(),
  table_code text not null,
  session_id uuid references table_sessions(id) on delete set null,
  kind text not null check (kind in ('waiter','bill','water','feedback')),
  message text,
  status text default 'open' check (status in ('open','acked','done')),
  created_at timestamptz default now()
);

alter table cafe_tables enable row level security;
alter table table_sessions enable row level security;
alter table table_requests enable row level security;

create policy "Public read tables" on cafe_tables for select using (true);
create policy "Public read sessions" on table_sessions for select using (true);
create policy "Public update sessions" on table_sessions for update using (true);
create policy "Public insert sessions" on table_sessions for insert with check (true);
create policy "Public read requests" on table_requests for select using (true);
create policy "Public insert requests" on table_requests for insert with check (true);
create policy "Public update requests" on table_requests for update using (true);

alter publication supabase_realtime add table table_sessions;
alter publication supabase_realtime add table table_requests;

insert into cafe_tables (code, label, zone, seats) values
  ('G01', 'Table G01', 'Window', 2),
  ('G02', 'Table G02', 'Window', 2),
  ('G07', 'Table G07', 'Long Table', 4),
  ('G12', 'Table G12', 'Courtyard', 2),
  ('W03', 'Walnut 03', 'Walnut Room', 4),
  ('B01', 'Bar 01', 'Brew Bar', 1)
on conflict (code) do nothing;
