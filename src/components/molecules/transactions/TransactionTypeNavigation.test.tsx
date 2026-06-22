import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TransactionTypeNavigation } from "./TransactionTypeNavigation";

afterEach(() => {
  cleanup();
});

describe("TransactionTypeNavigation", () => {
  it("点击收入时通知切换为收入", () => {
    const onChange = vi.fn();

    render(<TransactionTypeNavigation value="expense" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "收入" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("income");
  });

  it("点击转账时通知切换为转账", () => {
    const onChange = vi.fn();

    render(<TransactionTypeNavigation value="expense" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "转账" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("transfer");
  });

  it("点击当前选中的类型时不触发切换", () => {
    const onChange = vi.fn();

    render(<TransactionTypeNavigation value="expense" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "支出" }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("当前类型保持选中状态", () => {
    render(<TransactionTypeNavigation value="transfer" onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "转账" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
