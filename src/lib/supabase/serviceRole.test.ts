import { afterEach, describe, expect, it, vi } from "vitest";

const createSupabaseClientMock = vi.hoisted(() => vi.fn());

vi.mock("@supabase/supabase-js", () => ({
  createClient: createSupabaseClientMock,
}));

import { createServiceRoleClient } from "./serviceRole";

afterEach(() => {
  vi.unstubAllEnvs();
  createSupabaseClientMock.mockReset();
});

describe("createServiceRoleClient", () => {
  it("优先使用 service role key", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-key");
    vi.stubEnv("SUPABASE_SECRET_KEY", "secret-key");

    createServiceRoleClient();

    expect(createSupabaseClientMock).toHaveBeenCalledWith(
      "http://127.0.0.1:54321",
      "service-role-key",
      expect.any(Object),
    );
  });

  it("service role key 缺失时使用 secret key", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    vi.stubEnv("SUPABASE_SECRET_KEY", "secret-key");

    createServiceRoleClient();

    expect(createSupabaseClientMock).toHaveBeenCalledWith(
      "http://127.0.0.1:54321",
      "secret-key",
      expect.any(Object),
    );
  });

  it("两个服务端 key 均缺失时抛出错误", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    vi.stubEnv("SUPABASE_SECRET_KEY", "");

    expect(() => createServiceRoleClient()).toThrow(
      "Supabase service role environment variables are missing.",
    );
  });
});
