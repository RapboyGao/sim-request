# EdgeOne Pages 生产部署检查清单

## 配置

- `edgeone.json`
- `.edgeone/cloud-functions/ssr-node/config.json`
- Pages KV 绑定名：`BOOKING_KV`
- `@oxc-parser/binding-linux-x64-gnu` 已加入依赖，避免 EdgeOne 构建时缺少原生绑定

## 控制台

- 安装命令：`pnpm install --frozen-lockfile`
- 构建命令：`pnpm build`
- Node 版本：`22.11.0`

## 验收

- 首页 `/` 可打开
- `/admin` 可登录
- 预约、取消、恢复、导出正常
- 线上数据读写走 `BOOKING_KV`

## 本地

```bash
pnpm install
pnpm dev
```

本地只写 `.data/bookings.json`。
