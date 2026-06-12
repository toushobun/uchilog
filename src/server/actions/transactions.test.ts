import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createTransaction,
  voidTransaction,
} from "server/actions/transactions";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getCurrentLedgerContext: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
  revalidatePath: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("lib/ledger/current-ledger", () => ({
  getCurrentLedgerContext: mocks.getCurrentLedgerContext,
}));

vi.mock("lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

const ledgerId = "00000000-0000-4000-8000-000000000032";
const userId = "00000000-0000-4000-8000-000000000031";
const accountId = "00000000-0000-4000-8000-000000000045";
const categoryId = "00000000-0000-4000-8000-000000005072";
const merchantId = "00000000-0000-4000-8000-000000001001";
const transactionRecordId = "00000000-0000-4000-8000-000000009999";

function createValidFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();

  formData.set("type", "expense");
  formData.set("transactionAt", "2026-06-04T10:30:05");
  formData.set("timeZoneOffsetMinutes", "-540");
  formData.set("accountId", accountId);
  formData.append("itemCategoryId", categoryId);
  formData.append("itemAmount", "1234");
  formData.set("merchantId", merchantId);
  formData.set("note", "测试记录");

  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }

  return formData;
}

function createVoidFormData(value = transactionRecordId) {
  const formData = new FormData();

  formData.set("transactionRecordId", value);

  return formData;
}

function setupActionMocks() {
  mocks.getCurrentLedgerContext.mockResolvedValue({
    currentLedger: {
      id: ledgerId,
      name: "家庭账本",
      base_currency: "JPY",
    },
    userId,
  });

  mocks.createClient.mockResolvedValue({
    rpc: mocks.rpc,
  });

  mocks.rpc.mockResolvedValue({
    data: transactionRecordId,
    error: null,
  });
}

describe("createTransaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupActionMocks();
  });

  it("输入值不合法时认证后带错误参数跳回新增页面", async () => {
    await expect(
      createTransaction(createValidFormData({ itemAmount: "-1" })),
    ).rejects.toThrow("NEXT_REDIRECT:/transactions/new?error=amount_invalid");

    expect(mocks.getCurrentLedgerContext).toHaveBeenCalledTimes(1);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("输入值合法时通过 RPC 创建记账并跳转到列表页", async () => {
    await expect(createTransaction(createValidFormData())).rejects.toThrow(
      /^NEXT_REDIRECT:\/transactions$/,
    );

    expect(mocks.rpc).toHaveBeenCalledWith("create_transaction", {
      p_account_id: accountId,
      p_items: [{ amount: 1234, categoryId }],
      p_ledger_id: ledgerId,
      p_merchant_id: merchantId,
      p_note: "测试记录",
      p_transaction_at: "2026-06-04T01:30:05.000Z",
      p_type: "expense",
    });

    expect(mocks.revalidatePath).toHaveBeenCalledWith("/accounts");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/transactions");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/transactions/new");
  });

  it("未指定商家时向 RPC 传入 null 并保存", async () => {
    await expect(
      createTransaction(createValidFormData({ merchantId: "" })),
    ).rejects.toThrow(/^NEXT_REDIRECT:\/transactions$/);

    expect(mocks.rpc).toHaveBeenCalledWith(
      "create_transaction",
      expect.objectContaining({
        p_merchant_id: null,
      }),
    );
  });

  it("0 元明细也可以保存", async () => {
    await expect(
      createTransaction(createValidFormData({ itemAmount: "0" })),
    ).rejects.toThrow(/^NEXT_REDIRECT:\/transactions$/);

    expect(mocks.rpc).toHaveBeenCalledWith("create_transaction", {
      p_account_id: accountId,
      p_items: [{ amount: 0, categoryId }],
      p_ledger_id: ledgerId,
      p_merchant_id: merchantId,
      p_note: "测试记录",
      p_transaction_at: "2026-06-04T01:30:05.000Z",
      p_type: "expense",
    });
  });

  it("RPC 失败时带错误参数跳回新增页面", async () => {
    mocks.rpc.mockResolvedValue({
      data: null,
      error: {
        message: "transaction failed",
      },
    });

    await expect(createTransaction(createValidFormData())).rejects.toThrow(
      "NEXT_REDIRECT:/transactions/new?error=create_failed",
    );

    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});

describe("voidTransaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupActionMocks();
  });

  it("transactionRecordId 不合法时认证后带错误参数跳回列表页", async () => {
    await expect(
      voidTransaction(createVoidFormData("invalid-id")),
    ).rejects.toThrow("NEXT_REDIRECT:/transactions?error=void_invalid");

    expect(mocks.getCurrentLedgerContext).toHaveBeenCalledTimes(1);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("输入值合法时通过 RPC 撤销记账并回到列表页", async () => {
    await expect(voidTransaction(createVoidFormData())).rejects.toThrow(
      /^NEXT_REDIRECT:\/transactions$/,
    );

    expect(mocks.rpc).toHaveBeenCalledWith("void_transaction", {
      p_ledger_id: ledgerId,
      p_transaction_record_id: transactionRecordId,
    });

    expect(mocks.revalidatePath).toHaveBeenCalledWith("/accounts");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/transactions");
  });

  it("RPC 失败时带错误参数跳回列表页", async () => {
    mocks.rpc.mockResolvedValue({
      data: null,
      error: {
        message: "void failed",
      },
    });

    await expect(voidTransaction(createVoidFormData())).rejects.toThrow(
      "NEXT_REDIRECT:/transactions?error=void_failed",
    );

    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});
