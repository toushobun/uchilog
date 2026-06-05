// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SettingsLinkCard } from "./SettingsLinkCard";

afterEach(() => {
  cleanup();
});

describe("SettingsLinkCard", () => {
  it("显示设置入口并指向指定页面", () => {
    render(
      <SettingsLinkCard
        buttonLabel="打开账户管理"
        description="管理当前账本的现金、银行卡、信用卡等账户，并可继续新增账户。"
        href="/accounts"
        title="账户管理"
      />,
    );

    expect(screen.getByText("账户管理")).toBeTruthy();
    expect(
      screen.getByText(
        "管理当前账本的现金、银行卡、信用卡等账户，并可继续新增账户。",
      ),
    ).toBeTruthy();
    expect(screen.getByRole("link", { name: "打开账户管理" })).toHaveProperty(
      "href",
      "http://localhost:3000/accounts",
    );
  });
});
