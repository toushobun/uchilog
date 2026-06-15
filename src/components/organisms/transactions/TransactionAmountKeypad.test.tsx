import { useState } from "react";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { transactionFormValidationMessages } from "utils/transactionMessages";

import { TransactionAmountKeypad } from "./TransactionAmountKeypad";

afterEach(() => {
  cleanup();
});

function ControlledAmountKeypad({
  currency,
  onConfirm = vi.fn(),
}: {
  currency?: string;
  onConfirm?: (value: string) => void;
}) {
  const [value, setValue] = useState("");

  return (
    <TransactionAmountKeypad
      currency={currency}
      value={value}
      onChange={setValue}
      onConfirm={onConfirm}
    />
  );
}

describe("TransactionAmountKeypad", () => {
  it("可以通过数字键和确认键回填金额", () => {
    const handleChange = vi.fn();
    const handleConfirm = vi.fn();

    render(
      <TransactionAmountKeypad
        value=""
        onChange={handleChange}
        onConfirm={handleConfirm}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "确认" }));

    expect(handleChange).toHaveBeenLastCalledWith("12");
    expect(handleChange).toHaveBeenCalledTimes(2);
    expect(handleConfirm).toHaveBeenCalledWith("12");
  });

  it("按指定布局显示确认键和退格键", () => {
    render(
      <TransactionAmountKeypad
        value=""
        onChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "确认" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "退格" })).toBeInTheDocument();
  });

  it("根据 currency 显示金额符号", () => {
    render(
      <TransactionAmountKeypad
        currency="USD"
        value="12"
        onChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("计算器显示金额").textContent).toContain(
      "$ 12",
    );
  });

  it("支持清空当前输入", () => {
    const handleChange = vi.fn();

    render(
      <TransactionAmountKeypad
        value="12"
        onChange={handleChange}
        onConfirm={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "清空" }));

    expect(handleChange).toHaveBeenLastCalledWith("");
  });

  it("普通输入时不显示表达式，按加减号后才显示", () => {
    render(<ControlledAmountKeypad />);

    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));

    expect(
      screen.queryByText("50", { selector: ".MuiTypography-caption" }),
    ).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "加" }));

    expect(screen.getByText("50 +")).toBeInTheDocument();
  });

  it("支持受控状态下实时预览加法结果和输入表达式", () => {
    render(<ControlledAmountKeypad />);

    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "加" }));
    fireEvent.click(screen.getByRole("button", { name: "2" }));

    expect(screen.getByLabelText("计算器显示金额").textContent).toContain(
      "102",
    );
    expect(screen.getByText("100 + 2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "0" }));
    expect(screen.getByLabelText("计算器显示金额").textContent).toContain(
      "120",
    );
    expect(screen.getByText("100 + 20")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "0" }));
    expect(screen.getByLabelText("计算器显示金额").textContent).toContain(
      "300",
    );
    expect(screen.getByText("100 + 200")).toBeInTheDocument();
  });

  it("支持简单加法和减法", () => {
    const handleConfirm = vi.fn();

    render(<ControlledAmountKeypad onConfirm={handleConfirm} />);

    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "加" }));
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "减" }));
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    fireEvent.click(screen.getByRole("button", { name: "确认" }));

    expect(handleConfirm).toHaveBeenCalledWith("12");
  });

  it("连续按加号时保留完整表达式继续输入", () => {
    const handleConfirm = vi.fn();

    render(<ControlledAmountKeypad onConfirm={handleConfirm} />);

    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "加" }));
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "加" }));

    expect(screen.getByLabelText("计算器显示金额").textContent).toContain(
      "101",
    );
    expect(screen.getByText("51 + 50 +")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(screen.getByText("51 + 50 + 2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "确认" }));
    expect(handleConfirm).toHaveBeenCalledWith("103");
  });

  it("JPY 场景下小数点按钮不可用", () => {
    render(
      <TransactionAmountKeypad
        currency="JPY"
        value=""
        onChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "." })).toHaveProperty(
      "disabled",
      true,
    );
  });

  it("可以确认 0 金额", () => {
    const handleConfirm = vi.fn();

    render(
      <TransactionAmountKeypad
        value="0"
        onChange={vi.fn()}
        onConfirm={handleConfirm}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "确认" }));

    expect(handleConfirm).toHaveBeenCalledWith("0");
  });

  it("刚打开时可直接确认显示的 0 金额", () => {
    const handleConfirm = vi.fn();
    const handleChange = vi.fn();

    render(
      <TransactionAmountKeypad
        value=""
        onChange={handleChange}
        onConfirm={handleConfirm}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "确认" }));

    expect(
      screen.queryByText(transactionFormValidationMessages.amountInvalid),
    ).toBeNull();
    expect(handleChange).toHaveBeenCalledWith("0");
    expect(handleConfirm).toHaveBeenCalledWith("0");
  });

  it("父组件清空金额后重置上一次的计算表达式", () => {
    const { rerender } = render(
      <TransactionAmountKeypad
        value="53"
        onChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "加" }));
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    fireEvent.click(screen.getByRole("button", { name: "6" }));

    expect(screen.getByLabelText("计算器显示金额").textContent).toContain("89");
    expect(screen.getByText("53 + 36")).toBeInTheDocument();

    rerender(
      <TransactionAmountKeypad
        value=""
        onChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("计算器显示金额").textContent).toContain("0");
    expect(screen.queryByText("53 + 36")).toBeNull();
  });

  it("减到负数确认失败时不把结果写回表达式", () => {
    render(
      <TransactionAmountKeypad
        value=""
        onChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "6" }));
    fireEvent.click(screen.getByRole("button", { name: "6" }));
    fireEvent.click(screen.getByRole("button", { name: "减" }));
    fireEvent.click(screen.getByRole("button", { name: "9" }));
    fireEvent.click(screen.getByRole("button", { name: "9" }));
    fireEvent.click(screen.getByRole("button", { name: "确认" }));

    expect(screen.getByLabelText("计算器显示金额").textContent).toContain(
      "-33",
    );
    expect(screen.getByText("66 - 99")).toBeInTheDocument();
    expect(screen.queryByText("66 - -33")).toBeNull();
    expect(
      screen.getByText(transactionFormValidationMessages.amountInvalid),
    ).toBeInTheDocument();
  });
});
