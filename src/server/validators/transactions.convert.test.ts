import { describe, expect, it } from "vitest";

import { validateConvertTransactionTypeForm } from "./transactions";

const accountId = "00000000-0000-4000-8000-000000000041";
const toAccountId = "00000000-0000-4000-8000-000000000042";
const categoryId = "00000000-0000-4000-8000-000000000101";
const merchantId = "00000000-0000-4000-8000-000000001001";
const transactionRecordId = "00000000-0000-4000-8000-000000002001";

function createNormalFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();

  formData.set("transactionRecordId", transactionRecordId);
  formData.set("sourceType", "transfer");
  formData.set("type", "expense");
  formData.set("transactionAt", "2026-06-04T10:30:05");
  formData.set("timeZoneOffsetMinutes", "-540");
  formData.set("accountId", accountId);
  formData.append("itemCategoryId", categoryId);
  formData.append("itemAmount", "1200");
  formData.set("merchantId", merchantId);
  formData.set("note", "转换记录");

  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }

  return formData;
}

function createTransferFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();

  formData.set("transactionRecordId", transactionRecordId);
  formData.set("sourceType", "expense");
  formData.set("type", "transfer");
  formData.set("transactionAt", "2026-06-04T10:30:05");
  formData.set("timeZoneOffsetMinutes", "-540");
  formData.set("accountId", accountId);
  formData.set("transferTargetAccountId", toAccountId);
  formData.set("transferAmount", "1200");
  formData.set("note", "转为转账");

  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }

  return formData;
}

describe("validateConvertTransactionTypeForm", () => {
  it("sourceType 缺失时拒绝", () => {
    expect(
      validateConvertTransactionTypeForm(
        createNormalFormData({ sourceType: "" }),
      ),
    ).toEqual({ error: "update_invalid", ok: false });
  });

  it("targetType（type 字段）缺失时拒绝", () => {
    expect(
      validateConvertTransactionTypeForm(createNormalFormData({ type: "" })),
    ).toEqual({ error: "update_invalid", ok: false });
  });

  it("sourceType = targetType 时拒绝", () => {
    expect(
      validateConvertTransactionTypeForm(
        createNormalFormData({ sourceType: "expense", type: "expense" }),
      ),
    ).toEqual({ error: "update_invalid", ok: false });
  });

  it("转账 → 普通交易 0 元明细不被 validator 拒绝", () => {
    expect(
      validateConvertTransactionTypeForm(
        createNormalFormData({ itemAmount: "0" }),
      ),
    ).toMatchObject({
      ok: true,
      value: expect.objectContaining({
        items: [{ amount: 0, categoryId }],
        targetType: "expense",
      }),
    });
  });

  it("转账 → 普通交易 校验通过并返回正确参数", () => {
    expect(validateConvertTransactionTypeForm(createNormalFormData())).toEqual({
      ok: true,
      value: {
        accountId,
        items: [{ amount: 1200, categoryId }],
        merchantId,
        note: "转换记录",
        tagNames: [],
        transactionAt: "2026-06-04T01:30:05.000Z",
        transactionRecordId,
        type: "expense",
        sourceType: "transfer",
        targetType: "expense",
      },
    });
  });

  it("转账 → 收入 校验通过并返回正确参数", () => {
    expect(
      validateConvertTransactionTypeForm(
        createNormalFormData({ type: "income" }),
      ),
    ).toEqual({
      ok: true,
      value: {
        accountId,
        items: [{ amount: 1200, categoryId }],
        merchantId,
        note: "转换记录",
        tagNames: [],
        transactionAt: "2026-06-04T01:30:05.000Z",
        transactionRecordId,
        type: "income",
        sourceType: "transfer",
        targetType: "income",
      },
    });
  });

  it("普通交易 → 转账 校验通过并返回正确参数", () => {
    expect(
      validateConvertTransactionTypeForm(createTransferFormData()),
    ).toEqual({
      ok: true,
      value: {
        accountId,
        note: "转为转账",
        transactionAt: "2026-06-04T01:30:05.000Z",
        transactionRecordId,
        transferAmount: 1200,
        transferTargetAccountId: toAccountId,
        type: "transfer",
        sourceType: "expense",
        targetType: "transfer",
      },
    });
  });

  it("普通交易 → 转账 转账金额为 0 时拒绝", () => {
    expect(
      validateConvertTransactionTypeForm(
        createTransferFormData({ transferAmount: "0" }),
      ),
    ).toEqual({ error: "amount_invalid", ok: false });
  });

  it("普通交易 → 转账 from/to 账户相同时拒绝", () => {
    expect(
      validateConvertTransactionTypeForm(
        createTransferFormData({ transferTargetAccountId: accountId }),
      ),
    ).toEqual({ error: "account_invalid", ok: false });
  });
});
