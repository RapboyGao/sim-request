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

## EdgeOne Pages 生产配置

项目以 EdgeOne Pages 纯前端 + Functions 方式部署：

1. 代码仓库直接导入 EdgeOne Pages。
2. 构建命令使用 `pnpm build`。
3. 安装命令使用 `pnpm install --frozen-lockfile`。
4. 项目根目录的 `edgeone.json` 已提供默认构建配置。
5. `.edgeone/cloud-functions/ssr-node/config.json` 用于 SSR 运行配置。
6. 在控制台创建并绑定 Pages KV，绑定名使用 `BOOKING_KV`。
7. 线上运行时只读写 `BOOKING_KV`，本地仍使用 `.data/bookings.json`。

## 导出接口

- CSV: `/api/admin/export?format=csv`
- JSON: `/api/admin/export?format=json`
