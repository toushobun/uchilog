import { describe, expect, it } from "vitest";

import {
  editTransactionErrorHref,
  transactionEditHref,
  transactionEditPagePath,
} from "./paths";

describe("transaction edit paths", () => {
  it("生成编辑记账专用路由", () => {
    expect(transactionEditHref("00000000-0000-4000-8000-000000009001")).toBe(
      "/transactions/00000000-0000-4000-8000-000000009001/edit",
    );
  });

  it("编码编辑记账路由参数", () => {
    expect(transactionEditHref("record/id with space")).toBe(
      "/transactions/record%2Fid%20with%20space/edit",
    );
  });

  it("生成带错误参数的编辑记账路由", () => {
    expect(
      editTransactionErrorHref(
        "00000000-0000-4000-8000-000000009001",
        "update failed",
      ),
    ).toBe(
      "/transactions/00000000-0000-4000-8000-000000009001/edit?error=update+failed",
    );
  });

  it("暴露 App Router 动态编辑页路径", () => {
    expect(transactionEditPagePath).toBe(
      "/transactions/[transactionRecordId]/edit",
    );
  });
});
