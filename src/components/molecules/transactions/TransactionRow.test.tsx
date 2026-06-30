import { cleanup, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { TransactionRowItem } from "types/transactions";

import { TransactionRow } from "./TransactionRow";

const nativeDateTimeFormat = Intl.DateTimeFormat;

afterEach(() => {
  cleanup();
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
      {
        amount: "1234",
        categoryName: "餐饮",
        parentCategoryName: "饮食",
        categoryType: "expense",
      },
    ],
    merchant_name: "便利店",
    merchant_icon_url: null,
    note: null,
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

  it("金额为 0 时仍显示记录金额", () => {
    render(<TransactionRow item={createItem({ amount: "0" })} />);

    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("转账记录显示账户周转和转账图标，且不显示类型标签", () => {
    render(
      <TransactionRow
        item={createItem({
          account_name: "日元现金 → 储蓄账户",
          categoryItems: [],
          merchant_icon_url: null,
          merchant_name: null,
          type: "transfer",
        })}
      />,
    );

    expect(screen.getByText("账户周转")).toBeInTheDocument();
    expect(screen.queryByText("未知商家")).toBeNull();
    expect(screen.queryByText("转账")).toBeNull();
    expect(screen.getByTestId("SyncAltIcon")).toBeInTheDocument();
  });

  it("转账记录在第二行显示转出到账户摘要", () => {
    render(
      <TransactionRow
        item={createItem({
          account_name: "日元现金 → 储蓄账户",
          categoryItems: [],
          merchant_icon_url: null,
          merchant_name: null,
          type: "transfer",
        })}
        showAccount
      />,
    );

    expect(screen.getByText("日元现金 → 储蓄账户")).toBeInTheDocument();
  });

  it("备注紧挨小分类显示在第三行", () => {
    render(<TransactionRow item={createItem({ note: "测试备注" })} />);

    expect(screen.getByText("餐饮 | 测试备注")).toBeInTheDocument();
  });

  it("第二行全部为空时不显示 meta 内容", () => {
    render(<TransactionRow item={createItem()} />);

    expect(screen.queryByText(/日元现金/)).toBeNull();
    expect(screen.queryByText(/12:20/)).toBeNull();
  });

  it("showAccount 为 true 时账户名称出现在第二行", () => {
    render(<TransactionRow item={createItem()} showAccount />);

    expect(screen.getByText(/日元现金/)).toBeInTheDocument();
  });

  it("服务端渲染时使用日本 fallback 时区显示时间", () => {
    const html = renderToString(
      <TransactionRow item={createItem()} showAccount showTime />,
    );

    expect(html).toContain("日元现金");
    expect(html).toContain("12:20");
  });

  it("客户端渲染时使用浏览器时区显示时间", () => {
    stubBrowserTimeZone("Asia/Shanghai");

    render(<TransactionRow item={createItem()} showAccount showTime />);

    expect(screen.getByText(/日元现金/)).toBeInTheDocument();
    expect(screen.getByText(/11:20/)).toBeInTheDocument();
  });

  it("merchant_name 为 null 时显示未知商家和问号头像", () => {
    render(<TransactionRow item={createItem({ merchant_name: null })} />);

    expect(screen.getByText("未知商家")).toBeInTheDocument();
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("两项小分类摘要显示全部小分类名", () => {
    render(
      <TransactionRow
        item={createItem({
          categoryItems: [
            {
              amount: "800",
              categoryName: "餐饮",
              parentCategoryName: "饮食",
              categoryType: "expense",
            },
            {
              amount: "1600",
              categoryName: "日用品",
              parentCategoryName: "购物",
              categoryType: "expense",
            },
          ],
        })}
      />,
    );

    expect(screen.getByText("餐饮、日用品")).toBeInTheDocument();
  });

  it("三项小分类摘要显示全部小分类名", () => {
    render(
      <TransactionRow
        item={createItem({
          categoryItems: [
            {
              amount: "800",
              categoryName: "餐饮",
              parentCategoryName: "饮食",
              categoryType: "expense",
            },
            {
              amount: "1600",
              categoryName: "日用品",
              parentCategoryName: "购物",
              categoryType: "expense",
            },
            {
              amount: "500",
              categoryName: "交通",
              parentCategoryName: "出行",
              categoryType: "expense",
            },
          ],
        })}
      />,
    );

    expect(screen.getByText("餐饮、日用品、交通")).toBeInTheDocument();
  });

  it("超过三项支出小分类时显示最高三项支出并追加总项数", () => {
    render(
      <TransactionRow
        item={createItem({
          categoryItems: [
            {
              amount: "800",
              categoryName: "餐饮",
              parentCategoryName: "饮食",
              categoryType: "expense",
            },
            {
              amount: "1600",
              categoryName: "日用品",
              parentCategoryName: "购物",
              categoryType: "expense",
            },
            {
              amount: "500",
              categoryName: "交通",
              parentCategoryName: "出行",
              categoryType: "expense",
            },
            {
              amount: "2400",
              categoryName: "药品",
              parentCategoryName: "医疗",
              categoryType: "expense",
            },
          ],
        })}
      />,
    );

    expect(screen.getByText("药品、日用品、餐饮等 4 项")).toBeInTheDocument();
  });

  it("超过三项收入小分类时显示最高三项收入并追加总项数", () => {
    render(
      <TransactionRow
        item={createItem({
          amount: "320000",
          categoryItems: [
            {
              amount: "800",
              categoryName: "餐饮",
              parentCategoryName: "饮食",
              categoryType: "expense",
            },
            {
              amount: "260000",
              categoryName: "工资",
              parentCategoryName: "收入",
              categoryType: "income",
            },
            {
              amount: "30000",
              categoryName: "奖金",
              parentCategoryName: "收入",
              categoryType: "income",
            },
            {
              amount: "20000",
              categoryName: "副业",
              parentCategoryName: "收入",
              categoryType: "income",
            },
            {
              amount: "10000",
              categoryName: "利息",
              parentCategoryName: "收入",
              categoryType: "income",
            },
          ],
          type: "income",
        })}
      />,
    );

    expect(screen.getByText("工资、奖金、副业等 5 项")).toBeInTheDocument();
  });

  it("超过三项净收入但收入分类不足三项时只显示收入分类", () => {
    render(
      <TransactionRow
        item={createItem({
          amount: "250000",
          categoryItems: [
            {
              amount: "1000",
              categoryName: "餐饮",
              parentCategoryName: "饮食",
              categoryType: "expense",
            },
            {
              amount: "2000",
              categoryName: "交通",
              parentCategoryName: "出行",
              categoryType: "expense",
            },
            {
              amount: "3000",
              categoryName: "日用品",
              parentCategoryName: "购物",
              categoryType: "expense",
            },
            {
              amount: "260000",
              categoryName: "工资",
              parentCategoryName: "收入",
              categoryType: "income",
            },
          ],
          type: "income",
        })}
      />,
    );

    expect(screen.getByText("工资等 4 项")).toBeInTheDocument();
  });

  it("单条小分类摘要只显示小分类名", () => {
    render(<TransactionRow item={createItem()} />);

    expect(screen.getByText("餐饮")).toBeInTheDocument();
    expect(screen.queryByText("饮食 > 餐饮")).toBeNull();
    expect(screen.queryByText("餐饮等")).toBeNull();
  });

  it("显示标签且去重后保留全部标签", () => {
    render(
      <TransactionRow
        item={createItem({
          tagNames: ["日常", "孩子", "公司", "旅行", "日常", "多余"],
        })}
      />,
    );

    expect(screen.getByText("日常")).toBeInTheDocument();
    expect(screen.getByText("孩子")).toBeInTheDocument();
    expect(screen.getByText("公司")).toBeInTheDocument();
    expect(screen.getByText("旅行")).toBeInTheDocument();
    expect(screen.getByText("多余")).toBeInTheDocument();
    expect(screen.queryByText("日常、孩子、公司、旅行、多余")).toBeNull();
  });

  it("长商家名仍可渲染", () => {
    render(
      <TransactionRow
        item={createItem({
          merchant_name: "很长很长很长很长很长的商家名称便利店",
        })}
      />,
    );

    expect(
      screen.getByText("很长很长很长很长很长的商家名称便利店"),
    ).toBeInTheDocument();
  });

  it("不显示删除按钮", () => {
    render(<TransactionRow item={createItem()} />);

    expect(screen.queryByRole("button", { name: "删除" })).toBeNull();
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
