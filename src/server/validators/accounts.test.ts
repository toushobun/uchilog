import { describe, expect, it } from "vitest";

import {
  validateArchiveAccountForm,
  validateCreateAccountForm,
  validateUpdateAccountForm,
} from "./accounts";

const accountId = "00000000-0000-4000-8000-000000000001";
const holderUserId = "00000000-0000-4000-8000-000000000002";

function createFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();

  formData.set("accountId", accountId);
  formData.set("name", "现金");
  formData.set("type", "cash");
  formData.set("currency", "jpy");
  formData.set("initialBalance", "1000");
  formData.append("holderUserIds", holderUserId);

  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }

  return formData;
}

describe("account validators", () => {
  it("新增账户表单校验通过", () => {
    expect(validateCreateAccountForm(createFormData())).toEqual({
      ok: true,
      value: {
        currency: "JPY",
        holderUserIds: [holderUserId],
        initialBalance: 1000,
        name: "现金",
        type: "cash",
      },
    });
  });

  it("新增账户允许空初始余额并默认 0", () => {
    const result = validateCreateAccountForm(
      createFormData({ initialBalance: "" }),
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.initialBalance).toBe(0);
  });

  it("新增账户拒绝非法货币", () => {
    expect(
      validateCreateAccountForm(createFormData({ currency: "jp" })),
    ).toEqual({
      error: "currency_invalid",
      ok: false,
    });
  });

  it("新增账户拒绝非法持有人", () => {
    const formData = createFormData();
    formData.delete("holderUserIds");
    formData.append("holderUserIds", "invalid");

    expect(validateCreateAccountForm(formData)).toEqual({
      error: "holder_invalid",
      ok: false,
    });
  });

  it("更新账户表单校验通过", () => {
    const result = validateUpdateAccountForm(createFormData());

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.accountId).toBe(accountId);
  });

  it("更新账户拒绝非法账户 ID", () => {
    expect(
      validateUpdateAccountForm(createFormData({ accountId: "invalid" })),
    ).toEqual({
      error: "account_invalid",
      ok: false,
    });
  });

  it("归档账户拒绝非法账户 ID", () => {
    expect(
      validateArchiveAccountForm(createFormData({ accountId: "invalid" })),
    ).toEqual({ error: "account_invalid", ok: false });
  });

  it("新增账户拒绝空持有人列表", () => {
    const formData = createFormData();

    formData.delete("holderUserIds");

    expect(validateCreateAccountForm(formData)).toEqual({
      error: "holder_invalid",
      ok: false,
    });
  });
});
