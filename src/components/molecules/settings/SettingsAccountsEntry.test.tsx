import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SettingsAccountsEntry } from "./SettingsAccountsEntry";

afterEach(() => {
  cleanup();
});

describe("SettingsAccountsEntry", () => {
  it("显示账户管理标题", () => {
    const { container } = render(<SettingsAccountsEntry />);

    expect(
      within(container).getByRole("heading", { name: "账户管理" }),
    ).toBeTruthy();
  });

  it("打开账户管理按钮链接到账户管理页面", () => {
    const { container } = render(<SettingsAccountsEntry />);

    const link = within(container).getByRole("link", { name: "打开账户管理" });

    expect(link.getAttribute("href")).toBe("/accounts");
  });
});
