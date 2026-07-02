import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TransactionFilterResultSummary } from "./TransactionFilterResultSummary";

describe("TransactionFilterResultSummary", () => {
  it("显示分组说明、筛选标签和清除操作", () => {
    const onClear = vi.fn();

    render(
      <TransactionFilterResultSummary
        chips={["支出", "日常", "支付宝", "2026/07"]}
        hasActiveFilters
        label="按商家显示，筛选结果如下"
        onClear={onClear}
      />,
    );

    expect(screen.getByText("按商家显示，筛选结果如下")).toBeInTheDocument();
    expect(screen.getByText("支出")).toBeInTheDocument();
    expect(screen.getByText("日常")).toBeInTheDocument();
    expect(screen.getByText("支付宝")).toBeInTheDocument();
    expect(screen.getByText("2026/07")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "清除" }));

    expect(onClear).toHaveBeenCalledOnce();
  });
});
