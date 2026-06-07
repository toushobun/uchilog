// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";

vi.mock("lib/ledger/current-ledger", () => ({
  getCurrentLedgerContext: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
}));

describe("SettingsPage", () => {
  it("没有当前账本时跳转到账本初始化页面", async () => {
    const { getCurrentLedgerContext } =
      await import("lib/ledger/current-ledger");

    vi.mocked(getCurrentLedgerContext).mockResolvedValue({
      userId: "user-1",
      email: "test@example.com",
      ledgers: [],
      currentLedger: null,
    });

    const { default: SettingsPage } =
      await import("@/app/(protected)/settings/page");

    await expect(SettingsPage()).rejects.toThrow("NEXT_REDIRECT:/ledger-setup");
  });
});
