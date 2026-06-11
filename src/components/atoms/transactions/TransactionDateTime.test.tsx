import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { TransactionDateTime } from "./TransactionDateTime";

afterEach(() => {
  cleanup();
});

describe("TransactionDateTime", () => {
  it("使用 time 元素展示发生时间", () => {
    const { container } = render(
      <TransactionDateTime value="2026-06-05T03:20:10.000Z" />,
    );

    const time = container.querySelector("time");

    expect(time?.getAttribute("dateTime")).toBe("2026-06-05T03:20:10.000Z");
    expect(time?.textContent).toBeTruthy();
  });
});
