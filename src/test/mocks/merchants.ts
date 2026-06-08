import type { MerchantAliasRow, MerchantRow } from "types/merchants";

export function createMerchantAliasRow(
  overrides: Partial<MerchantAliasRow> = {},
): MerchantAliasRow {
  return {
    alias: "来福",
    created_at: "2026-01-01T00:00:00.000Z",
    id: "alias-1",
    merchant_id: "00000000-0000-4000-8000-000000001001",
    sort_order: 1,
    ...overrides,
  };
}

export function createMerchantRow(
  overrides: Partial<MerchantRow> = {},
): MerchantRow {
  return {
    aliases: [],
    created_at: "2026-01-01T00:00:00.000Z",
    icon_url: null,
    id: "00000000-0000-4000-8000-000000001001",
    name: "LIFE超市",
    note: null,
    sort_order: 1,
    website_url: "https://www.lifecorp.jp",
    ...overrides,
  };
}
