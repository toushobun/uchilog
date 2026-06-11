import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentLedgerContext: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("config/paths", () => ({
  routePaths: {
    ledgerSetup: "/ledger-setup",
  },
}));

vi.mock("lib/ledger/current-ledger", () => ({
  getCurrentLedgerContext: mocks.getCurrentLedgerContext,
}));

import { requireCurrentUserAndLedger } from "./currentLedger";

beforeEach(() => {
  mocks.getCurrentLedgerContext.mockReset();
  mocks.redirect.mockClear();
});

describe("requireCurrentUserAndLedger", () => {
  it("当前账本存在时返回用户和账本", async () => {
    const currentLedger = {
      id: "ledger-1",
      name: "家庭账本",
      baseCurrency: "JPY",
    };
    mocks.getCurrentLedgerContext.mockResolvedValue({
      currentLedger,
      email: "user@example.com",
      ledgers: [currentLedger],
      userId: "user-1",
    });

    await expect(requireCurrentUserAndLedger()).resolves.toEqual({
      currentLedger,
      userId: "user-1",
    });
  });

  it("当前账本不存在时跳转到账本初始化页", async () => {
    mocks.getCurrentLedgerContext.mockResolvedValue({
      currentLedger: null,
      email: "user@example.com",
      ledgers: [],
      userId: "user-1",
    });

    await expect(requireCurrentUserAndLedger()).rejects.toThrow(
      "redirect:/ledger-setup",
    );
    expect(mocks.redirect).toHaveBeenCalledWith("/ledger-setup");
  });
});
