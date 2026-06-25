import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const migrationPath = path.join(
  process.cwd(),
  "supabase/migrations/20260625000000_allow_mixed_category_types_in_normal_transactions.sql",
);

type NormalRecordTypeItem = {
  amount: number;
  type: "expense" | "income";
};

function readMigration(filePath: string) {
  return readFileSync(filePath, "utf8");
}

function resolveNormalRecordType(items: NormalRecordTypeItem[]) {
  const totals = items.reduce(
    (currentTotals, item) => {
      currentTotals[item.type] += item.amount;
      return currentTotals;
    },
    { expense: 0, income: 0 },
  );

  return totals.income >= totals.expense ? "income" : "expense";
}

describe("普通记账混合收支后端规则", () => {
  it.each([
    {
      expectedType: "income",
      items: [
        { amount: 500, type: "expense" as const },
        { amount: 300000, type: "income" as const },
      ],
      name: "收入合计大于支出合计时主记录为 income",
    },
    {
      expectedType: "expense",
      items: [
        { amount: 300000, type: "expense" as const },
        { amount: 500, type: "income" as const },
      ],
      name: "支出合计大于收入合计时主记录为 expense",
    },
    {
      expectedType: "income",
      items: [
        { amount: 1000, type: "expense" as const },
        { amount: 1000, type: "income" as const },
      ],
      name: "收入合计等于支出合计时主记录为 income",
    },
  ])("净额规则：$name", ({ expectedType, items }) => {
    expect(resolveNormalRecordType(items)).toBe(expectedType);
  });

  it("按净额决定 transaction_record.type", () => {
    const migration = readMigration(migrationPath);

    expect(migration).toContain(
      "incomeTotal >= expenseTotal ? 'income' : 'expense'",
    );
    expect(migration).toContain(
      "when v_income_total >= v_expense_total then 'income'",
    );
    expect(migration).toContain("else 'expense'");
    expect(migration).toContain("transaction_item_sync_normal_record_type");
    expect(migration).toContain(
      "coalesce(sum(ti.amount) filter (where ti.stat_type = 'expense'), 0)",
    );
    expect(migration).toContain(
      "coalesce(sum(ti.amount) filter (where ti.stat_type = 'income'), 0)",
    );
  });

  it("保留带标签参数的 create / update RPC 签名", () => {
    const migration = readMigration(migrationPath);

    expect(migration).toContain("p_tag_names jsonb default '[]'::jsonb");
    expect(migration).toContain("public.sync_transaction_record_tags(");
    expect(migration).toContain("public.create_transaction(");
    expect(migration).toContain("public.update_transaction(");
  });
});
