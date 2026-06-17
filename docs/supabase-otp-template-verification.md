# Supabase 注册 OTP 邮件模板验证手顺

本文件记录 #203 的 Supabase custom SMTP、Confirm signup 邮件模板和 `verifyOtp` 成功链路验证步骤。

## Cloud 实测结论（2026-06-17）

#203 / PR #204 已完成 Cloud 侧实测，结论如下：

- Cloud custom SMTP 已保存，邮件可正常发送。
- Cloud Confirm signup 模板已使用 `{{ .Token }}`，不再只提供确认链接。
- OTP 邮件可收到，Gmail 中 6 位数字验证码正常显示。
- Email OTP expiration 已设置为 600 秒，Email OTP length 已设置为 6。
- Auth 邮件发送限制未在 #203 中记录 Cloud 实测值，后续如需对齐 resend 体验需在 Dashboard 复核。
- `signUp()` 注册邮件发送成功，注册阶段 `hasSession = false`。
- `verifyOtp({ type: "signup" })` 成功，`hasSession = true`，`emailConfirmedAt` 有值。
- `verifyOtp({ type: "email" })` 实测同样成功；#199 注册确认链路建议使用语义更明确的 `signup`。
- Server Action 中 session cookie 写入成功，跳转后服务端 `getUser()` 可读取用户。
- 浏览器 URL 未出现 `access_token` / `refresh_token` / `token_type` / `expires_at`。

## 背景

#197 实测确认，当前 Supabase Cloud 项目在未配置 custom SMTP 时无法编辑 Confirm signup 邮件模板，因此无法直接验证 `{{ .Token }}` 是否能输出注册 OTP。

Supabase 官方文档说明，本地开发可通过 `supabase/config.toml` 的 `content_path` 指向 HTML 模板文件；托管项目需要在 Dashboard 的 Email Templates 页面复制模板内容。文档同时说明 `auth.email.template.confirmation` 是注册确认邮件模板，`{{ .Token }}` 是可用于替代确认链接的一次性验证码。

## 本地配置

本仓库使用以下本地模板文件：

```text
supabase/templates/confirmation.html
```

`supabase/config.toml` 应指向该模板：

```toml
[auth.email.template.confirmation]
subject = "Your UchiLog verification code"
content_path = "./supabase/templates/confirmation.html"
```

本地反映配置变更后，需要重启 Supabase：

```bash
supabase stop && supabase start
```

邮件可在本地 Inbucket 查看：

```text
http://127.0.0.1:54324
```

## Cloud Dashboard 配置手顺

### 1. 配置 custom SMTP

在 Supabase Dashboard 中进入目标项目：

```text
Authentication > Emails / SMTP Settings
```

实测记录：

- custom SMTP 已配置并保存。
- 邮件可正常发送。
- 发信所需的 Provider 域名 / 发信验证已通过。

不要把 SMTP 密码、API key、token 写入仓库、Issue 或 PR。

### 2. 修改 Confirm signup 模板

进入：

```text
Authentication > Email Templates > Confirm signup
```

Subject 建议：

```text
Your UchiLog verification code
```

Body 使用 `supabase/templates/confirmation.html` 的内容。

模板必须包含：

```text
{{ .Token }}
```

不应只提供确认链接。

### 3. OTP 参数

实测记录：

- Email OTP length 已设置为 6。
- Email OTP expiration 已设置为 600 seconds。
- Auth 邮件发送限制未在 #203 中记录 Cloud 实测值，当前状态为待复核。

## 验证项目

### 1. signUp 发送邮件

使用未注册测试邮箱调用 `signUp()`。

实测记录：

- `signUp()` 成功发送注册邮件。
- 注册阶段 `hasSession = false`。
- Auth 用户已创建。
- Gmail 已收到邮件。
- 邮件中正常显示 6 位数字验证码。

### 2. verifyOtp type 实测

已分别验证：

```ts
await supabase.auth.verifyOtp({
  email,
  token,
  type: "signup",
});
```

```ts
await supabase.auth.verifyOtp({
  email,
  token,
  type: "email",
});
```

注意：同一个 OTP 成功验证后可能立即失效。应使用两个不同测试邮箱或重新发送验证码分别验证。

实测记录：

- `verifyOtp({ type: "signup" })` 成功，`hasSession = true`，`emailConfirmedAt` 有值。
- `verifyOtp({ type: "email" })` 实测同样成功。
- #199 注册确认链路建议使用语义更明确的 `signup`。
- 实测时已分别使用不同测试邮箱验证 `signup` 和 `email`，两次均成功。

### 3. Server Action cookie session 写入

在 #199 开始前，已通过最小 Server Action 验证：

- Server Action 内调用 `verifyOtp` 成功。
- 跳转后服务端 `getUser()` 可读取用户。
- 浏览器 URL 未出现 access token / refresh token。
- session 未写入 localStorage 之类前端持久化位置。

## #203 收尾标准

#203 comment 已记录以下完成状态：

- [x] custom SMTP 配置完成。
- [x] Cloud Confirm signup 已使用 `{{ .Token }}` 模板。
- [x] OTP length / expiration 的最终值为 6 位 / 600 秒。
- [x] `verifyOtp` 成功 type 为 `signup`；`email` 实测也成功。
- [x] Server Action cookie session 写入验证成功。
- [x] #199 可继续按纯 OTP 路线实现，并建议使用 `verifyOtp({ type: "signup" })`。

## 参考

- [Supabase 官方文档：Customizing email templates](https://supabase.com/docs/guides/local-development/customizing-email-templates)：本地开发可通过 `config.toml` 的 `content_path` 自定义邮件模板。
- [Supabase 官方文档：Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)：托管项目需要在 Dashboard 的 Email Templates 页面复制模板内容；`{{ .Token }}` 表示一次性验证码，可替代确认链接。
- [Supabase 官方文档：CLI config](https://supabase.com/docs/guides/local-development/cli/config)：`auth.email.template.confirmation` 是注册确认邮件模板配置。
