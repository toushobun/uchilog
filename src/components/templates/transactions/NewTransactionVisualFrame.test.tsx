import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { NewTransactionVisualFrame } from "./NewTransactionVisualFrame";

afterEach(() => {
  cleanup();
});

describe("NewTransactionVisualFrame", () => {
  it("默认启用新增记账页的 full-bleed 背景层", () => {
    render(
      <NewTransactionVisualFrame>
        <div>content</div>
      </NewTransactionVisualFrame>,
    );

    expect(screen.getByTestId("new-transaction-visual-frame")).toHaveAttribute(
      "data-full-bleed",
      "true",
    );
  });

  it("允许编辑页只复用样式作用域，不再追加 full-bleed 背景层", () => {
    render(
      <NewTransactionVisualFrame fullBleed={false}>
        <div>content</div>
      </NewTransactionVisualFrame>,
    );

    expect(screen.getByTestId("new-transaction-visual-frame")).toHaveAttribute(
      "data-full-bleed",
      "false",
    );
  });
});
