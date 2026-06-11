import { describe, expect, it } from "vitest";

import { getFormText, isUuid, parseOptionalText } from "./formData";

describe("formData utils", () => {
  describe("isUuid", () => {
    it("判定 UUID 形式的字符串", () => {
      expect(isUuid("00000000-0000-4000-8000-000000000001")).toBe(true);
      expect(isUuid("00000000-0000-4000-A000-000000000001")).toBe(true);
    });

    it("非 UUID 字符串返回 false", () => {
      expect(isUuid("")).toBe(false);
      expect(isUuid("00000000-0000-4000-7000-000000000001")).toBe(false);
      expect(isUuid("00000000000040008000000000000001")).toBe(false);
      expect(isUuid("not-a-uuid")).toBe(false);
    });
  });

  describe("getFormText", () => {
    it("从 FormData 取得字符串并 trim", () => {
      const formData = new FormData();
      formData.set("name", "  食費  ");

      expect(getFormText(formData, "name")).toBe("食費");
    });

    it("不存在的 key 按空字符串处理", () => {
      const formData = new FormData();

      expect(getFormText(formData, "missing")).toBe("");
    });
  });

  describe("parseOptionalText", () => {
    it("空字符串转换为 null", () => {
      expect(parseOptionalText("", 10)).toEqual({ ok: true, value: null });
    });

    it("最大长度以内的字符串原样返回", () => {
      expect(parseOptionalText("メモ", 10)).toEqual({
        ok: true,
        value: "メモ",
      });
      expect(parseOptionalText("12345", 5)).toEqual({
        ok: true,
        value: "12345",
      });
    });

    it("超过最大长度时返回失败", () => {
      expect(parseOptionalText("123456", 5)).toEqual({ ok: false });
    });
  });
});
