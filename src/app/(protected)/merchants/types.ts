export type MerchantAliasRow = {
  id: string;
  merchant_id: string;
  alias: string;
  sort_order: number;
  created_at: string;
};

export type MerchantRow = {
  id: string;
  name: string;
  website_url: string | null;
  icon_url: string | null;
  note: string | null;
  sort_order: number;
  created_at: string;
  aliases: MerchantAliasRow[];
};

export function getMerchantInitial(name: string) {
  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    return "?";
  }

  return Array.from(trimmedName)[0]?.toUpperCase() ?? "?";
}

export function normalizeSearchText(value: string) {
  return value.trim().toLowerCase();
}
