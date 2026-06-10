import { describe, expect, it } from "vitest";

import { accountErrorCodes } from "server/errors/accounts";
import { categoryErrorCodes } from "server/errors/categories";
import { merchantErrorCodes } from "server/errors/merchants";
import { transactionErrorCodes } from "server/errors/transactions";

import {
  getAccountErrorMessage,
  getCategoryErrorMessage,
  getMerchantErrorMessage,
  getNewTransactionErrorMessage,
  getTransactionErrorMessage,
} from "./pageErrors";

describe("pageErrors", () => {
  it("使用统一错误码映射账户错误提示", () => {
    expect(getAccountErrorMessage(accountErrorCodes.nameRequired)).toBe(
      "请输入账户名称。",
    );
    expect(getAccountErrorMessage(accountErrorCodes.createFailed)).toBe(
      "账户新增失败。请确认账户名称是否重复，或稍后重试。",
    );
  });

  it("使用统一错误码映射分类错误提示", () => {
    expect(getCategoryErrorMessage(categoryErrorCodes.parentInvalid)).toBe(
      "大分类指定不正确。",
    );
    expect(getCategoryErrorMessage(categoryErrorCodes.updateFailed)).toBe(
      "分类更新失败。请确认分类名称是否重复，或稍后重试。",
    );
  });

  it("使用统一错误码映射商家错误提示", () => {
    expect(getMerchantErrorMessage(merchantErrorCodes.aliasRequired)).toBe(
      "请输入商家别名。",
    );
    expect(getMerchantErrorMessage(merchantErrorCodes.websiteUrlInvalid)).toBe(
      "商家网址必须以 http:// 或 https:// 开头。",
    );
  });

  it("使用统一错误码映射交易错误提示", () => {
    expect(
      getNewTransactionErrorMessage(transactionErrorCodes.amountInvalid),
    ).toBe("金额必须为正数，且最多两位小数。");
    expect(getTransactionErrorMessage(transactionErrorCodes.voidInvalid)).toBe(
      "删除对象不正确。",
    );
  });

  it("空值或未知错误码返回 null", () => {
    expect(getAccountErrorMessage()).toBeNull();
    expect(getTransactionErrorMessage("unknown")).toBeNull();
  });
});
