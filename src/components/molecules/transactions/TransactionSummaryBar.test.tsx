import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { TransactionSummaryBar } from "./TransactionSummaryBar";

afterEach(() => {
  cleanup();
});

describe("TransactionSummaryBar", () => {
  it("显示收入标签", () => {
    const { container } = render(
      <TransactionSummaryBar
        summary={{
          currency: "JPY",
          income: "260000",
          expense: "80000",
          balance: "180000",
        }}
      />,
    );

    expect(within(container).getByText("收入")).toBeTruthy();
  });

  it("显示支出标签", () => {
    const { container } = render(
      <TransactionSummaryBar
        summary={{
          currency: "JPY",
          income: "260000",
          expense: "80000",
          balance: "180000",
        }}
      />,
    );

    expect(within(container).getByText("支出")).toBeTruthy();
  });

  it("显示结余标签", () => {
    const { container } = render(
      <TransactionSummaryBar
        summary={{
          currency: "JPY",
          income: "260000",
          expense: "80000",
          balance: "180000",
        }}
      />,
    );

    expect(within(container).getByText("结余")).toBeTruthy();
  });

  it("显示格式化后的收入金额", () => {
    const { container } = render(
      <TransactionSummaryBar
        summary={{
          currency: "JPY",
          income: "260000",
          expense: "80000",
          balance: "180000",
        }}
      />,
    );

    expect(within(container).getByText("260,000")).toBeTruthy();
  });

  it("显示格式化后的支出金额", () => {
    const { container } = render(
      <TransactionSummaryBar
        summary={{
          currency: "JPY",
          income: "260000",
          expense: "80000",
          balance: "180000",
        }}
      />,
    );

    expect(within(container).getByText("80,000")).toBeTruthy();
  });
});
