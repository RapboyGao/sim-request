# sim-request

Nuxt 4 + Vuetify 预约模拟机观摩时段系统。

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## 本地 JSON 数据库

本地调试默认写入 `.data/bookings.json`，不会使用 KV。

## EdgeOne Pages KV

线上运行时会优先读取 `BOOKING_KV` 环境绑定。
