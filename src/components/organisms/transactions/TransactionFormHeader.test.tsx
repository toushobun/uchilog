import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TransactionFormHeader } from "./TransactionFormHeader";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

afterEach(() => {
  cleanup();
});

describe("TransactionFormHeader", () => {
  it("渲染标题、关闭链接和保存按钮", () => {
    render(
      <TransactionFormHeader
        closeHref="/transactions"
        isSubmitDisabled={false}
        title="新增记账"
      />,
    );

    expect(screen.getByText("新增记账")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "关闭" })).toHaveAttribute(
      "href",
      "/transactions",
    );
    expect(screen.getByRole("button", { name: "保存" })).toBeInTheDocument();
  });

  it("isSubmitDisabled=true 时保存按钮禁用", () => {
    render(
      <TransactionFormHeader
        closeHref="/transactions"
        isSubmitDisabled={true}
        title="新增记账"
      />,
    );

    expect(screen.getByRole("button", { name: "保存" })).toHaveProperty(
      "disabled",
      true,
    );
  });

  it("isSubmitDisabled=false 时保存按钮可用", () => {
    render(
      <TransactionFormHeader
        closeHref="/transactions"
        isSubmitDisabled={false}
        title="新增记账"
      />,
    );

    expect(screen.getByRole("button", { name: "保存" })).toHaveProperty(
      "disabled",
      false,
    );
  });

  it("传入 ledgerName 时显示账本名", () => {
    render(
      <TransactionFormHeader
        closeHref="/transactions"
        isSubmitDisabled={false}
        ledgerName="家庭账本"
        title="新增记账"
      />,
    );

    expect(screen.getByText("当前账本：家庭账本")).toBeInTheDocument();
  });

  it("不传 ledgerName 时不显示账本名区域", () => {
    render(
      <TransactionFormHeader
        closeHref="/transactions"
        isSubmitDisabled={false}
        title="新增记账"
      />,
    );

    expect(screen.queryByText(/当前账本/)).toBeNull();
  });
});
