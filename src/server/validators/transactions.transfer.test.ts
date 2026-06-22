import { describe, expect, it } from "vitest";

import {
  validateTransactionForm,
  validateUpdateTransactionForm,
} from "./transactions";

const fromAccountId = "00000000-0000-4000-8000-000000000041";
const toAccountId = "00000000-0000-4000-8000-000000000042";
const categoryId = "00000000-0000-4000-8000-000000000101";
const transactionRecordId = "00000000-0000-4000-8000-000000002001";

function createTransferFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();

  formData.set("type", "transfer");
  formData.set("transactionAt", "2026-06-04T10:30:05");
  formData.set("timeZoneOffsetMinutes", "-540");
  formData.set("accountId", fromAccountId);
  formData.set("transferTargetAccountId", toAccountId);
  formData.set("transferAmount", "1200");
  formData.set("note", "账户转账");
  // validateUpdateTransactionForm 的测试也复用此 helper，故需要包含该字段
  // validateTransactionForm 不读取该字段，可安全忽略
  formData.set("transactionRecordId", transactionRecordId);

  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }

  return formData;
}

describe("transfer transaction validators", () => {
  it("转账交易表单校验通过", () => {
    expect(validateTransactionForm(createTransferFormData())).toEqual({
      ok: true,
      value: {
        accountId: fromAccountId,
        note: "账户转账",
        transactionAt: "2026-06-04T01:30:05.000Z",
        transferAmount: 1200,
        transferTargetAccountId: toAccountId,
        type: "transfer",
      },
    });
  });

  it("转账不要求商家、分类和标签", () => {
    const formData = createTransferFormData({ merchantId: "" });

    formData.append("itemCategoryId", categoryId);
    formData.append("itemAmount", "1200");
    formData.append("tagName", "很长的标签名".repeat(10));

    expect(validateTransactionForm(formData)).toEqual({
      ok: true,
      value: {
        accountId: fromAccountId,
        note: "账户转账",
        transactionAt: "2026-06-04T01:30:05.000Z",
        transferAmount: 1200,
        transferTargetAccountId: toAccountId,
        type: "transfer",
      },
    });
  });

  it("拒绝转出和转入账户相同", () => {
    expect(
      validateTransactionForm(
        createTransferFormData({ transferTargetAccountId: fromAccountId }),
      ),
    ).toEqual({
      error: "account_invalid",
      ok: false,
    });
  });

  it("拒绝非法转账金额", () => {
    expect(
      validateTransactionForm(createTransferFormData({ transferAmount: "0" })),
    ).toEqual({
      error: "amount_invalid",
      ok: false,
    });
  });

  it("普通编辑校验拒绝 transfer", () => {
    expect(validateUpdateTransactionForm(createTransferFormData())).toEqual({
      error: "update_invalid",
      ok: false,
    });
  });

  it("普通编辑校验在 transfer 字段不足时也直接拒绝", () => {
    const formData = new FormData();

    formData.set("transactionRecordId", transactionRecordId);
    formData.set("type", "transfer");

    expect(validateUpdateTransactionForm(formData)).toEqual({
      error: "update_invalid",
      ok: false,
    });
  });
});
