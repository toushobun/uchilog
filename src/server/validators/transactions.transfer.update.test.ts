import { describe, expect, it } from "vitest";

import { validateUpdateTransferTransactionForm } from "./transactions";

const fromAccountId = "00000000-0000-4000-8000-000000000041";
const toAccountId = "00000000-0000-4000-8000-000000000042";
const transactionRecordId = "00000000-0000-4000-8000-000000002001";

function createTransferUpdateFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();

  formData.set("transactionRecordId", transactionRecordId);
  formData.set("type", "transfer");
  formData.set("transactionAt", "2026-06-04T10:30:05");
  formData.set("timeZoneOffsetMinutes", "-540");
  formData.set("accountId", fromAccountId);
  formData.set("transferTargetAccountId", toAccountId);
  formData.set("transferAmount", "5000");
  formData.set("note", "账户转账");

  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }

  return formData;
}

describe("validateUpdateTransferTransactionForm", () => {
  it("转账编辑表单校验通过", () => {
    expect(
      validateUpdateTransferTransactionForm(createTransferUpdateFormData()),
    ).toEqual({
      ok: true,
      value: {
        accountId: fromAccountId,
        note: "账户转账",
        transactionAt: "2026-06-04T01:30:05.000Z",
        transactionRecordId,
        transferAmount: 5000,
        transferTargetAccountId: toAccountId,
        type: "transfer",
      },
    });
  });

  it("缺少 transactionRecordId 时返回 update_invalid", () => {
    expect(
      validateUpdateTransferTransactionForm(
        createTransferUpdateFormData({ transactionRecordId: "" }),
      ),
    ).toEqual({ error: "update_invalid", ok: false });
  });

  it("非法 transactionRecordId 时返回 update_invalid", () => {
    expect(
      validateUpdateTransferTransactionForm(
        createTransferUpdateFormData({ transactionRecordId: "not-a-uuid" }),
      ),
    ).toEqual({ error: "update_invalid", ok: false });
  });

  it("type 不是 transfer 时返回 update_invalid", () => {
    expect(
      validateUpdateTransferTransactionForm(
        createTransferUpdateFormData({ type: "expense" }),
      ),
    ).toEqual({ error: "update_invalid", ok: false });
  });

  it("转出和转入账户相同时返回 account_invalid", () => {
    expect(
      validateUpdateTransferTransactionForm(
        createTransferUpdateFormData({
          transferTargetAccountId: fromAccountId,
        }),
      ),
    ).toEqual({ error: "account_invalid", ok: false });
  });

  it("金额为 0 时返回 amount_invalid", () => {
    expect(
      validateUpdateTransferTransactionForm(
        createTransferUpdateFormData({ transferAmount: "0" }),
      ),
    ).toEqual({ error: "amount_invalid", ok: false });
  });

  it("金额为空时返回 amount_invalid", () => {
    expect(
      validateUpdateTransferTransactionForm(
        createTransferUpdateFormData({ transferAmount: "" }),
      ),
    ).toEqual({ error: "amount_invalid", ok: false });
  });

  it("金额为负数时返回 amount_invalid", () => {
    expect(
      validateUpdateTransferTransactionForm(
        createTransferUpdateFormData({ transferAmount: "-100" }),
      ),
    ).toEqual({ error: "amount_invalid", ok: false });
  });

  it("金额格式错误时返回 amount_invalid", () => {
    expect(
      validateUpdateTransferTransactionForm(
        createTransferUpdateFormData({ transferAmount: "abc" }),
      ),
    ).toEqual({ error: "amount_invalid", ok: false });
  });

  it("日期非法时返回 date_invalid", () => {
    expect(
      validateUpdateTransferTransactionForm(
        createTransferUpdateFormData({ transactionAt: "invalid-date" }),
      ),
    ).toEqual({ error: "date_invalid", ok: false });
  });

  it("备注超过 2000 字时返回 note_too_long", () => {
    expect(
      validateUpdateTransferTransactionForm(
        createTransferUpdateFormData({ note: "あ".repeat(2001) }),
      ),
    ).toEqual({ error: "note_too_long", ok: false });
  });
});
