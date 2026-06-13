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
  redirect: vi.fn((href: string) => {
    throw new Error(`NEXT_REDIRECT:${href}`);
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

  it("带 editId 的旧 URL 会跳转到专用编辑路由", async () => {
    await expect(
      TransactionsNewPage({
        searchParams: Promise.resolve({ editId: transactionRecordId }),
      }),
    ).rejects.toThrow(
      `NEXT_REDIRECT:/transactions/${transactionRecordId}/edit`,
    );

    expect(mocks.redirect).toHaveBeenCalledWith(
      `/transactions/${transactionRecordId}/edit`,
    );
    expect(mocks.loadNewTransactionView).not.toHaveBeenCalled();
  });

  it("旧 URL 的 error 参数会带到专用编辑路由", async () => {
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

    expect(mocks.redirect).toHaveBeenCalledWith(
      `/transactions/${transactionRecordId}/edit?error=update_failed`,
    );
    expect(mocks.loadNewTransactionView).not.toHaveBeenCalled();
  });

  it("没有 editId 时显示新增记账画面", async () => {
    const view = {
      accountOptions: [],
      categoryOptions: [],
      ledgerName: "家庭账本",
      merchantOptions: [],
    };
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
    });
  });
});
