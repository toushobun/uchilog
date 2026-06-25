# KuraNote Theme 使用规范

本文件定义 KuraNote 的 Theme / Design Token 使用规则。

## 视觉方向

KuraNote 是家庭共享的生活记录工具，不是企业后台，也不是强金融工具。

整体视觉关键词：

- 清爽
- 生活感
- 低压力
- 卡片式布局
- 信息密度适中
- 移动端优先

实现页面和组件时，优先采用：

- 浅色背景
- 柔和卡片
- 适中留白
- 适合手指点击的按钮、表单、列表项
- 轻量数据卡片，而不是重型 BI 看板

避免以下方向：

- 高密度 Excel / ERP 风格
- 复杂企业后台风格
- 强金融工具压迫感
- 霓虹、赛博、强装饰风格
- 暗色模式优先设计

## Theme 策略

本期只支持 light mode。

暂不实现 dark mode。

如未来需要 dark mode，应单独立 Issue 设计，不要在当前 Theme 中提前混入暗色分支。

## Design Token

通用颜色、圆角、阴影、间距优先从 `src/theme/theme.ts` 的 `designTokens` 获取。

主要 token：

- `designTokens.color.background.app`：应用背景色
- `designTokens.color.background.paper`：卡片 / 弹窗背景色
- `designTokens.color.background.subtle`：弱背景色
- `designTokens.color.border.subtle`：弱边框色
- `designTokens.color.brand.*`：品牌主色
- `designTokens.color.text.*`：文字色
- `designTokens.radius.*`：圆角
- `designTokens.shadow.*`：阴影
- `designTokens.spacing.*`：页面和卡片间距语义

`designTokens.spacing.*` 的值为 MUI spacing 单位，使用时需要配合 `theme.spacing()`，或在 `sx` 中直接传入数字，让 MUI 自动换算。

## 组件默认样式

Theme 中已经定义以下组件的默认方向：

- `MuiCard`
- `MuiButton`
- `MuiTextField`
- `MuiOutlinedInput`
- `MuiDialog`
- `MuiPaper`

新组件应优先复用这些默认样式，不要在每个页面重复手写圆角、阴影和边框。

## `sx` 使用规则

可以使用 `sx`，但应遵守：

- 优先使用 theme token 和语义化值
- 不在多个组件里重复硬编码颜色
- 不在多个组件里重复硬编码大段 boxShadow / borderRadius
- 页面级 layout 可以使用 `sx` 控制局部间距，但不要绕过 Theme 重新定义视觉体系

## Storybook

Storybook 必须使用与应用相同的 Theme。

当前 Storybook 入口 `.storybook/preview.tsx` 已通过 `ThemeProvider` 引入 `src/theme/theme.ts`。

新增可复用 UI 组件时，应在 Storybook 中确认：

- light mode 下显示正常
- 卡片、按钮、输入框、弹窗与整体视觉一致
- 移动端宽度下布局不拥挤

## 新页面检查清单

新增页面或重构页面时，检查：

- 是否复用 Theme，而不是局部新建颜色体系
- 是否优先使用卡片分组信息
- 是否避免高密度表格和企业后台感
- 是否移动端优先
- 是否复用现有基础组件和 MUI 默认样式
- 是否避免散落 hard-coded style
