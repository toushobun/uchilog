import { describe, expect, it } from "vitest";

import {
  validateTransactionForm,
  validateUpdateTransactionForm,
  validateUpdateTransferTransactionForm,
  validateVoidTransactionForm,
} from "./transactions";

const accountId = "00000000-0000-4000-8000-000000000041";
const transferTargetAccountId = "00000000-0000-4000-8000-000000000042";
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

function createTransferFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();

  formData.set("type", "transfer");
  formData.set("transactionAt", "2026-06-04T10:30:05");
  formData.set("timeZoneOffsetMinutes", "-540");
  formData.set("accountId", accountId);
  formData.set("transferTargetAccountId", transferTargetAccountId);
  formData.set("transferAmount", "1200");
  formData.set("note", "测试转账");
  formData.set("transactionRecordId", transactionRecordId);

  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }

  return formData;
}

describe("transaction validators", () => {
  it("支出交易表单校验通过", () => {
    expect(validateTransactionForm(createFormData())).toEqual({
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

  it("收入交易表单校验通过", () => {
    const result = validateTransactionForm(createFormData({ type: "income" }));

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.type).toBe("income");
  });

  it("转账交易表单校验通过", () => {
    expect(validateTransactionForm(createTransferFormData())).toEqual({
      ok: true,
      value: {
        accountId,
        note: "测试转账",
        transactionAt: "2026-06-04T01:30:05.000Z",
        transferAmount: 1200,
        transferTargetAccountId,
        type: "transfer",
      },
    });
  });

  it("转账交易不要求商家和明细分类", () => {
    expect(
      validateTransactionForm(
        createTransferFormData({
          itemCategoryId: "",
          itemAmount: "",
          merchantId: "",
        }),
      ),
    ).toEqual({
      ok: true,
      value: {
        accountId,
        note: "测试转账",
        transactionAt: "2026-06-04T01:30:05.000Z",
        transferAmount: 1200,
        transferTargetAccountId,
        type: "transfer",
      },
    });
  });

  it("转账交易拒绝未指定转入账户", () => {
    expect(
      validateTransactionForm(
        createTransferFormData({ transferTargetAccountId: "" }),
      ),
    ).toEqual({
      error: "account_invalid",
      ok: false,
    });
  });

  it("转账交易拒绝相同的转出和转入账户", () => {
    expect(
      validateTransactionForm(
        createTransferFormData({ transferTargetAccountId: accountId }),
      ),
    ).toEqual({
      error: "account_invalid",
      ok: false,
    });
  });

  it.each(["0", "-1", "1.234"])(
    "转账交易拒绝非法金额：%s",
    (transferAmount) => {
      expect(
        validateTransactionForm(createTransferFormData({ transferAmount })),
      ).toEqual({
        error: "amount_invalid",
        ok: false,
      });
    },
  );

  it("更新普通交易表单拒绝转账类型", () => {
    expect(validateUpdateTransactionForm(createTransferFormData())).toEqual({
      error: "update_invalid",
      ok: false,
    });
  });

  it("更新转账交易表单校验通过", () => {
    expect(
      validateUpdateTransferTransactionForm(createTransferFormData()),
    ).toEqual({
      ok: true,
      value: {
        accountId,
        note: "测试转账",
        transactionAt: "2026-06-04T01:30:05.000Z",
        transactionRecordId,
        transferAmount: 1200,
        transferTargetAccountId,
        type: "transfer",
      },
    });
  });

  it("更新转账交易表单拒绝非转账类型", () => {
    expect(validateUpdateTransferTransactionForm(createFormData())).toEqual({
      error: "update_invalid",
      ok: false,
    });
  });

  it("允许 0 元明细", () => {
    expect(
      validateTransactionForm(createFormData({ itemAmount: "0" })),
    ).toEqual({
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

  it("拒绝非法金额", () => {
    expect(
      validateTransactionForm(createFormData({ itemAmount: "-1" })),
    ).toEqual({
      error: "amount_invalid",
      ok: false,
    });
  });

  it("多条明细表单校验通过", () => {
    const formData = createFormData();
    const secondCategoryId = "00000000-0000-4000-8000-000000000102";

    formData.append("itemCategoryId", secondCategoryId);
    formData.append("itemAmount", "45");

    expect(validateTransactionForm(formData)).toEqual({
      ok: true,
      value: {
        accountId,
        items: [
          { amount: 1200, categoryId },
          { amount: 45, categoryId: secondCategoryId },
        ],
        merchantId,
        note: "测试记录",
        tagNames: [],
        transactionAt: "2026-06-04T01:30:05.000Z",
        type: "expense",
      },
    });
  });

  it("标签表单校验通过，并去除空值和大小写重复项", () => {
    const formData = createFormData();

    formData.append("tagName", " 日常 ");
    formData.append("tagName", "");
    formData.append("tagName", "日常");
    formData.append("tagName", "DAILY");
    formData.append("tagName", "daily");

    expect(validateTransactionForm(formData)).toEqual({
      ok: true,
      value: {
        accountId,
        items: [{ amount: 1200, categoryId }],
        merchantId,
        note: "测试记录",
        tagNames: ["日常", "DAILY"],
        transactionAt: "2026-06-04T01:30:05.000Z",
        type: "expense",
      },
    });
  });

  it("拒绝超过 10 个标签", () => {
    const formData = createFormData();

    Array.from({ length: 11 }, (_, index) => `标签${index + 1}`).forEach(
      (tagName) => formData.append("tagName", tagName),
    );

    expect(validateTransactionForm(formData)).toEqual({
      error: "tag_invalid",
      ok: false,
    });
  });

  it("拒绝过长标签", () => {
    const formData = createFormData();

    formData.append("tagName", "あ".repeat(41));

    expect(validateTransactionForm(formData)).toEqual({
      error: "tag_invalid",
      ok: false,
    });
  });

  it("拒绝非法时间", () => {
    expect(
      validateTransactionForm(
        createFormData({ transactionAt: "2026-02-30T10:30:05" }),
      ),
    ).toEqual({
      error: "date_invalid",
      ok: false,
    });
  });

  it("拒绝过长备注", () => {
    expect(
      validateTransactionForm(createFormData({ note: "あ".repeat(2001) })),
    ).toEqual({
      error: "note_too_long",
      ok: false,
    });
  });

  it("拒绝未指定商家", () => {
    expect(validateTransactionForm(createFormData({ merchantId: "" }))).toEqual(
      {
        error: "merchant_invalid",
        ok: false,
      },
    );
  });

  it("允许备注为空", () => {
    const result = validateTransactionForm(createFormData({ note: "" }));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.note).toBeNull();
    }
  });

  it("void 交易表单校验通过", () => {
    expect(validateVoidTransactionForm(createFormData())).toEqual({
      ok: true,
      value: { transactionRecordId },
    });
  });

  it("void 交易拒绝非法 ID", () => {
    expect(
      validateVoidTransactionForm(
        createFormData({ transactionRecordId: "invalid" }),
      ),
    ).toEqual({
      error: "void_invalid",
      ok: false,
    });
  });
});
