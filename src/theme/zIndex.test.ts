import { describe, expect, it } from "vitest";

import { appZIndex } from "./zIndex";

describe("appZIndex", () => {
  it("下拉菜单显示在弹框之上且不遮挡提示", () => {
    expect(appZIndex.dropdown).toBeGreaterThan(appZIndex.dialog);
    expect(appZIndex.dropdown).toBeLessThan(appZIndex.tooltip);
  });
});
