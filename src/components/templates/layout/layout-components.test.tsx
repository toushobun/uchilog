import Button from "@mui/material/Button";
import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { PageHeader } from "./PageHeader";
import { PageShell } from "./PageShell";

afterEach(() => {
  cleanup();
});

describe("PageShell", () => {
  it("显示页面内容", () => {
    const { container } = render(
      <PageShell>
        <p>页面内容</p>
      </PageShell>,
    );

    expect(within(container).getByRole("main")).toBeInTheDocument();
    expect(within(container).getByText("页面内容")).toBeInTheDocument();
  });
});

describe("PageHeader", () => {
  it("显示标题", () => {
    const { container } = render(<PageHeader title="账户" />);

    expect(
      within(container).getByRole("heading", { name: "账户" }),
    ).toBeInTheDocument();
  });

  it("显示副标题和操作区域", () => {
    const { container } = render(
      <PageHeader
        title="账户"
        subtitle="账户说明"
        action={<Button>新增账户</Button>}
      />,
    );

    expect(within(container).getByText("账户说明")).toBeInTheDocument();
    expect(
      within(container).getByRole("button", { name: "新增账户" }),
    ).toBeInTheDocument();
  });
});
