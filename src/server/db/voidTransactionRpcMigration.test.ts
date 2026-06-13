import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const migrationPath = resolve(
  process.cwd(),
  "supabase/migrations/20260612224500_void_multi_item_transactions.sql",
);

function readVoidTransactionMigration() {
  try {
    return readFileSync(migrationPath, "utf8");
  } catch {
    throw new Error(`Migration file not found: ${migrationPath}`);
  }
}

describe("void_transaction RPC migration", () => {
  it("不会退回到只允许单条 transaction_item 的旧实现", () => {
    const migration = readVoidTransactionMigration();

    expect(migration).not.toContain("v_item_count <> 1");
    expect(migration).not.toContain("transaction_item_count_invalid");
  });

  it("在同一个明细遍历路径中按负 balance_delta 回滚账户余额", () => {
    const migration = readVoidTransactionMigration();

    expect(migration).toMatch(
      /for\s+v_item\s+in[\s\S]*from\s+public\.transaction_item\s+ti[\s\S]*perform\s+public\.apply_account_balance_delta\([\s\S]*v_item\.account_id,[\s\S]*-v_item\.balance_delta/,
    );
  });
});
