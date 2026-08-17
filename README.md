# sim-request

Nuxt 4 + Vuetify 预约模拟机观摩时段系统。

## 环境变量

复制 `.env.example` 为 `.env.local`，再填写本地开发所需值。`.env.local` 不要提交到仓库。

| 变量 | 必需 | 说明 |
| --- | --- | --- |
| `SUPABASE_URL` | 生产必需 | Supabase 项目 URL |
| `SUPABASE_PUBLISHABLE_KEY` | 生产必需 | Supabase publishable/anon key，仅用于健康检查配置确认 |
| `SUPABASE_SECRET_KEY` | 生产必需 | Supabase service role key，只能放在 Netlify Functions 环境变量中 |
| `SUPABASE_BOOKINGS_TABLE` | 可选 | 预约表名，默认 `bookings` |
| `ADMIN_USERNAME` | 生产必需 | 管理页面登录用户名 |
| `ADMIN_PASSWORD` | 生产必需 | 管理页面登录密码，必须使用强密码 |
| `NUXT_PUBLIC_CHECKLISTS_PASSWORD` | 可选 | 私密检查单 URL 参数，默认 `13515`；它不是服务端鉴权 |
| `BOOKING_STORAGE_FILE` | 本地可选 | 本地 JSON 数据文件路径，生产环境不使用 |

Netlify 不会自动读取仓库中的 `.env` 文件。生产环境请在 Netlify 项目的 **Project configuration → Environment variables** 中配置变量，并确保变量同时可用于 **Builds** 和 **Functions**；修改变量后需要重新部署。`SUPABASE_SECRET_KEY` 和 `ADMIN_PASSWORD` 应标记为 secret。

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

本地开发时，如果没有配置 Supabase，预约 API 使用本地 JSON；管理页仍需要配置 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD` 才能登录。

## 生产部署

### Netlify + Supabase

1. 将仓库导入 Netlify。
2. 使用仓库中的 `netlify.toml`：构建命令为 `pnpm build`，发布目录为 `dist`，Node.js 版本为 `20`。
3. Netlify 会根据 `packageManager` 使用 pnpm；如果项目设置了自定义构建环境，请确保 pnpm `10.11.0` 可用。
4. 准备 Supabase 数据库表，SQL 见 [`docs/netlify-supabase.md`](docs/netlify-supabase.md)。
5. 在 Netlify 环境变量中配置：
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `NUXT_PUBLIC_CHECKLISTS_PASSWORD`（可选）
   - `SUPABASE_BOOKINGS_TABLE`（可选，默认 `bookings`）
6. 部署完成后访问 `https://<你的站点域名>/api/health`，确认 `productionReady: true`，且 `supabase.url`、`supabase.publishableKey`、`supabase.secretKey`、`admin.credentials` 均为 `true`。
7. 首次上线后验证：公开检查单、私密检查单、气压/空速换算、管理页登录，以及在线访问后断网刷新检查单页面。
8. PWA 离线页面需要先在线打开一次；预约提交、按人查看和预约日历依赖在线 API，不纳入离线保证。

注意：旧版本源码中的管理密码如果曾经被使用过，应在上线前立即更换；删除源码中的硬编码不会使已经泄露的旧密码失效。

### EdgeOne Pages + Supabase

1. 将仓库导入 EdgeOne Pages。
2. 构建命令使用 `pnpm build`。
3. 输出目录使用 `dist`。
4. 配置同一组 Supabase 环境变量：
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - 可选：`NUXT_PUBLIC_CHECKLISTS_PASSWORD`
   - 可选：`SUPABASE_BOOKINGS_TABLE`
5. 数据库仍然只使用 Supabase，不使用 EdgeOne KV。
6. EdgeOne Node 版本建议使用 `20`。

## 导出接口

- CSV: `/api/admin/export?format=csv`
- JSON: `/api/admin/export?format=json`

## 上线前检查

```bash
pnpm install --frozen-lockfile
pnpm test:unit
pnpm typecheck
pnpm build
git diff --check
```

生产部署前不要提交 `.env.local`、Supabase secret key 或管理密码；仓库只提交 `.env.example`。
