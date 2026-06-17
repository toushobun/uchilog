import { beforeEach, describe, expect, it, vi } from "vitest";

import { verifyTurnstileToken } from "./turnstile";

const originalFetch = globalThis.fetch;

beforeEach(() => {
  vi.restoreAllMocks();
  delete process.env.TURNSTILE_SECRET_KEY;
  globalThis.fetch = originalFetch;
});

describe("verifyTurnstileToken", () => {
  it("secret 缺失时 fail closed", async () => {
    await expect(verifyTurnstileToken({ token: "token" })).resolves.toBe(false);
  });

  it("token 缺失时 fail closed", async () => {
    process.env.TURNSTILE_SECRET_KEY = "secret";

    await expect(verifyTurnstileToken({ token: "" })).resolves.toBe(false);
  });

  it("fetch 抛错时 fail closed", async () => {
    process.env.TURNSTILE_SECRET_KEY = "secret";
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network"));

    await expect(verifyTurnstileToken({ token: "token" })).resolves.toBe(false);
  });

  it("HTTP 非 OK 时 fail closed", async () => {
    process.env.TURNSTILE_SECRET_KEY = "secret";
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
    } as Response);

    await expect(verifyTurnstileToken({ token: "token" })).resolves.toBe(false);
  });

  it("response.json() 抛错时 fail closed", async () => {
    process.env.TURNSTILE_SECRET_KEY = "secret";
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      json: async () => {
        throw new Error("parse error");
      },
      ok: true,
    } as unknown as Response);

    await expect(verifyTurnstileToken({ token: "token" })).resolves.toBe(false);
  });

  it("success 不是 true 时 fail closed", async () => {
    process.env.TURNSTILE_SECRET_KEY = "secret";
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      json: async () => ({ success: false }),
      ok: true,
    } as Response);

    await expect(verifyTurnstileToken({ token: "token" })).resolves.toBe(false);
  });

  it("success 是 true 时通过校验", async () => {
    process.env.TURNSTILE_SECRET_KEY = "secret";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      json: async () => ({ success: true }),
      ok: true,
    } as Response);

    await expect(
      verifyTurnstileToken({ remoteIp: "203.0.113.10", token: "token" }),
    ).resolves.toBe(true);

    const [, init] = fetchMock.mock.calls[0];
    expect(init?.method).toBe("POST");
    expect(init?.body).toBeInstanceOf(URLSearchParams);
    expect((init?.body as URLSearchParams).get("remoteip")).toBe(
      "203.0.113.10",
    );
  });
});
