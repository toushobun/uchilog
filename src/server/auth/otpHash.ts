import "server-only";

import { createHash } from "node:crypto";

export function hashAuthOtpValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function normalizeAuthOtpEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hashAuthOtpEmail(email: string) {
  return hashAuthOtpValue(normalizeAuthOtpEmail(email));
}

type AuthOtpHeaders = Pick<Headers, "get">;

export function normalizeAuthOtpIp(headers: AuthOtpHeaders) {
  // x-vercel-forwarded-for 依赖 Vercel 平台保证不可被客户端伪造。
  const vercelForwardedFor = headers.get("x-vercel-forwarded-for")?.trim();

  if (vercelForwardedFor && vercelForwardedFor.length > 0) {
    return vercelForwardedFor;
  }

  // x-forwarded-for 依赖部署层保证最后一个值来自受信代理。
  const forwardedForValues = headers
    .get("x-forwarded-for")
    ?.split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
  const forwardedFor = forwardedForValues?.[forwardedForValues.length - 1];

  const realIp = headers.get("x-real-ip")?.trim();

  if (forwardedFor) {
    return forwardedFor;
  }

  if (realIp && realIp.length > 0) {
    return realIp;
  }

  const vercelProxiedForValues = headers
    .get("x-vercel-proxied-for")
    ?.split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
  const vercelProxiedFor =
    vercelProxiedForValues?.[vercelProxiedForValues.length - 1];

  if (vercelProxiedFor && vercelProxiedFor.length > 0) {
    return vercelProxiedFor;
  }

  const forwarded = headers.get("forwarded");
  // forwarded 依赖部署层保证最后一个 for= 值来自受信代理。
  const forwardedValues = forwarded
    ?.split(",")
    .flatMap((value) => value.split(";"))
    .map((value) => value.trim())
    .filter((value) => value.toLowerCase().startsWith("for="))
    .map((value) =>
      value
        .slice(4)
        .trim()
        .replace(/^"(.*)"$/, "$1"),
    )
    .filter((value) => value.length > 0);
  const forwardedIp = forwardedValues?.[forwardedValues.length - 1];

  if (forwardedIp && forwardedIp.length > 0) {
    return forwardedIp;
  }

  return process.env.NODE_ENV === "development" ? "127.0.0.1" : null;
}

// 返回 null 表示无法识别可信 IP，调用方必须直接拒绝 OTP 发送。
export function hashAuthOtpIp(headers: AuthOtpHeaders) {
  const ip = normalizeAuthOtpIp(headers);

  return ip ? hashAuthOtpValue(ip) : null;
}
