import {
  maxTransactionTagCount,
  maxTransactionTagNameLength,
} from "@/constants/transactions";

export const transactionTagValidationMessages = {
  duplicate: "这个标签已经添加过。",
  invalid: `标签最多 ${maxTransactionTagCount} 个，单个标签不能超过 ${maxTransactionTagNameLength} 个字符。`,
  nameTooLong: `单个标签不能超过 ${maxTransactionTagNameLength} 个字符。`,
  tooMany: `标签最多只能添加 ${maxTransactionTagCount} 个。`,
} as const;
