import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import SettingsLoadingPage from "./loading";

afterEach(() => {
  cleanup();
});

describe("SettingsLoadingPage", () => {
  it("显示设置页面的加载状态", () => {
    const { container } = render(<SettingsLoadingPage />);

    expect(
      within(container).getByRole("heading", { name: "设置" }),
    ).toBeInTheDocument();
    expect(within(container).getByRole("status")).toBeInTheDocument();
    expect(within(container).getByText("正在读取设置数据")).toBeInTheDocument();
  });
});
