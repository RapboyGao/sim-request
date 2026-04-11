# sim-request

Nuxt 4 + Vuetify 预约模拟机观摩时段系统。

## 开发

```bash
pnpm install
pnpm dev
```

## 构建

```bash
pnpm build
```

## 本地 JSON 数据库

本地调试默认写入 `.data/bookings.json`，不会使用 KV。

## Netlify + Supabase 生产配置

1. 将仓库导入 Netlify。
2. 构建命令使用 `pnpm build`。
3. 发布目录使用 `.output/public`。
4. 准备 Supabase 数据库表，并配置环境变量：
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - 可选：`SUPABASE_BOOKINGS_TABLE`，默认 `bookings`
5. 本地仍使用 `.data/bookings.json`，线上优先使用 Supabase。

## 导出接口

- CSV: `/api/admin/export?format=csv`
- JSON: `/api/admin/export?format=json`
