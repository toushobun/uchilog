import { describe, expect, it } from "vitest";
import migration from "../../../supabase/migrations/20260612224500_void_multi_item_transactions.sql?raw";

describe("void_transaction RPC migration", () => {
  it("不会退回到只允许单条 transaction_item 的旧实现", () => {
    expect(migration).toContain("v_item_count = 0");
    expect(migration).toContain("transaction_item_invalid");
    expect(migration).not.toContain("v_item_count <> 1");
    expect(migration).not.toContain("transaction_item_count_invalid");
  });

  it("在同一个明细遍历路径中按负 balance_delta 回滚账户余额", () => {
    const functionMatch = migration.match(
      /create\s+or\s+replace\s+function\s+public\.void_transaction\([\s\S]*?\bend;\s*\$\$/i,
    );
    expect(
      functionMatch,
      "void_transaction function body not found in migration",
    ).not.toBeNull();

    const loopMatch = functionMatch![0].match(
      /for\s+v_item\s+in\s+([\s\S]*?)\s+loop\s+([\s\S]*?)\s+end\s+loop;/i,
    );
    expect(
      loopMatch,
      "v_item rollback loop not found in void_transaction",
    ).not.toBeNull();

    expect(loopMatch![1]).toContain("from public.transaction_item ti");
    expect(loopMatch![2]).toMatch(
      /perform\s+public\.apply_account_balance_delta\([\s\S]*v_item\.account_id,[\s\S]*-v_item\.balance_delta/i,
    );
  });
});
