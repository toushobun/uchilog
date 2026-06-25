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
      within(container).getByRole("heading", { name: "KuraNote" }),
    ).toBeInTheDocument();
  });

  it("显示提示文字", () => {
    const { container } = render(<HomeTemplate />);

    expect(
      within(container).getByText("家庭生活记录工具开发中"),
    ).toBeInTheDocument();
  });
});
