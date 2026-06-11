import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SettingsCategoriesEntry } from "./SettingsCategoriesEntry";

afterEach(() => {
  cleanup();
});

describe("SettingsCategoriesEntry", () => {
  it("显示分类管理入口", () => {
    const { container } = render(<SettingsCategoriesEntry />);
    const link = within(container).getByRole("link", { name: "打开分类管理" });

    expect(
      within(container).getByRole("heading", { name: "分类管理" }),
    ).toBeTruthy();
    expect(link.getAttribute("href")).toContain("/categories");
  });
});
