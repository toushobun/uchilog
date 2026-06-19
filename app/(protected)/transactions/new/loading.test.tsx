import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import TransactionsNewLoadingPage from "./loading";

afterEach(() => {
  cleanup();
});

describe("TransactionsNewLoadingPage", () => {
  it("显示新增记账页面的加载状态", () => {
    const { container } = render(<TransactionsNewLoadingPage />);

    expect(within(container).getByRole("status")).toBeInTheDocument();
    expect(
      within(container).getByRole("heading", { name: "新增记账" }),
    ).toBeInTheDocument();
  });
});
