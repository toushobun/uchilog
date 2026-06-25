import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { TransactionRowItem } from "types/transactions";

import { TransactionRow } from "./TransactionRow";

const originalConfirm = window.confirm;
const nativeDateTimeFormat = Intl.DateTimeFormat;

afterEach(() => {
  cleanup();
  window.confirm = originalConfirm;
  vi.unstubAllGlobals();
});

function createItem(
  overrides: Partial<TransactionRowItem> = {},
): TransactionRowItem {
  return {
    id: "00000000-0000-4000-8000-000000009001",
    type: "expense",
    transaction_at: "2026-06-05T03:20:10.000Z",
    amount: "1234",
    account_name: "日元现金",
    account_currency: "JPY",
    categoryItems: [
      { categoryName: "餐饮", parentCategoryName: "饮食", amount: "1234" },
    ],
    merchant_name: "便利店",
    merchant_icon_url: null,
    note: "测试备注",
    recorder_name: null,
    tagNames: [],
    ...overrides,
  };
}

describe("TransactionRow", () => {
  it("显示商家名称", () => {
    render(<TransactionRow item={createItem()} />);

    expect(screen.getByText("便利店")).toBeInTheDocument();
  });

  it("支出记录显示负号金额", () => {
    render(<TransactionRow item={createItem()} />);

    expect(screen.getByText("-1,234")).toBeInTheDocument();
  });

  it("收入记录显示正号金额", () => {
    render(
      <TransactionRow
        item={createItem({ type: "income", amount: "260000" })}
      />,
    );

    expect(screen.getByText("+260,000")).toBeInTheDocument();
  });

  it("转账记录显示账户周转和转账图标", () => {
    render(
      <TransactionRow
        item={createItem({
          categoryItems: [],
          merchant_icon_url: null,
          merchant_name: null,
          type: "transfer",
        })}
      />,
    );

    expect(screen.getByText("账户周转")).toBeInTheDocument();
    expect(screen.queryByText("未指定商家")).toBeNull();
    expect(screen.getByTestId("SyncAltIcon")).toBeInTheDocument();
  });

  it("showType 为 true 时显示支出标签", () => {
    render(<TransactionRow item={createItem()} showType />);

    expect(screen.getByText("支出")).toBeInTheDocument();
  });

  it("showType 为 true 时显示收入标签", () => {
    render(<TransactionRow item={createItem({ type: "income" })} showType />);

    expect(screen.getByText("收入")).toBeInTheDocument();
  });

  it("showType 为 true 时显示转账标签", () => {
    render(<TransactionRow item={createItem({ type: "transfer" })} showType />);

    expect(screen.getByText("转账")).toBeInTheDocument();
  });

  it("showNote 为 true 时显示备注", () => {
    render(<TransactionRow item={createItem()} showNote />);

    expect(screen.getByText(/测试备注/)).toBeInTheDocument();
  });

  it("showNote 为 false 时不显示备注", () => {
    render(<TransactionRow item={createItem()} />);

    expect(screen.queryByText(/测试备注/)).toBeNull();
  });

  it("showAccount 为 true 时账户名称出现在行内", () => {
    render(<TransactionRow item={createItem()} showAccount />);

    expect(screen.getByText(/日元现金/)).toBeInTheDocument();
  });

  it("服务端渲染时使用日本 fallback 时区显示时间", () => {
    const html = renderToString(
      <TransactionRow item={createItem()} showAccount showTime />,
    );

    expect(html).toContain("12:20 · 日元现金");
  });

  it("客户端渲染时使用浏览器时区显示时间", () => {
    stubBrowserTimeZone("Asia/Shanghai");

    render(<TransactionRow item={createItem()} showAccount showTime />);

    expect(screen.getByText("11:20 · 日元现金")).toBeInTheDocument();
  });

  it("merchant_name 为 null 时显示未指定商家", () => {
    render(<TransactionRow item={createItem({ merchant_name: null })} />);

    expect(screen.getByText("未指定商家")).toBeInTheDocument();
  });

  it("未传入删除 action 时不显示删除按钮", () => {
    render(<TransactionRow item={createItem()} />);

    expect(screen.queryByRole("button", { name: "删除" })).toBeNull();
  });

  it("传入删除 action 时显示删除按钮", () => {
    render(<TransactionRow item={createItem()} voidAction={vi.fn()} />);

    expect(screen.getByRole("button", { name: "删除" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "编辑" })).toBeNull();
  });

  it("showEdit 为 true 时显示编辑入口", () => {
    render(<TransactionRow item={createItem()} showEdit />);

    expect(
      screen.getByRole("link", { name: "编辑" }).getAttribute("href"),
    ).toBe("/transactions/00000000-0000-4000-8000-000000009001/edit");
  });

  it("showEdit 和删除 action 同时传入时显示两个操作", () => {
    render(
      <TransactionRow item={createItem()} showEdit voidAction={vi.fn()} />,
    );

    expect(screen.getByRole("link", { name: "编辑" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "删除" })).toBeInTheDocument();
  });

  it("确认后提交删除表单并传递记录 id", () => {
    const voidAction = vi.fn();
    window.confirm = vi.fn(() => true);

    render(<TransactionRow item={createItem()} voidAction={voidAction} />);

    fireEvent.submit(
      screen.getByRole("button", { name: "删除" }).closest("form")!,
    );

    expect(voidAction).toHaveBeenCalledTimes(1);
    expect(voidAction.mock.calls[0]?.[0].get("transactionRecordId")).toBe(
      "00000000-0000-4000-8000-000000009001",
    );
  });

  it("取消确认时不提交删除表单", () => {
    const voidAction = vi.fn();
    window.confirm = vi.fn(() => false);

    render(<TransactionRow item={createItem()} voidAction={voidAction} />);

    fireEvent.submit(
      screen.getByRole("button", { name: "删除" }).closest("form")!,
    );

    expect(voidAction).not.toHaveBeenCalled();
  });
});

function stubBrowserTimeZone(timeZone: string) {
  const mockedIntl = Object.create(Intl) as typeof Intl;

  mockedIntl.DateTimeFormat = function DateTimeFormat(
    locales?: Intl.LocalesArgument,
    options?: Intl.DateTimeFormatOptions,
  ) {
    if (locales === undefined && options === undefined) {
      const formatter = new nativeDateTimeFormat();

      return {
        ...formatter,
        format: formatter.format.bind(formatter),
        resolvedOptions: () => ({
          ...formatter.resolvedOptions(),
          timeZone,
        }),
      };
    }

    return new nativeDateTimeFormat(locales, options);
  } as typeof Intl.DateTimeFormat;

  vi.stubGlobal("Intl", mockedIntl);
}
