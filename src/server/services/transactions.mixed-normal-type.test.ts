import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const migrationPath = path.join(
  process.cwd(),
  "supabase/migrations/20260630010000_refactor_transaction_type_model.sql",
);

function readMigration(filePath: string) {
  return readFileSync(filePath, "utf8");
}

describe("普通记账 normal 类型后端规则", () => {
  it("将 transaction_record.type 收敛为 normal / transfer", () => {
    const migration = readMigration(migrationPath);

    expect(migration).toContain("type in ('normal', 'transfer')");
    expect(migration).toContain("when type = 'transfer' then 'transfer'");
    expect(migration).toContain("else 'normal'");
    expect(migration).toContain("'normal'");
  });

  it("普通明细统计方向改由 category.type 决定", () => {
    const migration = readMigration(migrationPath);

    expect(migration).toContain("select c.type");
    expect(migration).toContain("v_item_category_type");
    expect(migration).toContain("when v_item_category_type = 'expense'");
    expect(migration).toContain(
      "drop index if exists public.transaction_item_stat_type_idx",
    );
    expect(migration).toContain("alter column stat_type drop not null");
  });

  it("已被引用的分类不能跨收入 / 支出方向修改", () => {
    const migration = readMigration(migrationPath);

    expect(migration).toContain("prevent_used_category_type_change");
    expect(migration).toContain("category_type_locked");
    expect(migration).toContain("category_prevent_used_type_change");
  });

  it("保留带标签参数的 create / update RPC 签名", () => {
    const migration = readMigration(migrationPath);

    expect(migration).toContain("p_tag_names jsonb default '[]'::jsonb");
    expect(migration).toContain("public.sync_transaction_record_tags(");
    expect(migration).toContain("public.create_transaction(");
    expect(migration).toContain("public.update_transaction(");
  });
});
