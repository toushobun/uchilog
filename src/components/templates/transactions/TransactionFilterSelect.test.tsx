import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TransactionFilterSelect } from "./TransactionFilterSelect";

const options = [
  { label: "钱包", value: "wallet" },
  { label: "银行卡", value: "bank" },
];

describe("TransactionFilterSelect", () => {
  it("值在选项内时正常显示", () => {
    render(
      <TransactionFilterSelect
        label="账户"
        options={options}
        value="bank"
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("combobox", { name: "账户" })).toHaveTextContent(
      "银行卡",
    );
  });

  it("选中值不在选项内时回退显示全部，并清空该值", () => {
    const onChange = vi.fn();

    render(
      <TransactionFilterSelect
        label="账户"
        options={options}
        value="deleted-account"
        onChange={onChange}
      />,
    );

    expect(
      screen.getByRole("combobox", { name: "账户" }),
    ).not.toHaveTextContent("银行卡");
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("选择选项时回调新值", () => {
    const onChange = vi.fn();

    render(
      <TransactionFilterSelect
        label="账户"
        options={options}
        value={undefined}
        onChange={onChange}
      />,
    );

    fireEvent.mouseDown(screen.getByRole("combobox", { name: "账户" }));
    fireEvent.click(screen.getByRole("option", { name: "钱包" }));

    expect(onChange).toHaveBeenCalledWith("wallet");
  });
});
