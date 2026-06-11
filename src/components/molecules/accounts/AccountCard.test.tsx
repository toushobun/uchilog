import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AccountCard } from "./AccountCard";

afterEach(() => {
  cleanup();
});

const baseProps = {
  name: "三菱UFJ银行",
  type: "bank" as const,
  currency: "JPY",
  initialBalance: 100000,
  currentBalance: 85000,
  holders: [],
};

describe("AccountCard", () => {
  it("显示账户名称", () => {
    const { container } = render(<AccountCard {...baseProps} />);

    expect(within(container).getByText("三菱UFJ银行")).toBeTruthy();
  });

  it("显示账户类型标签", () => {
    const { container } = render(<AccountCard {...baseProps} />);

    expect(within(container).getByText("银行账户")).toBeTruthy();
  });

  it("显示当前余额", () => {
    const { container } = render(<AccountCard {...baseProps} />);

    expect(within(container).getByText(/当前余额/)).toBeTruthy();
  });

  it("没有持有人时显示未设置", () => {
    const { container } = render(<AccountCard {...baseProps} />);

    expect(within(container).getByText("未设置")).toBeTruthy();
  });

  it("有持有人时显示持有人名称", () => {
    const { container } = render(
      <AccountCard
        {...baseProps}
        holders={[
          {
            id: "holder-1",
            user_id: "user-1",
            display_name: "张三",
            email: "zhangsan@example.com",
            display_color: "sky",
            role: "owner",
            share_ratio: null,
          },
        ]}
      />,
    );

    expect(within(container).getByText(/张三/)).toBeTruthy();
  });

  it("渲染自定义 actions 插槽", () => {
    const { container } = render(
      <AccountCard
        {...baseProps}
        actions={<button type="button">编辑</button>}
      />,
    );

    expect(
      within(container).getByRole("button", { name: "编辑" }),
    ).toBeTruthy();
  });
});
