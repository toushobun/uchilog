export const newTransactionPageErrorMessages = {
  accountInvalid: "账户指定不正确。",
  amountInvalid: "金额不能为负数，且最多两位小数。",
  categoryInvalid: "分类指定不正确。",
  createFailed: "新增记账失败。请稍后重试。",
  dateInvalid: "发生时间不正确。",
  merchantInvalid: "商家指定不正确。",
  typeInvalid: "记账类型不正确。",
} as const;

export const editTransactionPageErrorMessages = {
  accountInvalid: "账户指定不正确。",
  amountInvalid: "金额不能为负数，且最多两位小数。",
  categoryInvalid: "分类指定不正确。",
  dateInvalid: "发生时间不正确。",
  merchantInvalid: "商家指定不正确。",
  noteTooLong: "备注不能超过 2000 个字符。",
  typeInvalid: "记账类型不正确。",
  updateFailed: "记账更新失败。请稍后重试。",
  updateInvalid: "编辑对象不正确。",
} as const;

export const transactionFormValidationMessages = {
  accountRequired: "请选择账户。",
  amountInvalid: "请输入有效金额。",
  categoryRequired: "请选择一个小分类。",
  itemsRequired: "请至少添加一条明细。",
  merchantRequired: "请选择商家。",
} as const;

export const transactionListPageErrorMessages = {
  voidFailed: "记录删除失败。请稍后重试。",
  voidInvalid: "删除对象不正确。",
} as const;
