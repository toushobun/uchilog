import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const transactionRecordId = "00000000-0000-4000-8000-000000009001";

const mocks = vi.hoisted(() => ({
  createTransaction: vi.fn(),
  getNewTransactionErrorMessage: vi.fn((error?: string) =>
    error ? `新建错误:${error}` : null,
  ),
  loadNewTransactionView: vi.fn(),
  NewTransactionTemplate: vi.fn(() => null),
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("server/actions/transactions", () => ({
  createTransaction: mocks.createTransaction,
}));

vi.mock("server/loaders/transactionForm", () => ({
  loadNewTransactionView: mocks.loadNewTransactionView,
}));

vi.mock("templates/transactions/TransactionFormPage", () => ({
  NewTransactionTemplate: mocks.NewTransactionTemplate,
}));

vi.mock("utils/pageErrors", () => ({
  getNewTransactionErrorMessage: mocks.getNewTransactionErrorMessage,
}));

import TransactionsNewPage from "./page";

describe("TransactionsNewPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("存在 editId 时重定向到编辑页面", async () => {
    await expect(
      TransactionsNewPage({
        searchParams: Promise.resolve({ editId: transactionRecordId }),
      }),
    ).rejects.toThrow(
      `NEXT_REDIRECT:/transactions/${transactionRecordId}/edit`,
    );

    expect(mocks.loadNewTransactionView).not.toHaveBeenCalled();
  });

  it("存在 editId 和 error 时重定向到编辑错误页面", async () => {
    await expect(
      TransactionsNewPage({
        searchParams: Promise.resolve({
          editId: transactionRecordId,
          error: "update_failed",
        }),
      }),
    ).rejects.toThrow(
      `NEXT_REDIRECT:/transactions/${transactionRecordId}/edit?error=update_failed`,
    );

    expect(mocks.loadNewTransactionView).not.toHaveBeenCalled();
  });

  it("没有 editId 时显示新增记账画面", async () => {
    const view = createView();
    mocks.loadNewTransactionView.mockResolvedValue(view);

    const result = await TransactionsNewPage({
      searchParams: Promise.resolve({ error: "create_failed" }),
    });
    const element = result as ReactElement<Record<string, unknown>>;

    expect(mocks.loadNewTransactionView).toHaveBeenCalledTimes(1);
    expect(mocks.getNewTransactionErrorMessage).toHaveBeenCalledWith(
      "create_failed",
    );
    expect(element.type).toBe(mocks.NewTransactionTemplate);
    expect(element.props).toMatchObject({
      ...view,
      action: mocks.createTransaction,
      errorMessage: "新建错误:create_failed",
      initialType: "expense",
    });
  });

  it("type=income 时以收入类型打开新增记账画面", async () => {
    const view = createView();
    mocks.loadNewTransactionView.mockResolvedValue(view);

    const result = await TransactionsNewPage({
      searchParams: Promise.resolve({ type: "income" }),
    });
    const element = result as ReactElement<Record<string, unknown>>;

    expect(element.props).toMatchObject({
      initialType: "income",
    });
  });

  it("type=transfer 时以转账类型打开新增记账画面", async () => {
    const view = createView();
    mocks.loadNewTransactionView.mockResolvedValue(view);

    const result = await TransactionsNewPage({
      searchParams: Promise.resolve({ type: "transfer" }),
    });
    const element = result as ReactElement<Record<string, unknown>>;

    expect(element.props).toMatchObject({
      initialType: "transfer",
    });
  });

  it("type 不合法时回退为支出类型", async () => {
    const view = createView();
    mocks.loadNewTransactionView.mockResolvedValue(view);

    const result = await TransactionsNewPage({
      searchParams: Promise.resolve({ type: "unknown" }),
    });
    const element = result as ReactElement<Record<string, unknown>>;

    expect(element.props).toMatchObject({
      initialType: "expense",
    });
  });
});

function createView() {
  return {
    accountOptions: [],
    categoryOptions: [],
    ledgerName: "家庭账本",
    merchantOptions: [],
    tagOptions: [],
  };
}
