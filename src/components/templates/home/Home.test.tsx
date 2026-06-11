import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { HomeTemplate } from "./Home";

afterEach(() => {
  cleanup();
});

describe("HomeTemplate", () => {
  it("显示应用名称", () => {
    const { container } = render(<HomeTemplate />);

    expect(
      within(container).getByRole("heading", { name: "UchiLog" }),
    ).toBeTruthy();
  });

  it("显示开发中提示文字", () => {
    const { container } = render(<HomeTemplate />);

    expect(within(container).getByText("记账应用开发中")).toBeTruthy();
  });
});
