# AI_RULES.md

本文件用于约束 AI Agent 在本仓库中的开发行为。
本项目会在多台设备（Windows / macOS）之间流转，以项目级规则为准。

## 必须先确认的内容

开始任何开发任务前，必须按以下顺序确认规则：

1. 先阅读 GitHub Issue #1 的项目开发规则。
2. 如果任务对应 GitHub Issue，再阅读当前要处理的目标 Issue。
3. 如果任务涉及前端组件、页面、Storybook、测试，必须同时阅读 Issue #90。
4. 如果任务涉及 Theme、Design Token、Layout、状态组件、前端骨架，必须同时阅读 Issue #95，并按 Issue #95 的执行顺序推进。

## CodeGraph

如果仓库根目录存在 `.codegraph/`，需要优先使用 CodeGraph 理解或定位代码，再使用 grep/find 或直接读取文件。

- MCP 工具可用时，优先使用 `codegraph_explore` 获取相关符号源码、调用路径和影响范围。工具名称可能以 `mcp__codegraph__` 为前缀，用 ToolSearch 加载。
- 需要读取单个符号或文件时，使用 `codegraph_node`。
- 如果 MCP 工具不可用，可以使用 shell 命令 `codegraph explore "<query>"` 或 `codegraph node <symbol-or-file>`。

## GitHub Issue 规则

创建或编辑 GitHub Issue 时，必须遵循 Issue #1 中的项目规则：

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
- 保持最小差分，不混入无关重构。

## PR 正文规则

创建 PR 时，正文必须遵循 `.github/pull_request_template.md`。

PR merge 后需要回收相关状态：

- 确认对应 Issue / PR 中相关 TODO checkbox 已勾选。
- 更新对应 Issue 的状态、说明或后续事项。
- 如 PR 描述中有未完成事项、Storybook / 测试说明或 follow-up，merge 后同步更新。
- 确认关联关系正确，例如 PR 正文包含 `Closes #N` 或在 Issue 中补充对应 PR 链接。

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

## 实现时的注意事项

- 保持最小差分，不混入无关重构。
- 新增或修改含有业务逻辑的 `.ts` 文件时，原则上需要补充 Vitest 单元测试。
- 类型定义文件、常量文件、纯配置文件不强制要求测试。
- 新增或修改 `.tsx` 组件时，原则上需要补充 Vitest 组件测试。
- 可复用 UI 组件需要补充 Storybook。
- 新 UI 优先复用 MUI 和现有组件，不要重复造基础组件。
- 页面基础结构优先复用 Theme、PageShell、PageHeader、SectionCard、EmptyState、LoadingState、ErrorState。

## Storybook 豁免条件

以下情况不需要新增 Storybook story：

- Next.js route-level 文件（`page.tsx`、`loading.tsx`、`error.tsx`、`layout.tsx`），内部只组合已有 Storybook 覆盖的组件。
- 仅调整运行时逻辑，无新增或变更可见 UI 状态（例如：provider 逻辑、hooks、工具函数、Server Actions、loader）。
- Bug 修复不涉及组件 props 新增或视觉输出变化。
- 纯服务端代码（Server Actions、loader、service、migration、RPC）。
- 对现有 Storybook 已覆盖组件的内部实现改动，不引入新的可测试 UI 状态。

## Issue 的角色

- #1：项目整体开发规则。
- #90：前端骨架、hooks、Atomic Design、测试、Storybook 规则。
- #92：Theme / Design Token。
- #93：Layout / 状态组件。
- #95：前端骨架整体验收和执行顺序。

## 迷路时的判断顺序

如果实现过程中不知道该参考哪个规则，按以下优先级判断：

1. Issue #1
2. 当前目标 Issue
3. 前端相关任务参考 Issue #90
4. Theme / Layout / 状态组件 / 前端骨架任务参考 Issue #95

确认规则后，按最小差分实现。
