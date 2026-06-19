export const registerFormMessages = {
  labels: {
    displayName: "昵称",
    email: "邮箱",
    otp: "验证码",
    password: "密码",
    passwordConfirm: "确认密码",
  },
  messages: {
    emailCheckFailed: "暂时无法确认邮箱是否可用，请稍后再试。",
    emailChecking: "正在检查邮箱可用性",
    emailAvailable: "该邮箱可用",
    emailAlreadyRegisteredPrefix: "该邮箱已被注册，前往",
    emailAlreadyRegisteredLinkText: "登录",
    modifyRequired: "注册信息已修改，请重新获取验证码",
    redirecting: "注册完成，正在跳转...",
    submitOtpLocked: "验证码尝试次数已用尽，请重新获取验证码。",
    turnstileError: "人机验证失败，请刷新页面后再试。",
    turnstileLoadFailed: "人机验证加载失败，请检查网络后刷新页面重试。",
    turnstileLoadTimeout: "人机验证加载超时，请检查网络后刷新页面重试。",
  },
  modifyRegisterInfo: "修改注册信息",
  requestOtp: "获取验证码",
  requestOtpPending: "发送中...",
  resendOtp: "重新发送验证码",
  retryTurnstile: "重新加载验证",
  submitOtp: "完成注册",
  submitOtpPending: "提交中...",
  otpInstruction: "请输入邮件中的 6 位数字验证码。",
  getInitialCooldownText: (cooldownSeconds: number) =>
    `${cooldownSeconds} 秒后可重新获取验证码。`,
  getRemainingAttemptsText: (remainingAttempts: number) =>
    `剩余可尝试次数：${remainingAttempts}`,
  getResendCooldownText: (cooldownSeconds: number) =>
    `${cooldownSeconds} 秒后可重新发送。`,
} as const;
