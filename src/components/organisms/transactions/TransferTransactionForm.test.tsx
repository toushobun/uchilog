import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TransferTransactionForm } from "./TransferTransactionForm";

const accountOptions = [
  {
    id: "00000000-0000-4000-8000-000000000045",
    name: "日元现金",
    currency: "JPY",
  },
  {
    id: "00000000-0000-4000-8000-000000000046",
    name: "银行卡",
    currency: "JPY",
  },
  {
    id: "00000000-0000-4000-8000-000000000047",
    name: "美元账户",
    currency: "USD",
  },
];

const archivedAccount = {
  id: "00000000-0000-4000-8000-000000000048",
  name: "旧现金（已归档）",
  currency: "JPY",
  isArchived: true,
};

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function renderTransferForm(
  props: Partial<ComponentProps<typeof TransferTransactionForm>> = {},
) {
  const action = vi.fn(async () => undefined);
  const view = render(
    <TransferTransactionForm
      action={action}
      accountOptions={accountOptions}
      {...props}
    />,
  );

  return { action, ...view };
}

function getCombobox(container: HTMLElement, name: string) {
  return within(container).getByRole("combobox", { name });
}

function getInput(container: HTMLElement, name: string) {
  const input = container.querySelector<HTMLInputElement>(
    `input[name="${name}"]`,
  );

  if (!input) throw new Error(`${name} 字段不存在`);

  return input;
}

function clickOption(name: string) {
  const options = screen.getAllByText(name);
  fireEvent.click(options[options.length - 1]);
}

describe("TransferTransactionForm", () => {
  it("传入错误信息时显示错误提示", () => {
    const { container } = renderTransferForm({
      errorMessage: "保存失败：create_failed",
    });

    expect(
      within(container).getByText("保存失败：create_failed"),
    ).toBeInTheDocument();
  });

  it("提交字段包含转账类型、账户、金额和发生时间", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 10, 9, 8, 7));

    const { container } = renderTransferForm();

    fireEvent.mouseDown(getCombobox(container, "转出账户"));
    clickOption("日元现金（JPY）");
    fireEvent.mouseDown(getCombobox(container, "转入账户"));
    clickOption("银行卡（JPY）");
    fireEvent.change(
      within(container).getByRole("textbox", { name: "转账金额" }),
      { target: { value: "1200" } },
    );

    expect(getInput(container, "type").value).toBe("transfer");
    expect(getInput(container, "accountId").value).toBe(accountOptions[0].id);
    expect(getInput(container, "transferTargetAccountId").value).toBe(
      accountOptions[1].id,
    );
    expect(getInput(container, "transferAmount").value).toBe("1200");
    expect(getInput(container, "transactionAt").value).toBe(
      "2026-06-10T09:08:07",
    );
  });

  it("转入账户列表不显示已选择的转出账户", () => {
    const { container } = renderTransferForm();

    fireEvent.mouseDown(getCombobox(container, "转出账户"));
    clickOption("日元现金（JPY）");
    fireEvent.mouseDown(getCombobox(container, "转入账户"));

    const listbox = screen.getByRole("listbox");

    expect(
      within(listbox).queryByText("日元现金（JPY）"),
    ).not.toBeInTheDocument();
    expect(within(listbox).getByText("银行卡（JPY）")).toBeInTheDocument();
  });

  it("转账账户币种不一致时显示提示并禁用保存", () => {
    const { container } = renderTransferForm();

    fireEvent.mouseDown(getCombobox(container, "转出账户"));
    clickOption("日元现金（JPY）");
    fireEvent.mouseDown(getCombobox(container, "转入账户"));
    clickOption("美元账户（USD）");
    fireEvent.change(
      within(container).getByRole("textbox", { name: "转账金额" }),
      { target: { value: "1200" } },
    );

    expect(
      within(container).getByText("当前只支持同币种账户转账。"),
    ).toBeInTheDocument();
    expect(
      within(container).getByRole("button", { name: "保存转账" }),
    ).toHaveProperty("disabled", true);
  });

  it("回填已归档账户时显示提示并禁用保存", () => {
    const { container } = renderTransferForm({
      accountOptions: [...accountOptions, archivedAccount],
      initialValues: {
        accountId: archivedAccount.id,
        note: "旧账户转账",
        transactionAt: "2026-06-04T10:30:05.000Z",
        transactionRecordId: "00000000-0000-4000-8000-000000009001",
        transferAmount: "1200",
        transferTargetAccountId: accountOptions[1].id,
      },
    });

    expect(
      within(container).getByText("已归档账户不能用于保存转账。"),
    ).toBeInTheDocument();
    expect(
      within(container).getByRole("button", { name: "保存转账" }),
    ).toHaveProperty("disabled", true);
  });

  it("账户不足两个时禁用保存", () => {
    const { container } = renderTransferForm({
      accountOptions: [accountOptions[0]],
    });

    expect(
      within(container).getByRole("button", { name: "保存转账" }),
    ).toHaveProperty("disabled", true);
    expect(
      within(container).getByText("请至少新增两个账户后再记录转账。"),
    ).toBeInTheDocument();
  });
});
