import { describe, expect, it } from "vitest";

import {
  getBalanceDelta,
  validateTransactionForm,
} from "utils/transactionValidation";

const accountId = "00000000-0000-4000-8000-000000000041";
const categoryId = "00000000-0000-4000-8000-000000000101";
const merchantId = "00000000-0000-4000-8000-000000001001";

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

  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }

  return formData;
}

describe("validateTransactionForm", () => {
  it("支出交易的输入值正确时校验通过", () => {
    const result = validateTransactionForm(createFormData());

    expect(result).toEqual({
      ok: true,
      value: {
        accountId,
        items: [{ amount: 1200, categoryId }],
        merchantId,
        note: "测试记录",
        tagNames: [],
        transactionAt: "2026-06-04T01:30:05.000Z",
        type: "expense",
      },
    });
  });

  it("收入交易的输入值正确时校验通过", () => {
    const result = validateTransactionForm(createFormData({ type: "income" }));

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value.type).toBe("income");
    }
  });

  it("金额为空时校验失败", () => {
    const result = validateTransactionForm(createFormData({ itemAmount: "" }));

    expect(result).toEqual({ ok: false, error: "amount_invalid" });
  });

  it("金额为 0 时校验通过", () => {
    const result = validateTransactionForm(createFormData({ itemAmount: "0" }));

    expect(result).toEqual({
      ok: true,
      value: {
        accountId,
        items: [{ amount: 0, categoryId }],
        merchantId,
        note: "测试记录",
        tagNames: [],
        transactionAt: "2026-06-04T01:30:05.000Z",
        type: "expense",
      },
    });
  });

  it("金额为负数时校验失败", () => {
    const result = validateTransactionForm(
      createFormData({ itemAmount: "-1" }),
    );

    expect(result).toEqual({ ok: false, error: "amount_invalid" });
  });

  it("金额超过两位小数时校验失败", () => {
    const result = validateTransactionForm(
      createFormData({ itemAmount: "1.234" }),
    );

    expect(result).toEqual({ ok: false, error: "amount_invalid" });
  });

  it("类型不是支出或收入时校验失败", () => {
    const result = validateTransactionForm(
      createFormData({ type: "transfer" }),
    );

    expect(result).toEqual({ ok: false, error: "type_invalid" });
  });

  it("发生时间为空时校验失败", () => {
    const result = validateTransactionForm(
      createFormData({ transactionAt: "" }),
    );

    expect(result).toEqual({ ok: false, error: "date_invalid" });
  });

  it("发生时间不合法时校验失败", () => {
    const result = validateTransactionForm(
      createFormData({ transactionAt: "2026-02-30T10:30:05" }),
    );

    expect(result).toEqual({ ok: false, error: "date_invalid" });
  });

  it("时区偏移格式不合法时校验失败", () => {
    const result = validateTransactionForm(
      createFormData({ timeZoneOffsetMinutes: "abc" }),
    );

    expect(result).toEqual({ ok: false, error: "date_invalid" });
  });

  it("时区偏移超出范围时校验失败", () => {
    const result = validateTransactionForm(
      createFormData({ timeZoneOffsetMinutes: "841" }),
    );

    expect(result).toEqual({ ok: false, error: "date_invalid" });
  });

  it("账户 ID 不合法时校验失败", () => {
    const result = validateTransactionForm(
      createFormData({ accountId: "invalid" }),
    );

    expect(result).toEqual({ ok: false, error: "account_invalid" });
  });

  it("分类 ID 不合法时校验失败", () => {
    const result = validateTransactionForm(
      createFormData({ itemCategoryId: "invalid" }),
    );

    expect(result).toEqual({ ok: false, error: "category_invalid" });
  });

  it("商家为空时校验失败", () => {
    const result = validateTransactionForm(createFormData({ merchantId: "" }));

    expect(result).toEqual({ ok: false, error: "merchant_invalid" });
  });

  it("商家 ID 不合法时校验失败", () => {
    const result = validateTransactionForm(
      createFormData({ merchantId: "invalid" }),
    );

    expect(result).toEqual({ ok: false, error: "merchant_invalid" });
  });

  it("备注为空时校验通过", () => {
    const result = validateTransactionForm(createFormData({ note: "" }));

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value.note).toBeNull();
    }
  });
});

describe("getBalanceDelta", () => {
  it("支出时返回负数余额变化值", () => {
    expect(getBalanceDelta("expense", 1200)).toBe(-1200);
  });

  it("收入时返回正数余额变化值", () => {
    expect(getBalanceDelta("income", 1200)).toBe(1200);
  });
});
