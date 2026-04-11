# EdgeOne Pages 部署说明

## 构建配置

- Framework: `Nuxt`
- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm build`
- Output directory: `dist`
- Node version: `20`

## 环境变量

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- Optional: `SUPABASE_BOOKINGS_TABLE=bookings`

## 数据库

数据库仍然使用 Supabase，不使用 EdgeOne KV。

表结构：

```sql
create table if not exists public.bookings (
  id uuid primary key,
  date text not null,
  slot text not null,
  name text not null,
  is_student boolean not null default false,
  created_at timestamptz not null default now(),
  status text not null default 'active'
);

create index if not exists bookings_date_slot_idx on public.bookings (date, slot);
create index if not exists bookings_created_at_idx on public.bookings (created_at);
```

## 备注

- 生产环境先检查 `/api/health`
- 本地开发仍然使用 `.data/bookings.json`
