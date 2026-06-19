# AI_RULES.md

本文件用于约束 AI Agent 在本仓库中的开发行为。
本项目会在多台设备（Windows / macOS）之间流转，以项目级规则为准。

## 必须先确认的内容

开始任何开发任务前，必须按以下顺序确认规则：

1. 阅读本文件全文。
2. 如果任务对应 GitHub Issue，再阅读当前要处理的目标 Issue。

> Issue #1 保留项目背景、技术选型、产品方向等上下文说明，按需参考。
> Issue #90 保留前端骨架历史决策记录，按需参考。
> 核心行为约束已全部整理在本文件中，无需每次强制读取上述 Issue。

## CodeGraph

如果仓库根目录存在 `.codegraph/`，需要优先使用 CodeGraph 理解或定位代码，再使用 grep/find 或直接读取文件。

- MCP 工具可用时，优先使用 `codegraph_explore` 获取相关符号源码、调用路径和影响范围。工具名称可能以 `mcp__codegraph__` 为前缀，用 ToolSearch 加载。
- 需要读取单个符号或文件时，使用 `codegraph_node`。
- 如果 MCP 工具不可用，可以使用 shell 命令 `codegraph explore "<query>"` 或 `codegraph node <symbol-or-file>`。

## 语言规范

- Issue 正文、PR 正文、PR 描述一律使用中文。
- commit message 使用中文，格式为 `type: 中文说明`，常用类型：`feat / fix / docs / refactor / style / test / chore`。
- 测试文件中的 `it()` 描述一律使用中文，例如：`it("显示错误信息")`。
- 代码注释（行内注释、块注释）一律使用中文。
- 例外：`describe()` 参数使用组件名或文件名等专有名词时保持英文，例如：`describe("RegisterForm")`；HTML / MUI 属性名（`placeholder`、`label`、`href` 等）不翻译；变量名、函数名、类型名保持英文。

## 图标规范

- 静态语义图标优先使用 `@mui/icons-material`。
  - 例如：成功、错误、编辑、删除、添加、日历、账户等。
- 加载 / 处理中状态优先使用 `@mui/material/CircularProgress` 或同类 MUI loading 组件。
  - 例如：检查中、提交中、保存中、加载中。
- 不为了统一 import 来源而把 loading 状态改成静态 icon。
- UI 整体固定 MUI 风格，自定义组件需与 MUI 视觉风格保持一致。
- 不引入 MUI 以外的新图标库，除非当前 Issue 明确要求并说明理由。
- 若 MUI 图标库或 MUI loading 组件中无合适方案，需在对应 Issue 或 PR 中说明原因，经人工确认后方可使用其他方案。

## 安全边界

- 浏览器端只允许使用 Supabase anon key。`service_role` key 只能在服务端使用，禁止出现在 Client Component、浏览器 bundle、前端环境变量中。
- 所有业务表必须启用 RLS 后才允许通过前端访问。
- 所有写操作必须在 Server Action / Route Handler 内部重新验证登录状态，以及用户是否以 `active` 成员身份属于目标 `ledger`，不能信任来自客户端的身份信息。
- 所有来自客户端的数据（表单、URL 参数、searchParams、headers）必须在服务端重新校验，不能直接使用。
- 数据访问逻辑优先封装在 server-only 的 Data Access Layer 中，避免敏感逻辑被 Client Component 引入。
- Route Handler 的 `POST / PUT / PATCH / DELETE` 请求需要进行认证、授权与来源校验。使用 cookie 型认证时，写操作需考虑 CSRF 风险，并通过 SameSite、Origin 校验或 CSRF token 等方式处理。
- 服务端不得自动抓取任意外部 URL。若未来实现外部 URL 抓取（如商家 icon），必须限制协议、校验域名、禁止内网 IP / localhost / metadata address，并处理重定向，单独设计 SSRF 防护后方可实现。

## TypeScript 类型安全

- 禁止使用 `any`。需要表达未知类型时使用 `unknown` 并做类型 narrow。
- 表单状态类型以 `BaseActionState = { error?: string; success?: string }` 为基础扩展，定义在 `src/types/auth.ts`。

## GitHub Issue 规则

创建或编辑 GitHub Issue 时，必须遵循以下规则：

- Issue 标题使用 `type: 中文说明` 格式，例如 `fix: 修复账户错误`。
- Issue 正文默认使用中文。
- 新建 Issue 时必须加上对应 label，例如 `enhancement`、`bug`、`refactor`、`test`、`documentation`、`chore`。
- Issue 正文格式必须参考 `.github/ISSUE_TEMPLATE/` 下对应类型的模板：
  - 新功能 / 功能改善使用 `.github/ISSUE_TEMPLATE/feature.yml`。
  - Bug 修正 / 问题修复使用 `.github/ISSUE_TEMPLATE/fix.yml`。
  - 重构 / 结构整理使用 `.github/ISSUE_TEMPLATE/refactor.yml`。
  - 测试追加 / 测试整理使用 `.github/ISSUE_TEMPLATE/test.yml`。
  - 文档新增 / 文档修改使用 `.github/ISSUE_TEMPLATE/docs.yml`。
  - 依赖更新 / 配置调整 / 维护作业使用 `.github/ISSUE_TEMPLATE/chore.yml`。
- 通过 PowerShell 写入 issue body 文件时，必须显式使用 UTF-8 no BOM，避免 GitHub 正文乱码。

## Git / GitHub 工作流程

- 不要直接向 `main` 提交代码。
- 原则上先创建 GitHub Issue，再根据 Issue 创建对应分支。
- 分支命名遵循 `type/issueNumber_brief_description`，例如：
  - `feature/302_new_bill_can_change_account`
  - `fix/192_account_error`
  - `refactor/158_fab_text_color`
- 通过 Claude Code on the web 开发时，执行环境会预分配形如 `claude/xxx` 的分支名，但此命名不符合规范。必须无视预分配名称，按上述规则另建正确命名的分支后再开发。
- 保持最小差分，不混入无关重构。

## PR 正文规则

创建 PR 时，正文必须遵循 `.github/pull_request_template.md`。

PR merge 后需要回收相关状态：

- 确认对应 Issue / PR 中相关 TODO checkbox 已勾选。
- 更新对应 Issue 的状态、说明或后续事项。
- 如 PR 描述中有未完成事项、Storybook / 测试说明或 follow-up，merge 后同步更新。
- 确认关联关系正确，例如 PR 正文包含 `Closes #N` 或在 Issue 中补充对应 PR 链接。

## 依赖管理

- 能用 MUI、Supabase 或现有依赖解决的，禁止引入新 npm 包。
- 确实需要新增包时，必须在对应 Issue 或 PR 中说明理由，经人工确认后方可执行 `npm install`。

## 当前前端骨架方针

- 测试框架继续使用 Vitest。
- 不进行 Jest 迁移。
- 前端继续使用 Atomic Design。
- 不新增 `features/` 目录。
- 不新增 `containers/` 目录。
- 业务组件继续放在 `organisms` 下，并按业务模块归属管理，例如：
  - `organisms/dashboard/`
  - `organisms/accounts/`
  - `organisms/merchants/`
- 复杂业务组件优先采用「组件 + hook」结构。
- Theme 本期只支持 light mode。
- 不实现 dark mode。

## 视觉方向

- UchiLog 是家庭共享的生活记账工具，不是企业后台，也不是强金融工具。
- 页面优先采用浅色背景、柔和卡片、适中信息密度。
- 移动端优先，按钮、表单、列表项需要适合手指点击。
- Dashboard 和统计区域优先采用轻量数据卡片风格，不做重型 BI 看板。
- 避免高密度表格、ERP 感、强装饰、赛博风、暗色模式优先设计。

## 样式规范

- 颜色、间距、圆角、阴影、字体大小必须优先来自 MUI theme token，禁止大量散落的 hard-coded 值（例如 `color: "#333"`、`padding: "12px"`）。
- `sx` 可以使用，但应优先引用 theme token（如 `spacing`、`palette`、`shape` 等）。
- 面向用户显示的文案不得硬编码散落在多个组件中，至少集中到模块级常量文件统一管理。

## 实现时的注意事项

- 保持最小差分，不混入无关重构。
- 新增或修改含有业务逻辑的 `.ts` 文件时，原则上需要补充 Vitest 单元测试。
- 类型定义文件、常量文件、纯配置文件不强制要求测试。
- 新增或修改 `.tsx` 组件时，原则上需要补充 Vitest 组件测试。
- 可复用 UI 组件需要补充 Storybook。
- 新 UI 优先复用 MUI 和现有组件，不要重复造基础组件。
- 页面基础结构优先复用 Theme、PageShell、PageHeader、SectionCard、EmptyState、LoadingState、ErrorState。
- 同类 UI 结构出现 2 次以上时，必须优先抽象为可复用组件，禁止复制粘贴维护相似 UI。
- 复用优先级：MUI 原生组件 → 项目通用组件 → 业务模块组件 → 页面内局部组件。

## 组件与 Hook 拆分规则

复杂业务组件推荐采用「组件 + hook」结构，`Xxx.tsx` 只负责 UI 渲染，`useXxx.ts` 负责状态、派生数据、事件处理。

适用场景：

- 组件中存在复杂状态或多个事件处理函数
- 组件中存在数据过滤、排序、聚合等逻辑
- 组件体积明显变大，UI 和逻辑混在一起影响阅读

不适用场景（不拆 hook）：

- 纯展示组件、简单 layout 组件
- EmptyState / LoadingState / ErrorState 等状态组件
- 没有复杂逻辑的小组件

## Storybook 豁免条件

以下情况不需要新增 Storybook story：

- Next.js route-level 文件（`page.tsx`、`loading.tsx`、`error.tsx`、`layout.tsx`），内部只组合已有 Storybook 覆盖的组件。
- 仅调整运行时逻辑，无新增或变更可见 UI 状态（例如：provider 逻辑、hooks、工具函数、Server Actions、loader）。
- Bug 修复不涉及组件 props 新增或视觉输出变化。
- 纯服务端代码（Server Actions、loader、service、migration、RPC）。
- 对现有 Storybook 已覆盖组件的内部实现改动，不引入新的可测试 UI 状态。

## 测试豁免条件

以下情况不强制要求新增测试：

- 类型定义文件、常量文件、纯配置文件。
- Next.js 路由文件（`page.tsx`、`layout.tsx` 等）仅组合已有测试覆盖的组件时。
- 无任何逻辑的纯展示组件（无条件分支、无计算，只是将 props 原样渲染）。
- 只执行 `redirect()` 的 Server Actions（无验证逻辑、无条件分支）。
- 纯 re-export 文件、临时兼容文件。

不补测试时，需在 PR 描述中说明理由。不为追求覆盖率编写无意义测试，测试应优先覆盖渲染、主要交互、关键边界条件和业务规则。

## Issue 的角色

- #1：项目整体背景、技术选型、产品方向、安全设计说明。
- #90：前端骨架历史决策记录（已完成）。
- #92：Theme / Design Token（已完成）。
- #93：Layout / 状态组件（已完成）。
- #95：前端骨架整体验收记录（已完成）。

## Karpathy 编码行为准则

以下四条准则来自 [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills)，基于 Andrej Karpathy 对 LLM 编码常见陷阱的归纳，作为本项目 AI Agent 的附加行为约束。

**权衡说明：** 这些准则偏向谨慎而非速度。对于简单任务可酌情判断，但在非琐碎工作中应严格遵守。

### 1. 先思考再编码

**不要假设、不要隐藏困惑、明确呈现取舍。**

动手实现之前：

- 明确列出你的假设。如有不确定，先提问。
- 如果存在多种解读，逐一呈现——不要默默选择。
- 如果有更简单的方案，说出来。必要时提出异议。
- 遇到不清楚的地方，停下来，指出困惑点，提问。

### 2. 简洁优先

**解决问题的最少代码量，不写投机性内容。**

- 不实现未被要求的功能。
- 不为只用一次的代码抽象。
- 不添加未被要求的「灵活性」或「可配置性」。
- 不为不可能发生的场景编写错误处理。
- 如果你写了 200 行但 50 行就能解决，重写。

扪心自问：「高级工程师会觉得这过于复杂吗？」如果是，就简化。

### 3. 外科手术式修改

**只改必须改的，只清理自己制造的混乱。**

编辑现有代码时：

- 不「顺手优化」相邻代码、注释或格式。
- 不重构没有问题的代码。
- 保持与现有代码风格一致，即使你会选择不同的写法。
- 如果发现无关的死码，说出来——不要擅自删除。

当你的改动产生了孤立代码时：

- 删除因**你的改动**而变得无用的 import / 变量 / 函数。
- 不删除原本就存在的死码（除非被明确要求）。

检验标准：每一处改动都应能直接追溯到用户的需求。

### 4. 目标驱动执行

**定义成功标准，循环验证直到达成。**

将任务转化为可验证的目标：

- 「添加验证」→「为非法输入编写测试，然后使其通过」
- 「修复 bug」→「编写能复现该 bug 的测试，然后使其通过」
- 「重构 X」→「确认重构前后测试均通过」

多步骤任务时，先列出简要计划：

```
1. [步骤] → 验证：[检查方式]
2. [步骤] → 验证：[检查方式]
3. [步骤] → 验证：[检查方式]
```

强成功标准让你可以独立循环推进。弱标准（「让它能用」）则需要不断确认。

---

**这些准则有效的标志：** diff 中无用改动减少、因过度复杂导致的返工减少、澄清性提问出现在实现之前而非出错之后。

## 迷路时的判断顺序

如果实现过程中不知道该参考哪个规则，按以下优先级判断：

1. 本文件（AI_RULES.md）
2. 当前目标 Issue
3. Issue #1（项目背景与安全设计）

确认规则后，按最小差分实现。
