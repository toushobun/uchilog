import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TransactionTypeNavigation } from "./TransactionTypeNavigation";

afterEach(() => {
  cleanup();
});

describe("TransactionTypeNavigation", () => {
  it("默认渲染三种类型", () => {
    render(
      <TransactionTypeNavigation activeType="expense" onChange={() => {}} />,
    );

    expect(screen.getByRole("button", { name: "支出" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "收入" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "转账" })).toBeInTheDocument();
  });

  it("当前类型高亮", () => {
    render(
      <TransactionTypeNavigation activeType="income" onChange={() => {}} />,
    );

    expect(screen.getByRole("button", { name: "收入" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "支出" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "转账" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("点击转账会触发切换", () => {
    const onChange = vi.fn();
    render(
      <TransactionTypeNavigation activeType="expense" onChange={onChange} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "转账" }));

    expect(onChange).toHaveBeenCalledWith("transfer");
  });

  it("点击支出会触发切换", () => {
    const onChange = vi.fn();
    render(
      <TransactionTypeNavigation activeType="transfer" onChange={onChange} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "支出" }));

    expect(onChange).toHaveBeenCalledWith("expense");
  });

  it("点击收入会触发切换", () => {
    const onChange = vi.fn();
    render(
      <TransactionTypeNavigation activeType="transfer" onChange={onChange} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "收入" }));

    expect(onChange).toHaveBeenCalledWith("income");
  });
});
