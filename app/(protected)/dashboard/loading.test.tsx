import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import DashboardLoadingPage from "./loading";

afterEach(() => {
  cleanup();
});

describe("DashboardLoadingPage", () => {
  it("显示首页的加载状态", () => {
    const { container } = render(<DashboardLoadingPage />);

    expect(within(container).getByRole("status")).toBeInTheDocument();
    expect(within(container).getByText("最近记录")).toBeInTheDocument();
  });
});
