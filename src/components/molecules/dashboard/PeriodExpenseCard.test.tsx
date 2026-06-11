import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { PeriodExpenseCard } from "./PeriodExpenseCard";

afterEach(() => {
  cleanup();
});

describe("PeriodExpenseCard", () => {
  it("显示标签文字", () => {
    const { container } = render(
      <PeriodExpenseCard label="今日支出" expense="3200" recordCount={5} />,
    );

    expect(within(container).getByText("今日支出")).toBeTruthy();
  });

  it("显示格式化后的支出金额（含负号）", () => {
    const { container } = render(
      <PeriodExpenseCard label="今日支出" expense="3200" recordCount={5} />,
    );

    expect(within(container).getByText("-3,200")).toBeTruthy();
  });

  it("recordCount 大于 0 时显示笔数", () => {
    const { container } = render(
      <PeriodExpenseCard label="今日支出" expense="3200" recordCount={5} />,
    );

    expect(within(container).getByText("共 5 笔记录")).toBeTruthy();
  });

  it("recordCount 为 0 时不显示笔数", () => {
    const { container } = render(
      <PeriodExpenseCard label="今日支出" expense="0" recordCount={0} />,
    );

    expect(within(container).queryByText(/笔记录/)).toBeNull();
  });
});
