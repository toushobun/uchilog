import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";

import {
  TransactionForm,
  type TransactionFormInitialValues,
} from "./TransactionForm";

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

const expenseCategoryId = "00000000-0000-4000-8000-000000005072";
const incomeCategoryId = "00000000-0000-4000-8000-000000005073";

const categoryOptions = [
  {
    id: expenseCategoryId,
    name: "餐饮",
    parentId: "00000000-0000-4000-8000-000000005001",
    parentName: "食材/调料",
    type: "expense" as const,
  },
  {
    id: incomeCategoryId,
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
];

afterEach(() => {
  cleanup();
});

function renderForm(
  props: Partial<React.ComponentProps<typeof TransactionForm>> = {},
) {
  return render(
    <TransactionForm
      action={vi.fn(async () => undefined)}
      accountOptions={accountOptions}
      categoryOptions={categoryOptions}
      merchantOptions={merchantOptions}
      tagOptions={tagOptions}
      {...props}
    />,
  );
}

/**
 * 模拟 EditTransactionTemplate 的行为：typeNavigation 由外部传入，
 * 切换类型时以 key={activeType} 重新挂载 TransactionForm 并清空 items。
 */
function renderEditFormWithTypeSwitch(
  baseInitialValues: TransactionFormInitialValues,
) {
  function Wrapper() {
    const [activeType, setActiveType] = useState<"expense" | "income">(
      baseInitialValues.type,
    );
    const currentInitialValues: TransactionFormInitialValues =
      activeType === baseInitialValues.type
        ? baseInitialValues
        : { ...baseInitialValues, type: activeType, items: [] };
    const typeNavigation = (
      <div>
        <button
          onClick={() => setActiveType("expense")}
          aria-pressed={activeType === "expense"}
        >
          支出
        </button>
        <button
          onClick={() => setActiveType("income")}
          aria-pressed={activeType === "income"}
        >
          收入
        </button>
      </div>
    );
    return (
      <TransactionForm
        key={activeType}
        action={vi.fn(async () => undefined)}
        accountOptions={accountOptions}
        categoryOptions={categoryOptions}
        merchantOptions={merchantOptions}
        tagOptions={tagOptions}
        initialValues={currentInitialValues}
        typeNavigation={typeNavigation}
      />
    );
  }
  return render(<Wrapper />);
}

function createInitialValues(
  type: "expense" | "income" = "expense",
): TransactionFormInitialValues {
  return {
    accountId: accountOptions[0].id,
    items: [
      {
        amount: type === "expense" ? "1200" : "300000",
        categoryId: type === "expense" ? expenseCategoryId : incomeCategoryId,
      },
    ],
    merchantId: merchantOptions[0].id,
    note: "编辑前备注",
    tagNames: ["日常"],
    transactionAt: "2026-06-05T03:20:10.000Z",
    transactionRecordId: "00000000-0000-4000-8000-000000009001",
    type,
  };
}

function getHiddenInput(container: HTMLElement, name: string) {
  const input = container.querySelector<HTMLInputElement>(
    `input[name="${name}"]`,
  );

  if (!input) throw new Error(`${name} hidden input 不存在`);

  return input;
}

function getSubmittedCategoryIds(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLInputElement>(
      'input[name="itemCategoryId"]',
    ),
  ).map((input) => input.value);
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

describe("TransactionForm 编辑类型切换", () => {
  it("编辑支出时 hidden type 默认为 expense", () => {
    const { container } = renderForm({ initialValues: createInitialValues() });

    expect(getHiddenInput(container, "type").value).toBe("expense");
  });

  it("编辑收入时 hidden type 默认为 income", () => {
    const { container } = renderForm({
      initialValues: createInitialValues("income"),
    });

    expect(getHiddenInput(container, "type").value).toBe("income");
  });

  it("编辑支出点击收入后 hidden type 变为 income，且旧支出分类不会继续提交", () => {
    const { container } = renderEditFormWithTypeSwitch(createInitialValues());

    expect(getSubmittedCategoryIds(container)).toEqual([expenseCategoryId]);

    fireEvent.click(within(container).getByRole("button", { name: "收入" }));

    expect(getHiddenInput(container, "type").value).toBe("income");
    expect(getSubmittedCategoryIds(container)).toEqual([]);
  });

  it("编辑收入点击支出后 hidden type 变为 expense，且旧收入分类不会继续提交", () => {
    const { container } = renderEditFormWithTypeSwitch(
      createInitialValues("income"),
    );

    expect(getSubmittedCategoryIds(container)).toEqual([incomeCategoryId]);

    fireEvent.click(within(container).getByRole("button", { name: "支出" }));

    expect(getHiddenInput(container, "type").value).toBe("expense");
    expect(getSubmittedCategoryIds(container)).toEqual([]);
  });

  it("切换到收入后可选择收入分类", () => {
    const { container } = renderEditFormWithTypeSwitch(createInitialValues());

    fireEvent.click(within(container).getByRole("button", { name: "收入" }));
    openSheet(container);

    expect(
      screen.getByRole("button", { name: "固定收入" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "工资" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "餐饮" })).toBeNull();

    addItemViaSheet("工资", "500");

    expect(getSubmittedCategoryIds(container)).toEqual([incomeCategoryId]);
  });

  it("切换到支出后可选择支出分类", () => {
    const { container } = renderEditFormWithTypeSwitch(
      createInitialValues("income"),
    );

    fireEvent.click(within(container).getByRole("button", { name: "支出" }));
    openSheet(container);

    expect(
      screen.getByRole("button", { name: "食材/调料" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "餐饮" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "工资" })).toBeNull();

    addItemViaSheet("餐饮", "800");

    expect(getSubmittedCategoryIds(container)).toEqual([expenseCategoryId]);
  });
});
