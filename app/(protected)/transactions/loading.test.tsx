import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import TransactionsLoadingPage from "./loading";

afterEach(() => {
  cleanup();
});

describe("TransactionsLoadingPage", () => {
  it("显示明细页面的加载状态", () => {
    const { container } = render(<TransactionsLoadingPage />);

    expect(within(container).getByRole("status")).toBeInTheDocument();
    expect(
      within(container).getByRole("heading", { name: "明细" }),
    ).toBeInTheDocument();
  });
});
