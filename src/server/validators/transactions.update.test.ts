import { describe, expect, it } from "vitest";

import { validateUpdateTransactionForm } from "./transactions";

const accountId = "00000000-0000-4000-8000-000000000041";
const categoryId = "00000000-0000-4000-8000-000000000101";
const merchantId = "00000000-0000-4000-8000-000000001001";
const transactionRecordId = "00000000-0000-4000-8000-000000002001";

function createFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();

  formData.set("type", "expense");
  formData.set("transactionAt", "2026-06-04T10:30:05");
  formData.set("timeZoneOffsetMinutes", "-540");
  formData.set("accountId", accountId);
  formData.append("itemCategoryId", categoryId);
  formData.append("itemAmount", "1200");
  formData.set("merchantId", merchantId);
  formData.set("note", "测试记录");
  formData.set("transactionRecordId", transactionRecordId);

  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }

  return formData;
}

describe("validateUpdateTransactionForm", () => {
  it("update 普通交易允许 type=expense", () => {
    expect(validateUpdateTransactionForm(createFormData())).toEqual({
      ok: true,
      value: {
        accountId,
        items: [{ amount: 1200, categoryId }],
        merchantId,
        note: "测试记录",
        tagNames: [],
        transactionAt: "2026-06-04T01:30:05.000Z",
        transactionRecordId,
        type: "expense",
      },
    });
  });

  it("update 普通交易允许 type=income", () => {
    expect(
      validateUpdateTransactionForm(createFormData({ type: "income" })),
    ).toEqual({
      ok: true,
      value: {
        accountId,
        items: [{ amount: 1200, categoryId }],
        merchantId,
        note: "测试记录",
        tagNames: [],
        transactionAt: "2026-06-04T01:30:05.000Z",
        transactionRecordId,
        type: "income",
      },
    });
  });

  it("update 普通交易拒绝 type=transfer", () => {
    expect(
      validateUpdateTransactionForm(createFormData({ type: "transfer" })),
    ).toEqual({
      error: "update_invalid",
      ok: false,
    });
  });
});
