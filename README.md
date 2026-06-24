<p align="right">
  简体中文 |
  <a href="./README.ja.md">日本語</a> |
  <a href="./README.en.md">English</a>
</p>

# KuraNote

KuraNote 是一个以家庭记账为当前核心的多语言家庭生活记录 PWA，支持中文、日语和英语。它用于记录和可视化收入、支出、账户、转账、分类以及家庭共享消费，并帮助家庭理解钱主要花在哪些商家、每个商家涉及哪些消费分类，以及家庭成员之间如何共享日常消费。

本仓库同时作为个人开发过程记录使用。
项目目前仍处于 MVP 开发阶段。

## 项目简介

KuraNote 的目标是做一个适合家庭日常使用的 merchant-first 家庭生活记录应用。

传统记账软件通常先按分类管理消费，但实际回顾家庭支出时，“在哪个商家花了钱”往往更直观。KuraNote 会把商家作为重要入口，让用户可以围绕商家查看消费记录、分类分布和支出趋势。

初期目标包括：

- 快速记录日常支出和收入
- 以商家为入口管理和回顾消费
- 管理现金、银行卡、信用卡、电子钱包等账户
- 管理支出分类和收入分类
- 支持同一商家下的多分类消费记录
- 支持家庭成员之间的共享记账
- 优先优化手机端的日常使用体验
- 保持功能清晰、操作简单，避免记账软件常见的复杂膨胀

本项目当前主要使用中文进行需求整理、Issue 编写和开发记录。
代码、目录名、变量名和技术标识使用英文。

## 当前开发状态

项目当前处于 MVP 初期开发阶段。

已完成：

- 项目开发规则整理
- 初始页面设计方向整理
- MVP 数据库结构设计
- Supabase 本地开发环境初始化
- Supabase 初期数据库 migration
- Next.js 应用基础工程
- MUI ThemeProvider 基础配置
- Supabase Auth 邮箱密码登录
- 登录后受保护页面
- 登录后基础 App Shell
- 当前账本初始化 / 账本选择基础
- 账户管理基础功能
- 账户持有人功能（新增 / 编辑账户时维护持有人）
- 商家管理基础功能
- 商家别名 schema 与基础搜索支持
- 本地开发用 seed 数据
- Vitest 单元测试基础设施
- Storybook 基础设施
- GitHub Actions CI
- Storybook build CI

尚未实现：

- 记账新增最小闭环
- 记账列表
- 分类管理页面完善
- 账户所属权体验完善
- 商家维度的消费统计和趋势分析
- 数据统计和图表
- PWA 配置
- 正式部署

## 技术栈

### 前端

- Next.js App Router
- TypeScript
- React
- MUI

### 后端 / 数据库

- Supabase
- PostgreSQL
- Supabase Auth
- Row Level Security 设计

### 开发工具

- GitHub Issues
- GitHub Pull Requests
- GitHub Actions
- Supabase CLI
- Figma
- Vitest
- Storybook

## 已实现功能

### 认证

- 邮箱密码登录
- 登出
- 未登录访问受保护页面时跳转到登录页
- 已登录访问登录页时跳转到 Dashboard

### 应用外壳

- 登录后的基础 App Shell
- 顶部栏
- 当前登录用户显示
- 底部导航
- Dashboard 占位页面
- 记账占位页面
- 分类占位页面

### 账本

- 登录后获取当前用户所属账本
- 没有账本时跳转到账本初始化页面
- 创建初始账本
- 账本列表基础页面

### 账户管理

- 当前账本下的账户列表
- 新增账户
- 编辑账户基础信息
- 归档账户
- 账户持有人选择
- 新增 / 编辑账户时维护持有人
- 账户类型中文显示
- 金额格式化显示
- 基础账户展示组件
- 账户组件 Storybook story

### 商家管理

- 当前账本下的商家列表
- 新增商家
- 编辑商家基础信息
- 归档商家
- 商家别名 schema
- 新增商家别名
- 归档商家别名
- 商家名称 / 别名基础搜索支持
- 以商家为消费记录和后续统计分析的重要入口

### 本地开发数据

- `supabase/seed.sql`
- 本地测试用户
- 家庭账本 seed
- 账户 seed
- 商家和商家别名 seed
- 基础分类 seed

### 工程化

- GitHub Actions CI
  - Pull Request 时自动执行检查
  - main 分支更新时自动执行检查
  - Type check
  - Format check
  - Lint
  - Test
  - Build
  - Storybook build
- 本地开发工具
  - Prettier
  - Vitest
  - Storybook

## 开发路线

当前计划按以下顺序推进：

1. 整理项目开发规则
2. 设计初始应用画面
3. 设计 MVP 数据库结构
4. 实现初期数据库 migration
5. 初始化 Next.js 应用
6. 实现邮箱密码登录
7. 添加 GitHub Actions CI
8. 实现登录后基础 App Shell
9. 实现当前账本初始化 / 账本选择
10. 实现账户管理基础功能
11. 实现商家管理基础功能
12. 追加本地 seed 数据
13. 追加 unit test 和 CI
14. 追加 Storybook 和 CI
15. 完善分类管理页面
16. 实现记账新增最小闭环
17. 实现记账列表
18. 完善账户所属权相关体验
19. 实现基础统计和汇总
20. 配置 PWA
21. 整理部署方式

## 本地启动

### 前置要求

需要准备：

- Node.js 20 或以上
- npm
- Docker
- Supabase CLI

### 安装依赖

```bash
npm install
```

如果希望严格按照 `package-lock.json` 安装，也可以使用：

```bash
npm ci
```

### 启动本地 Supabase

```bash
npx supabase start
```

确认 Supabase 本地服务状态：

```bash
npx supabase status
```

Supabase Studio 默认地址通常是：

```text
http://127.0.0.1:54323
```

### 环境变量

复制环境变量模板：

```bash
cp .env.example .env.local
```

然后根据本地 Supabase 输出填写 `.env.local`。

示例：

```text
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-local-publishable-key
```

`.env.local` 只用于本地开发，不应提交到仓库。

### 本地测试用户

`npx supabase db reset` 会自动执行 `supabase/seed.sql`，并创建本地开发用测试用户。

登录信息：

```text
邮箱：local@example.test
密码：password123

邮箱：local2@example.test
密码：password123
```

seed 还会创建家庭账本、账户、商家、商家别名和基础分类数据，方便 reset 后直接做 UI 手动验证。

如需手动查看或调整本地 Auth 用户，可以打开 Supabase Studio：

```text
http://127.0.0.1:54323
```

### 重置本地数据库

```bash
npx supabase db reset
```

重置后如果浏览器中残留旧登录状态，可能会出现 refresh token 相关错误。重新登录即可。

### 启动 Next.js 开发服务器

```bash
npm run dev
```

打开：

```text
http://localhost:3000
```

### 启动 Storybook 并确认组件展示

```bash
npm run storybook
```

打开 Storybook：

```text
http://localhost:6006
```

## 常用命令

### 启动开发服务器

```bash
npm run dev
```

### 执行格式检查

```bash
npm run format:check
```

### 自动格式化

```bash
npm run format
```

### 执行 lint

```bash
npm run lint
```

### 执行单元测试

```bash
npm run test
```

### 执行 build

```bash
npm run build
```

### 启动 Storybook 开发服务器

```bash
npm run storybook
```

### 执行 Storybook build

```bash
npm run build-storybook
```

### 重置本地 Supabase 数据库并执行 seed

```bash
npx supabase db reset
```

## 开发流程

本项目采用 Issue-first 的开发方式。

基本流程：

1. 创建或选择一个 GitHub Issue
2. 根据 Issue 创建对应分支
3. 在新分支中进行开发
4. 本地执行检查
5. 创建 Pull Request
6. 等待 GitHub Actions CI 通过
7. 确认后合并 PR

分支名示例：

```text
feature/16_implement_authenticated_app_shell
docs/18_update_public_readme
chore/14_add_github_actions_ci
```

Commit 示例：

```text
feat: 实现登录后基础 App Shell
docs: 整理公开仓库 README
chore: 添加 GitHub Actions CI
```

## 截图

截图会在 MVP UI 更稳定后补充。

计划补充：

- 登录页
- 登录后 App Shell
- Dashboard
- 账户管理页面
- 商家管理页面
- 分类管理页面
- 记账新增页面
- 记账列表页面

## 作为求职作品的说明

本项目不仅是一个记账应用，也用于展示一个小型 Web 产品从 0 到 1 的开发过程。

重点展示内容包括：

- 需求拆分
- Issue 驱动开发
- 数据库结构设计
- Supabase Auth 接入
- Row Level Security 设计
- 受保护路由设计
- 前端 App Shell 设计
- 账户管理和商家管理基础功能
- 本地 seed 数据设计
- 单元测试基础设施
- Storybook 组件展示
- CI 配置
- MVP 迭代推进过程

当前项目仍在开发中，因此仓库会持续保留 Issue、PR 和 Commit 记录。

## 公开仓库说明

本仓库用于记录开发过程和展示项目实现方式。

仓库中不会提交本地环境变量文件、真实用户数据或个人记账数据。

## License

暂未选择 License。
