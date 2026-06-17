import { beforeEach, describe, expect, it, vi } from "vitest";

import { createSupabaseMock } from "test/supabaseMock";
import {
  register,
  requestRegisterOtp,
  submitRegisterOtp,
  validateRegisterEmailFormat,
} from "server/actions/auth";

const mocks = vi.hoisted(() => ({
  checkAuthOtpSendRateLimit: vi.fn(),
  countAuthOtpVerifyFailuresSinceLastSend: vi.fn(),
  createClient: vi.fn(),
  headers: vi.fn(),
  getUser: vi.fn(),
  recordAuthOtpAttempt: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
  signUp: vi.fn(),
  verifyOtp: vi.fn(),
  verifyTurnstileToken: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: mocks.headers,
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

vi.mock("server/auth/otpAttempts", () => ({
  checkAuthOtpSendRateLimit: mocks.checkAuthOtpSendRateLimit,
  countAuthOtpVerifyFailuresSinceLastSend:
    mocks.countAuthOtpVerifyFailuresSinceLastSend,
  recordAuthOtpAttempt: mocks.recordAuthOtpAttempt,
}));

vi.mock("server/auth/turnstile", () => ({
  verifyTurnstileToken: mocks.verifyTurnstileToken,
}));

function createRegisterFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();

  formData.set("displayName", "山田太郎");
  formData.set("email", "yamada@example.test");
  formData.set("password", "password-1234");
  formData.set("passwordConfirm", "password-1234");

  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }

  return formData;
}

function createRequestRegisterOtpFormData(
  overrides: Record<string, string> = {},
) {
  return createRegisterFormData({
    turnstileToken: "turnstile-token",
    ...overrides,
  });
}

function createSubmitRegisterOtpFormData(
  overrides: Record<string, string> = {},
) {
  const formData = new FormData();

  formData.set("displayName", "山田太郎");
  formData.set("email", "yamada@example.test");
  formData.set("token", "012345");

  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }

  return formData;
}

describe("register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createClient.mockResolvedValue({
      auth: {
        signUp: mocks.signUp,
      },
    });
    mocks.signUp.mockResolvedValue({ error: null });
  });

  it("必填项不足时返回错误", async () => {
    const result = await register({}, createRegisterFormData({ email: "" }));

    expect(result).toEqual({ error: "请输入昵称、邮箱和密码。" });
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("密码确认不一致时返回错误", async () => {
    const result = await register(
      {},
      createRegisterFormData({ passwordConfirm: "different-password" }),
    );

    expect(result).toEqual({ error: "两次输入的密码不一致。" });
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it.each([
    [
      "邮箱过长",
      { email: `${"a".repeat(250)}@example.test` },
      "邮箱最多 255 个字符。",
      false,
    ],
    ["邮箱格式有误", { email: "not-email" }, "邮箱格式有误", false],
    [
      "昵称过长",
      { displayName: "名".repeat(51) },
      "昵称最多 50 个字符。",
      false,
    ],
    [
      "密码过长",
      { password: "a1".repeat(37), passwordConfirm: "a1".repeat(37) },
      "密码最多 72 个字符。",
      true,
    ],
    [
      "确认密码过长",
      { passwordConfirm: "a1".repeat(37) },
      "确认密码最多 72 个字符。",
      false,
    ],
  ])(
    "字段长度或格式不符合规则时返回错误：%s",
    async (_, overrides, errorMessage, resetPassword) => {
      const result = await register({}, createRegisterFormData(overrides));

      expect(result).toEqual({
        error: errorMessage,
        ...(resetPassword ? { resetPassword } : {}),
      });
      expect(mocks.createClient).not.toHaveBeenCalled();
    },
  );

  it("密码不符合强度规则时返回错误并要求清空密码", async () => {
    const result = await register(
      {},
      createRegisterFormData({
        password: "password",
        passwordConfirm: "password",
      }),
    );

    expect(result).toEqual({
      error: "密码强度不足。密码至少 8 位，并且需要同时包含字母和数字。",
      resetPassword: true,
    });
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("注册时将昵称写入 Supabase Auth metadata", async () => {
    const result = await register({}, createRegisterFormData());

    expect(mocks.signUp).toHaveBeenCalledWith({
      email: "yamada@example.test",
      password: "password-1234",
      options: {
        data: {
          display_name: "山田太郎",
        },
      },
    });
    expect(result).toEqual({
      success: "注册申请已提交。请查收确认邮件后再登录。",
    });
  });

  it.each([
    [
      "邮箱已存在",
      { code: "user_already_exists", message: "User already registered" },
      "这个邮箱已经注册过了，请直接登录或换一个邮箱。",
      false,
    ],
    [
      "邮箱格式不正确",
      { code: "invalid_email", message: "Email address is invalid" },
      "邮箱格式看起来不正确，请检查后再试。",
      false,
    ],
    [
      "密码强度不足",
      { code: "weak_password", message: "Password should be stronger" },
      "密码强度不足。密码至少 8 位，并且需要同时包含字母和数字。",
      true,
    ],
    [
      "注册功能关闭",
      { code: "signup_disabled", message: "Signups are disabled" },
      "当前暂时无法开放新用户注册，请稍后再试。",
      false,
    ],
    [
      "请求过于频繁",
      { code: "over_email_send_rate_limit", message: "Too many requests" },
      "注册请求太频繁了，请稍等一会儿再试。",
      false,
    ],
    [
      "未知错误",
      { message: "unexpected auth error" },
      "注册失败，请确认邮箱和密码后再试。",
      false,
    ],
    [
      "仅 message 提到 password 时不误判为弱密码",
      { message: "unexpected password provider error" },
      "注册失败，请确认邮箱和密码后再试。",
      false,
    ],
  ])(
    "Supabase 注册失败时返回细分错误：%s",
    async (_, error, errorMessage, resetPassword) => {
      mocks.signUp.mockResolvedValue({ error });

      const result = await register({}, createRegisterFormData());

      expect(result).toEqual({
        error: errorMessage,
        ...(resetPassword ? { resetPassword } : {}),
      });
    },
  );
});

describe("requestRegisterOtp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createClient.mockResolvedValue({
      auth: {
        signUp: mocks.signUp,
      },
    });
    mocks.headers.mockResolvedValue(
      new Headers({ "x-real-ip": "203.0.113.10" }),
    );
    mocks.checkAuthOtpSendRateLimit.mockResolvedValue({
      allowed: true,
      retryAfterSeconds: 0,
    });
    mocks.recordAuthOtpAttempt.mockResolvedValue(undefined);
    mocks.signUp.mockResolvedValue({ error: null });
    mocks.verifyTurnstileToken.mockResolvedValue(true);
  });

  it("基础字段校验失败时不调用 Turnstile 和 Supabase", async () => {
    const result = await requestRegisterOtp(
      {},
      createRequestRegisterOtpFormData({ email: "not-email" }),
    );

    expect(result).toEqual({
      error: "邮箱格式有误",
      resetTurnstile: true,
      status: "validation_error",
    });
    expect(mocks.verifyTurnstileToken).not.toHaveBeenCalled();
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("密码强度失败时要求重置密码和 Turnstile", async () => {
    const result = await requestRegisterOtp(
      {},
      createRequestRegisterOtpFormData({
        password: "password",
        passwordConfirm: "password",
      }),
    );

    expect(result).toEqual({
      error: "密码强度不足。密码至少 8 位，并且需要同时包含字母和数字。",
      resetPassword: true,
      resetTurnstile: true,
      status: "validation_error",
    });
    expect(mocks.verifyTurnstileToken).not.toHaveBeenCalled();
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("应用层限流命中时不调用 Turnstile 和 Supabase 并返回剩余秒数", async () => {
    mocks.checkAuthOtpSendRateLimit.mockResolvedValue({
      allowed: false,
      retryAfterSeconds: 42,
    });

    const result = await requestRegisterOtp(
      {},
      createRequestRegisterOtpFormData(),
    );

    expect(result).toEqual({
      error: "验证码发送过于频繁，请稍后再试",
      resetTurnstile: true,
      retryAfterSeconds: 42,
      status: "rate_limited",
    });
    expect(mocks.verifyTurnstileToken).not.toHaveBeenCalled();
    expect(mocks.createClient).not.toHaveBeenCalled();
    expect(mocks.recordAuthOtpAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        attempt_type: "send",
        result: "blocked",
      }),
    );
  });

  it("Turnstile 失败时不写入 email_hash 维度 attempt", async () => {
    mocks.verifyTurnstileToken.mockResolvedValue(false);

    const result = await requestRegisterOtp(
      {},
      createRequestRegisterOtpFormData(),
    );

    expect(result).toEqual({
      error: "人机验证失败，请稍后重试",
      resetTurnstile: true,
      status: "turnstile_failed",
    });
    expect(mocks.recordAuthOtpAttempt).not.toHaveBeenCalled();
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("signUp 成功时写入 send success", async () => {
    const result = await requestRegisterOtp(
      {},
      createRequestRegisterOtpFormData(),
    );

    expect(mocks.signUp).toHaveBeenCalledWith({
      email: "yamada@example.test",
      password: "password-1234",
      options: {
        data: {
          display_name: "山田太郎",
        },
      },
    });
    expect(mocks.recordAuthOtpAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        attempt_type: "send",
        result: "success",
      }),
    );
    expect(result).toEqual({
      resetTurnstile: true,
      status: "success",
      success: "如果该邮箱可以注册，我们已发送验证码。请查收邮件。",
    });
  });

  it("Supabase 发送限制时返回频繁文案", async () => {
    mocks.signUp.mockResolvedValue({
      error: { code: "over_email_send_rate_limit" },
    });

    const result = await requestRegisterOtp(
      {},
      createRequestRegisterOtpFormData(),
    );

    expect(result).toEqual({
      error: "验证码发送过于频繁，请稍后再试",
      resetTurnstile: true,
      status: "send_rate_limited",
    });
    expect(mocks.recordAuthOtpAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        attempt_type: "send",
        result: "blocked",
      }),
    );
  });

  it("邮箱已存在时返回不可区分的中性提示", async () => {
    mocks.signUp.mockResolvedValue({
      error: { code: "user_already_exists" },
    });

    const result = await requestRegisterOtp(
      {},
      createRequestRegisterOtpFormData(),
    );

    expect(result).toEqual({
      resetTurnstile: true,
      status: "neutral",
      success: "如果该邮箱可以注册，我们已发送验证码。请查收邮件。",
    });
    expect(mocks.recordAuthOtpAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        attempt_type: "send",
        result: "failed",
      }),
    );
  });

  it("signUp 未分类错误时返回服务异常", async () => {
    mocks.signUp.mockResolvedValue({
      error: { message: "unexpected" },
    });

    const result = await requestRegisterOtp(
      {},
      createRequestRegisterOtpFormData(),
    );

    expect(result).toEqual({
      error: "服务异常，请稍后再试",
      resetTurnstile: true,
      status: "unknown_error",
    });
    expect(mocks.recordAuthOtpAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        attempt_type: "send",
        result: "failed",
      }),
    );
  });
});

describe("submitRegisterOtp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const supabase = createSupabaseMock({
      queryResponses: [{ data: { display_name: "山田太郎" } }],
    });
    mocks.createClient.mockResolvedValue({
      ...supabase.client,
      auth: {
        getUser: mocks.getUser,
        verifyOtp: mocks.verifyOtp,
      },
    });
    mocks.headers.mockResolvedValue(
      new Headers({ "x-real-ip": "203.0.113.10" }),
    );
    mocks.countAuthOtpVerifyFailuresSinceLastSend.mockResolvedValue(0);
    mocks.recordAuthOtpAttempt.mockResolvedValue(undefined);
    mocks.verifyOtp.mockResolvedValue({ error: null });
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });
  });

  it("token 不是 6 位数字时不调用 verifyOtp", async () => {
    const result = await submitRegisterOtp(
      {},
      createSubmitRegisterOtpFormData({ token: "12345a" }),
    );

    expect(result).toEqual({
      error: "请输入6位数字验证码",
      status: "validation_error",
    });
    expect(mocks.verifyOtp).not.toHaveBeenCalled();
  });

  it("verify failure 次数超过 5 时不调用 verifyOtp", async () => {
    mocks.countAuthOtpVerifyFailuresSinceLastSend.mockResolvedValue(5);

    const result = await submitRegisterOtp(
      {},
      createSubmitRegisterOtpFormData(),
    );

    expect(result).toEqual({
      error: "验证码错误次数过多，请重新获取",
      remainingAttempts: 0,
      status: "too_many_attempts",
    });
    expect(mocks.recordAuthOtpAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        attempt_type: "verify_failure",
        result: "blocked",
      }),
    );
    expect(mocks.verifyOtp).not.toHaveBeenCalled();
  });

  it("verifyOtp 失败时写入 verify_failure 并返回统一错误文案", async () => {
    mocks.verifyOtp.mockResolvedValue({
      error: { message: "invalid or expired" },
    });

    const result = await submitRegisterOtp(
      {},
      createSubmitRegisterOtpFormData(),
    );

    expect(mocks.recordAuthOtpAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        attempt_type: "verify_failure",
        result: "failed",
      }),
    );
    expect(result).toEqual({
      error: "验证码不正确或已过期，请重新获取",
      remainingAttempts: 4,
      status: "otp_invalid",
    });
  });

  it("verifyOtp 成功但 session 无效时只带 email 返回登录页", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });

    const result = await submitRegisterOtp(
      {},
      createSubmitRegisterOtpFormData(),
    );

    expect(result).toEqual({
      redirectTo: "/login?email=yamada%40example.test",
      status: "session_invalid",
    });
  });

  it("verifyOtp 成功且 session 有效时进入成功流程", async () => {
    const result = await submitRegisterOtp(
      {},
      createSubmitRegisterOtpFormData(),
    );

    expect(mocks.verifyOtp).toHaveBeenCalledWith({
      email: "yamada@example.test",
      token: "012345",
      type: "signup",
    });
    expect(result).toEqual({
      redirectTo: "/dashboard",
      status: "success",
      success: "注册完成。",
    });
  });

  it("app_user 不存在时返回同步异常", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [{ data: null }],
    });
    mocks.createClient.mockResolvedValue({
      ...supabase.client,
      auth: {
        getUser: mocks.getUser,
        verifyOtp: mocks.verifyOtp,
      },
    });

    const result = await submitRegisterOtp(
      {},
      createSubmitRegisterOtpFormData(),
    );

    expect(result).toEqual({
      error: "注册资料同步异常，请稍后登录后再确认。",
      status: "app_user_sync_failed",
    });
  });

  it("display_name 不一致时 update 后成功", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [{ data: { display_name: "別名" } }, {}],
    });
    mocks.createClient.mockResolvedValue({
      ...supabase.client,
      auth: {
        getUser: mocks.getUser,
        verifyOtp: mocks.verifyOtp,
      },
    });

    const result = await submitRegisterOtp(
      {},
      createSubmitRegisterOtpFormData(),
    );

    expect(result).toEqual({
      redirectTo: "/dashboard",
      status: "success",
      success: "注册完成。",
    });
    expect(supabase.queries[1].table).toBe("app_user");
    expect(supabase.queries[1].calls).toEqual([
      { method: "update", args: [{ display_name: "山田太郎" }] },
      { method: "eq", args: ["id", "user-1"] },
    ]);
  });

  it("display_name 不一致且 update 失败时返回同步异常", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [
        { data: { display_name: "別名" } },
        { error: { message: "db error" } },
      ],
    });
    mocks.createClient.mockResolvedValue({
      ...supabase.client,
      auth: {
        getUser: mocks.getUser,
        verifyOtp: mocks.verifyOtp,
      },
    });

    const result = await submitRegisterOtp(
      {},
      createSubmitRegisterOtpFormData(),
    );

    expect(result).toEqual({
      error: "注册资料同步异常，请稍后登录后再确认。",
      status: "app_user_sync_failed",
    });
  });
});

describe("validateRegisterEmailFormat", () => {
  it.each([
    ["未输入邮箱", "", "请输入邮箱后再校验。"],
    ["邮箱过长", `${"a".repeat(250)}@example.test`, "邮箱最多 255 个字符。"],
    ["邮箱格式有误", "not-email", "邮箱格式有误"],
  ])("邮箱格式无法校验时返回错误：%s", async (_, email, errorMessage) => {
    const result = await validateRegisterEmailFormat(email);

    expect(result).toEqual({ error: errorMessage });
  });

  it("邮箱格式可用时返回可继续填写提示", async () => {
    const result = await validateRegisterEmailFormat("yamada@example.test");

    expect(result).toEqual({
      success: "该邮箱格式可以使用。",
    });
  });
});
