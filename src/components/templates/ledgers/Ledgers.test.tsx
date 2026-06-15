import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { CurrentLedger } from "lib/ledger/current-ledger";

import { LedgersTemplate } from "./Ledgers";

afterEach(() => {
  cleanup();
});

const ledgers: CurrentLedger[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    name: "家庭账本",
    baseCurrency: "JPY",
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    name: "个人账本",
    baseCurrency: "CNY",
  },
];

describe("LedgersTemplate", () => {
  it("显示账本页面标题", () => {
    const { container } = render(
      <LedgersTemplate
        currentLedgerId="00000000-0000-4000-8000-000000000001"
        ledgers={ledgers}
      />,
    );

    expect(
      within(container).getByRole("heading", { name: "账本" }),
    ).toBeInTheDocument();
  });

  it("显示账本列表中的账本名称", () => {
    const { container } = render(
      <LedgersTemplate
        currentLedgerId="00000000-0000-4000-8000-000000000001"
        ledgers={ledgers}
      />,
    );

    expect(within(container).getByText("家庭账本")).toBeInTheDocument();
    expect(within(container).getByText("个人账本")).toBeInTheDocument();
  });

  it("当前账本显示「当前」标签", () => {
    const { container } = render(
      <LedgersTemplate
        currentLedgerId="00000000-0000-4000-8000-000000000001"
        ledgers={ledgers}
      />,
    );

    expect(within(container).getByText("当前")).toBeInTheDocument();
  });

  it("非当前账本不显示「当前」标签", () => {
    const { container } = render(
      <LedgersTemplate
        currentLedgerId="00000000-0000-4000-8000-000000000002"
        ledgers={ledgers}
      />,
    );

    const chips = within(container).getAllByText("当前");

    // 只有一个「当前」标签
    expect(chips).toHaveLength(1);
  });

  it("显示账本的基础货币信息", () => {
    const { container } = render(
      <LedgersTemplate
        currentLedgerId="00000000-0000-4000-8000-000000000001"
        ledgers={ledgers}
      />,
    );

    expect(within(container).getByText("基础货币：JPY")).toBeInTheDocument();
  });
});
