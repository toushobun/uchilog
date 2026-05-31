# UchiLog

UchiLog 是一个面向家庭共用的记账应用。

当前项目处于 MVP 开发初期，本仓库包含：

- Next.js 应用基础工程
- Supabase 本地开发配置
- MVP 初期数据库 migration

## 本地启动

```bash
npm install
npm run dev
```

浏览器打开：

```text
http://localhost:3000
```

## 环境变量

请参考 .env.example 创建 .env.local。

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

`.env.local` 不提交到 Git。
