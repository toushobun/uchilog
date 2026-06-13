import { describe, expect, it } from "vitest";

import { accountErrorCodes } from "server/errors/accounts";
import { categoryErrorCodes } from "server/errors/categories";
import { merchantErrorCodes } from "server/errors/merchants";
import { transactionErrorCodes } from "server/errors/transactions";

import {
  getAccountErrorMessage,
  getCategoryErrorMessage,
  getEditTransactionErrorMessage,
  getLedgerSetupErrorMessage,
  getMerchantErrorMessage,
  getNewTransactionErrorMessage,
  getTransactionErrorMessage,
} from "./pageErrors";
import {
  newTransactionPageErrorMessages,
  editTransactionPageErrorMessages,
  transactionListPageErrorMessages,
} from "./transactionMessages";

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

  it("使用统一错误码映射账本初始化错误提示", () => {
    expect(getLedgerSetupErrorMessage("name_required")).toBe(
      "请输入账本名称。",
    );
    expect(getLedgerSetupErrorMessage("currency_invalid")).toBe(
      "基础货币必须是 3 位大写字母，例如 JPY。",
    );
    expect(getLedgerSetupErrorMessage("create_failed")).toBe(
      "账本创建失败，请稍后重试。",
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
    ).toBe(newTransactionPageErrorMessages.amountInvalid);
    expect(getTransactionErrorMessage(transactionErrorCodes.voidInvalid)).toBe(
      transactionListPageErrorMessages.voidInvalid,
    );
    expect(
      getEditTransactionErrorMessage(transactionErrorCodes.updateInvalid),
    ).toBe(editTransactionPageErrorMessages.updateInvalid);
    expect(
      getTransactionErrorMessage(transactionErrorCodes.updateInvalid),
    ).toBeNull();
  });

  it("空值或未知错误码返回 null", () => {
    expect(getAccountErrorMessage()).toBeNull();
    expect(getLedgerSetupErrorMessage()).toBeNull();
    expect(getTransactionErrorMessage("unknown")).toBeNull();
  });
});
