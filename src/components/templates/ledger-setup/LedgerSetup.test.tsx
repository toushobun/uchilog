import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LedgerSetupTemplate } from "./LedgerSetup";

afterEach(() => {
  cleanup();
});

const baseProps = {
  createLedgerAction: vi.fn(async () => {}),
  errorMessage: null,
};

describe("LedgerSetupTemplate", () => {
  it("显示初始化账本页面标题", () => {
    const { container } = render(<LedgerSetupTemplate {...baseProps} />);

    expect(
      within(container).getByRole("heading", { name: "初始化账本" }),
    ).toBeInTheDocument();
  });

  it("显示账本名称输入框", () => {
    const { container } = render(<LedgerSetupTemplate {...baseProps} />);

    // required 字段会在 label 中添加星号，使用正则匹配
    expect(within(container).getByLabelText(/账本名称/)).toBeInTheDocument();
  });

  it("账本名称输入框默认值为家庭账本", () => {
    const { container } = render(<LedgerSetupTemplate {...baseProps} />);

    const input = within(container).getByLabelText(
      /账本名称/,
    ) as HTMLInputElement;

    expect(input.value).toBe("家庭账本");
  });

  it("显示基础货币输入框", () => {
    const { container } = render(<LedgerSetupTemplate {...baseProps} />);

    expect(within(container).getByLabelText(/基础货币/)).toBeInTheDocument();
  });

  it("显示创建账本按钮", () => {
    const { container } = render(<LedgerSetupTemplate {...baseProps} />);

    expect(
      within(container).getByRole("button", { name: "创建账本" }),
    ).toBeInTheDocument();
  });

  it("传入错误信息时显示错误提示", () => {
    const { container } = render(
      <LedgerSetupTemplate
        {...baseProps}
        errorMessage="账本创建失败。请稍后重试。"
      />,
    );

    expect(within(container).getByRole("alert")).toBeInTheDocument();
    expect(
      within(container).getByText("账本创建失败。请稍后重试。"),
    ).toBeInTheDocument();
  });

  it("无错误信息时不显示错误提示", () => {
    const { container } = render(<LedgerSetupTemplate {...baseProps} />);

    expect(within(container).queryByRole("alert")).toBeNull();
  });
});
