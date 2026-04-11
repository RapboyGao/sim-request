# Netlify + Supabase 部署检查清单

## Netlify

- Build command: `pnpm build`
- Publish directory: `dist`
- Node version: `20`

## Environment variables

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- Optional: `SUPABASE_BOOKINGS_TABLE=bookings`

## Supabase table

```sql
create table if not exists public.bookings (
  id uuid primary key,
  date text not null,
  slot text not null,
  name text not null,
  priority_level text not null default 'normal',
  created_at timestamptz not null default now(),
  status text not null default 'active'
);

create index if not exists bookings_date_slot_idx on public.bookings (date, slot);
create index if not exists bookings_created_at_idx on public.bookings (created_at);

alter table public.bookings
  add column if not exists priority_level text not null default 'normal';

-- Allowed values: specified | classmate | normal
```

## Local development

```bash
pnpm install
pnpm dev
```

Local data still uses `.data/bookings.json`.
