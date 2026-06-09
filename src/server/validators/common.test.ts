import { describe, expect, it } from "vitest";

import {
  parseCurrencyCode,
  parseEnumValue,
  parseMoneyAmount,
  parseOptionalTextField,
  parseRequiredText,
  parseUuid,
  parseUuidList,
} from "./common";

const uuid = "00000000-0000-4000-8000-000000000001";

describe("server validator common", () => {
  it("required text 会 trim 并拒绝空值", () => {
    expect(parseRequiredText("  账户  ", "required")).toEqual({
      ok: true,
      value: "账户",
    });
    expect(parseRequiredText("   ", "required")).toEqual({
      error: "required",
      ok: false,
    });
  });

  it("optional text 支持空值、纯空白与长度校验", () => {
    const emptyForm = new FormData();
    emptyForm.set("note", "");
    expect(parseOptionalTextField(emptyForm, "note", 3, "too_long")).toEqual({
      ok: true,
      value: null,
    });

    const blankForm = new FormData();
    blankForm.set("note", "   ");
    expect(parseOptionalTextField(blankForm, "note", 3, "too_long")).toEqual({
      ok: true,
      value: null,
    });

    const longForm = new FormData();
    longForm.set("note", "abcd");
    expect(parseOptionalTextField(longForm, "note", 3, "too_long")).toEqual({
      error: "too_long",
      ok: false,
    });
  });

  it("uuid 校验合法性", () => {
    expect(parseUuid(uuid, "invalid")).toEqual({ ok: true, value: uuid });
    expect(parseUuid("invalid", "invalid")).toEqual({
      error: "invalid",
      ok: false,
    });
  });

  it("enum value 会 trim 并只允许指定值", () => {
    expect(
      parseEnumValue(" expense ", ["expense", "income"] as const, "invalid"),
    ).toEqual({
      ok: true,
      value: "expense",
    });
    expect(
      parseEnumValue("transfer", ["expense", "income"] as const, "invalid"),
    ).toEqual({
      error: "invalid",
      ok: false,
    });
  });

  it("currency code 会转大写并校验三位字母", () => {
    expect(parseCurrencyCode(" jpy ", "invalid")).toEqual({
      ok: true,
      value: "JPY",
    });
    expect(parseCurrencyCode("jp", "invalid")).toEqual({
      error: "invalid",
      ok: false,
    });
  });

  it("money amount 支持边界配置", () => {
    expect(
      parseMoneyAmount("", {
        allowNegative: true,
        allowZero: true,
        emptyFallback: 0,
        error: "invalid",
      }),
    ).toEqual({ ok: true, value: 0 });
    expect(parseMoneyAmount("-1", { error: "invalid" })).toEqual({
      error: "invalid",
      ok: false,
    });
    expect(parseMoneyAmount("1.234", { error: "invalid" })).toEqual({
      error: "invalid",
      ok: false,
    });
  });

  it("uuid list 会去重并拒绝非法值", () => {
    expect(parseUuidList([uuid, uuid], "invalid")).toEqual({
      ok: true,
      value: [uuid],
    });
    expect(parseUuidList([uuid, "invalid"], "invalid")).toEqual({
      error: "invalid",
      ok: false,
    });
  });
});
