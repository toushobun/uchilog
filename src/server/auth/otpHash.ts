import "server-only";

import { createHash } from "node:crypto";
import { isIP } from "node:net";

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

function normalizeIpValue(value: string | null | undefined) {
  const normalized = value?.trim().replace(/^"(.*)"$/, "$1");

  if (!normalized) {
    return null;
  }

  if (isIP(normalized)) {
    return normalized;
  }

  const bracketedIpv6 = normalized.match(/^\[([^\]]+)\](?::\d+)?$/);

  if (bracketedIpv6 && isIP(bracketedIpv6[1]) === 6) {
    return bracketedIpv6[1];
  }

  const ipv4WithPort = normalized.match(/^(.+):\d+$/);

  return ipv4WithPort && isIP(ipv4WithPort[1]) === 4 ? ipv4WithPort[1] : null;
}

export function normalizeAuthOtpIp(headers: AuthOtpHeaders) {
  // x-vercel-forwarded-for 依赖 Vercel 平台保证不可被客户端伪造。
  const vercelForwardedFor = normalizeIpValue(
    headers.get("x-vercel-forwarded-for"),
  );

  if (vercelForwardedFor) {
    return vercelForwardedFor;
  }

  // x-forwarded-for 依赖部署层保证最后一个值来自受信代理。
  const forwardedForValues = headers
    .get("x-forwarded-for")
    ?.split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
  const forwardedFor = normalizeIpValue(
    forwardedForValues?.[forwardedForValues.length - 1],
  );

  const realIp = normalizeIpValue(headers.get("x-real-ip"));

  if (forwardedFor) {
    return forwardedFor;
  }

  if (realIp) {
    return realIp;
  }

  // x-vercel-proxied-for 依赖 Vercel 平台保证最后一个值来自受信代理。
  const vercelProxiedForValues = headers
    .get("x-vercel-proxied-for")
    ?.split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
  const vercelProxiedFor = normalizeIpValue(
    vercelProxiedForValues?.[vercelProxiedForValues.length - 1],
  );

  if (vercelProxiedFor) {
    return vercelProxiedFor;
  }

  const forwarded = headers.get("forwarded");
  // forwarded 依赖部署层保证最后一个 for= 值来自受信代理。
  const forwardedValues = forwarded
    ?.split(/[,;]/)
    .map((value) => value.trim())
    .filter((value) => value.toLowerCase().startsWith("for="))
    .map((value) => value.slice(4))
    .filter((value) => value.length > 0);
  const forwardedIp = normalizeIpValue(
    forwardedValues?.[forwardedValues.length - 1],
  );

  if (forwardedIp) {
    return forwardedIp;
  }

  return process.env.NODE_ENV === "development" ? "127.0.0.1" : null;
}

// 返回 null 表示无法识别可信 IP，调用方必须直接拒绝 OTP 发送。
export function hashAuthOtpIp(headers: AuthOtpHeaders) {
  const ip = normalizeAuthOtpIp(headers);

  return ip ? hashAuthOtpValue(ip) : null;
}
