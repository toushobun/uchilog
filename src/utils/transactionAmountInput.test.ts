import { describe, expect, it } from "vitest";

import {
  applyAmountKeypadKey,
  confirmAmountKeypadState,
  createAmountKeypadState,
  getAmountDecimalPlaces,
  isValidMoneyText,
  isValidPositiveMoneyText,
  normalizeMoneyText,
} from "./transactionAmountInput";

describe("transactionAmountInput", () => {
  it("校验最多两位小数的金额格式", () => {
    expect(isValidMoneyText("1200")).toBe(true);
    expect(isValidMoneyText("1200.5")).toBe(true);
    expect(isValidMoneyText("1200.50")).toBe(true);
    expect(isValidMoneyText("1200.500")).toBe(false);
    expect(isValidMoneyText("12..5")).toBe(false);
  });

  it("正数金额不允许空值和 0", () => {
    expect(isValidPositiveMoneyText("")).toBe(false);
    expect(isValidPositiveMoneyText("0")).toBe(false);
    expect(isValidPositiveMoneyText("0.01")).toBe(true);
  });

  it("JPY 使用整数金额，不允许多余小数", () => {
    expect(getAmountDecimalPlaces("JPY")).toBe(0);
    expect(isValidMoneyText("1200", { currency: "JPY" })).toBe(true);
    expect(isValidMoneyText("1200.1", { currency: "JPY" })).toBe(false);
    expect(normalizeMoneyText("001200", { currency: "JPY" })).toBe("1200");
  });

  it("规范化金额时去掉前导零和多余小数 0", () => {
    expect(normalizeMoneyText("001.20")).toBe("1.2");
    expect(normalizeMoneyText("001.00")).toBe("1");
  });

  it("按键输入支持数字、小数点、删除和清空", () => {
    let state = createAmountKeypadState();
    state = applyAmountKeypadKey(state, "1");
    state = applyAmountKeypadKey(state, ".");
    state = applyAmountKeypadKey(state, "2");
    state = applyAmountKeypadKey(state, "3");
    state = applyAmountKeypadKey(state, "4");

    expect(state.displayValue).toBe("1.23");

    state = applyAmountKeypadKey(state, "backspace");
    expect(state.displayValue).toBe("1.2");

    state = applyAmountKeypadKey(state, "clear");
    expect(state.displayValue).toBe("");
  });

  it("JPY 金额输入会忽略小数点", () => {
    let state = createAmountKeypadState();
    state = applyAmountKeypadKey(state, "1", { currency: "JPY" });
    state = applyAmountKeypadKey(state, ".", { currency: "JPY" });
    state = applyAmountKeypadKey(state, "5", { currency: "JPY" });

    expect(state.displayValue).toBe("15");
  });

  it("支持简单加减后确认", () => {
    let state = createAmountKeypadState();
    state = applyAmountKeypadKey(state, "1");
    state = applyAmountKeypadKey(state, "0");
    state = applyAmountKeypadKey(state, "+");
    state = applyAmountKeypadKey(state, "2");
    state = applyAmountKeypadKey(state, ".");
    state = applyAmountKeypadKey(state, "5");

    const result = confirmAmountKeypadState(state);

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe("12.5");
  });

  it("确认时拒绝空金额、0 金额和减到负数的金额", () => {
    expect(confirmAmountKeypadState(createAmountKeypadState()).ok).toBe(false);
    expect(confirmAmountKeypadState(createAmountKeypadState("0")).ok).toBe(
      false,
    );

    let state = createAmountKeypadState("1");
    state = applyAmountKeypadKey(state, "-");
    state = applyAmountKeypadKey(state, "2");

    expect(confirmAmountKeypadState(state).ok).toBe(false);
  });
});
