"use client";

import { formatTransactionAt } from "utils/transactions";

type TransactionDateTimeProps = {
  value: string;
};

export function TransactionDateTime({ value }: TransactionDateTimeProps) {
  return (
    <time dateTime={value} suppressHydrationWarning>
      {formatTransactionAt(value)}
    </time>
  );
}
