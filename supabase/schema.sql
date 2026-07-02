create table aqi_records (
  id bigint generated always as identity primary key,
  site_name text,
  county text,
  aqi integer,
  status text,
  pm25 numeric,
  publish_time text,
  fetched_at timestamptz not null default now()
);

alter table aqi_records enable row level security;

create policy "Allow public read" on aqi_records
  for select using (true);
