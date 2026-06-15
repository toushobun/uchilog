import { cleanup, fireEvent, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import TransactionEditErrorPage from "./error";

afterEach(() => {
  cleanup();
});

describe("TransactionEditErrorPage", () => {
  it("显示编辑记账页面的错误状态", () => {
    const reset = vi.fn();
    const { container } = render(
      <TransactionEditErrorPage
        error={new Error("load failed")}
        reset={reset}
      />,
    );

    expect(
      within(container).getByRole("heading", { name: "编辑记账" }),
    ).toBeInTheDocument();
    expect(within(container).getByRole("alert")).toBeInTheDocument();
    expect(within(container).getByText("编辑记账读取失败")).toBeInTheDocument();
    expect(
      within(container).getByText(
        "这笔记账暂时无法读取。不存在或无权限的记录仍会显示 404，本提示表示读取过程中发生了未预期错误。",
      ),
    ).toBeInTheDocument();
  });

  it("点击按钮时重新读取编辑数据", () => {
    const reset = vi.fn();
    const { container } = render(
      <TransactionEditErrorPage
        error={new Error("load failed")}
        reset={reset}
      />,
    );

    fireEvent.click(
      within(container).getByRole("button", { name: "重新读取编辑数据" }),
    );

    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("有 digest 时显示错误编号", () => {
    const reset = vi.fn();
    const error = Object.assign(new Error("load failed"), { digest: "abc123" });
    const { container } = render(
      <TransactionEditErrorPage error={error} reset={reset} />,
    );

    expect(
      within(container).getByText(
        "这笔记账暂时无法读取。不存在或无权限的记录仍会显示 404，本提示表示读取过程中发生了未预期错误。错误编号：abc123",
      ),
    ).toBeInTheDocument();
  });
});
