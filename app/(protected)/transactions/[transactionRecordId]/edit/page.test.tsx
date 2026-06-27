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
  NewTransactionVisualFrame: vi.fn(() => null),
  saveEditTransaction: vi.fn(),
  updateTransaction: vi.fn(),
}));

vi.mock("server/actions/transactions", () => ({
  saveEditTransaction: mocks.saveEditTransaction,
  updateTransaction: mocks.updateTransaction,
}));

vi.mock("server/loaders/transactionForm", () => ({
  loadEditTransactionView: mocks.loadEditTransactionView,
}));

vi.mock("templates/transactions/TransactionFormPage", () => ({
  EditTransactionTemplate: mocks.EditTransactionTemplate,
  EditTransferTransactionTemplate: mocks.EditTransferTransactionTemplate,
}));

vi.mock("utils/pageErrors", () => ({
  getEditTransactionErrorMessage: mocks.getEditTransactionErrorMessage,
}));

vi.mock("templates/transactions/NewTransactionVisualFrame", () => ({
  NewTransactionVisualFrame: mocks.NewTransactionVisualFrame,
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
    ...createEditView(),
    initialValues: {
      accountId: "00000000-0000-4000-8000-000000000041",
      note: "转账",
      transactionAt: "2026-06-04T10:30:05.000Z",
      transactionRecordId,
      transferAmount: "1200",
      transferTargetAccountId: "00000000-0000-4000-8000-000000000042",
      type: "transfer" as const,
    },
  };
}

describe("TransactionEditPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("使用 URL 参数中的 transactionRecordId 显示编辑画面", async () => {
    const view = createEditView();
    mocks.loadEditTransactionView.mockResolvedValue(view);

    const result = await TransactionEditPage({
      params: Promise.resolve({ transactionRecordId }),
      searchParams: Promise.resolve({ error: "update_failed" }),
    });
    const element = result as ReactElement<Record<string, unknown>>;
    const child = element.props.children as ReactElement<
      Record<string, unknown>
    >;

    expect(mocks.loadEditTransactionView).toHaveBeenCalledWith(
      transactionRecordId,
    );
    expect(mocks.getEditTransactionErrorMessage).toHaveBeenCalledWith(
      "update_failed",
    );
    expect(element.type).toBe(mocks.NewTransactionVisualFrame);
    expect(element.props).toMatchObject({ fullBleed: false });
    expect(child.type).toBe(mocks.EditTransactionTemplate);
    expect(child.props).toMatchObject({
      ...view,
      action: mocks.saveEditTransaction,
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
    const child = element.props.children as ReactElement<
      Record<string, unknown>
    >;

    expect(mocks.loadEditTransactionView).toHaveBeenCalledWith(
      transactionRecordId,
    );
    expect(mocks.getEditTransactionErrorMessage).toHaveBeenCalledWith(
      undefined,
    );
    expect(element.type).toBe(mocks.NewTransactionVisualFrame);
    expect(element.props).toMatchObject({ fullBleed: false });
    expect(child.type).toBe(mocks.EditTransactionTemplate);
    expect(child.props).toMatchObject({
      ...view,
      action: mocks.saveEditTransaction,
      errorMessage: null,
    });
  });

  it("转账记录使用转账编辑模板并关闭 full-bleed 外壳", async () => {
    const view = createTransferEditView();
    mocks.loadEditTransactionView.mockResolvedValue(view);

    const result = await TransactionEditPage({
      params: Promise.resolve({ transactionRecordId }),
      searchParams: Promise.resolve({}),
    });
    const element = result as ReactElement<Record<string, unknown>>;
    const child = element.props.children as ReactElement<
      Record<string, unknown>
    >;

    expect(element.type).toBe(mocks.NewTransactionVisualFrame);
    expect(element.props).toMatchObject({ fullBleed: false });
    expect(child.type).toBe(mocks.EditTransferTransactionTemplate);
    expect(child.props).toMatchObject({
      ...view,
      action: mocks.saveEditTransaction,
      errorMessage: null,
    });
  });
});
