import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SoftCard } from "./SoftCard";

afterEach(() => {
  cleanup();
});

describe("SoftCard", () => {
  it("渲染子元素内容", () => {
    const { container } = render(
      <SoftCard>
        <span>卡片内容</span>
      </SoftCard>,
    );

    expect(within(container).getByText("卡片内容")).toBeInTheDocument();
  });

  it("透传额外的 sx 属性", () => {
    const { container } = render(
      <SoftCard data-testid="soft-card" sx={{ mt: 2 }}>
        内容
      </SoftCard>,
    );

    expect(container.querySelector("[data-testid='soft-card']")).not.toBeNull();
  });
});
