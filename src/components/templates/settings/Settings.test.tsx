import { cleanup, render, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SettingsTemplate } from "./Settings";

vi.mock("molecules/theme/UserThemePicker", () => ({
  UserThemePicker: (): ReactNode => <div data-testid="user-theme-picker" />,
}));

afterEach(() => {
  cleanup();
});

const baseProps = {
  currentLedgerName: "家庭账本",
  email: "test@example.com",
  logoutAction: vi.fn(async () => {}),
};

describe("SettingsTemplate", () => {
  it("显示设置页面标题和当前账本名称", () => {
    const { container } = render(<SettingsTemplate {...baseProps} />);

    expect(
      within(container).getByRole("heading", { name: "设置" }),
    ).toBeTruthy();
    expect(within(container).getAllByText("当前账本：家庭账本").length).toBe(1);
  });

  it("账户管理区域显示标题和说明文字", () => {
    const { container } = render(<SettingsTemplate {...baseProps} />);

    expect(
      within(container).getByRole("heading", { name: "账户管理" }),
    ).toBeTruthy();
    expect(
      within(container).getByText(
        "管理当前账本的现金、银行卡、信用卡等账户，并可继续新增账户。",
      ),
    ).toBeTruthy();
  });

  it("打开账户管理按钮链接到账户管理页面", () => {
    const { container } = render(<SettingsTemplate {...baseProps} />);

    expect(
      within(container)
        .getByRole("link", { name: "打开账户管理" })
        .getAttribute("href"),
    ).toBe("/accounts");
  });
});
