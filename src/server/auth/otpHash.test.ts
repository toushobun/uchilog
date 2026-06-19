import { createHash } from "node:crypto";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  hashAuthOtpEmail,
  hashAuthOtpIp,
  hashAuthOtpValue,
  normalizeAuthOtpEmail,
  normalizeAuthOtpIp,
} from "./otpHash";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("auth OTP hash", () => {
  it("邮箱 hash 前会去除首尾空白并转成小写", () => {
    expect(normalizeAuthOtpEmail("  USER@Example.COM  ")).toBe(
      "user@example.com",
    );
    expect(hashAuthOtpEmail("  USER@Example.COM  ")).toBe(
      sha256("user@example.com"),
    );
  });

  it("相同标准化输入每次生成一致的 hash", () => {
    expect(hashAuthOtpValue("same-value")).toBe(hashAuthOtpValue("same-value"));
  });

  it("IP 优先使用 Vercel 转发头", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.10",
      "x-real-ip": "198.51.100.20",
      "x-vercel-forwarded-for": "192.0.2.30",
    });

    expect(normalizeAuthOtpIp(headers)).toBe("192.0.2.30");
    expect(hashAuthOtpIp(headers)).toBe(sha256("192.0.2.30"));
  });

  it("Vercel 转发头无效时使用下一个可信 header", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.10",
      "x-vercel-forwarded-for": "not-an-ip",
    });

    expect(normalizeAuthOtpIp(headers)).toBe("203.0.113.10");
    expect(hashAuthOtpIp(headers)).toBe(sha256("203.0.113.10"));
  });

  it("IP 优先使用 x-forwarded-for 的最后一个非空值", () => {
    const headers = new Headers({
      "x-forwarded-for": " , 203.0.113.10, 203.0.113.11",
      "x-real-ip": "198.51.100.20",
    });

    expect(normalizeAuthOtpIp(headers)).toBe("203.0.113.11");
    expect(hashAuthOtpIp(headers)).toBe(sha256("203.0.113.11"));
  });

  it("没有 x-forwarded-for 时使用 x-real-ip", () => {
    const headers = new Headers({
      "x-real-ip": " 198.51.100.20 ",
    });

    expect(normalizeAuthOtpIp(headers)).toBe("198.51.100.20");
  });

  it("没有更高优先级的 header 时使用 x-vercel-proxied-for", () => {
    const headers = new Headers({
      "x-vercel-proxied-for": " , 192.0.2.40, 192.0.2.41",
    });

    expect(normalizeAuthOtpIp(headers)).toBe("192.0.2.41");
  });

  it("从 forwarded header 读取 for 值", () => {
    const headers = new Headers({
      forwarded: 'for="192.0.2.50";proto=https, for="192.0.2.51";proto=https',
    });

    expect(normalizeAuthOtpIp(headers)).toBe("192.0.2.51");
  });

  it("从 forwarded header 读取无引号 IPv4", () => {
    const headers = new Headers({
      forwarded: "for=192.0.2.50;proto=https",
    });

    expect(normalizeAuthOtpIp(headers)).toBe("192.0.2.50");
  });

  it.each([
    ['for="192.0.2.50:8080"', "192.0.2.50"],
    ['for="[2001:db8::1]"', "2001:db8::1"],
    ['for="[2001:db8::1]:8080"', "2001:db8::1"],
  ])("标准化 forwarded 的 IP 节点标识：%s", (forwarded, expected) => {
    expect(normalizeAuthOtpIp(new Headers({ forwarded }))).toBe(expected);
  });

  it("无法识别任意字符串为可信 IP", () => {
    vi.stubEnv("NODE_ENV", "production");
    const headers = new Headers({
      forwarded: 'for="not-an-ip"',
      "x-vercel-proxied-for": "arbitrary-value",
    });

    expect(normalizeAuthOtpIp(headers)).toBeNull();
    expect(hashAuthOtpIp(headers)).toBeNull();
  });

  it("开发环境没有可用 IP 时使用本地 fallback", () => {
    vi.stubEnv("NODE_ENV", "development");
    const headers = new Headers();

    expect(normalizeAuthOtpIp(headers)).toBe("127.0.0.1");
    expect(hashAuthOtpIp(headers)).toBe(sha256("127.0.0.1"));
  });

  it.each(["production", "test"])(
    "%s 环境没有可用 IP 时返回 null",
    (nodeEnv) => {
      vi.stubEnv("NODE_ENV", nodeEnv);
      const headers = new Headers({
        forwarded: "proto=https",
        "x-forwarded-for": " , ",
        "x-real-ip": " ",
        "x-vercel-proxied-for": " ",
      });

      expect(normalizeAuthOtpIp(headers)).toBeNull();
      expect(hashAuthOtpIp(headers)).toBeNull();
    },
  );
});
