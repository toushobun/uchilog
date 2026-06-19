import { beforeEach, describe, expect, it, vi } from "vitest";

import { createSupabaseMock } from "test/supabaseMock";

const mocks = vi.hoisted(() => ({
  createServiceRoleClient: vi.fn(),
}));

vi.mock("lib/supabase/serviceRole", () => ({
  createServiceRoleClient: mocks.createServiceRoleClient,
}));

import {
  checkAuthOtpSendRateLimit,
  checkRegisterEmailAvailabilityRateLimit,
  countAuthOtpVerifyFailuresSinceLastSend,
  recordAuthOtpAttempt,
} from "./otpAttempts";

const emailHash = "e".repeat(64);
const ipHash = "f".repeat(64);
const now = new Date("2026-06-16T12:00:00.000Z");

function rows(createdAtValues: string[]) {
  return createdAtValues.map((created_at) => ({ created_at }));
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("auth OTP attempts", () => {
  it("成功发送次数未命中限制时允许发送", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [
        {
          data: rows(["2026-06-15T13:00:00.000Z", "2026-06-16T10:00:00.000Z"]),
        },
        { data: rows(["2026-06-16T10:30:00.000Z"]) },
      ],
    });
    mocks.createServiceRoleClient.mockReturnValue(supabase.client);

    await expect(
      checkAuthOtpSendRateLimit({ emailHash, ipHash, now }),
    ).resolves.toEqual({
      allowed: true,
      retryAfterSeconds: 0,
    });

    expect(mocks.createServiceRoleClient).toHaveBeenCalledTimes(1);
    expect(supabase.queries[0].calls).toEqual(
      expect.arrayContaining([
        { args: ["attempt_type", "send"], method: "eq" },
        { args: ["result", "success"], method: "eq" },
        { args: ["email_hash", emailHash], method: "eq" },
        {
          args: ["created_at", "2026-06-15T12:00:00.000Z"],
          method: "gte",
        },
        { args: ["created_at", { ascending: false }], method: "order" },
        { args: [11], method: "limit" },
      ]),
    );
    expect(supabase.queries[1].calls).toEqual(
      expect.arrayContaining([
        { args: ["ip_hash", ipHash], method: "eq" },
        { args: ["created_at", { ascending: false }], method: "order" },
        { args: [101], method: "limit" },
      ]),
    );
  });

  it("60 秒冷却命中时返回剩余秒数", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [
        { data: rows(["2026-06-16T11:59:30.000Z"]) },
        { data: [] },
      ],
    });
    mocks.createServiceRoleClient.mockReturnValue(supabase.client);

    await expect(
      checkAuthOtpSendRateLimit({ emailHash, ipHash, now }),
    ).resolves.toEqual({
      allowed: false,
      retryAfterSeconds: 30,
    });
  });

  it("多个发送限制同时命中时使用最长剩余时间", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [
        {
          data: rows([
            "2026-06-15T13:00:00.000Z",
            "2026-06-16T08:00:00.000Z",
            "2026-06-16T09:00:00.000Z",
            "2026-06-16T10:00:00.000Z",
            "2026-06-16T11:10:00.000Z",
            "2026-06-16T11:20:00.000Z",
            "2026-06-16T11:30:00.000Z",
            "2026-06-16T11:40:00.000Z",
            "2026-06-16T11:50:00.000Z",
            "2026-06-16T11:59:45.000Z",
          ]),
        },
        { data: rows(["2026-06-16T11:30:00.000Z"]) },
      ],
    });
    mocks.createServiceRoleClient.mockReturnValue(supabase.client);

    await expect(
      checkAuthOtpSendRateLimit({ emailHash, ipHash, now }),
    ).resolves.toEqual({
      allowed: false,
      retryAfterSeconds: 3600,
    });
  });

  it("email 未命中但 IP 超限时拒绝发送", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [
        { data: rows(["2026-06-16T10:00:00.000Z"]) },
        {
          data: rows([
            "2026-06-16T11:01:00.000Z",
            "2026-06-16T11:02:00.000Z",
            "2026-06-16T11:03:00.000Z",
            "2026-06-16T11:04:00.000Z",
            "2026-06-16T11:05:00.000Z",
            "2026-06-16T11:06:00.000Z",
            "2026-06-16T11:07:00.000Z",
            "2026-06-16T11:08:00.000Z",
            "2026-06-16T11:09:00.000Z",
            "2026-06-16T11:10:00.000Z",
            "2026-06-16T11:11:00.000Z",
            "2026-06-16T11:12:00.000Z",
            "2026-06-16T11:13:00.000Z",
            "2026-06-16T11:14:00.000Z",
            "2026-06-16T11:15:00.000Z",
            "2026-06-16T11:16:00.000Z",
            "2026-06-16T11:17:00.000Z",
            "2026-06-16T11:18:00.000Z",
            "2026-06-16T11:19:00.000Z",
            "2026-06-16T11:20:00.000Z",
          ]),
        },
      ],
    });
    mocks.createServiceRoleClient.mockReturnValue(supabase.client);

    await expect(
      checkAuthOtpSendRateLimit({ emailHash, ipHash, now }),
    ).resolves.toEqual({
      allowed: false,
      retryAfterSeconds: 60,
    });
  });

  it("读取发送记录失败时抛出错误", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [{ error: new Error("db down") }, { data: [] }],
    });
    mocks.createServiceRoleClient.mockReturnValue(supabase.client);

    await expect(
      checkAuthOtpSendRateLimit({ emailHash, ipHash, now }),
    ).rejects.toThrow("Failed to load auth OTP send attempts.");
  });

  it("读取 IP 发送记录失败时抛出错误", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [{ data: [] }, { error: new Error("db down") }],
    });
    mocks.createServiceRoleClient.mockReturnValue(supabase.client);

    await expect(
      checkAuthOtpSendRateLimit({ emailHash, ipHash, now }),
    ).rejects.toThrow("Failed to load auth OTP send attempts.");
  });

  it("邮箱可用性检查未命中 IP 限制时允许查询", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [
        {
          data: rows(["2026-06-16T11:30:00.000Z", "2026-06-16T11:59:00.000Z"]),
        },
      ],
    });
    mocks.createServiceRoleClient.mockReturnValue(supabase.client);

    await expect(
      checkRegisterEmailAvailabilityRateLimit({ ipHash, now }),
    ).resolves.toEqual({
      allowed: true,
      retryAfterSeconds: 0,
    });

    expect(supabase.queries[0].calls).toEqual(
      expect.arrayContaining([
        { args: ["attempt_type", "availability_check"], method: "eq" },
        { args: ["ip_hash", ipHash], method: "eq" },
        {
          args: ["created_at", "2026-06-16T11:00:00.000Z"],
          method: "gte",
        },
        { args: [101], method: "limit" },
      ]),
    );
  });

  it("一分钟内邮箱可用性检查达到上限时拒绝查询", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [
        {
          data: rows(
            Array.from(
              { length: 10 },
              (_, index) =>
                `2026-06-16T11:59:${String(index + 30).padStart(2, "0")}.000Z`,
            ),
          ),
        },
      ],
    });
    mocks.createServiceRoleClient.mockReturnValue(supabase.client);

    await expect(
      checkRegisterEmailAvailabilityRateLimit({ ipHash, now }),
    ).resolves.toEqual({
      allowed: false,
      retryAfterSeconds: 30,
    });
  });

  it("一小时内邮箱可用性检查达到上限时拒绝查询", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [
        {
          data: rows(
            Array.from({ length: 100 }, (_, index) =>
              new Date(
                new Date("2026-06-16T11:00:01.000Z").getTime() +
                  index * 30 * 1000,
              ).toISOString(),
            ),
          ),
        },
      ],
    });
    mocks.createServiceRoleClient.mockReturnValue(supabase.client);

    await expect(
      checkRegisterEmailAvailabilityRateLimit({ ipHash, now }),
    ).resolves.toEqual({
      allowed: false,
      retryAfterSeconds: 1,
    });
  });

  it("读取邮箱可用性检查记录失败时抛出错误", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [{ error: new Error("db down") }],
    });
    mocks.createServiceRoleClient.mockReturnValue(supabase.client);

    await expect(
      checkRegisterEmailAvailabilityRateLimit({ ipHash, now }),
    ).rejects.toThrow("Failed to load register email availability attempts.");
  });

  it("写入 OTP attempt 记录", async () => {
    const supabase = createSupabaseMock();
    mocks.createServiceRoleClient.mockReturnValue(supabase.client);

    await expect(
      recordAuthOtpAttempt({
        attempt_type: "send",
        email_hash: emailHash,
        ip_hash: ipHash,
        purpose: "signup",
        result: "blocked",
      }),
    ).resolves.toBeUndefined();

    expect(supabase.queries[0].table).toBe("auth_otp_attempt");
    expect(supabase.queries[0].calls).toEqual([
      {
        args: [
          {
            attempt_type: "send",
            email_hash: emailHash,
            ip_hash: ipHash,
            purpose: "signup",
            result: "blocked",
          },
        ],
        method: "insert",
      },
    ]);
  });

  it("写入 OTP attempt 失败时抛出错误", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [{ error: new Error("insert failed") }],
    });
    mocks.createServiceRoleClient.mockReturnValue(supabase.client);

    await expect(
      recordAuthOtpAttempt({
        attempt_type: "send",
        email_hash: emailHash,
        ip_hash: ipHash,
        purpose: "signup",
        result: "blocked",
      }),
    ).rejects.toThrow("Failed to record auth OTP attempt.");
  });

  it("统计最近一次成功发送之后的验证失败次数", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [
        { data: { created_at: "2026-06-16T11:50:00.000Z" } },
        { count: 3 },
      ],
    });
    mocks.createServiceRoleClient.mockReturnValue(supabase.client);

    await expect(
      countAuthOtpVerifyFailuresSinceLastSend({ emailHash, now }),
    ).resolves.toBe(3);

    expect(supabase.queries[1].calls).toEqual(
      expect.arrayContaining([
        { args: ["attempt_type", "verify_failure"], method: "eq" },
        { args: ["created_at", "2026-06-16T11:50:00.000Z"], method: "gt" },
      ]),
    );
  });

  it("没有成功发送记录时验证失败次数为 0", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [{ data: null }],
    });
    mocks.createServiceRoleClient.mockReturnValue(supabase.client);

    await expect(
      countAuthOtpVerifyFailuresSinceLastSend({ emailHash, now }),
    ).resolves.toBe(0);
  });

  it("读取最近一次成功发送失败时抛出错误", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [{ error: new Error("select failed") }],
    });
    mocks.createServiceRoleClient.mockReturnValue(supabase.client);

    await expect(
      countAuthOtpVerifyFailuresSinceLastSend({ emailHash, now }),
    ).rejects.toThrow("Failed to load latest auth OTP send attempt.");
  });

  it("统计验证失败次数失败时抛出错误", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [
        { data: { created_at: "2026-06-16T11:50:00.000Z" } },
        { error: new Error("count failed") },
      ],
    });
    mocks.createServiceRoleClient.mockReturnValue(supabase.client);

    await expect(
      countAuthOtpVerifyFailuresSinceLastSend({ emailHash, now }),
    ).rejects.toThrow("Failed to count auth OTP verify failures.");
  });
});
