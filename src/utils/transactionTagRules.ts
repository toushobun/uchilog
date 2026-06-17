import {
  maxTransactionTagCount,
  maxTransactionTagNameLength,
} from "@/constants/transactions";

export function isTooManyTransactionTags(tagNames: string[]) {
  return tagNames.length > maxTransactionTagCount;
}

export function isTransactionTagNameTooLong(tagName: string) {
  return tagName.length > maxTransactionTagNameLength;
}
