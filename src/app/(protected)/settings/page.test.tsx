// @vitest-environment jsdom

import { cleanup, render, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("lib/ledger/current-ledger", () => ({
  getCurrentLedgerContext: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
}));

vi.mock("ui/UserThemePicker", () => ({
  UserThemePicker: (): ReactNode => <div data-testid="user-theme-picker" />,
}));

afterEach(() => {
  cleanup();
});

describe("SettingsPage", () => {
  beforeEach(async () => {
    const { getCurrentLedgerContext } =
      await import("lib/ledger/current-ledger");
    vi.mocked(getCurrentLedgerContext).mockResolvedValue({
      userId: "user-1",
      email: "test@example.com",
      ledgers: [
        {
          id: "ledger-1",
          name: "家庭账本",
          baseCurrency: "JPY",
        },
      ],
      currentLedger: {
        id: "ledger-1",
        name: "家庭账本",
        baseCurrency: "JPY",
      },
    });
  });

  it("显示当前账本名称", async () => {
    const { default: SettingsPage } = await import("./page");
    const { container } = render(await SettingsPage());

    expect(within(container).getByText("当前账本：家庭账本")).toBeTruthy();
  });

  it("账户管理区域显示标题和说明文字", async () => {
    const { default: SettingsPage } = await import("./page");
    const { container } = render(await SettingsPage());

    expect(
      within(container).getByRole("heading", { name: "账户管理" }),
    ).toBeTruthy();
    expect(
      within(container).getByText(
        "管理当前账本的现金、银行卡、信用卡等账户，并可继续新增账户。",
      ),
    ).toBeTruthy();
  });

  it("打开账户管理按钮链接到账户管理页面", async () => {
    const { default: SettingsPage } = await import("./page");
    const { container } = render(await SettingsPage());

    expect(
      within(container)
        .getByRole("link", { name: "打开账户管理" })
        .getAttribute("href"),
    ).toBe("/accounts");
  });

  it("没有当前账本时跳转到账本初始化页面", async () => {
    const { getCurrentLedgerContext } =
      await import("lib/ledger/current-ledger");
    const emptyLedgerContext: Awaited<
      ReturnType<typeof getCurrentLedgerContext>
    > = {
      userId: "user-1",
      email: "test@example.com",
      ledgers: [],
      currentLedger: null,
    };

    vi.mocked(getCurrentLedgerContext).mockResolvedValue(emptyLedgerContext);

    const { default: SettingsPage } = await import("./page");

    await expect(SettingsPage()).rejects.toThrow("NEXT_REDIRECT:/ledger-setup");
  });
});
