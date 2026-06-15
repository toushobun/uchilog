import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { PageCard } from "./PageCard";

afterEach(() => {
  cleanup();
});

describe("PageCard", () => {
  it("渲染子元素内容", () => {
    const { container } = render(
      <PageCard>
        <span>页面内容</span>
      </PageCard>,
    );

    expect(within(container).getByText("页面内容")).toBeInTheDocument();
  });
});
