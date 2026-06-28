import { match } from "pinyin-pro";

export function matchesCategorySearch(value: string, query: string) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const normalizedValue = normalizeSearchText(value);
  if (normalizedValue.includes(normalizedQuery)) return true;

  return (
    match(normalizedValue, normalizedQuery, {
      continuous: true,
      precision: "start",
      space: "ignore",
      v: true,
    }) !== null
  );
}

function normalizeSearchText(value: string) {
  return value.toLocaleLowerCase().replace(/[\s·/\-_]+/g, "");
}
