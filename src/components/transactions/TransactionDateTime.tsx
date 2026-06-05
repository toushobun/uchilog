"use client";

import { useEffect, useState } from "react";

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
  const [formattedValue, setFormattedValue] = useState("");

  useEffect(() => {
    setFormattedValue(formatTransactionAt(value));
  }, [value]);

  return <time dateTime={value}>{formattedValue || "..."}</time>;
}
