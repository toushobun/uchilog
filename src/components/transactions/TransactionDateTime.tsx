"use client";

type TransactionDateTimeProps = {
  value: string;
};

function formatTransactionAt(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function TransactionDateTime({ value }: TransactionDateTimeProps) {
  return (
    <time dateTime={value} suppressHydrationWarning>
      {formatTransactionAt(value)}
    </time>
  );
}
