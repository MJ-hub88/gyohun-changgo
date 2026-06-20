create table if not exists public.lessons (
  id uuid default gen_random_uuid() primary key,
  level1 text not null,
  level2 text not null,
  level3 text,
  level4 text,
  project_name text not null,
  evaluation_name text,
  factor_type text not null check (factor_type in ('작동요인', '비작동요인', '개선사항')),
  content text not null,
  author text,
  follow_up_type text,
  responsible text,
  monitoring_result text,
  monitoring_status text check (monitoring_status in ('반영', '미반영', '진행중') or monitoring_status is null),
  created_at timestamptz default now()
);

alter table public.lessons enable row level security;

create policy "anyone can read" on public.lessons for select using (true);
create policy "anyone can insert" on public.lessons for insert with check (true);
create policy "anyone can update" on public.lessons for update using (true);
create policy "anyone can delete" on public.lessons for delete using (true);
