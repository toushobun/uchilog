import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTransaction } from "server/actions/transactions";

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
const transferTargetAccountId = "00000000-0000-4000-8000-000000000046";
const transactionRecordId = "00000000-0000-4000-8000-000000009999";

function createValidTransferFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();

  formData.set("type", "transfer");
  formData.set("transactionAt", "2026-06-04T10:30:05");
  formData.set("timeZoneOffsetMinutes", "-540");
  formData.set("accountId", accountId);
  formData.set("transferTargetAccountId", transferTargetAccountId);
  formData.set("transferAmount", "1200");
  formData.set("note", "测试转账");

  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }

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

describe("createTransaction transfer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupActionMocks();
  });

  it("转账输入值不合法时带类型参数跳回新增页面", async () => {
    await expect(
      createTransaction(createValidTransferFormData({ transferAmount: "0" })),
    ).rejects.toThrow(
      "NEXT_REDIRECT:/transactions/new?error=amount_invalid&type=transfer",
    );

    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("输入值合法时通过 RPC 创建转账并跳转到发生月份的列表页", async () => {
    await expect(
      createTransaction(createValidTransferFormData()),
    ).rejects.toThrow("NEXT_REDIRECT:/transactions?month=2026-06");

    expect(mocks.rpc).toHaveBeenCalledWith("create_transfer_transaction", {
      p_amount: 1200,
      p_from_account_id: accountId,
      p_ledger_id: ledgerId,
      p_note: "测试转账",
      p_to_account_id: transferTargetAccountId,
      p_transaction_at: "2026-06-04T01:30:05.000Z",
    });
  });

  it("转账 RPC 失败时带类型参数跳回新增页面", async () => {
    mocks.rpc.mockResolvedValue({
      data: null,
      error: {
        message: "transfer failed",
      },
    });

    await expect(
      createTransaction(createValidTransferFormData()),
    ).rejects.toThrow(
      "NEXT_REDIRECT:/transactions/new?error=create_failed&type=transfer",
    );

    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});
