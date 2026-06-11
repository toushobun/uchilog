# CLAUDE.md

本文件用于约束 Claude Code / AI Agent 在本仓库中的开发行为。

## 必须先确认的内容

开始任何开发任务前，必须按以下顺序确认规则：

1. 先阅读 GitHub Issue #1 的项目开发规则。
2. 再阅读当前要处理的目标 Issue。
3. 如果任务涉及前端组件、页面、Storybook、测试，必须同时阅读 Issue #90。
4. 如果任务涉及 Theme、Design Token、Layout、状态组件、前端骨架，必须同时阅读 Issue #95，并按 Issue #95 的执行顺序推进。

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
- 不要直接向 `main` 提交代码，必须基于 Issue 创建分支和 PR。

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
