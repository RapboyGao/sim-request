# EdgeOne Pages 部署说明

## 运行模式

- 本地开发：使用 `.data/bookings.json`
- 线上部署：使用 EdgeOne Pages KV，绑定名默认是 `BOOKING_KV`

## 部署步骤

1. 在腾讯云 EdgeOne Pages 中导入 Git 仓库。
2. 构建命令使用 `pnpm build`。
3. 安装命令使用 `pnpm install`。
4. 如果控制台支持 KV 绑定，将 `BOOKING_KV` 绑定到 Pages KV。
5. 发布后访问首页 `/`，管理员查看页在 `/admin`。

## 导出接口

- CSV: `/api/admin/export?format=csv&date=YYYY-MM-DD`
- JSON: `/api/admin/export?format=json&date=YYYY-MM-DD`

## 本地调试

```bash
pnpm install
pnpm dev
```

本地不会使用 KV，数据会写入 `.data/bookings.json`。
