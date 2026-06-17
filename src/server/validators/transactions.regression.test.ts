import { describe, expect, it } from "vitest";

import { transactionErrorCodes } from "server/errors/transactions";

import {
  validateTransactionForm,
  validateUpdateTransactionForm,
} from "./transactions";

const accountId = "00000000-0000-4000-8000-000000000045";
const categoryId = "00000000-0000-4000-8000-000000005072";
const secondCategoryId = "00000000-0000-4000-8000-000000005074";
const merchantId = "00000000-0000-4000-8000-000000001001";
const transactionRecordId = "00000000-0000-4000-8000-000000009001";

function createFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();

  formData.set("type", "expense");
  formData.set("transactionAt", "2026-06-05T12:20:10");
  formData.set("timeZoneOffsetMinutes", "-540");
  formData.set("accountId", accountId);
  formData.append("itemCategoryId", categoryId);
  formData.append("itemAmount", "1200");
  formData.set("merchantId", merchantId);
  formData.set("note", "测试备注");

  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }

  return formData;
}

describe("validateTransactionForm regression", () => {
  it("接受多条明细、0 元金额和必填商家字段", () => {
    const formData = createFormData();
    formData.append("itemCategoryId", secondCategoryId);
    formData.append("itemAmount", "0");

    const result = validateTransactionForm(formData);

    expect(result).toEqual({
      ok: true,
      value: {
        accountId,
        items: [
          { amount: 1200, categoryId },
          { amount: 0, categoryId: secondCategoryId },
        ],
        merchantId,
        note: "测试备注",
        tagNames: [],
        transactionAt: "2026-06-05T03:20:10.000Z",
        type: "expense",
      },
    });
  });

  it("商家为空时校验失败", () => {
    expect(validateTransactionForm(createFormData({ merchantId: "" }))).toEqual(
      {
        error: transactionErrorCodes.merchantInvalid,
        ok: false,
      },
    );
  });

  it("明细分类与金额数量不一致时校验失败", () => {
    const formData = createFormData();
    formData.append("itemCategoryId", secondCategoryId);

    expect(validateTransactionForm(formData)).toEqual({
      error: transactionErrorCodes.amountInvalid,
      ok: false,
    });
  });

  it("明细金额为负数时校验失败", () => {
    expect(
      validateTransactionForm(createFormData({ itemAmount: "-1" })),
    ).toEqual({
      error: transactionErrorCodes.amountInvalid,
      ok: false,
    });
  });
});

describe("validateUpdateTransactionForm regression", () => {
  it("keeps transactionRecordId and parses multiple edited items", () => {
    const formData = createFormData({ transactionRecordId });
    formData.append("itemCategoryId", secondCategoryId);
    formData.append("itemAmount", "45");
    formData.append("tagName", "结婚");

    expect(validateUpdateTransactionForm(formData)).toEqual({
      ok: true,
      value: {
        accountId,
        items: [
          { amount: 1200, categoryId },
          { amount: 45, categoryId: secondCategoryId },
        ],
        merchantId,
        note: "测试备注",
        tagNames: ["结婚"],
        transactionAt: "2026-06-05T03:20:10.000Z",
        transactionRecordId,
        type: "expense",
      },
    });
  });

  it("transactionRecordId 不合法时在解析更新值之前校验失败", () => {
    expect(
      validateUpdateTransactionForm(
        createFormData({ transactionRecordId: "invalid-id" }),
      ),
    ).toEqual({
      error: transactionErrorCodes.updateInvalid,
      ok: false,
    });
  });
});
