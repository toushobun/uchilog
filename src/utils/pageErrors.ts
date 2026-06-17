import {
  accountErrorCodes,
  type AccountErrorCode,
} from "server/errors/accounts";
import {
  categoryErrorCodes,
  type CategoryErrorCode,
} from "server/errors/categories";
import {
  merchantErrorCodes,
  type MerchantErrorCode,
} from "server/errors/merchants";
import {
  transactionErrorCodes,
  type EditTransactionErrorCode,
  type NewTransactionErrorCode,
  type TransactionListErrorCode,
} from "server/errors/transactions";
import {
  editTransactionPageErrorMessages,
  newTransactionPageErrorMessages,
  transactionListPageErrorMessages,
} from "utils/transactionMessages";

const accountErrorMessages: Record<AccountErrorCode, string> = {
  [accountErrorCodes.accountInvalid]: "账户指定不正确。",
  [accountErrorCodes.archiveFailed]: "账户归档失败。",
  [accountErrorCodes.createFailed]:
    "账户新增失败。请确认账户名称是否重复，或稍后重试。",
  [accountErrorCodes.currencyInvalid]: "货币必须是 3 位大写字母，例如 JPY。",
  [accountErrorCodes.holderInvalid]: "账户持有人指定不正确。",
  [accountErrorCodes.initialBalanceInvalid]: "初始余额必须是数字。",
  [accountErrorCodes.nameRequired]: "请输入账户名称。",
  [accountErrorCodes.typeInvalid]: "账户类型不正确。",
  [accountErrorCodes.updateFailed]:
    "账户更新失败。请确认账户名称是否重复，或稍后重试。",
};

const categoryErrorMessages: Record<CategoryErrorCode, string> = {
  [categoryErrorCodes.archiveFailed]: "分类归档失败。",
  [categoryErrorCodes.categoryInvalid]: "分类指定不正确。",
  [categoryErrorCodes.createFailed]:
    "分类新增失败。请确认分类名称是否重复，或稍后重试。",
  [categoryErrorCodes.nameRequired]: "请输入分类名称。",
  [categoryErrorCodes.nameTooLong]: "分类名称不能超过 100 个字符。",
  [categoryErrorCodes.parentInvalid]: "大分类指定不正确。",
  [categoryErrorCodes.typeInvalid]: "分类类型不正确。",
  [categoryErrorCodes.updateFailed]:
    "分类更新失败。请确认分类名称是否重复，或稍后重试。",
};

const ledgerSetupErrorMessages: Record<string, string> = {
  create_failed: "账本创建失败，请稍后重试。",
  currency_invalid: "基础货币必须是 3 位大写字母，例如 JPY。",
  name_required: "请输入账本名称。",
};

const merchantErrorMessages: Record<MerchantErrorCode, string> = {
  [merchantErrorCodes.aliasArchiveFailed]: "商家别名归档失败。",
  [merchantErrorCodes.aliasCreateFailed]:
    "商家别名新增失败。请确认别名是否重复，或稍后重试。",
  [merchantErrorCodes.aliasInvalid]: "商家别名指定不正确。",
  [merchantErrorCodes.aliasRequired]: "请输入商家别名。",
  [merchantErrorCodes.aliasTooLong]: "商家别名不能超过 100 个字符。",
  [merchantErrorCodes.archiveFailed]: "商家归档失败。",
  [merchantErrorCodes.createFailed]:
    "商家新增失败。请确认商家名称是否重复，或稍后重试。",
  [merchantErrorCodes.merchantInvalid]: "商家指定不正确。",
  [merchantErrorCodes.nameRequired]: "请输入商家名称。",
  [merchantErrorCodes.nameTooLong]: "商家名称不能超过 100 个字符。",
  [merchantErrorCodes.noteTooLong]: "备注不能超过 1000 个字符。",
  [merchantErrorCodes.updateFailed]:
    "商家更新失败。请确认商家名称是否重复，或稍后重试。",
  [merchantErrorCodes.websiteUrlInvalid]:
    "商家网址必须以 http:// 或 https:// 开头。",
};

const newTransactionErrorMessages: Partial<
  Record<NewTransactionErrorCode, string>
> = {
  [transactionErrorCodes.accountInvalid]:
    newTransactionPageErrorMessages.accountInvalid,
  [transactionErrorCodes.amountInvalid]:
    newTransactionPageErrorMessages.amountInvalid,
  [transactionErrorCodes.categoryInvalid]:
    newTransactionPageErrorMessages.categoryInvalid,
  [transactionErrorCodes.createFailed]:
    newTransactionPageErrorMessages.createFailed,
  [transactionErrorCodes.dateInvalid]:
    newTransactionPageErrorMessages.dateInvalid,
  [transactionErrorCodes.merchantInvalid]:
    newTransactionPageErrorMessages.merchantInvalid,
  [transactionErrorCodes.noteTooLong]:
    newTransactionPageErrorMessages.noteTooLong,
  [transactionErrorCodes.tagInvalid]:
    newTransactionPageErrorMessages.tagInvalid,
  [transactionErrorCodes.typeInvalid]:
    newTransactionPageErrorMessages.typeInvalid,
};

const editTransactionErrorMessages: Partial<
  Record<EditTransactionErrorCode, string>
> = {
  [transactionErrorCodes.accountInvalid]:
    editTransactionPageErrorMessages.accountInvalid,
  [transactionErrorCodes.amountInvalid]:
    editTransactionPageErrorMessages.amountInvalid,
  [transactionErrorCodes.categoryInvalid]:
    editTransactionPageErrorMessages.categoryInvalid,
  [transactionErrorCodes.dateInvalid]:
    editTransactionPageErrorMessages.dateInvalid,
  [transactionErrorCodes.merchantInvalid]:
    editTransactionPageErrorMessages.merchantInvalid,
  [transactionErrorCodes.noteTooLong]:
    editTransactionPageErrorMessages.noteTooLong,
  [transactionErrorCodes.tagInvalid]:
    editTransactionPageErrorMessages.tagInvalid,
  [transactionErrorCodes.typeInvalid]:
    editTransactionPageErrorMessages.typeInvalid,
  [transactionErrorCodes.updateFailed]:
    editTransactionPageErrorMessages.updateFailed,
  [transactionErrorCodes.updateInvalid]:
    editTransactionPageErrorMessages.updateInvalid,
};

const transactionErrorMessages: Record<TransactionListErrorCode, string> = {
  [transactionErrorCodes.voidFailed]:
    transactionListPageErrorMessages.voidFailed,
  [transactionErrorCodes.voidInvalid]:
    transactionListPageErrorMessages.voidInvalid,
};

function getPageErrorMessage<TError extends string>(
  messages: Partial<Record<TError, string>>,
  error?: string,
) {
  return error ? (messages[error as TError] ?? null) : null;
}

export function getAccountErrorMessage(error?: string) {
  return getPageErrorMessage(accountErrorMessages, error);
}

export function getCategoryErrorMessage(error?: string) {
  return getPageErrorMessage(categoryErrorMessages, error);
}

export function getLedgerSetupErrorMessage(error?: string) {
  return getPageErrorMessage(ledgerSetupErrorMessages, error);
}

export function getMerchantErrorMessage(error?: string) {
  return getPageErrorMessage(merchantErrorMessages, error);
}

export function getNewTransactionErrorMessage(error?: string) {
  return getPageErrorMessage(newTransactionErrorMessages, error);
}

export function getEditTransactionErrorMessage(error?: string) {
  return getPageErrorMessage(editTransactionErrorMessages, error);
}

export function getTransactionErrorMessage(error?: string) {
  return getPageErrorMessage(transactionErrorMessages, error);
}
