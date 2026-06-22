import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const transactionRecordId = "00000000-0000-4000-8000-000000009001";

const mocks = vi.hoisted(() => ({
  EditTransactionTemplate: vi.fn(() => null),
  EditTransferTransactionTemplate: vi.fn(() => null),
  getEditTransactionErrorMessage: vi.fn((error?: string) =>
    error ? `编辑错误:${error}` : null,
  ),
  loadEditTransactionView: vi.fn(),
  loadEditTransferTransactionView: vi.fn(),
  loadTransactionRecordType: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  updateTransaction: vi.fn(),
  updateTransferTransaction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: mocks.notFound,
}));

vi.mock("server/actions/transactions", () => ({
  updateTransaction: mocks.updateTransaction,
  updateTransferTransaction: mocks.updateTransferTransaction,
}));

vi.mock("server/loaders/transactionForm", () => ({
  loadEditTransactionView: mocks.loadEditTransactionView,
  loadEditTransferTransactionView: mocks.loadEditTransferTransactionView,
}));

vi.mock("server/loaders/transactionRecordType", () => ({
  loadTransactionRecordType: mocks.loadTransactionRecordType,
}));

vi.mock("templates/transactions/TransactionFormPage", () => ({
  EditTransactionTemplate: mocks.EditTransactionTemplate,
  EditTransferTransactionTemplate: mocks.EditTransferTransactionTemplate,
}));

vi.mock("utils/pageErrors", () => ({
  getEditTransactionErrorMessage: mocks.getEditTransactionErrorMessage,
}));

import TransactionEditPage from "./page";

function createEditView() {
  return {
    accountOptions: [],
    categoryOptions: [],
    initialValues: {
      accountId: "00000000-0000-4000-8000-000000000041",
      items: [
        {
          amount: "1200",
          categoryId: "00000000-0000-4000-8000-000000005072",
        },
      ],
      merchantId: "00000000-0000-4000-8000-000000001001",
      note: "晚餐",
      tagNames: ["日常"],
      transactionAt: "2026-06-04T10:30:05.000Z",
      transactionRecordId,
      type: "expense" as const,
    },
    ledgerName: "家庭账本",
    merchantOptions: [],
    tagOptions: [],
  };
}

function createTransferEditView() {
  return {
    accountOptions: [],
    initialValues: {
      accountId: "00000000-0000-4000-8000-000000000041",
      note: "",
      transactionAt: "2026-06-04T10:30:05.000Z",
      transactionRecordId,
      transferAmount: "500",
      transferTargetAccountId: "00000000-0000-4000-8000-000000000042",
    },
    ledgerName: "家庭账本",
  };
}

describe("TransactionEditPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.loadTransactionRecordType.mockResolvedValue("expense");
  });

  it("transactionRecordId 不合法时显示 notFound", async () => {
    await expect(
      TransactionEditPage({
        params: Promise.resolve({ transactionRecordId: "bad" }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(mocks.loadTransactionRecordType).not.toHaveBeenCalled();
  });

  it("使用 URL 参数中的 transactionRecordId 显示编辑画面", async () => {
    const view = createEditView();
    mocks.loadEditTransactionView.mockResolvedValue(view);

    const result = await TransactionEditPage({
      params: Promise.resolve({ transactionRecordId }),
      searchParams: Promise.resolve({ error: "update_failed" }),
    });
    const element = result as ReactElement<Record<string, unknown>>;

    expect(mocks.loadTransactionRecordType).toHaveBeenCalledWith(
      transactionRecordId,
    );
    expect(mocks.loadEditTransactionView).toHaveBeenCalledWith(
      transactionRecordId,
    );
    expect(mocks.loadEditTransferTransactionView).not.toHaveBeenCalled();
    expect(mocks.getEditTransactionErrorMessage).toHaveBeenCalledWith(
      "update_failed",
    );
    expect(element.type).toBe(mocks.EditTransactionTemplate);
    expect(element.props).toMatchObject({
      ...view,
      action: mocks.updateTransaction,
      errorMessage: "编辑错误:update_failed",
    });
  });

  it("没有 error 参数时正常显示编辑画面", async () => {
    const view = createEditView();
    mocks.loadEditTransactionView.mockResolvedValue(view);

    const result = await TransactionEditPage({
      params: Promise.resolve({ transactionRecordId }),
      searchParams: Promise.resolve({}),
    });
    const element = result as ReactElement<Record<string, unknown>>;

    expect(mocks.loadEditTransactionView).toHaveBeenCalledWith(
      transactionRecordId,
    );
    expect(mocks.getEditTransactionErrorMessage).toHaveBeenCalledWith(
      undefined,
    );
    expect(element.type).toBe(mocks.EditTransactionTemplate);
    expect(element.props).toMatchObject({
      ...view,
      action: mocks.updateTransaction,
      errorMessage: null,
    });
  });

  it("转账记录显示转账编辑画面", async () => {
    mocks.loadTransactionRecordType.mockResolvedValue("transfer");
    const transferView = createTransferEditView();
    mocks.loadEditTransferTransactionView.mockResolvedValue(transferView);

    const result = await TransactionEditPage({
      params: Promise.resolve({ transactionRecordId }),
      searchParams: Promise.resolve({ error: "update_failed" }),
    });
    const element = result as ReactElement<Record<string, unknown>>;

    expect(mocks.loadTransactionRecordType).toHaveBeenCalledWith(
      transactionRecordId,
    );
    expect(mocks.loadEditTransactionView).not.toHaveBeenCalled();
    expect(mocks.loadEditTransferTransactionView).toHaveBeenCalledWith(
      transactionRecordId,
    );
    expect(element.type).toBe(mocks.EditTransferTransactionTemplate);
    expect(element.props).toMatchObject({
      ...transferView,
      action: mocks.updateTransferTransaction,
      errorMessage: "编辑错误:update_failed",
    });
  });
});
