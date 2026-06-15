import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { EmptyState } from "./EmptyState";

afterEach(() => {
  cleanup();
});

describe("EmptyState", () => {
  it("显示标题文字", () => {
    const { container } = render(
      <EmptyState
        title="还没有账户"
        description="点击下方按钮新增第一个账户。"
      />,
    );

    expect(within(container).getByText("还没有账户")).toBeInTheDocument();
  });

  it("显示描述文字", () => {
    const { container } = render(
      <EmptyState
        title="还没有账户"
        description="点击下方按钮新增第一个账户。"
      />,
    );

    expect(
      within(container).getByText("点击下方按钮新增第一个账户。"),
    ).toBeInTheDocument();
  });
});
