import { describe, expect, it } from "vitest";

import {
  validateArchiveMerchantAliasForm,
  validateArchiveMerchantForm,
  validateCreateMerchantAliasForm,
  validateCreateMerchantForm,
  validateUpdateMerchantForm,
} from "./merchants";

const merchantId = "00000000-0000-4000-8000-000000001001";
const aliasId = "00000000-0000-4000-8000-000000001002";

function createFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();

  formData.set("merchantId", merchantId);
  formData.set("aliasId", aliasId);
  formData.set("name", "LIFE");
  formData.set("websiteUrl", "https://example.com");
  formData.set("note", "常用超市");
  formData.set("alias", "来福");

  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }

  return formData;
}

describe("merchant validators", () => {
  it("新增商家表单校验通过", () => {
    expect(validateCreateMerchantForm(createFormData())).toEqual({
      ok: true,
      value: {
        name: "LIFE",
        note: "常用超市",
        siteUrl: "https://example.com",
      },
    });
  });

  it("新增商家允许空网址和空备注", () => {
    const result = validateCreateMerchantForm(
      createFormData({ note: "", websiteUrl: "" }),
    );

    expect(result).toEqual({
      ok: true,
      value: { name: "LIFE", note: null, siteUrl: null },
    });
  });

  it("新增商家拒绝非法网址", () => {
    expect(
      validateCreateMerchantForm(
        createFormData({ websiteUrl: "ftp://example.com" }),
      ),
    ).toEqual({
      error: "website_url_invalid",
      ok: false,
    });
  });

  it("更新商家失败时保留 merchantId 作为错误定位", () => {
    expect(validateUpdateMerchantForm(createFormData({ name: "" }))).toEqual({
      error: "name_required",
      merchantId,
      ok: false,
    });
  });

  it("新增别名失败时保留 merchantId 作为错误定位", () => {
    expect(
      validateCreateMerchantAliasForm(createFormData({ alias: "" })),
    ).toEqual({
      error: "alias_required",
      merchantId,
      ok: false,
    });
  });

  it("归档商家表单校验通过", () => {
    expect(validateArchiveMerchantForm(createFormData())).toEqual({
      ok: true,
      value: { merchantId },
    });
  });

  it("归档别名表单校验通过", () => {
    expect(validateArchiveMerchantAliasForm(createFormData())).toEqual({
      ok: true,
      value: { aliasId },
    });
  });
});
