import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { GlassCard } from "./GlassCard";

afterEach(() => {
  cleanup();
});

describe("GlassCard", () => {
  it("渲染子元素内容", () => {
    const { container } = render(
      <GlassCard>
        <span>卡片内容</span>
      </GlassCard>,
    );

    expect(within(container).getByText("卡片内容")).toBeTruthy();
  });

  it("透传额外的 sx 属性", () => {
    const { container } = render(
      <GlassCard data-testid="glass-card" sx={{ mt: 2 }}>
        内容
      </GlassCard>,
    );

    expect(
      container.querySelector("[data-testid='glass-card']"),
    ).not.toBeNull();
  });
});
