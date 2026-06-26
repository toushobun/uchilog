import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { KuraIcon } from "./KuraIcon";
import { KURA_ICON_NAMES, kuraIconRegistry } from "./kuraIconRegistry";

afterEach(() => {
  cleanup();
});

describe("KuraIcon", () => {
  it("根据名称渲染对应图片", () => {
    render(<KuraIcon name="account" />);
    const img = screen.getByRole("img", { name: "账户" });
    expect(img).toHaveAttribute("src", "/assets/kura-icons/account.png");
  });

  it("有 label 时覆盖 registry 默认标签", () => {
    render(<KuraIcon name="account" label="我的账户" />);
    expect(screen.getByRole("img", { name: "我的账户" })).toBeInTheDocument();
  });

  it("无 label 时使用 registry 默认标签", () => {
    render(<KuraIcon name="merchant" />);
    expect(screen.getByRole("img", { name: "商家" })).toBeInTheDocument();
  });

  it("有 label 时设置可访问名称", () => {
    render(<KuraIcon name="tag" label="自定义标签" />);
    const img = screen.getByRole("img", { name: "自定义标签" });
    expect(img).toHaveAttribute("alt", "自定义标签");
    expect(img).not.toHaveAttribute("aria-hidden");
  });

  it("decorative=true 时隐藏无障碍信息", () => {
    const { container } = render(<KuraIcon name="home" decorative />);
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("aria-hidden")).toBe("true");
    expect(img?.getAttribute("alt")).toBe("");
  });

  it("size=number 时可正常渲染", () => {
    const { container } = render(<KuraIcon name="statistics" size={96} />);
    expect(container.querySelector("img")).not.toBeNull();
  });
});

describe("kuraIconRegistry", () => {
  it("KURA_ICON_NAMES 包含全 10 个图标", () => {
    const expected = [
      "home",
      "transactions",
      "quickRecord",
      "statistics",
      "profile",
      "account",
      "category",
      "tag",
      "merchant",
      "settings",
    ];
    expect(KURA_ICON_NAMES).toEqual(expect.arrayContaining(expected));
    expect(KURA_ICON_NAMES).toHaveLength(expected.length);
  });

  it("registry 每个条目都有 src 和 label", () => {
    for (const name of KURA_ICON_NAMES) {
      const entry = kuraIconRegistry[name];
      expect(entry.src).toBeTruthy();
      expect(entry.label).toBeTruthy();
    }
  });

  it("registry 所有图标都可通过 name 渲染", () => {
    for (const name of KURA_ICON_NAMES) {
      const { container } = render(<KuraIcon name={name} />);
      expect(container.querySelector("img")).not.toBeNull();
      cleanup();
    }
  });

  it("各图标的 src 路径不重复", () => {
    const srcs = KURA_ICON_NAMES.map((n) => kuraIconRegistry[n].src);
    expect(new Set(srcs).size).toBe(KURA_ICON_NAMES.length);
  });
});
