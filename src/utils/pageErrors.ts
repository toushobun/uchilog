const accountErrorMessages: Record<string, string> = {
  account_invalid: "账户指定不正确。",
  archive_failed: "账户归档失败。",
  create_failed: "账户新增失败。请确认账户名称是否重复，或稍后重试。",
  currency_invalid: "货币必须是 3 位大写字母，例如 JPY。",
  holder_invalid: "账户持有人指定不正确。",
  initial_balance_invalid: "初始余额必须是数字。",
  name_required: "请输入账户名称。",
  type_invalid: "账户类型不正确。",
  update_failed: "账户更新失败。请确认账户名称是否重复，或稍后重试。",
};

const ledgerSetupErrorMessages: Record<string, string> = {
  create_failed: "账本创建失败，请稍后重试。",
  currency_invalid: "基础货币必须是 3 位大写字母，例如 JPY。",
  name_required: "请输入账本名称。",
};

const merchantErrorMessages: Record<string, string> = {
  alias_archive_failed: "商家别名归档失败。",
  alias_create_failed: "商家别名新增失败。请确认别名是否重复，或稍后重试。",
  alias_invalid: "商家别名指定不正确。",
  alias_required: "请输入商家别名。",
  alias_too_long: "商家别名不能超过 100 个字符。",
  archive_failed: "商家归档失败。",
  create_failed: "商家新增失败。请确认商家名称是否重复，或稍后重试。",
  merchant_invalid: "商家指定不正确。",
  name_required: "请输入商家名称。",
  name_too_long: "商家名称不能超过 100 个字符。",
  note_too_long: "备注不能超过 1000 个字符。",
  update_failed: "商家更新失败。请确认商家名称是否重复，或稍后重试。",
  website_url_invalid: "商家网址必须以 http:// 或 https:// 开头。",
};

const newTransactionErrorMessages: Record<string, string> = {
  account_invalid: "账户指定不正确。",
  amount_invalid: "金额必须为正数，且最多两位小数。",
  category_invalid: "分类指定不正确。",
  create_failed: "新增记账失败。请稍后重试。",
  date_invalid: "发生时间不正确。",
  merchant_invalid: "商家指定不正确。",
  type_invalid: "记账类型不正确。",
};

const transactionErrorMessages: Record<string, string> = {
  void_failed: "记录删除失败。请稍后重试。",
  void_invalid: "删除对象不正确。",
};

function getPageErrorMessage(messages: Record<string, string>, error?: string) {
  return error ? (messages[error] ?? null) : null;
}

export function getAccountErrorMessage(error?: string) {
  return getPageErrorMessage(accountErrorMessages, error);
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

export function getTransactionErrorMessage(error?: string) {
  return getPageErrorMessage(transactionErrorMessages, error);
}
