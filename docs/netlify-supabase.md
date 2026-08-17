# Netlify + Supabase 部署检查清单

## Netlify

- Build command: `pnpm build`
- Publish directory: `dist`
- Node version: `20`
- The repository `packageManager` pins pnpm to `10.11.0`; do not commit production secrets.

## Environment variables

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- Optional: `SUPABASE_BOOKINGS_TABLE=bookings`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

Configure these in Netlify Project configuration → Environment variables and make them available to both Builds and Functions. Mark `SUPABASE_SECRET_KEY` and `ADMIN_PASSWORD` as secret values. The secret key must be the Supabase server/service-role key and must never be exposed through `runtimeConfig.public`.

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
cp .env.example .env.local
pnpm install
pnpm dev
```

Fill in `ADMIN_USERNAME` and `ADMIN_PASSWORD` to use the admin page locally. Without Supabase variables, local development uses `.data/bookings.json`; production must have all Supabase and admin variables configured.

After deployment, check `/api/health`. A ready deployment returns `productionReady: true` and `true` for the Supabase URL, publishable key, secret key, and admin credentials. The PWA shell is cached after the first online visit, so all page interfaces can open offline; booking submission, calendar data, and people data still require the booking API connection.
