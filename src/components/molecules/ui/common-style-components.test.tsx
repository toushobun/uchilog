import Button from "@mui/material/Button";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { IconBadge } from "atoms/ui/IconBadge";

import { FieldCard } from "./FieldCard";
import { ReceiptCard } from "./ReceiptCard";
import { SegmentTabs } from "./SegmentTabs";

afterEach(() => {
  cleanup();
});

describe("IconBadge", () => {
  it("使用可访问名称显示图标底座", () => {
    render(<IconBadge label="账户图标">账</IconBadge>);

    expect(screen.getByRole("img", { name: "账户图标" })).toBeInTheDocument();
  });
});

describe("SegmentTabs", () => {
  const items = [
    { label: "日", value: "day" },
    { label: "月", value: "month" },
    { label: "年", value: "year", disabled: true },
  ] as const;

  it("显示分段切换并标记当前选中项", () => {
    render(
      <SegmentTabs
        ariaLabel="统计期间"
        items={items}
        value="month"
        onChange={() => undefined}
      />,
    );

    expect(screen.getByRole("group", { name: "统计期间" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "月" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "年" })).toBeDisabled();
  });

  it("点击未选中项时触发切换", () => {
    const onChange = vi.fn();
    render(
      <SegmentTabs
        ariaLabel="统计期间"
        items={items}
        value="month"
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "日" }));

    expect(onChange).toHaveBeenCalledWith("day");
  });
});

describe("ReceiptCard", () => {
  it("显示小票头部、内容和底部", () => {
    const { container } = render(
      <ReceiptCard header="小票头部" footer="合计 ¥1,200">
        小票内容
      </ReceiptCard>,
    );

    expect(within(container).getByText("小票头部")).toBeInTheDocument();
    expect(within(container).getByText("小票内容")).toBeInTheDocument();
    expect(within(container).getByText("合计 ¥1,200")).toBeInTheDocument();
  });
});

describe("FieldCard", () => {
  it("显示选择项标题和说明", () => {
    const { container } = render(
      <FieldCard title="现金账户" description="家庭日常支出账户" selected />,
    );

    expect(within(container).getByText("现金账户")).toBeInTheDocument();
    expect(within(container).getByText("家庭日常支出账户")).toBeInTheDocument();
    expect(container.querySelector("[data-selected='true']")).not.toBeNull();
  });

  it("点击选择项时触发操作", () => {
    const onClick = vi.fn();
    render(<FieldCard title="选择商家" onClick={onClick} />);

    fireEvent.click(screen.getByRole("button", { name: "选择商家" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("可点击选择项会表达选中状态", () => {
    render(<FieldCard title="选择商家" selected onClick={() => undefined} />);

    expect(screen.getByRole("button", { name: "选择商家" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("未选中的可点击选择项会表达未选中状态", () => {
    render(<FieldCard title="选择商家" onClick={() => undefined} />);

    expect(screen.getByRole("button", { name: "选择商家" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("禁用时点击和键盘操作不触发", () => {
    const onClick = vi.fn();
    render(<FieldCard title="选择商家" disabled onClick={onClick} />);
    const button = screen.getByRole("button", { name: "选择商家" });

    fireEvent.click(button);
    fireEvent.keyDown(button, { key: "Enter" });
    fireEvent.keyDown(button, { key: " " });

    expect(onClick).not.toHaveBeenCalled();
  });

  it("操作按钮不会被包进选择项按钮", () => {
    render(
      <FieldCard
        title="选择商家"
        onClick={() => undefined}
        action={<Button>编辑</Button>}
      />,
    );

    expect(
      screen.getByRole("button", { name: "选择商家" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "编辑" })).toBeInTheDocument();
  });
});
