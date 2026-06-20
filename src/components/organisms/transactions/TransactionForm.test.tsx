import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { routePaths } from "config/paths";
import {
  newTransactionPageErrorMessages,
  transactionFormValidationMessages,
} from "utils/transactionMessages";
import { transactionTagValidationMessages } from "utils/transactionTagValidationMessages";

import { TransactionForm } from "./TransactionForm";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const accountOptions = [
  {
    id: "00000000-0000-4000-8000-000000000045",
    name: "日元现金",
    currency: "JPY",
  },
];

const categoryOptions = [
  {
    id: "00000000-0000-4000-8000-000000005072",
    name: "餐饮",
    parentId: "00000000-0000-4000-8000-000000005001",
    parentName: "食材/调料",
    type: "expense" as const,
  },
  {
    id: "00000000-0000-4000-8000-000000005074",
    name: "日用品",
    parentId: "00000000-0000-4000-8000-000000005001",
    parentName: "食材/调料",
    type: "expense" as const,
  },
  {
    id: "00000000-0000-4000-8000-000000005075",
    name: "电车",
    parentId: "00000000-0000-4000-8000-000000005002",
    parentName: "交通出行",
    type: "expense" as const,
  },
  {
    id: "00000000-0000-4000-8000-000000005073",
    name: "工资",
    parentId: "00000000-0000-4000-8000-000000005003",
    parentName: "固定收入",
    type: "income" as const,
  },
];

const merchantOptions = [
  {
    id: "00000000-0000-4000-8000-000000001001",
    name: "便利店",
    icon_url: null,
  },
];

const tagOptions = [
  {
    id: "00000000-0000-4000-8000-000000003001",
    name: "日常",
    color: null,
  },
  {
    id: "00000000-0000-4000-8000-000000003002",
    name: "公司",
    color: "#176A66",
  },
];

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function renderForm(
  props: Partial<React.ComponentProps<typeof TransactionForm>> = {},
) {
  const action = vi.fn(async () => undefined);
  const view = render(
    <TransactionForm
      action={action}
      accountOptions={accountOptions}
      categoryOptions={categoryOptions}
      merchantOptions={merchantOptions}
      tagOptions={tagOptions}
      {...props}
    />,
  );

  return { action, ...view };
}

function getCombobox(container: HTMLElement, name: string) {
  return within(container).getByRole("combobox", { name });
}

function openSheet(container: HTMLElement) {
  fireEvent.click(within(container).getByRole("button", { name: "添加明细" }));
}

function clickSheetAddButton() {
  const buttons = screen.getAllByRole("button", { name: "追加" });
  const button = buttons.at(-1);

  if (!button) throw new Error("明细追加按钮不存在");

  fireEvent.click(button);
}

function addItemViaSheet(categoryName: string, amount: string) {
  fireEvent.click(screen.getByRole("button", { name: categoryName }));
  fireEvent.change(screen.getByRole("textbox", { name: "金额" }), {
    target: { value: amount },
  });
  clickSheetAddButton();
}

function getSubmittedTagNames(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLInputElement>('input[name="tagName"]'),
  ).map((input) => input.value);
}

function getSubmittedTransactionAt(container: HTMLElement) {
  const input = container.querySelector<HTMLInputElement>(
    'input[name="transactionAt"]',
  );

  if (!input) throw new Error("发生时间提交字段不存在");

  return input.value;
}

function createInitialValues(tagNames: string[] = []) {
  return {
    accountId: accountOptions[0].id,
    items: [{ amount: "1200", categoryId: categoryOptions[0].id }],
    merchantId: merchantOptions[0].id,
    note: "",
    tagNames,
    transactionAt: "2026-06-05T03:20:10.000Z",
    transactionRecordId: "00000000-0000-4000-8000-000000009001",
    type: "expense" as const,
  };
}

function formatExpectedDateTimeParts(value: string) {
  const date = new Date(value);
  const pad = (part: number) => String(part).padStart(2, "0");
  const dateValue = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}`;
  const timeValue = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;

  return { dateValue, timeValue };
}

describe("TransactionForm", () => {
  it("显示移动端记账顶部操作区", () => {
    const { container } = renderForm({ ledgerName: "家庭账本" });

    expect(
      within(container).getByRole("heading", { name: "新增记账" }),
    ).toBeInTheDocument();
    expect(
      within(container)
        .getByRole("link", { name: "关闭" })
        .getAttribute("href"),
    ).toBe(routePaths.transactions);
    expect(
      within(container).getByRole("button", { name: "保存" }),
    ).toBeInTheDocument();
  });

  it("传入错误信息时显示 Alert", () => {
    renderForm({ errorMessage: newTransactionPageErrorMessages.amountInvalid });

    expect(
      screen.getByText(newTransactionPageErrorMessages.amountInvalid),
    ).toBeInTheDocument();
  });

  it("编辑模式下回填发生日期、时间和标签", () => {
    const transactionAt = "2026-06-05T03:20:10.000Z";
    const expected = formatExpectedDateTimeParts(transactionAt);
    const { container } = renderForm({
      initialValues: createInitialValues(["日常"]),
    });

    expect(
      within(container).getByRole("button", { name: "选择记账时间" }),
    ).toHaveTextContent(expected.timeValue);
    expect(getSubmittedTransactionAt(container)).toBe(
      `${expected.dateValue}T${expected.timeValue}`,
    );
    expect(getSubmittedTagNames(container)).toEqual(["日常"]);
  });

  it("时刻默认开启并保留具体时间", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 10, 9, 8, 7));

    const { container } = renderForm();

    expect(getSubmittedTransactionAt(container)).toBe("2026-06-10T09:08:07");
    expect(
      within(container).getByRole("button", { name: "选择记账时间" }),
    ).toHaveTextContent("09:08:07");
  });

  it("账户选项中显示币种", () => {
    const { container } = renderForm();

    fireEvent.mouseDown(getCombobox(container, "账户"));

    expect(screen.getByText("日元现金（JPY）")).toBeInTheDocument();
  });

  it("支出弹框只显示支出分类", () => {
    const { container } = renderForm();

    openSheet(container);

    expect(
      screen.getByRole("heading", { name: "添加明细" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "食材/调料" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "餐饮" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "固定收入" })).toBeNull();
  });

  it("收入弹框只显示收入分类", () => {
    const { container } = renderForm();

    fireEvent.click(within(container).getByRole("button", { name: "收入" }));
    openSheet(container);

    expect(
      screen.getByRole("button", { name: "固定收入" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "工资" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "餐饮" })).toBeNull();
  });

  it("切换大分类后右侧显示对应的小分类", () => {
    const { container } = renderForm();

    openSheet(container);
    fireEvent.click(screen.getByRole("button", { name: "交通出行" }));

    expect(screen.getByRole("button", { name: "电车" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "餐饮" })).toBeNull();
  });

  it("追加明细后合计同步更新", () => {
    const { container } = renderForm();

    openSheet(container);
    addItemViaSheet("餐饮", "286");
    addItemViaSheet("日用品", "45");
    fireEvent.click(screen.getByRole("button", { name: "完成" }));

    expect(within(container).getByText("共 2 项")).toBeInTheDocument();
    expect(within(container).getByText("合计 -331")).toBeInTheDocument();
  });

  it("未选小分类时点击追加显示错误提示", () => {
    const { container } = renderForm();

    openSheet(container);
    fireEvent.change(screen.getByRole("textbox", { name: "金额" }), {
      target: { value: "500" },
    });
    clickSheetAddButton();

    expect(
      screen.getByText(transactionFormValidationMessages.categoryRequired),
    ).toBeInTheDocument();
  });

  it("保存前汇总显示商家、账户和明细", () => {
    const { container } = renderForm();

    fireEvent.mouseDown(getCombobox(container, "商家"));
    fireEvent.click(screen.getByText("便利店"));
    fireEvent.mouseDown(getCombobox(container, "账户"));
    fireEvent.click(screen.getByText("日元现金（JPY）"));
    openSheet(container);
    addItemViaSheet("餐饮", "1200");
    fireEvent.click(screen.getByRole("button", { name: "完成" }));

    expect(within(container).getByText("保存前汇总")).toBeInTheDocument();
    expect(within(container).getAllByText("便利店")).toHaveLength(2);
    expect(within(container).getAllByText("日元现金（JPY）")).toHaveLength(2);
    expect(
      within(container).getByText("食材/调料 / 餐饮 / 1200"),
    ).toBeInTheDocument();
  });

  it("可选择已有标签并随表单提交", () => {
    const { container } = renderForm();

    fireEvent.click(within(container).getByRole("button", { name: "日常" }));

    expect(getSubmittedTagNames(container)).toEqual(["日常"]);
    expect(within(container).getByText("标签")).toBeInTheDocument();
  });

  it("可输入新标签，重复标签会显示提示且不会重复提交", () => {
    const { container } = renderForm();
    const tagInput = within(container).getByRole("textbox", {
      name: "新增标签",
    });
    const tagAddButton = within(container).getByRole("button", {
      name: "追加",
    });

    fireEvent.change(tagInput, { target: { value: " 结婚 " } });
    fireEvent.click(tagAddButton);
    fireEvent.change(tagInput, { target: { value: "结婚" } });
    fireEvent.click(tagAddButton);

    expect(getSubmittedTagNames(container)).toEqual(["结婚"]);
    expect(
      within(container).getByText(transactionTagValidationMessages.duplicate),
    ).toBeInTheDocument();
  });

  it("标签超过长度限制时显示独立错误", () => {
    const { container } = renderForm();

    fireEvent.change(
      within(container).getByRole("textbox", { name: "新增标签" }),
      { target: { value: "あ".repeat(41) } },
    );
    fireEvent.click(within(container).getByRole("button", { name: "追加" }));

    expect(
      within(container).getByText(transactionTagValidationMessages.nameTooLong),
    ).toBeInTheDocument();
  });

  it("标签超过 10 个时阻断第 11 个并显示独立错误", () => {
    const { container } = renderForm({
      initialValues: createInitialValues(
        Array.from({ length: 10 }, (_, index) => `标签${index + 1}`),
      ),
    });

    fireEvent.change(
      within(container).getByRole("textbox", { name: "新增标签" }),
      { target: { value: "第 11 个" } },
    );
    fireEvent.click(within(container).getByRole("button", { name: "追加" }));

    expect(getSubmittedTagNames(container)).toHaveLength(10);
    expect(
      within(container).getByText(transactionTagValidationMessages.tooMany),
    ).toBeInTheDocument();
  });

  it("初始标签非法时禁用保存按钮", () => {
    const { container } = renderForm({
      initialValues: createInitialValues(["あ".repeat(41)]),
    });

    expect(
      within(container).getByRole("button", { name: "保存" }),
    ).toHaveProperty("disabled", true);
    expect(
      within(container).getByRole("button", { name: "保存记账" }),
    ).toHaveProperty("disabled", true);
  });

  it("时间字段显示在保存前汇总上面", () => {
    const { container } = renderForm();

    const dateTimeButton = within(container).getByRole("button", {
      name: "选择记账时间",
    });
    const summaryHeading = within(container).getByText("保存前汇总");

    expect(dateTimeButton.compareDocumentPosition(summaryHeading)).toBe(4);
  });

  it("没有账户时保存按钮不可用", () => {
    const { container } = renderForm({ accountOptions: [] });

    expect(
      within(container).getByRole("button", { name: "保存" }),
    ).toHaveProperty("disabled", true);
    expect(
      within(container).getByRole("button", { name: "保存记账" }),
    ).toHaveProperty("disabled", true);
  });

  it("商家下拉显示占位项和商家名称", () => {
    const { container } = renderForm();

    fireEvent.mouseDown(getCombobox(container, "商家"));

    expect(screen.getByText("请选择商家")).toBeInTheDocument();
    expect(screen.getByText("便利店")).toBeInTheDocument();
  });
});
