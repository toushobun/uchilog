import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import TransactionEditLoadingPage from "./loading";

afterEach(() => {
  cleanup();
});

describe("TransactionEditLoadingPage", () => {
  it("显示编辑记账页面的加载状态", () => {
    const { container } = render(<TransactionEditLoadingPage />);

    expect(
      within(container).getByRole("heading", { name: "编辑记账" }),
    ).toBeInTheDocument();
    expect(within(container).getByRole("status")).toBeInTheDocument();
    expect(within(container).getByText("正在读取记账数据")).toBeInTheDocument();
    expect(
      within(container).getByText("请稍等，读取完成后会自动显示编辑表单。"),
    ).toBeInTheDocument();
  });
});
