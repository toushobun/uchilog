import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as transactionsUtils from "utils/transactions";

import { TransferTransactionForm } from "./TransferTransactionForm";

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

const jpyAccount1 = {
  id: "00000000-0000-4000-8000-000000000045",
  name: "日元现金",
  currency: "JPY",
};

const jpyAccount2 = {
  id: "00000000-0000-4000-8000-000000000046",
  name: "三井住友银行",
  currency: "JPY",
};

const usdAccount = {
  id: "00000000-0000-4000-8000-000000000047",
  name: "美元账户",
  currency: "USD",
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderForm(
  props: Partial<React.ComponentProps<typeof TransferTransactionForm>> = {},
) {
  const action = vi.fn(async () => undefined);
  const view = render(
    <TransferTransactionForm
      action={action}
      accountOptions={[jpyAccount1, jpyAccount2]}
      {...props}
    />,
  );

  return { action, ...view };
}

function getSaveButton(container: HTMLElement) {
  return within(container).getByRole("button", { name: "保存" });
}

describe("TransferTransactionForm", () => {
  it("能渲染转出账户、转入账户、金额、日期时间、备注、保存按钮", () => {
    const { container } = renderForm();

    expect(
      within(container).getByRole("combobox", { name: "转出账户" }),
    ).toBeInTheDocument();
    expect(
      within(container).getByRole("combobox", { name: "转入账户" }),
    ).toBeInTheDocument();
    expect(
      within(container).getByRole("textbox", { name: "金额" }),
    ).toBeInTheDocument();
    expect(
      within(container).getByRole("button", { name: "选择记账时间" }),
    ).toBeInTheDocument();
    expect(
      within(container).getByRole("textbox", { name: "备注（选填）" }),
    ).toBeInTheDocument();
    expect(getSaveButton(container)).toBeInTheDocument();
  });

  it("表单内包含 type=transfer 的 hidden input", () => {
    const { container } = renderForm();

    const typeInput =
      container.querySelector<HTMLInputElement>('input[name="type"]');

    expect(typeInput).not.toBeNull();
    expect(typeInput?.value).toBe("transfer");
  });

  it("account 少于 2 个时禁用保存按钮", () => {
    const { container } = renderForm({ accountOptions: [jpyAccount1] });

    expect(getSaveButton(container)).toHaveProperty("disabled", true);
  });

  it("account 为空时禁用保存按钮", () => {
    const { container } = renderForm({ accountOptions: [] });

    expect(getSaveButton(container)).toHaveProperty("disabled", true);
  });

  it("转出账户和转入账户相同时禁用保存按钮", () => {
    const { container } = renderForm();

    fireEvent.mouseDown(
      within(container).getByRole("combobox", { name: "转出账户" }),
    );
    fireEvent.click(screen.getByText("日元现金（JPY）"));

    fireEvent.mouseDown(
      within(container).getByRole("combobox", { name: "转入账户" }),
    );
    fireEvent.click(screen.getAllByText("日元现金（JPY）").at(-1)!);

    expect(getSaveButton(container)).toHaveProperty("disabled", true);
    expect(
      within(container).getByText("转出账户和转入账户不能相同。"),
    ).toBeInTheDocument();
  });

  it("不同币种账户时禁用保存按钮并显示提示", () => {
    const { container } = renderForm({
      accountOptions: [jpyAccount1, usdAccount],
    });

    fireEvent.mouseDown(
      within(container).getByRole("combobox", { name: "转出账户" }),
    );
    fireEvent.click(screen.getByText("日元现金（JPY）"));

    fireEvent.mouseDown(
      within(container).getByRole("combobox", { name: "转入账户" }),
    );
    fireEvent.click(screen.getAllByText("美元账户（USD）").at(-1)!);

    expect(getSaveButton(container)).toHaveProperty("disabled", true);
    expect(
      within(container).getByText("暂不支持不同币种之间的转账。"),
    ).toBeInTheDocument();
  });

  it("金额为空时禁用保存按钮", () => {
    const { container } = renderForm();

    expect(getSaveButton(container)).toHaveProperty("disabled", true);
  });

  it("金额为 0 时禁用保存按钮", () => {
    const { container } = renderForm();

    fireEvent.change(within(container).getByRole("textbox", { name: "金额" }), {
      target: { value: "0" },
    });

    expect(getSaveButton(container)).toHaveProperty("disabled", true);
  });

  it("金额为负数时禁用保存按钮", () => {
    const { container } = renderForm();

    fireEvent.change(within(container).getByRole("textbox", { name: "金额" }), {
      target: { value: "-100" },
    });

    expect(getSaveButton(container)).toHaveProperty("disabled", true);
  });

  it("金额格式不合法时禁用保存按钮", () => {
    const { container } = renderForm();

    fireEvent.change(within(container).getByRole("textbox", { name: "金额" }), {
      target: { value: "abc" },
    });

    expect(getSaveButton(container)).toHaveProperty("disabled", true);
  });

  it("合法输入时保存按钮可用", () => {
    const { container } = renderForm();

    fireEvent.mouseDown(
      within(container).getByRole("combobox", { name: "转出账户" }),
    );
    fireEvent.click(screen.getByText("日元现金（JPY）"));

    fireEvent.mouseDown(
      within(container).getByRole("combobox", { name: "转入账户" }),
    );
    fireEvent.click(screen.getAllByText("三井住友银行（JPY）").at(-1)!);

    fireEvent.change(within(container).getByRole("textbox", { name: "金额" }), {
      target: { value: "1000" },
    });

    expect(getSaveButton(container)).toHaveProperty("disabled", false);
  });

  it("渲染保存前汇总区域", () => {
    const { container } = renderForm();

    expect(within(container).getByText("保存前汇总")).toBeInTheDocument();
  });

  it("选择账户和输入金额后保存前汇总内容更新", () => {
    const { container } = renderForm();

    fireEvent.mouseDown(
      within(container).getByRole("combobox", { name: "转出账户" }),
    );
    fireEvent.click(screen.getByText("日元现金（JPY）"));

    fireEvent.mouseDown(
      within(container).getByRole("combobox", { name: "转入账户" }),
    );
    fireEvent.click(screen.getAllByText("三井住友银行（JPY）").at(-1)!);

    fireEvent.change(within(container).getByRole("textbox", { name: "金额" }), {
      target: { value: "500" },
    });

    expect(within(container).getAllByText("日元现金（JPY）")).toHaveLength(2);
    expect(within(container).getAllByText("三井住友银行（JPY）")).toHaveLength(
      2,
    );
    expect(within(container).getByText("500")).toBeInTheDocument();
  });

  it("转账金额 input 带有 data-amount-input 属性", () => {
    const { container } = renderForm();

    const amountInput = within(container).getByRole("textbox", {
      name: "金额",
    });

    expect(amountInput).toHaveAttribute("data-amount-input", "true");
  });

  it("选择转出账户后金额 input 的 data-amount-currency 为该账户币种", () => {
    const { container } = renderForm();

    fireEvent.mouseDown(
      within(container).getByRole("combobox", { name: "转出账户" }),
    );
    fireEvent.click(screen.getByText("日元现金（JPY）"));

    const amountInput = within(container).getByRole("textbox", {
      name: "金额",
    });

    expect(amountInput).toHaveAttribute("data-amount-currency", "JPY");
  });

  it("日期时间初始化失败时保存按钮禁用", () => {
    vi.spyOn(transactionsUtils, "getNowDateTimeLocalValue").mockReturnValue("");
    const { container } = renderForm();

    expect(getSaveButton(container)).toHaveProperty("disabled", true);
  });

  it("合法账户 + 合法金额 + 日期时间存在时保存按钮可用", () => {
    const { container } = renderForm();

    fireEvent.mouseDown(
      within(container).getByRole("combobox", { name: "转出账户" }),
    );
    fireEvent.click(screen.getByText("日元现金（JPY）"));

    fireEvent.mouseDown(
      within(container).getByRole("combobox", { name: "转入账户" }),
    );
    fireEvent.click(screen.getAllByText("三井住友银行（JPY）").at(-1)!);

    fireEvent.change(within(container).getByRole("textbox", { name: "金额" }), {
      target: { value: "1000" },
    });

    const hiddenTransactionAt = container.querySelector<HTMLInputElement>(
      'input[name="transactionAt"]',
    );

    expect(hiddenTransactionAt?.value).not.toBe("");
    expect(getSaveButton(container)).toHaveProperty("disabled", false);
  });

  it("时间格式无效时汇总时间显示未选择而非原始值", () => {
    vi.spyOn(transactionsUtils, "splitDateTimeLocalValue").mockReturnValue({
      date: "2024-01-01",
      time: "badtime",
    });
    const { container } = renderForm();

    expect(within(container).queryByText(/2024\/01\/01 badtime/)).toBeNull();
    expect(within(container).queryByText(/2024\/01\/01/)).toBeNull();
  });

  it("编辑状态下显示初始值的转出账户、转入账户和金额", () => {
    const { container } = renderForm({
      title: "编辑记账",
      initialValues: {
        type: "transfer",
        transactionRecordId: "00000000-0000-4000-8000-000000009001",
        transactionAt: "2026-06-04T01:30:05.000Z",
        accountId: jpyAccount1.id,
        transferTargetAccountId: jpyAccount2.id,
        transferAmount: "5000",
        note: "零花钱",
      },
    });

    expect(
      within(container).getByRole("combobox", { name: "转出账户" }),
    ).toHaveTextContent("日元现金（JPY）");
    expect(
      within(container).getByRole("combobox", { name: "转入账户" }),
    ).toHaveTextContent("三井住友银行（JPY）");
    expect(
      within(container).getByRole("textbox", { name: "金额" }),
    ).toHaveValue("5000");
    expect(
      within(container).getByRole("textbox", { name: "备注（选填）" }),
    ).toHaveValue("零花钱");
  });

  it("编辑状态下提交时包含 transactionRecordId hidden input", () => {
    const { container } = renderForm({
      initialValues: {
        type: "transfer",
        transactionRecordId: "00000000-0000-4000-8000-000000009001",
        transactionAt: "2026-06-04T01:30:05.000Z",
        accountId: jpyAccount1.id,
        transferTargetAccountId: jpyAccount2.id,
        transferAmount: "5000",
        note: "",
      },
    });

    const idInput = container.querySelector<HTMLInputElement>(
      'input[name="transactionRecordId"]',
    );

    expect(idInput).not.toBeNull();
    expect(idInput?.value).toBe("00000000-0000-4000-8000-000000009001");
  });

  it("新增状态下不包含 transactionRecordId hidden input", () => {
    const { container } = renderForm();

    expect(
      container.querySelector('input[name="transactionRecordId"]'),
    ).toBeNull();
  });

  it("编辑状态下初始值有效时保存按钮可用", () => {
    const { container } = renderForm({
      initialValues: {
        type: "transfer",
        transactionRecordId: "00000000-0000-4000-8000-000000009001",
        transactionAt: "2026-06-04T01:30:05.000Z",
        accountId: jpyAccount1.id,
        transferTargetAccountId: jpyAccount2.id,
        transferAmount: "5000",
        note: "",
      },
    });

    expect(getSaveButton(container)).toHaveProperty("disabled", false);
  });
});
