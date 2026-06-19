import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import StatisticsLoadingPage from "./loading";

afterEach(() => {
  cleanup();
});

describe("StatisticsLoadingPage", () => {
  it("显示统计页面的加载状态", () => {
    const { container } = render(<StatisticsLoadingPage />);

    expect(
      within(container).getByRole("heading", { name: "统计" }),
    ).toBeInTheDocument();
    expect(within(container).getByRole("status")).toBeInTheDocument();
    expect(within(container).getByText("正在读取统计数据")).toBeInTheDocument();
  });
});
